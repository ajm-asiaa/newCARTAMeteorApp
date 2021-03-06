import { ProfilerDB } from '../api/ProfilerDB';
import { mongoUpsert } from '../api/MongoHelper';
import Commands from '../api/Commands';
import api from '../api/ApiService';

const PROFILER_CHANGE = 'PROFILER_CHANGE';

export const ActionType = {
  PROFILER_CHANGE,
};

const SET_HOVER = 'SET_HOVER';
const ZOOM_PAN = 'ZOOM_PAN';
const SET_PROFILEDATA = 'SET_PROFILEDATA';

export function parseRegisterProfilerResp(resp) {
  const { cmd, data } = resp;
  // console.log('grimmer got register profiler-view command response:', data);
  const profilerID = data;

  // save profilerID to mongodb
  mongoUpsert(ProfilerDB, { profilerID }, `Resp_${cmd}`);
}

export function setupProfilerDB() {
  api.instance().setupMongoRedux(ProfilerDB, PROFILER_CHANGE);
}

function setupProfiler() {
  return (dispatch) => {
    // api.instance().setupMongoRedux(dispatch, ProfilerDB, PROFILER_CHANGE);

    const cmd = Commands.REGISTER_VIEWER;
    const params = 'pluginId:Profiler,index:0';

    // console.log('send register Profiler');

    // api.instance().sendCommand(cmd, params, (resp) => {
    //   // console.log('get register Profiler result:', resp);

    //   parseRegisterProfilerResp(resp);
    // });
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const profilerID = resp.data;
        const command = `${profilerID}:${Commands.GET_PROFILER_SETTINGS}`;
        const parameters = '';
        api.instance().sendCommand(command, parameters)
          .then((response) => {
            console.log('Try to get the setting of profiler!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', response);
            const profilerSettings = response.data;
            mongoUpsert(ProfilerDB, { profilerID, profilerSettings }, 'getProfilerSettings');
          })
          // .then(() => {
          //   parseRegisterProfilerResp(resp);
          // })
          .then(() => {
            dispatch(getFitData());
            dispatch(getFitStatistics());
          });
      });
  };
}

// function clearProfile() {
//   return (dispatch) => {
//     const data = { x: [], y: [] };
//     mongoUpsert(ProfilerDB, { profileData: data }, SET_PROFILEDATA);
//   };
// }

function getProfile() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    // console.log('profilerID for getting profile: ', profilerID);

    const cmd = `${profilerID}:${Commands.GET_PROFILE_DATA}`;
    const params = '';

    api.instance().sendCommand(cmd, params, (resp) => {
      // console.log('get response of profile:', resp);
      console.log('PROFILE DATA: ', resp.data);
      const { curves } = resp.data;
      mongoUpsert(ProfilerDB, { profileData: curves }, SET_PROFILEDATA);
    });
  };
}

function getFitData() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.GET_FIT_DATA}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const { fit, x, y } = resp.data;
        const fitData = [{ x, y }];
        mongoUpsert(ProfilerDB, { fit, fitData }, 'GET_FIT_DATA');
      });
  };
}

function getFitStatistics() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.GET_FIT_STATISTICS}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const { fitStats } = resp.data;
        mongoUpsert(ProfilerDB, { fitStats }, 'GET_FIT_DATA');
      });
  };
}

function getCurveData() {
  return (dispatch, getState) => {
    console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:getCurveData`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        console.log('Try to get curve data', resp);
      });
  };
}

function autoGenerate() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const { profilerSettings } = getState().ProfilerDB;
    if (profilerID && profilerSettings.autoGenerate) {
      const cmd = `${profilerID}:${Commands.NEW_PROFILE}`;
      const params = '';
      api.instance().sendCommand(cmd, params)
        .then((resp) => {
          const { curves } = resp.data;
          mongoUpsert(ProfilerDB, { profileData: curves }, 'AUTO_GENERATE');
        })
        .then(() => {
          dispatch(getProfilerSettings());
        });
    }
  };
}

function clearProfiles() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.CLEAR_PROFILES}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const { curves } = resp.data;
        mongoUpsert(ProfilerDB, { profileData: curves }, SET_PROFILEDATA);
      });
  };
}

function getProfilerSettings() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.GET_PROFILER_SETTINGS}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'getProfilerSettings');
      });
  };
}

function newProfile() {
  return (dispatch, getState) => {
    console.log('*******************************************************************');
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.NEW_PROFILE}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        console.log('Test to generate profile manually', resp);
        const { curves } = resp.data;
        mongoUpsert(ProfilerDB, { profileData: curves }, SET_PROFILEDATA);
      })
      .then(() => {
        dispatch(getProfilerSettings());
      });
  };
}

function removeProfile() {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.REMOVE_PROFILE}`;
    const params = '';
    api.instance().sendCommand(cmd, params)
      .then((resp) => {
        const { curves } = resp.data;
        mongoUpsert(ProfilerDB, { profileData: curves }, SET_PROFILEDATA);
      })
      .then(() => {
        dispatch(getProfilerSettings());
      });
  };
}

function setAutoGen(value) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_AUTO_GENERATE}`;
    api.instance().sendCommand(cmd, value)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_PROFILERSETTING');
      })
      .then(() => {
        dispatch(autoGenerate());
      });
    // only for test, not implement
    // const { autoGen } = getState().ProfilerDB;
    // const value = !autoGen;
    // mongoUpsert(ProfilerDB, { autoGen: value }, 'TEST');
  };
}

function setAxisUnitsLeft(value) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_AXIS_UNITS_LEFT}`;
    api.instance().sendCommand(cmd, value)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_PROFILERSETTING');
      })
      .then(() => {
        dispatch(getProfile());
      });
  };
}

function setAxisUnitsBottom(value) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_AXIS_UNITS_BOTTOM}`;
    api.instance().sendCommand(cmd, value)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_PROFILERSETTING');
      })
      .then(() => {
        dispatch(getProfile());
      });
  };
}

function setFitCurves(value) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_FIT_CURVES}`;
    const params = value.toString();
    api.instance().sendCommand(cmd, params)
      .then(() => {
        dispatch(getProfile());
      })
      .then(() => {
        dispatch(getFitData());
      });
  };
}

function setGaussCount(value) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_GAUSS_COUNT}`;
    api.instance().sendCommand(cmd, value)
      .then((resp) => {
        const { fit } = resp.data;
        mongoUpsert(ProfilerDB, { fit }, 'SET_GAUSS_COUNT');
      })
      .then(() => {
        dispatch(getProfile());
        dispatch(getFitData());
        dispatch(getFitStatistics());
      });
  };
}

function setGenerationMode(mode) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_GENERATION_MODE}`;
    api.instance().sendCommand(cmd, mode)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_PROFILERSETTING');
      })
      .then(() => {
        dispatch(autoGenerate());
      });
  };
}

function setLegendExternal(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.legendExternal = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setLegendLine(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.legendLine = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setLegendLocation(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.legendLocation = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setLegendShow(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.legendShow = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setProfilerMainSetting(value) {
  return (dispatch, getState) => {
    mongoUpsert(ProfilerDB, { profilerMainSetting: value }, 'SET_PROFILER_MAIN_SETTING');
  };
}

function setSelectedCurve(id) {
  return (dispatch, getState) => {
    const { profilerID } = getState().ProfilerDB;
    const cmd = `${profilerID}:${Commands.SET_SELECTED_CURVE}`;
    api.instance().sendCommand(cmd, id)
      .then((resp) => {
        const { data } = resp;
        mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
      });
  };
}

// TODO: The following list of functions do not have any function so far
// They only change the initial value (from C++) saved in the mongoDB
// They should call some function to change the layout of plotly.
// List: setShowCursor, setShowFrame, setShowGridLines
//       setLegendExternal, setLegendLine, setLegendLocation, setLegendShow
function setShowCursor(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.showCursor = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setShowFrame(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.showFrame = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setShowGridLines(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    // profilerSettings.gridLines = value;
    const data = { ...profilerSettings };
    data.gridLines = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setShowStatistics(value) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    // profilerSettings.gridLines = value;
    const data = { ...profilerSettings };
    data.showStats = value;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_SELECTED_CURVE');
  };
}

function setZoomRange(zoomMin, zoomMax) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.zoomMin = zoomMin;
    data.zoomMax = zoomMax;
    // console.log('******REPLACE PROFILERSETTING********', data);
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_ZOOM');
  };
}

function setZoomRangePercent(zoomMinPercent, zoomMaxPercent) {
  return (dispatch, getState) => {
    const { profilerSettings } = getState().ProfilerDB;
    const data = { ...profilerSettings };
    data.zoomMinPercent = zoomMinPercent;
    data.zoomMaxPercent = zoomMaxPercent;
    mongoUpsert(ProfilerDB, { profilerSettings: data }, 'SET_ZOOM');
  };
}

function onHover(data) {
  return () => {
    const val = {
      curveNumber: data.points[0].curveNumber,
      pointNumber: data.points[0].pointNumber,
    };
    mongoUpsert(ProfilerDB, { data: [val] }, SET_HOVER);
  };
}

function onZoomPan(data) {
  return () => {
    let val = null;
    val = {};
    if (data['xaxis.range[0]'] !== undefined) {
      // val['xaxis.range'] = [data['xaxis.range[0]'], data['xaxis.range[1]']];
      val.xRange = [data['xaxis.range[0]'], data['xaxis.range[1]']];
    }
    if (data['yaxis.range[0]'] !== undefined) {
      // val['yaxis.range'] = [data['yaxis.range[0]'], data['yaxis.range[1]']];
      val.yRange = [data['yaxis.range[0]'], data['yaxis.range[1]']];
    }
    if (data['xaxis.autorange'] && data['yaxis.autorange']) {
      // val['xaxis.autorange'] = true;
      // val['yaxis.autorange'] = true;
      val.xAutorange = true;
      val.yAutorange = true;
    }
    if (Object.keys(val).length > 0) mongoUpsert(ProfilerDB, { zoomPanData: val }, ZOOM_PAN);
  };
}

const actions = {
  setupProfiler,
  onHover,
  onZoomPan,
  getProfile,
  // clearProfile,
  getCurveData,

  autoGenerate,
  clearProfiles,
  getFitData,
  getFitStatistics,
  getProfilerSettings,
  newProfile,
  removeProfile,
  setAutoGen,
  setAxisUnitsLeft,
  setAxisUnitsBottom,
  setFitCurves,
  setGaussCount,
  setGenerationMode,
  setLegendShow,
  setLegendExternal,
  setLegendLine,
  setLegendLocation,
  setProfilerMainSetting,
  setSelectedCurve,
  setShowCursor,
  setShowFrame,
  setShowGridLines,
  setShowStatistics,
  setZoomRange,
  setZoomRangePercent,
};

export default actions;
