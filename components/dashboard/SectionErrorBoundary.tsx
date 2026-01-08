'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section Error Boundary
 * Catches errors in dashboard sections without breaking the entire page
 * Provides user-friendly error UI with retry functionality
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Section error caught:', error, errorInfo);
    
    // Call optional error handler prop
    this.props.onError?.(error, errorInfo);

    // You could also send error to logging service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div 
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm animate-in fade-in duration-300"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle 
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5" 
              aria-hidden="true"
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-400 mb-1">
                {this.props.sectionName 
                  ? `Failed to load ${this.props.sectionName}` 
                  : 'Failed to load this section'}
              </h4>
              <p className="text-sm text-red-300/80 mb-3">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label="Retry loading section"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary Hook-based alternative (for function components)
 * Note: This is a simplified version. For production, consider using react-error-boundary library
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

export function AsyncErrorBoundary({ children, fallback, sectionName }: AsyncErrorBoundaryProps) {
  return (
    <SectionErrorBoundary fallback={fallback} sectionName={sectionName}>
      {children}
    </SectionErrorBoundary>
  );
}
