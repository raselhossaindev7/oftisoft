"use client";
import { AnimatedDiv } from "@/lib/animated";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailSent = searchParams.get("sent") === "true";
  const emailParam = searchParams.get("email") || "";
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "sent"
  >(emailSent ? "sent" : "loading");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendSending, setResendSending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!token) {
      if (emailSent) return;
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully");
          toast.success("Email verified!");

          router.push("/login");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email");
        }
      } catch {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router, emailSent]);

  const handleVerifyOtp = async () => {
    if (!email || otp.length !== 6 || otpVerifying) return;
    setOtpVerifying(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Email verified successfully");
        toast.success("Email verified!");
        router.push("/login");
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendSending) return;
    setResendSending(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendSent(true);
        toast.success("Verification code resent!");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to resend code");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResendSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary" />
      <div className="absolute -top-40 -right-40 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8 text-center">
          <Link
            href="/"
            className="inline-block text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            Oftisoft
          </Link>
        </div>

        <AnimatedDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg sm:shadow-xl">
            <CardHeader className="space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto">
                {status === "loading" && (
                  <AnimatedDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
                  </AnimatedDiv>
                )}
                {status === "success" && (
                  <AnimatedDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-full h-full bg-green-500/10 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-green-500" />
                  </AnimatedDiv>
                )}
                {status === "error" && (
                  <AnimatedDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-full h-full bg-destructive/10 rounded-full flex items-center justify-center"
                  >
                    <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-destructive" />
                  </AnimatedDiv>
                )}
                {status === "sent" && (
                  <AnimatedDiv
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </AnimatedDiv>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">
                {status === "loading" && "Verifying Email..."}
                {status === "success" && "Email Verified!"}
                {status === "error" && "Verification Failed"}
                {status === "sent" && "Check Your Email"}
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {status === "success" && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Redirecting to login page...
                  </p>
                  <Button asChild>
                    <Link href="/login" className="gap-2">
                      Go to Login <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </Button>
                </div>
              )}

              {status === "sent" && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a 6-digit verification code to your email.
                    Enter it below to verify your account.
                  </p>
                  <div className="space-y-4">
                    <div className="text-left space-y-1.5">
                      <Label htmlFor="otp-email">Email address</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="text-left space-y-1.5">
                      <Label htmlFor="otp-code">Verification Code</Label>
                      <Input
                        id="otp-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={handleVerifyOtp}
                      disabled={!email || otp.length !== 6 || otpVerifying}
                    >
                      {otpVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Verify Email
                    </Button>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendSending || resendSent}
                        className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {resendSending
                          ? "Sending..."
                          : resendSent
                            ? "Code sent!"
                            : "Resend code"}
                      </button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/login">Back to Login</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="text-center space-y-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Back to Login</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedDiv>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
