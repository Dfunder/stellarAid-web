"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSessionTimeout, sessionUtils } from "@/lib/auth/sessionTimeout";
import { useAuthStore } from "@/store/authStore";

export function SessionTimeoutDemo() {
  const { token, refreshToken, login } = useAuthStore();
  const { getSessionState, refreshToken: refreshSession } = useSessionTimeout();
  const [demoToken, setDemoToken] = useState("");

  const sessionState = getSessionState();

  // Create a mock token that expires in 2 minutes for testing
  const createTestToken = () => {
    const now = Date.now();
    const exp = now + (2 * 60 * 1000); // 2 minutes from now
    const payload = {
      sub: "test-user",
      exp: Math.floor(exp / 1000),
      iat: Math.floor(now / 1000),
    };
    
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = "test-signature"; // Mock signature
    
    const testToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    setDemoToken(testToken);
    
    // Simulate login with test token
    login(
      { id: "test-user", email: "test@example.com", name: "Test User" },
      testToken,
      "test-refresh-token"
    );
  };

  // Create a token that expires in 30 seconds for testing warning
  const createExpiringToken = () => {
    const now = Date.now();
    const exp = now + (30 * 1000); // 30 seconds from now
    const payload = {
      sub: "test-user",
      exp: Math.floor(exp / 1000),
      iat: Math.floor(now / 1000),
    };
    
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = "test-signature";
    
    const testToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    login(
      { id: "test-user", email: "test@example.com", name: "Test User" },
      testToken,
      "test-refresh-token"
    );
  };

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    setDemoToken("");
  };

  const formatTime = (ms: number) => {
    return sessionUtils.formatTimeRemaining(ms);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Session Timeout Demo</h2>
        
        {/* Current Session Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current Session Status:</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Token:</strong> {token ? "Present" : "None"}</p>
            <p><strong>Refresh Token:</strong> {refreshToken ? "Present" : "None"}</p>
            <p><strong>Is Warning:</strong> {sessionState.isWarning ? "Yes" : "No"}</p>
            <p><strong>Time Remaining:</strong> {formatTime(sessionState.timeRemaining)}</p>
            <p><strong>Is Refreshing:</strong> {sessionState.isRefreshing ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold">Test Controls:</h3>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={createTestToken}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create 2-min Test Token
            </Button>
            
            <Button
              onClick={createExpiringToken}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Create 30-sec Token (Test Warning)
            </Button>
            
            <Button
              onClick={() => refreshSession()}
              disabled={!token}
              variant="outline"
            >
              Manual Refresh Token
            </Button>
            
            <Button
              onClick={handleLogout}
              disabled={!token}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click &quot;Create 2-min Test Token&quot; to simulate a login session</li>
            <li>Wait for the warning modal to appear (should show at 5 minutes, but our test token expires in 2 minutes)</li>
            <li>Click &quot;Create 30-sec Token&quot; to test the warning appearing quickly</li>
            <li>Test the &quot;Stay Logged In&quot; button to refresh the session</li>
            <li>Wait for automatic logout when token expires</li>
            <li>Verify notifications appear for different events</li>
          </ol>
        </div>

        {/* Token Debug Info */}
        {token && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">Token Debug Info:</h3>
            <div className="text-xs space-y-1">
              <p><strong>Full Token:</strong> {token.substring(0, 50)}...</p>
              <p><strong>Expiration Time:</strong> {
                sessionUtils.getTokenExpirationTime(token) 
                  ? new Date(sessionUtils.getTokenExpirationTime(token)!).toLocaleString()
                  : "Invalid"
              }</p>
              <p><strong>Is Expired:</strong> {sessionUtils.isTokenExpired(token) ? "Yes" : "No"}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
