"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Input, useToast, Card, Spinner } from "@/components/ui";
import { authApi } from "@/lib/api/auth";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Edit2 } from "lucide-react";

const COOLDOWN_SECONDS = 60;

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isResending, setIsResending] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState<"pending" | "success" | "error">(token ? "pending" : "pending");
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerify = useCallback(async (verificationToken: string) => {
    setIsVerifying(true);
    setStatus("pending");
    try {
      await authApi.verifyEmail({ token: verificationToken });
      setStatus("success");
      toast.success("Email verified successfully! You can now log in.");
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.response?.data?.message || "Verification failed. The link may have expired or is invalid.");
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }, [router, toast]);

  // Handle auto-verification if token is present
  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token, handleVerify]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsResending(true);
    try {
      // In a real app, you might want to get this from a state or context if available
      // For now we use the email entered/changed
      const targetEmail = email || "your email";
      await authApi.resendVerification({ email: targetEmail });
      toast.success(`Verification link sent to ${targetEmail}`);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend verification link.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsResending(true);
    try {
      await authApi.changeEmail({ email: newEmail });
      setEmail(newEmail);
      setIsChangingEmail(false);
      toast.success("Email updated and new verification link sent!");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update email.");
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="flex flex-col items-center py-12 space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-600 font-medium">Verifying your email address...</p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full ring-8 ring-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Email Verified!</h2>
            <p className="text-gray-600">Your account is now fully activated. We&apos;re redirecting you to the login page.</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/auth/login")} fullWidth>
            Go to Login
          </Button>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="bg-red-100 p-4 rounded-full ring-8 ring-red-50">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Verification Failed</h2>
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
            <p className="text-gray-600 text-sm">Don&apos;t worry, you can request a new link below.</p>
          </div>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
             <Button
              variant="primary"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              isLoading={isResending}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Link"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStatus("pending");
                setErrorMessage("");
              }}
              fullWidth
            >
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    // Default "pending" view (the initial view if no token or after successful resend)
    return (
      <div className="py-6 space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-indigo-100 p-4 rounded-full ring-8 ring-indigo-50">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Check your email</h2>
          <p className="text-gray-600 leading-relaxed">
            We&apos;ve sent a verification link to <span className="font-semibold text-gray-900">{email || "your email address"}</span>.
          </p>
        </div>

        {isChangingEmail ? (
          <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Update Email Address</h3>
            <Input
              label="New Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
              autoFocus
            />
            <div className="flex gap-3 pt-1">
              <Button
                variant="primary"
                onClick={handleChangeEmail}
                isLoading={isResending}
                disabled={!newEmail || isResending}
                className="flex-1"
                size="sm"
              >
                Update & Resend
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsChangingEmail(false)}
                disabled={isResending}
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="primary"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              isLoading={isResending}
              fullWidth
              className="h-12 text-base font-semibold transition-all active:scale-[0.98]"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend Verification Email"}
            </Button>
            
            <button
              onClick={() => setIsChangingEmail(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-lg transition-all text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Entered the wrong email?
            </button>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card
        className="w-full max-w-[440px] shadow-2xl overflow-hidden border-none"
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px -12px rgba(30,58,138,0.15), 0 1px 4px rgba(0,0,0,0.04)"
        }}
      >
        {renderContent()}
      </Card>
      
      {/* Visual background decoration */}
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full blur-[100px] -z-10 opacity-50" />
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-[100px] -z-10 opacity-50" />
    </div>
  );
};

export default VerifyEmail;
