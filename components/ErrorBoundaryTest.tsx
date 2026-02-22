"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { withErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Test component to demonstrate different error scenarios
 * This component is wrapped with ErrorBoundary to catch errors
 */
function ErrorTestComponent() {
  const [testState, setTestState] = useState<string>("idle");

  // Test 1: Throw a synchronous error
  const throwSyncError = () => {
    setTestState("error");
    throw new Error("Synchronous error thrown!");
  };

  // Test 2: Throw an async error (unhandled promise rejection)
  const throwAsyncError = async () => {
    setTestState("loading");
    await new Promise((resolve) => setTimeout(resolve, 500));
    throw new Error("Async/await error thrown!");
  };

  // Test 3: Throw a network error (recoverable)
  const throwNetworkError = () => {
    throw new Error("Failed to fetch: Network request failed");
  };

  // Test 4: Successful operation
  const successOperation = () => {
    setTestState("success");
    setTimeout(() => setTestState("idle"), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <h2 className="text-xl font-bold">Error Boundary Test</h2>
        <p className="text-sm text-gray-600">
          Test different error scenarios to verify the error boundary is working correctly
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {testState === "loading" && (
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          )}
          {testState === "error" && (
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          )}
          {testState === "success" && (
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          )}
          <span className="font-medium">
            {testState === "idle" && "Ready to test"}
            {testState === "loading" && "Loading..."}
            {testState === "error" && "Error occurred!"}
            {testState === "success" && "Success!"}
          </span>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={throwSyncError} variant="danger">
            Throw Sync Error
          </Button>
          
          <Button onClick={throwAsyncError} variant="danger">
            Throw Async Error
          </Button>
          
          <Button onClick={throwNetworkError} variant="outline">
            Throw Network Error
          </Button>
          
          <Button onClick={successOperation} variant="primary">
            Success Operation
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          <p><strong>Sync Error:</strong> Catches synchronous errors immediately</p>
          <p><strong>Async Error:</strong> Catches errors from async/await</p>
          <p><strong>Network Error:</strong> Demonstrates recoverable error with retry option</p>
          <p><strong>Success:</strong> Normal operation without errors</p>
        </div>
      </CardBody>
    </Card>
  );
}

// Export wrapped with ErrorBoundary
export const ErrorBoundaryTest = withErrorBoundary(ErrorTestComponent, {
  fallback: (
    <div className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-lg font-medium">Test Error Caught!</p>
      <p className="text-sm text-gray-500">The error boundary successfully caught the error.</p>
    </div>
  ),
});

export default ErrorBoundaryTest;
