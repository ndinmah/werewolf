import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 select-none relative overflow-hidden">
          <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

          <div className="max-w-md w-full bg-dark border border-red-500/30 p-8 rounded-2xl shadow-2xl relative z-10">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-950/50 rounded-full border border-red-500/20 text-red-500">
                <AlertTriangle className="w-12 h-12" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-2 tracking-wide">Đã Xảy Ra Sự Cố</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Ứng dụng đã gặp lỗi không mong muốn. Vui lòng tải lại trang hoặc quay lại màn hình chính.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-darker border border-gray-800 rounded-lg text-left overflow-x-auto text-[10px] font-mono text-red-400 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleReset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl border border-red-500 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </Button>
              <a
                href="/"
                className="w-full text-center text-xs text-gray-500 hover:text-gray-400 font-medium py-1 transition-colors"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
