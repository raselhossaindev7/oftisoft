"use client"
import { AnimatedDiv } from "@/lib/animated";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
    this.setState({ error, errorInfo });
    
    // Log to error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === "production") {
      // await logErrorToService(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#030712] to-[#0f172a]">
          <AnimatedDiv initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  Something Went Wrong
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  We apologize for the inconvenience. The application has encountered an unexpected error.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/30 rounded-lg border border-red-500/20">
                  <p className="text-sm text-red-400 font-mono break-all">
                    {this.state.error?.message || "Unknown error"}
                  </p>
                  {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={this.handleReload}
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Link>
                  </Button>
                </div>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/contact">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </AnimatedDiv>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch async errors
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error) => {
    console.error("Caught error:", error);
    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // await logErrorToService(error);
    }
  }, []);

  return { handleError };
}