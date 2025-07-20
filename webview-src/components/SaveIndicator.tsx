///** @_jsx h */
/** @jsxImportSource preact */
//import { h } from 'preact';

interface SaveIndicatorProps {
  status: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
}

export const SaveIndicator = ({ status }: SaveIndicatorProps) => {
  const getStatusText = () => {
    switch (status) {
      case 'unsaved':
        return '未保存';
      case 'saving':
        return '保存中...';
      case 'saved':
        return '保存済み';
      case 'error':
        return '保存失敗';
      default:
        return '保存済み';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'unsaved':
      case 'error':
        return '#d73a49';
      case 'saving':
        return '#0366d6';
      case 'saved':
        return '#28a745';
      default:
        return '#666';
    }
  };

  return (
    <div className="indicator-container">
      <div 
        className="save-indicator"
        style={{ color: getStatusColor() }}
      >
        {getStatusText()}
      </div>
    </div>
  );
};