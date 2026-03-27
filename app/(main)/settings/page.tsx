"use client";

import { useSession, signIn } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui";
import { useState } from "react";
import { Github, Globe } from "lucide-react";
import { withAuth } from "@/lib/auth/ProtectedRoute";

function SettingsPage() {
  const { data: session } = useSession();
  const { user, setUser } = useAuthStore();
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLink = async (provider: string) => {
    setLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/settings?linked=true" });
    } catch (error) {
      toast.error(`Failed to link ${provider} account.`);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    setLoading(provider);
    try {
      await authApi.disconnectSocialAccount(provider);
      if (user) {
        const updatedUser = { ...user };
        if (provider === "google") updatedUser.googleLinked = false;
        if (provider === "github") updatedUser.githubLinked = false;
        setUser(updatedUser);
      }
      toast.success(`${provider} account disconnected.`);
    } catch (error) {
      toast.error(`Failed to disconnect ${provider} account.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid gap-6">
        <Card variant="elevated" padding="lg">
          <h2 className="text-xl font-semibold mb-4 text-[#1a3a6b]">Linked Social Accounts</h2>
          <p className="text-sm text-gray-500 mb-6">
            Link your social accounts to sign in faster and more securely.
          </p>

          <div className="space-y-4">
            {/* Google */}
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                   <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Google</h3>
                  <p className="text-xs text-gray-400">
                    {user?.googleLinked ? "Account linked" : "Not linked"}
                  </p>
                </div>
              </div>
              <div>
                {user?.googleLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDisconnect("google")}
                    isLoading={loading === "google"}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-200 hover:bg-primary-50 text-blue-800"
                    onClick={() => handleLink("google")}
                    isLoading={loading === "google"}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Github className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">GitHub</h3>
                  <p className="text-xs text-gray-400">
                    {user?.githubLinked ? "Account linked" : "Not linked"}
                  </p>
                </div>
              </div>
              <div>
                {user?.githubLinked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDisconnect("github")}
                    isLoading={loading === "github"}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary-200 hover:bg-primary-50 text-blue-800"
                    onClick={() => handleLink("github")}
                    isLoading={loading === "github"}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(SettingsPage);
