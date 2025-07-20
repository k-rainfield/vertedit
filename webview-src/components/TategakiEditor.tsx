/** @jsxImportSource preact */
import { useState, useEffect, useRef } from 'preact/hooks';
import { SaveIndicator } from './SaveIndicator';
import { VerticalTextContainer } from './VerticalTextContainer';

interface TategakiEditorProps {
  initialContent: string;
}

// VS Code API
declare const acquireVsCodeApi: () => any;

export const TategakiEditor = ({ initialContent }: TategakiEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const vscodeApiRef = useRef<any>();

  // Initialize VS Code API
  useEffect(() => {
    vscodeApiRef.current = acquireVsCodeApi();

    // Listen for messages from VS Code
    const messageListener = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'requestSave':
          handleSave();
          break;
        case 'saveComplete':
          setSaveStatus(message.success ? 'saved' : 'error');
          if (message.success) {
            setTimeout(() => setSaveStatus('idle'), 2000);
          }
          break;
      }
    };

    window.addEventListener('message', messageListener);
    return () => window.removeEventListener('message', messageListener);
  }, []);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
    setSaveStatus('unsaved');
  };

  // Handle save
  const handleSave = () => {
    if (!vscodeApiRef.current) { return; }

    setSaveStatus('saving');
    setIsModified(false);

    vscodeApiRef.current.postMessage({
      command: 'save',
      content: content
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSave();
      return;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  return (
    <div className="tategaki-app">
      <SaveIndicator status={saveStatus} />
      <VerticalTextContainer 
        content={content}
        onContentChange={handleContentChange}
      />
    </div>
  );
};