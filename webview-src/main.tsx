/** @jsxImportSource preact */
import { render } from 'preact';
import { TategakiEditor } from './components/TategakiEditor';
import './styles.css';

// Get initial content from the global variable set by VS Code
declare global {
  interface Window {
    initialContent: string;
  }
}

const App = () => {
  return <TategakiEditor initialContent={window.initialContent || ''} />;
};

render(<App />, document.getElementById('root')!);