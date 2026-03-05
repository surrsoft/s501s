import { TrainRenderer } from './renderer';
import { TrainSettings } from './renderer';

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
};

const vscode = acquireVsCodeApi();

const canvas = document.getElementById('trainCanvas') as HTMLCanvasElement;
const renderer = new TrainRenderer(canvas);
renderer.start();

// Tell the extension we're ready to receive settings
vscode.postMessage({ type: 'ready' });

// Listen for messages from the extension host
window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data as { type: string; settings?: TrainSettings };
  if (msg.type === 'settings' && msg.settings) {
    renderer.applySettings(msg.settings);
  }
});
