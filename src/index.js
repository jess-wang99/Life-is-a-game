import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// 添加错误边界处理Firebase可能的初始化错误
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("应用错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-6 text-center">
        <h2 className="text-2xl text-red-500">加载失败</h2>
        <p className="mt-2">请检查网络连接或稍后再试</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          重新加载
        </button>
      </div>;
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
    
