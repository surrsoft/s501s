import * as vscode from 'vscode';

export interface TrainSettings {
  speed: 'slow' | 'normal' | 'fast';
  biome: 'auto' | 'forest' | 'field' | 'city' | 'mountains' | 'tundra';
  timeOfDay: 'auto' | 'day' | 'sunset' | 'night';
  weather: 'auto' | 'clear' | 'rain' | 'snow' | 'fog';
}

export class TrainViewProvider implements vscode.WebviewViewProvider {
  static readonly viewId = 'train-view';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._buildHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.type === 'ready') {
        this.sendSettings();
      }
    });
  }

  reload(): void {
    if (!this._view) return;
    this._view.webview.html = this._buildHtml(this._view.webview);
  }

  sendSettings(): void {
    if (!this._view) return;
    this._view.webview.postMessage({ type: 'settings', settings: this._readSettings() });
  }

  private _readSettings(): TrainSettings {
    const cfg = vscode.workspace.getConfiguration('train-view');
    return {
      speed: cfg.get<TrainSettings['speed']>('speed', 'normal'),
      biome: cfg.get<TrainSettings['biome']>('biome', 'auto'),
      timeOfDay: cfg.get<TrainSettings['timeOfDay']>('timeOfDay', 'auto'),
      weather: cfg.get<TrainSettings['weather']>('weather', 'auto'),
    };
  }

  private _buildHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview-dist', 'webview.js')
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Train View</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  <canvas id="trainCanvas"></canvas>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
