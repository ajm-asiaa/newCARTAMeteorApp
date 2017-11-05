
const REGISTER_VIEWER = '/CartaObjects/ViewManager:registerView';
const REQUEST_FILE_LIST = '/CartaObjects/DataLoader:getData';
const SELECT_FILE_TO_OPEN = '/CartaObjects/ViewManager:dataLoaded';

// New commands for new CARTA:
// const GET_DEFAULT_HISTOGRAM_ID = '/CartaObjects/ViewManager:getDefaultHistogramID';
const QUERY_ANIMATOR_TYPES = 'queryAnimatorTypes';
const GET_ANIMATORTYPE_ID = 'registerAnimator';
const GET_SELECTION_DATA = 'getSelecitonData';
const NEW_ZOOM = 'newzoom';
const SET_ZOOM_LEVEL = 'setZoomLevel';
const SET_FRAME = 'setFrame';
const GET_STACK_DATA = 'getStackData';
const CLOSE_IMAGE = 'closeImage';
// TODO some commands need parameters, wrap them as a function

const Commands = {
  REGISTER_VIEWER,
  REQUEST_FILE_LIST,
  SELECT_FILE_TO_OPEN,
  QUERY_ANIMATOR_TYPES,
  GET_ANIMATORTYPE_ID,
  GET_SELECTION_DATA,
  NEW_ZOOM,
  SET_ZOOM_LEVEL,
  SET_FRAME,
  GET_STACK_DATA,
  CLOSE_IMAGE,
  // GET_DEFAULT_HISTOGRAM_ID,
};

export default Commands;
