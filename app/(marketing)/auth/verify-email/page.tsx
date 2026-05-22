"use client";
import { AnimatedDiv } from "@/lib/animated";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your email...");

  const verifyEmail = useCallback(async () => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);

      if (response.data.success) {
        setStatus("success");
        setMessage(
          "Your email has been verified successfully! You can now log in to your account.",
        );
      } else {
        setStatus("error");
        setMessage(response.data.message ?? "");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setStatus("error");
      setMessage(error.response?.data?.message ?? "Something went wrong");
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email and try again.",
      );
      return;
    }

    verifyEmail();
  }, [verifyEmail, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] to-[#0f172a] p-4">
      <AnimatedDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 mb-4 relative">
              {status === "loading" && (
                <AnimatedDiv
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-20 h-20 text-primary" />
                </AnimatedDiv>
              )}
              {status === "success" && (
                <AnimatedDiv
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500" />
                </AnimatedDiv>
              )}
              {status === "error" && (
                <AnimatedDiv
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <XCircle className="w-20 h-20 text-red-500" />
                </AnimatedDiv>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {status === "loading" && "Verifying Email"}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <AnimatedDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm text-center">
                    âœ… Your account is now active and verified
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href="/login">Continue to Login</Link>
                </Button>
              </AnimatedDiv>
            )}

            {status === "error" && (
              <AnimatedDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm text-center">
                    The verification link may have expired or is invalid.
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Support</Link>
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </AnimatedDiv>
            )}

            {status === "loading" && (
              <div className="text-center text-sm text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p>Please wait while we verify your email address...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedDiv>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#030712] to-[#0f172a] p-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl w-full max-w-md">
            <CardHeader className="text-center">
              <AnimatedDiv
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-20 h-20 text-primary mx-auto" />
              </AnimatedDiv>
              <CardTitle className="text-2xl font-bold text-white mt-4">
                Loading...
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
