import { Meteor } from 'meteor/meteor';

import SessionManager from '../api/SessionManager';
import { ImageController } from '../api/ImageController';
import { FileBrowserDB } from '../api/FileBrowserDB';
import { Responses } from '../api/Responses';

// command response part:
import { parseFileList, Actions as filebrowserActions } from '../fileBrowser/actions';
import { parseImageToMongo, parseReigsterViewResp, Actions as imageViewerActions } from '../imageViewer/actions';

import { setupMongoReduxListeners } from '../api/MongoHelper';

import Commands from '../api/Commands';

const GET_SESSIONID = 'GET_SESSIONID';

export const Actions = {
  GET_SESSIONID,
};

let otherSubHnadleFile = null;
let otherSubHandleImage = null;

function turnOnWatching(watchingSessionID) {
  return (dispatch) => {
    // subscribe
    SessionManager.useOtherSession(watchingSessionID);

    console.log('use other session:', SessionManager.getOtherSession());

    otherSubHnadleFile = Meteor.subscribe('filebrowserdb', SessionManager.getOtherSession(), () => {
      console.log('filebrowserdb subscribes OK: !!!', SessionManager.get());
    });

    otherSubHandleImage = Meteor.subscribe('imagecontroller', SessionManager.getOtherSession(), () => {
      console.log('imagecontroller subscribes OK !!!');
    });
  };
}

function turnOffWatching() {
  return (dispatch) => {
    SessionManager.stopUsingOtherSession();

    // unsubscribe
    if (otherSubHnadleFile) {
      console.log('stop file handle');
      otherSubHnadleFile.stop();
    }

    if (otherSubHandleImage) {
      console.log('stop image handle');
      otherSubHandleImage.stop();
    }
  };
}

function subscribeNonCommandCollections(dispatch) {
  // if it stays in filebrower's actions's prepareFileBrowser, its sessionid is usually empty, subscribing will fail
  Meteor.subscribe('filebrowserdb', SessionManager.get(), () => {
    console.log('filebrowserdb subscribes OK: !!!');
  });

  Meteor.subscribe('imagecontroller', SessionManager.get(), () => {
    console.log('imagecontroller subscribes OK !!!');
  });

  setupMongoReduxListeners(ImageController, dispatch, imageViewerActions.IMAGEVIEWER_CHANGE);
  setupMongoReduxListeners(FileBrowserDB, dispatch, filebrowserActions.FILEBROWSER_CHANGE);
}

function handleCommandResponse(resp) {
  console.log('get response:');

  if (resp.cmd === Commands.REQUEST_FILE_LIST) {
    console.log('response is REQUEST_FILE_LIST:');
    console.log(resp);

    parseFileList(resp.data);
  } else if (resp.cmd === Commands.SELECT_FILE_TO_OPEN) {
    console.log('response is SELECT_FILE_TO_OPEN(get image):');
    console.log(resp);
    parseImageToMongo(resp.buffer);
  } else if (resp.cmd === Commands.REGISTER_IMAGEVIEWER) {
    console.log('response is REGISTER_IMAGEVIEWER:');
    parseReigsterViewResp(resp.data);
  }
}

function waitForCommandResponses() {
  return (dispatch) => {
    console.log('waitForCommandResponses');

    Meteor.call('getSessionId', (err, sessionID) => {
      console.log('getSessionId return:', sessionID);

      // use mongo or singleton
      SessionManager.set(sessionID);
      dispatch({
        type: GET_SESSIONID,
        payload: sessionID,
      });

      Meteor.subscribe('commandResponse', SessionManager.get(), () => {
        console.log('commandResponse subscribes OK !!!');
      });

      subscribeNonCommandCollections(dispatch);


      // TODO use returned handle to turn off observe when client unsubscribes, may not need, think more
      // e.g. https://gist.github.com/aaronthorp/06b67c171fde6d1ef317
      // subscription.onStop(function () {
      //   userHandle.stop();
      // });
      // ref: https://docs.meteor.com/api/collections.html#Mongo-Cursor-observe

      const respObservationHandle = Responses.find().observe({
        added(newDoc) {
          console.log('get Mongo added response');

          handleCommandResponse(newDoc);

          // delete responses
          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          });
        },

        changed(newDoc, oldDoc) {
          console.log('get Mongo changed response');

          handleCommandResponse(newDoc);

          process.nextTick(() => {
            console.log('delete response');
            Responses.remove(newDoc._id);
          // NOTE:
          // 1. Responses.remove({}); // Not permitted. Untrusted code may only remove documents by ID.
          // 2. tracker way does not need nextTickt to remove. Current osbserveration will throw exception if no tick
          });
        },
      });

      // ui part
      // Tracker.autorun(() => {
      //   // 1st time ok, 2nd insert fail, so becomes back to zero.
      //   // local write still get this callback.
      //   const uidata = FileBrowserDB.find().fetch();
      //
      //   console.log('get ui data change from db:', uidata.length);
      //   // if (uidata.length > 0) {
      //   //   const ui = uidata[0];
      //   //
      //   //   dispatch(receiveUIChange(ui));
      //   // } else {
      //   // }
      // });
      // response part
      // Tracker.autorun(() => {
      //   const responses = Responses.find().fetch();
      //   console.log('get responses count:', responses.length, ';content:', responses);
      //
      //   if (responses.length > 0) {
      //      //     // Responses.remove({});
      //     // delete responses
      //   }
      // });
    });
  };
}

const actions = {
  waitForCommandResponses,
  turnOnWatching,
  turnOffWatching,
};

export default actions;
