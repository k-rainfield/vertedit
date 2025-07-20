import * as vscode from 'vscode';
import { TategakiViewProvider } from './tategakiViewProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TategakiViewProvider(context.extensionUri);
    let currentPanel: vscode.WebviewPanel | undefined;
    let currentDocument: vscode.TextDocument | undefined;
    
    const openVerticalViewDisposable = vscode.commands.registerCommand('tategaki.openVerticalView', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active text editor found');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'tategakiView',
            'VertEdit',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const document = activeEditor.document;
        const text = document.getText();
        
        // Store references for the save command
        currentPanel = panel;
        currentDocument = document;
        
        panel.webview.html = provider.getWebviewContent(text, panel.webview);
        
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'save':
                        if (message.content !== undefined) {
                            try {
                                console.log('Saving content:', message.content);
                                
                                const edit = new vscode.WorkspaceEdit();
                                const fullRange = new vscode.Range(
                                    document.positionAt(0),
                                    document.positionAt(document.getText().length)
                                );
                                edit.replace(document.uri, fullRange, message.content);
                                
                                const success = await vscode.workspace.applyEdit(edit);
                                if (success) {
                                    await document.save();
                                    vscode.window.showInformationMessage('縦書きエディタの内容が保存されました');
                                    
                                    // Send confirmation back to webview
                                    panel.webview.postMessage({
                                        command: 'saveComplete',
                                        success: true
                                    });
                                } else {
                                    vscode.window.showErrorMessage('保存に失敗しました');
                                    panel.webview.postMessage({
                                        command: 'saveComplete',
                                        success: false
                                    });
                                }
                            } catch (error) {
                                console.error('Save error:', error);
                                vscode.window.showErrorMessage('保存中にエラーが発生しました: ' + error);
                                panel.webview.postMessage({
                                    command: 'saveComplete',
                                    success: false
                                });
                            }
                        }
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
        
        panel.onDidDispose(() => {
            currentPanel = undefined;
            currentDocument = undefined;
        });
    });

    // Register save command
    const saveDisposable = vscode.commands.registerCommand('tategaki.save', async () => {
        if (currentPanel && currentDocument) {
            // Request content from webview
            currentPanel.webview.postMessage({
                command: 'requestSave'
            });
        } else {
            vscode.window.showErrorMessage('縦書きエディタが開いていません');
        }
    });

    // Register reload command
    const reloadDisposable = vscode.commands.registerCommand('tategaki.reload', async () => {
        if (currentPanel && currentDocument) {
            // Reload webview content with current document content
            const text = currentDocument.getText();
            currentPanel.webview.html = provider.getWebviewContent(text, currentPanel.webview);
            vscode.window.showInformationMessage('縦書きエディタをリロードしました');
        } else {
            vscode.window.showErrorMessage('縦書きエディタが開いていません');
        }
    });

    context.subscriptions.push(openVerticalViewDisposable, saveDisposable, reloadDisposable);
}

export function deactivate() {}