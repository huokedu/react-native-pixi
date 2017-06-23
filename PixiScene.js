import React from 'react';
import Expo, { GLView } from 'expo';
import { Dimensions, Platform } from 'react-native'
import './FakeBrowser'
import HTMLCanvasElement from './FakeCanvas';
import CanvasRenderingContext2D from "react-native-canvas";


export const createTextureAsync = async ({ asset }) => {
  if (!asset.localUri) {
    await asset.downloadAsync();
  }
  return ({
    data: asset,
    width: asset.width,
    height: asset.height,
  });
};

var textStyle = { fill: 0xffffff };
function createSprite(texture, text) {
  var sprite = new PIXI.Sprite(texture);
  // sprite.addChild(new PIXI.Text(text, textStyle));
  sprite.anchor.set(0.5, 1);
  // sprite.children[0].anchor.set(0.5, 0);
  sprite.interactive = true;
  // sprite.on('click', function() { this.alpha = 1.7 - this.alpha; } );
  return sprite;
}


var PIXI = require('pixi.js');
// import phaser from 'phaser-ce'
export default class PixiScene extends React.Component {

  render() {
    return (
      <GLView
        style={this.props.style}
        onContextCreate={this._onContextCreate}
      />
    );
  }

  _onContextCreate = async gl => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const { width: screenWidth, height: screenHeight, scale } = Dimensions.get("window");


     /*
      This stuff is W.I.P: Trying to implement a canvas.
    */

    // console.log({ width, height, scale });
    // gl.enableLogging = true;
    const isAndroid = Platform.OS === 'android';
    var ctx = new CanvasRenderingContext2D(gl, width, height, isAndroid ? scale : 1),
      // Mockup of canvas class to bypass sanity checks inside chartjs
      canvas = new HTMLCanvasElement(ctx, width, height);
    ctx.drawImage = (image, x, y) => {
      image = image || { width: 10, height: 10 };
      ctx.fillRect(x, y, image.width, image.height)
    }
    ctx.getImageData = (x, y, width, height) => {
    }
    // Global in RN is like window in browser
    global.HTMLCanvasElement = HTMLCanvasElement;
    global.CanvasRenderingContext2D = CanvasRenderingContext2D;
    global.canvas = canvas
    global.canvasContext = ctx;


    /*
      Hack in a stencil flag
    */
    gl.getContextAttributes = (() => {
      return {
        stencil: true
      }
    });
    window.WebGLRenderingContext = gl;


    /*
      Setup Pixi Application
      Pass through our EXGL context
    */

    var app = new PIXI.Application(width, height, {
      context: gl,
      backgroundColor: 0x1099bb
    });


    /*
      TODO:
      Textures aren't working
      when they do we should see Ben Affleck
    */
    // create a new Sprite from an image path
    // console.warn(texture.data.type, texture.data.localUri)
    var benny = PIXI.Sprite.from('https://usefulstooges.files.wordpress.com/2016/10/affleck.jpg')

    // center the sprite's anchor point
    benny.anchor.set(0.5);
    benny.width = 300;
    benny.height = 300;
    // move the sprite to the center of the screen
    benny.x = app.renderer.width / 2;
    benny.y = app.renderer.height / 2;


    /*
      Draw some random Graphics
    */
    var graphics = new PIXI.Graphics();

    // set a fill and line style
    graphics.beginFill(0xFF3300);
    graphics.lineStyle(4, 0xffd900, 1);

    // draw a shape
    graphics.moveTo(50,50);
    graphics.lineTo(250, 50);
    graphics.lineTo(100, 100);
    graphics.lineTo(50, 50);
    graphics.endFill();

    // set a fill and a line style again and draw a rectangle
    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.beginFill(0xFF700B, 1);
    graphics.drawRect(benny.x, benny.y, benny.width, benny.height);
    graphics.endFill();

    // draw a rounded rectangle
    graphics.lineStyle(2, 0xFF00FF, 1);
    graphics.beginFill(0xFF00BB, 0.25);
    graphics.drawRoundedRect(150, 450, 300, 100, 15);
    graphics.endFill();

    // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    graphics.lineStyle(0);
    graphics.beginFill(0xFFFF0B, 0.5);
    graphics.drawCircle(470, 90,60);
    graphics.endFill();

    app.stage.addChild(graphics);

    app.stage.addChild(benny);

    /*
      Listen to the tick and call `gl.endFrameEXP();`
      to end a frame.
    */
    app.ticker.add(function (delta) {
      //  benny.rotation += 0.1 * delta;
      gl.endFrameEXP();
    });
  };
}