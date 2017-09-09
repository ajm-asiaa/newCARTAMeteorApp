// import { combineReducers } from 'redux';
import { Actions } from './actions';

const testFileList = {
  rootDir: '/tmp',
  files: [{ name: 'apple.fits', type: 'fits' }],
};

const FileBrowserDB = (state = { fileBrowserOpened: false, ...testFileList }, action) => {
  switch (action.type) {
    case Actions.FILEBROWSER_CHANGE: {
      console.log('fileBrowser action:', action);
      return action.payload.data;
    }
    default:
      return state;
  }
};

const fileReducer = {
  FileBrowserDB,
};

export default fileReducer;
