import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// 基础错误边界组件（不涉及Firebase相关错误处理）
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("应用错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-900">
          <div className="text-5xl text-red-500 mb-4">
            <i className="fa fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">加载失败</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            应用加载过程中出现错误，请重试
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
          >
            <i className="fa fa-refresh mr-2"></i>重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
    
