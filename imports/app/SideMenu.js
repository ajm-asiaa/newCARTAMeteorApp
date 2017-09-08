import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItemMUI from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';

import NavNext from 'material-ui/svg-icons/image/navigate-next';
import NavBefore from 'material-ui/svg-icons/image/navigate-before';
import Backspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import Folder from 'material-ui/svg-icons/file/folder';
import Run from 'material-ui/svg-icons/maps/directions-run';

import FileBrowser from '../fileBrowser/FileBrowser';

const openWidth = 200;
const closeWidth = 65;

export default class SideMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      width: 65,
      openFiles: false,
      openBrowser: false,
    };
  }
  handleToggle = () => {
    this.props.handleExpand();
  }
  handleLogout = () => {
    this.props.handleLogout();
  }
  handleOpenFiles = () => {
    this.props.expandToTrue();
    this.setState({
      width: this.state.openWidth,
      openFiles: !this.state.openFiles,
      openBrowser: !this.state.openBrowser,
    });
  }
  handleNavBack = () => {
    this.setState({
      openFiles: !this.state.openFiles,
      openBrowser: !this.state.openBrowser,
    });
  }
  render() {
    const buttonStyle1 = { margin: 'auto', left: '10%', bottom: '10px', position: 'absolute' };
    const buttonStyle2 = { margin: 'auto', right: '10%', bottom: '10px', position: 'absolute' };
    const menu = (
      <div>
        <MenuItemMUI style={{ overflowX: 'hidden' }} onClick={this.handleOpenFiles} primaryText="Files" leftIcon={<Folder />} />
        <MenuItemMUI style={{ overflowX: 'hidden' }} onClick={this.handleLogout} primaryText="Sign out" leftIcon={<Run />} />
        {
          this.props.expand ?
            <IconButton style={buttonStyle2}>
              <NavBefore onTouchTap={this.handleToggle} />
            </IconButton>
            : <IconButton style={buttonStyle1}>
              <NavNext onTouchTap={this.handleToggle} />
            </IconButton>
        }
      </div>
    );

    let width = 0;
    if (this.props.expand) {
      width = openWidth;
    } else {
      width = closeWidth;
    }

    return (
      <Drawer
        width={width}
        style={{ opacity: 0.8 }}
      >
        {
          this.state.openFiles ?
            <div>
              <IconButton>
                <Backspace onTouchTap={this.handleNavBack} />
              </IconButton>
              <FileBrowser openBrowser={this.state.openBrowser} />
            </div>
            : menu
        }
      </Drawer>
    );
  }
}
