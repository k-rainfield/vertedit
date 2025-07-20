import * as vscode from 'vscode';
import * as path from 'path';

export class TategakiViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    public getWebviewContent(text: string, webview: vscode.Webview): string {
        // Get paths to the built assets
        const webviewDistPath = vscode.Uri.joinPath(this._extensionUri, 'webview-dist');
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewDistPath, 'webview.js'));
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(webviewDistPath, 'webview.css'));
        
        // Get CSP for the webview
        const nonce = this.getNonce();
        
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <title>縦書きテキストエディタ</title>
    <link href="${cssUri}" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    
    <script nonce="${nonce}">
        // Set initial content for the Preact app
        window.initialContent = ${JSON.stringify(text)};
    </script>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}