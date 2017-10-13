import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import actions from './actions';
import People from 'material-ui/svg-icons/social/people';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';

const style = {
  margin: 12,
  marginLeft: '50%',
};

class SessionUI extends Component {
  constructor(props) {
    super(props);
    this.state = { watching: false, sessionText: '', open: false };
  }

  handleChange = (event) => {
    console.log('event:', event.target.value);
    this.setState({
      sessionText: event.target.value,
    });
  }
  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };
  switchWatchMode = () => {
    // if(this.state.watching || this.state.sessionText) {
    //   this.setState({watching: !this.state.watching});
    // }
    if (!this.state.watching) {
      if (this.state.sessionText) {
        this.setState({ watching: true });
        // save to SeesionManger:
        this.props.dispatch(actions.turnOnWatching(this.state.sessionText));
      } else {

      }
    } else {
      this.setState({ watching: false });
      this.props.dispatch(actions.turnOffWatching());
    }

    // TODO: save to redux
  }

  render() {
    const { sessionID } = this.props;
    const buttonLabel = !this.state.watching ? 'Get Screen' : 'StopWatch';
    return (
      <div>
        <IconButton>
          <People onTouchTap={this.handleTouchTap} />
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          style={{ width: '300px', height: '180px' }}
        >
          <TextField
            value={this.state.sessionText}
            hintText="Input Shared Screen's SessionID"
            onChange={this.handleChange}
            style={{ padding: '10px', paddingTop: 0 }}
          /><br />
          <RaisedButton onTouchTap={this.switchWatchMode} label={buttonLabel} style={style} />
          <br />
          <p style={{ textAlign: 'center' }}>
            My Session ID: <br />
            {sessionID}
          </p>
        </Popover>
      </div>
    );
  }
}


// let SessionUI = ({ sessionID }) => {
//   return (
//     <div>
//       <TextField
//         value="abc"
//         hintText="Input Shared Screen's SessionID"
//         onChange={handleChange}
//       />
//       <RaisedButton onTouchTap={this.switchShareMode} label="Get Screen" style={style} />
//       SelfSessionID: {sessionID}
//     </div>
//   )
// }

const mapStateToProps = state => ({
  // imageURL: state.image.imageURL,
  sessionID: state.sessionID,
});

export default connect(mapStateToProps)(SessionUI);

// export default SessionUI;