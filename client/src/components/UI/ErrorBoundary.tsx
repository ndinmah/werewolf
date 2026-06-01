import { Component, ErrorInfo, ReactNode } from 'react';
import { Skull, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { S } from '../../constants/strings';

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
        <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-center p-6 select-none relative overflow-hidden font-['Cormorant_Garamond',serif]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8a0303] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
          </div>

          <div className="max-w-md w-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#8a0303]/30 p-10 relative z-10 shadow-[0_0_50px_rgba(138,3,3,0.3)]">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#8a0303] to-transparent opacity-80"></div>

            <div className="flex justify-center mb-6">
              <div className="p-5 bg-[#030303] rounded-none border border-[#8a0303]/50 text-[#8a0303] shadow-[inset_0_0_20px_rgba(138,3,3,0.5)]">
                <Skull className="w-12 h-12 animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-['Cinzel_Decorative',serif] text-white mb-2 tracking-widest uppercase">{S.error.title}</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6 italic border-l border-r border-[#8a0303]/20 px-4">
              {S.error.story}
            </p>

            {this.state.error && (
              <div className="mb-8 p-4 bg-[#030303] border border-white/5 text-left overflow-x-auto text-xs font-sans tracking-widest text-[#8a0303] max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{S.error.btnRetry}</span>
              </Button>
              <a
                href="/"
                className="w-full text-center text-xs text-gray-500 hover:text-[#aa8c55] font-sans uppercase tracking-[0.2em] transition-colors mt-2"
              >
                {S.error.btnHome}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
