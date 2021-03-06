import { FileBrowserDB } from '../api/FileBrowserDB';
import { ImageViewerDB } from '../api/ImageViewerDB';
import Commands from '../api/Commands';
import api from '../api/ApiService';

import { mongoUpsert } from '../api/MongoHelper';
import animator from '../animator/actions';

import imageViewer from '../imageViewer/actions';

import profiler from '../profiler/actions';
import histogramActions from '../histogram/actions';
import histogramSettingsActions from '../histogramSettings/actions';
import gridControl from '../gridControl/actions';
import imageStatsActions from '../imageStats/actions';
import colormap from '../colormap/actions';

const FILEBROWSER_CHANGE = 'FILEBROWSER_CHANGE';

export const ActionType = {
  FILEBROWSER_CHANGE,
};

// only for saving action history in mongo
const SELECT_FILE = 'SELECT_FILE';
// const OPEN_FILEBROWSER = 'OPEN_FILEBROWSER';

export function setupFileBrowserDB() {
  api.instance().setupMongoRedux(FileBrowserDB, FILEBROWSER_CHANGE);
}

function parseFileList(resp) {
  const { cmd, data } = resp;
  const fileList = { files: data.dir, rootDir: data.name };

  mongoUpsert(FileBrowserDB, fileList, `Resp_${cmd}`);
}

function queryServerFileList(path) {
  return () => {
    const arg = `path:${path}`;

    api.instance().sendCommand(Commands.REQUEST_FILE_LIST, arg, (resp) => {
      parseFileList(resp);
    });
  };
}
function selectFile(index) {
  return () => {
    mongoUpsert(FileBrowserDB, { selectedFile: index }, SELECT_FILE);
  };
}

function closeFile() {
  return (dispatch, getState) => {
    // console.log('closeFile action');
    const state = getState();
    const controllerID = state.ImageViewerDB.controllerID;
    const stack = state.ImageViewerDB.stack;
    if (stack && stack.layers) {
      const count = stack.layers.length;
      let currentLayer = null;

      for (const layer of stack.layers) {
        if (layer.selected) {
          // console.log('close this file:', layer.name);
          currentLayer = layer;
          break;
        }
      }

      if (!currentLayer && count > 0) {
        currentLayer = stack.layers[count - 1];
        // console.log('close this file:', currentLayer.name);
      }
      if (currentLayer) {
        // console.log('start to close file');
        const cmd = `${controllerID}:${Commands.CLOSE_IMAGE}`;
        const arg = `image:${currentLayer.id}`;

        api.instance().sendCommand(cmd, arg)
          .then((resp) => {
            console.log('close ok:', resp);
            // TODO empty profiler if closing first image
            return dispatch(imageViewer.updateStack());
          })
          .then((resp) => {
            console.log('animator.updateAnimator !!!:', resp);
            // update animatorType-Selections.
            dispatch(colormap.updateColormap());
            dispatch(imageStatsActions.getImageStats());
            dispatch(animator.updateAnimator(resp));
            dispatch(profiler.autoGenerate());
          });
      } else {
        console.log('no stack layer to close');
      }
    }
  };
}

function _calculateFitZoomLevel(viewWidth, viewHeight, layer) {
  const zoomX = viewWidth / layer.pixelX;
  const zoomY = viewHeight / layer.pixelY;
  let zoom = 1;

  if (zoomX < 1 || zoomY < 1) {
    if (zoomX > zoomY) {
      zoom = zoomY; // aj.fits, 512x1024, slim
    } else {
      zoom = zoomX; // 502nmos.fits, 1600x1600, fat
    }
  } else { // equual or smaller than window size
    if (zoomX > zoomY) {
      zoom = zoomY; // M100_alma.fits,52x62 slim
    } else {
      zoom = zoomX; // cube_x220_z100_17MB,220x220 fat
    }
  }

  return zoom;
}

function selectFileToOpen(path) {
  mongoUpsert(ImageViewerDB, { requestingFile: true }, 'REQUESTING_FILE');
  return (dispatch, getState) => {
    const state = getState();

    const nameArray = path.split('/');
    const fileName = nameArray[nameArray.length - 1];

    const controllerID = state.ImageViewerDB.controllerID;
    const arg = `id:${controllerID},data:${path}`;

    api.instance().sendCommand(Commands.SELECT_FILE_TO_OPEN, arg)
      .then((resp) => {
        console.log('response is SELECT_FILE_TO_OPEN:', resp);

        // dispatch(profiler.getProfile());
        dispatch(profiler.autoGenerate());
        dispatch(histogramActions.getHistogramData());
        dispatch(histogramSettingsActions.getHistogramPref());
        dispatch(gridControl.getDataGrid());
        dispatch(imageStatsActions.getImageStats());
        dispatch(colormap.updateColormap());
        // dispatch(profiler.getCurveData());
        return dispatch(imageViewer.updateStack());
      })
      .then((stack) => {
        // NOTE Sometimes when open A(3d), then B(2d), will only get image animatorType,
        // so when switch back to A(3d), need to query animatorType list again.
        dispatch(animator.updateAnimator(stack));

        if (stack.layers) {
          const len = stack.layers.length;
          if (len > 0) {
            const lastLayer = stack.layers[len - 1];
            const lastLayerNameArray = stack.layers[len - 1].name.split('/');
            const lastLayerName = lastLayerNameArray[lastLayerNameArray.length - 1];
            if (lastLayerName === fileName) {
              // const zoomLevel = 3;
              const viewWidth = 482;
              const viewHeight = 477;
              const zoomLevel = _calculateFitZoomLevel(viewWidth, viewHeight, lastLayer);
              // console.log('setup zoomLevel to fit panel size:', zoomLevel);
              mongoUpsert(ImageViewerDB, { zoomLevel, layerID: lastLayer.id }, 'ZOOM_RESET_PROPS');
              dispatch(imageViewer.setZoomLevel(zoomLevel, lastLayer.id));
            } else {
              console.log('something wrong');
            }
          }
        }
      });
  };
}

const actions = {
  // closeFileBrowser,
  queryServerFileList,
  selectFileToOpen,
  selectFile,
  closeFile,
};

export default actions;
