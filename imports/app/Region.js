import React, { Component } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { Layer, Stage, Rect, Circle, Group } from 'react-konva';
import RaisedButton from 'material-ui/RaisedButton';

let startX;
let endX;
let startY;
let endY;
let mouseIsDown = 0;
class Region extends Component {
  constructor(props) {
    super(props);
    this.regions = [];
    this.state = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      regionArray: [],
    };
  }
  onMouseDown = (event) => {
    // console.log('INSIDE mouseDown');
    // console.log('EVENT: ', event);
    mouseIsDown = 1;
    // const pos = this.getMousePos(document.getElementById('canvas'), event);
    const pos = this.getMousePos(this.div, event);
    // console.log('MOUSE POSITION: ', pos);
    endX = pos.x;
    endY = pos.y;
    startX = endX;
    startY = endY;
    this.drawRect();
  }
  onMouseMove = (event) => {
    if (mouseIsDown === 1) {
      // const pos = this.getMousePos(document.getElementById('canvas'), event);
      const pos = this.getMousePos(this.div, event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
    }
  }
  onMouseUp = (event) => {
    if (mouseIsDown === 1) {
      mouseIsDown = 0;
      // const pos = this.getMousePos(document.getElementById('canvas'), event);
      const pos = this.getMousePos(this.div, event);
      endX = pos.x;
      endY = pos.y;
      this.drawRect();
      this.div.removeEventListener('mousedown', this.onMouseDown);
      this.div.removeEventListener('mousemove', this.onMouseMove);
      this.div.removeEventListener('mouseup', this.onMouseUp);
      // document.getElementById('canvas').removeEventListener('mousedown', this.onMouseDown);
      // document.getElementById('canvas').removeEventListener('mousemove', this.onMouseMove);
      // document.getElementById('canvas').removeEventListener('mouseup', this.onMouseUp);
    }
  }
  getMousePos = (canvas, event) => {
    // console.log('INSIDE getMousePos');
    // console.log('getMousePos CANVAS: ', canvas);
    // console.log('getMousePos EVENT: ', event);
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
  setShape = () => {
    if (mouseIsDown === 0) {
      this.setState(prevState => ({
        regionArray: prevState.regionArray.concat({
          x: prevState.x,
          y: prevState.y,
          w: prevState.width,
          h: prevState.height,
          key: Math.floor(Math.random() * 10000),
        }),
      }));
    }
  }
  init = () => {
    this.div.addEventListener('mousedown', this.onMouseDown);
    this.div.addEventListener('mousemove', this.onMouseMove);
    this.div.addEventListener('mouseup', this.onMouseUp);
    // document.getElementById('canvas').addEventListener('mousedown', this.onMouseDown);
    // document.getElementById('canvas').addEventListener('mousemove', this.onMouseMove);
    // document.getElementById('canvas').addEventListener('mouseup', this.onMouseUp);
  }
  drawRect = () => {
    const w = endX - startX;
    const h = endY - startY;
    const offsetX = (w < 0) ? w : 0;
    const offsetY = (h < 0) ? h : 0;
    // const width = Math.abs(w);
    // const height = Math.abs(h);
    this.setState({
      x: startX + offsetX,
      y: startY + offsetY,
      width: Math.abs(w),
      height: Math.abs(h),
    });
    if (mouseIsDown === 0) {
      this.setShape();
    }
  }
  delete = () => {
    const target = this.state.toDelete;
    // const attrs = target.getAttrs();
    if (this.state.regionArray.length === 1) {
      this.setState({ regionArray: [] });
    } else {
      this.setState(prevState => ({
        // regionArray: prevState.regionArray.filter(item => !_.isEqual(item, target)),
        // regionArray: prevState.regionArray.filter(item =>
        //   (item.x !== attrs.x) && (item.y !== attrs.y) &&
        //   (item.w !== target.width) && (item.h !== target.height),
        // ),
        regionArray: prevState.regionArray.filter(item => item.key !== target),
      }));
    }
  }
  reshape = (newW, newH, newX, newY, index) => {
    const arr = this.state.regionArray;
    const newArray = update(arr[index],
      { x: { $set: newX }, y: { $set: newY }, w: { $set: newW }, h: { $set: newH },
      });
    const data = update(arr, { $splice: [[index, 1, newArray]] });
    process.nextTick(() => {
      this.setState({
        regionArray: data,
      });
    });
  }
  addAnchor = (item) => {
    const anchors = (
      <Group>
        <Circle
          x={item.x}
          y={item.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topLeft')) {
              this.regions[item.key].topLeft = node;
              this.regions[item.key].topLeft.on('dragmove', () => {
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.state.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].topLeft.getAttrs().x;
                const y = this.regions[item.key].topLeft.getAttrs().y;
                const newW = Math.abs((itemX + itemW) - x);
                const newH = Math.abs((itemY + itemH) - y);
                this.reshape(newW, newH, x, y, i);
              });
            }
          }}
        />
        <Circle
          x={item.x + item.w}
          y={item.y}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('topRight')) {
              this.regions[item.key].topRight = node;
              this.regions[item.key].topRight.on('dragmove', () => {
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.state.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].topRight.getAttrs().x;
                const y = this.regions[item.key].topRight.getAttrs().y;
                const newW = Math.abs(itemW - ((itemX + itemW) - x));
                const newH = Math.abs((itemY + itemH) - y);
                this.reshape(newW, newH, itemX, y, i);
              });
            }
          }}
        />
        <Circle
          x={item.x}
          y={item.y + item.h}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomLeft')) {
              this.regions[item.key].bottomLeft = node;
              this.regions[item.key].bottomLeft.on('dragmove', () => {
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.state.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].bottomLeft.getAttrs().x;
                const y = this.regions[item.key].bottomLeft.getAttrs().y;
                const newW = Math.abs((itemX + itemW) - x);
                const newH = Math.abs(itemH - ((itemY + itemH) - y));
                this.reshape(newW, newH, x, itemY, i);
              });
            }
          }}
        />
        <Circle
          x={item.x + item.w}
          y={item.y + item.h}
          stroke="#666"
          fill="#ddd"
          strokeWidth={2}
          radius={8}
          draggable
          ref={(node) => {
            if (node && !this.regions[item.key].hasOwnProperty('bottomRight')) {
              this.regions[item.key].bottomRight = node;
              this.regions[item.key].bottomRight.on('dragmove', () => {
                let itemX = 0;
                let itemY = 0;
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.state.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemX = obj.x;
                    itemY = obj.y;
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].bottomRight.getAttrs().x;
                const y = this.regions[item.key].bottomRight.getAttrs().y;
                const newW = Math.abs(itemW - ((itemX + itemW) - x));
                const newH = Math.abs(itemH - ((itemY + itemH) - y));
                this.reshape(newW, newH, itemX, itemY, i);
              });
            }
          }}
        />
      </Group>
    );
    const result = (
      <Group
        key={item.key}
      >
        <Rect
          x={item.x}
          y={item.y}
          width={item.w}
          height={item.h}
          stroke="red"
          draggable
          listening
          ref={(node) => {
            if (node && !this.regions.hasOwnProperty(item.key)) {
              this.regions[item.key] = { shape: node };
              this.regions[item.key].shape.on('dragmove', () => {
                let itemW = 0;
                let itemH = 0;
                let i = 0;
                this.state.regionArray.forEach((obj, index) => {
                  if (obj.key === item.key) {
                    itemW = obj.w;
                    itemH = obj.h;
                    i = index;
                  }
                });
                const x = this.regions[item.key].shape.getAttrs().x;
                const y = this.regions[item.key].shape.getAttrs().y;
                this.reshape(itemW, itemH, x, y, i);
              });
              this.regions[item.key].shape.on('click', () => {
                this.setState({
                  toDelete: item.key,
                });
              });
            }
          }}
        />
        {anchors}
      </Group>
    );
    return result;
  }
  render() {
    const rect = (
      <Rect
        x={this.state.x}
        y={this.state.y}
        width={this.state.width}
        height={this.state.height}
        stroke="red"
        listening
        key={this.state.x + this.state.y}
      />
    );
    return (
      <div>
        <div ref={(node) => { this.div = node; }}>
          <Stage
            id="stage"
            width={637}
            height={477}
          >
            <Layer
              id="layer"
            >
              {/* <ImageViewer /> */}
              {(mouseIsDown === 1) ? rect : false}
              {this.state.regionArray.map(item => this.addAnchor(item))}
            </Layer>
          </Stage>
        </div>
        <RaisedButton label="rectangle" onClick={this.init} />
        <RaisedButton label="delete" onClick={this.delete} />
      </div>
    );
  }
}
export default Region;
