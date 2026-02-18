'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // If it's the specific specific "removeChild" error from external scripts, 
        // we don't want to show a fallback UI, we want to try to keep rendering if possible,
        // or at least show a specific message. 
        // However, for a critical React tree crash, we must show fallback.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Check if it's the known security software error
        if (error.message.includes("Failed to execute 'removeChild'") ||
            error.message.includes("The node to be removed is not a child of this node")) {
            console.warn('[GlobalErrorBoundary] Suppressed external script DOM interference error.');
            // In some cases, we might want to try to recover/reload
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
                    <div className="max-w-md text-center space-y-4">
                        <h2 className="text-xl font-bold text-red-500">System Interruption Detected</h2>
                        <p className="text-sm text-gray-400">
                            보안 프로그램(LINE/Antivirus)과의 충돌로 인해 화면 렌더링이 중단되었습니다.
                        </p>
                        <button
                            className="px-4 py-2 bg-bts-purple rounded hover:bg-purple-700 transition"
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            새로고침 (Reload)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
