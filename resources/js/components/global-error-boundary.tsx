import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 font-sans">
                    <div className="max-w-2xl w-full bg-slate-900 border border-red-500/50 rounded-lg shadow-2xl p-8">
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-red-400">Application Crashed</h1>
                                <p className="text-slate-400 text-sm">A client-side error occurred preventing the page from loading.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-950 rounded-md p-4 border border-slate-800 font-mono text-sm overflow-auto max-h-48 text-red-300">
                                {this.state.error?.toString()}
                            </div>

                            {this.state.errorInfo && (
                                <details className="text-slate-500 text-xs">
                                    <summary className="cursor-pointer hover:text-slate-300 mb-2">Stack Trace (Click to expand)</summary>
                                    <pre className="whitespace-pre-wrap pl-4 border-l-2 border-slate-700">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <a href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium transition-colors">
                                Reload Page
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
