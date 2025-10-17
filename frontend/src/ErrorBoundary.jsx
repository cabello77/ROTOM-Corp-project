import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-2 text-red-700">Something went wrong</h2>
            <p className="text-sm text-gray-700 mb-4">An unexpected error occurred in the application. The details are shown below — this helps debugging.</p>
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-gray-800 overflow-auto" style={{maxHeight: '40vh'}}>
              <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{String(error && error.toString())}</pre>
              {errorInfo && <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{String(errorInfo.componentStack)}</pre>}
            </div>
            <div className="flex gap-3">
              <button onClick={this.handleReload} className="bg-red-600 text-white px-4 py-2 rounded">Reload</button>
              <button onClick={() => console.log('Error details copied:', error, errorInfo)} className="bg-gray-200 px-4 py-2 rounded">Log details</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
