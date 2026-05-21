"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  resetKey?: string | number;
};

type ChatErrorBoundaryState = {
  error: Error | null;
};

export class ChatErrorBoundary extends Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  state: ChatErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[chat] render boundary caught an error", error);
  }

  componentDidUpdate(prevProps: ChatErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (!error) {
      return children;
    }

    if (typeof fallback === "function") {
      return fallback(error, this.reset);
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-[1.75rem] border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-50">
        <div className="max-w-md">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Chat render issue
          </div>
          <p className="mt-2 leading-6 text-red-100">The chat UI hit an error while rendering. You can reset the view and continue.</p>
          <Button type="button" variant="outline" onClick={this.reset} className="mt-4 border-red-300/30 bg-white/5 text-red-50 hover:bg-white/10">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset view
          </Button>
        </div>
      </div>
    );
  }
}
