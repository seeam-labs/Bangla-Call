import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-500/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl shadow-rose-500/10">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-heading">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
              We encountered an unexpected error. Please try reloading the page to restore functionality.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
