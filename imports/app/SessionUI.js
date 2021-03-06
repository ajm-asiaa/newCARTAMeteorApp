import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
/* material-ui beta */
import PeopleIcon from 'material-ui-icons/People';
import Copy from 'material-ui-icons/ContentCopy';
import IconButton from 'material-ui-next/IconButton';
import Popover from 'material-ui-next/Popover';
import TextField from 'material-ui-next/TextField';
import Button from 'material-ui-next/Button';
// import Popover from 'material-ui/Popover';
import actions from './actions';
// import SessionManager from '../api/SessionManager';

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
    // console.log('event:', event.target.value);
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
        {/* <IconButton onClick={this.handleTouchTap}>
          <People />
        </IconButton> */}
        <IconButton
          onClick={this.handleTouchTap}
        >
          <PeopleIcon />
        </IconButton>
        {this.state.watching ? 'watching' : false}
        <Popover
          open={this.state.open}
          onClose={this.handleRequestClose}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          style={{ width: '400px', height: '200px' }}
        >
          <TextField
            value={this.state.sessionText}
            label="Input shared screen's session ID"
            placeholder="shared screen ID"
            onChange={this.handleChange}
            style={{ margin: 10, width: '300px' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                this.switchWatchMode();
              }
            }}
            // style={{ padding: '10px', paddingTop: 0 }}
            margin="normal"
          />
          <Button
            variant="raised"
            size="medium"
            onClick={this.switchWatchMode}
            style={style}
          >
            {buttonLabel}
          </Button>
          <p style={{ textAlign: 'center' }}>
            My Session ID: <br />
            {sessionID}
            <CopyToClipboard
              text={sessionID}
            >
              <IconButton>
                <Copy />
              </IconButton>
            </CopyToClipboard>
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
