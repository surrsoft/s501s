import * as vscode from 'vscode';
import { TrainViewProvider } from './trainPanel';

export function activate(context: vscode.ExtensionContext): void {
  const provider = new TrainViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(TrainViewProvider.viewId, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('train-view.focus', () => {
      vscode.commands.executeCommand(`${TrainViewProvider.viewId}.focus`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('train-view.reload', () => {
      provider.reload();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('train-view')) {
        provider.sendSettings();
      }
    })
  );
}

export function deactivate(): void {}
