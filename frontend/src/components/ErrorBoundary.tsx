import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * ErrorBoundary – catches unhandled errors anywhere in the React tree
 * and renders a full-page recovery screen instead of a blank page.
 *
 * Must be a class component because React doesn't expose an
 * error-boundary hook equivalent (as of React 18).
 */

interface ErrorBoundaryProps {
  /** Optional fallback UI; when omitted the built-in screen is used. */
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /* ------------------------------------------------------------------ */
  /*  React lifecycle hooks for error handling                          */
  /* ------------------------------------------------------------------ */

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to the console (swap for your telemetry service in production)
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  /* ------------------------------------------------------------------ */
  /*  Actions                                                           */
  /* ------------------------------------------------------------------ */

  private handleReload = (): void => {
    window.location.reload();
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Allow consumers to provide their own fallback UI
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const errorMessage =
      this.state.error?.message ?? "An unexpected error occurred.";

    return (
      <div
        role="alert"
        className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-surface text-white animate-fade-in"
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-6 text-center">
          {/* ---- Icon ---- */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 shadow-glow-brand">
            <AlertTriangle className="h-12 w-12 text-red-400" strokeWidth={1.5} />
          </div>

          {/* ---- Heading ---- */}
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Something went wrong
          </h1>

          {/* ---- Error details ---- */}
          <pre className="w-full overflow-x-auto rounded-xl border border-surface-border bg-surface-card p-4 text-left text-sm leading-relaxed text-gray-400">
            <code>{errorMessage}</code>
          </pre>

          {/* ---- Actions ---- */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Try Again */}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-glow-brand transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>

            {/* Go Home */}
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-card px-6 py-3 font-semibold text-gray-300 transition-colors hover:border-brand-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <Home className="h-4 w-4" />
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
