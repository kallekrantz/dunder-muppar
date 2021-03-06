import * as GIFEncoder from 'gif-encoder-2';
import { createCanvas } from 'canvas';
import { performance } from 'perf_hooks';
import { writeFile } from 'fs';
import * as path from 'path';

import GameState from './GameState';
import Renderer from './Renderer';

const defaultColors = [
  '#ff0000',
  '#00ff00',
  '#ffff00',
  '#0000ff',
  '#ff00ff',
  '#00ffff',
  '#ffffff',
];

/*
drawBackground();
ctx.fillStyle = '#ff0000';
ctx.fillRect(0, 0, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#00ff00';
ctx.fillRect(half, 0, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#0000ff';
ctx.fillRect(half, half, half, half);
encoder.addFrame(ctx);

drawBackground();
ctx.fillStyle = '#ffff00';
ctx.fillRect(0, half, half, half);
encoder.addFrame(ctx);*/

// TACK BENJAMIN
// VARSÅGOOOD
// https://github.com/benjaminadk/gif-encoder-2

class GifRenderer implements Renderer {
  private history: GameState[];

  constructor(debug: boolean) {
    this.history = [];
  }
  render(state: GameState) {
    //const { x: width, y: height } = state.constants.boardSize;
    this.history.push(state);
  }

  finalize() {
    const { x: width, y: height } = this.history[0].constants.boardSize;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(width, height);
    encoder.setDelay(0);
    encoder.start();
    console.time('RenderTotal');
    for (
      let i = 0;
      i < this.history.length;
      i += 4 * this.history[i].players.length
    ) {
      const state = this.history[i];
      encoder.addFrame(ctx);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      for (const player of state.players) {
        ctx.beginPath();
        ctx.strokeStyle = defaultColors[player.id];
        ctx.lineWidth = 2;
        ctx.moveTo(
          Math.floor(player.segments[0].p0.x),
          Math.floor(player.segments[0].p0.y)
        );
        for (const segment of player.segments) {
          ctx.lineTo(Math.floor(segment.p1.x), Math.floor(segment.p1.y));
        }
        ctx.stroke();
      }
    }

    encoder.finish();

    const buffer = encoder.out.getData();
    writeFile(path.join(__dirname, 'beginner.gif'), buffer, (error) => {
      if (error) {
        console.log('error writing gif', error);
      } else {
        console.log('gif rendering successful');
      }
      let t1 = performance.now();
      console.timeEnd('RenderTotal');
    });
  }
}

export default GifRenderer;
