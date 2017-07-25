// import { combineReducers } from 'redux';
import { Actions } from './actions';

const testFileList = {
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};

const fileBrowserUI = (state = { fileBrowserOpened: false, ...testFileList }, action) => {
  switch (action.type) {
    case Actions.RECEIVE_FILEBROWSER_CHANGE: {
      console.log('fileBrowser action:', action);
      const combine = { ...state, ...action.payload.ui };
      // console.log('combine:', combine);
      return combine;
    }
    default:
      return state;
  }
};

const image = (state = { imageURL: '' }, action) => {
  console.log('image action:', action);
  switch (action.type) {
    case Actions.RECEIVE_IMAGE_CHANGE:
      // console.log('combine:', combine);
      return action.payload.imageData;
    default:
      return state;
  }
};

const fileReducer = {
  fileBrowserUI,
  // image,
};

export default fileReducer;
