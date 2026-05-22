"use client";
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";
import { AUTH_TESTIMONIALS, AUTH_FEATURES } from "@/lib/auth-ui-data";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  MailCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    verify2FALogin,
    isLoading: authLoading,
    isAuthenticated,
    checkAuth,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [lastEmail, setLastEmail] = useState("");
  const [resendSending, setResendSending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleVerifyOtp = async () => {
    if (!lastEmail || verifyOtp.length !== 6 || otpVerifying) return;
    setOtpVerifying(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lastEmail, otp: verifyOtp }),
      });
      if (res.ok) {
        setOtpVerified(true);
        toast.success("Email verified! You can now log in.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!lastEmail || resendSending) return;
    setResendSending(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lastEmail }),
      });
      if (res.ok) {
        setResendSent(true);
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to send verification email");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResendSending(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    setOauthLoading(provider);
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % AUTH_TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    const loadingToast = toast.loading("Signing in...");
    setRememberMe(data.remember);

    try {
      const result = await login(data.email, data.password, data.remember);

      if (result.success) {
        toast.success("Login successful!", { id: loadingToast });
        setIsSuccess(true);
        router.push("/dashboard");
      } else if ((result as any).requires2FA) {
        toast.dismiss(loadingToast);
        setRequires2FA(true);
        setTempToken((result as any).tempToken);
      } else {
        toast.error(result.error || "Login failed", { id: loadingToast });
        if (
          result.error &&
          result.error.toLowerCase().includes("email not verified")
        ) {
          setEmailNotVerified(true);
          setLastEmail(data.email);
          setResendSent(false);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.", {
        id: loadingToast,
      });
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || twoFACode.length !== 6) return;

    const loadingToast = toast.loading("Verifying 2FA...");
    try {
      const result = await verify2FALogin(tempToken, twoFACode, rememberMe);
      if (result.success) {
        toast.success("Login successful!", { id: loadingToast });
        setIsSuccess(true);
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Invalid 2FA code", { id: loadingToast });
        setTwoFACode("");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid 2FA code", { id: loadingToast });
      setTwoFACode("");
    }
  };

  return (
    <div className="min-h-screen w-full ">
      <div className="flex container mx-auto items-center justify-center h-[100vh]">
        <div className="hidden lg:flex w-[60%] relative bg-[#030712] overflow-hidden flex-col justify-between p-12 xl:p-16 h-full">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-[#030712] to-[#030712]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-[#030712] to-[#030712]" />
            <div className="absolute top-0 left-0 w-full h-full bg-grain opacity-[0.03] mix-blend-overlay" />

            <AnimatedDiv
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/4 right-0 pointer-events-none"
            >
              <div className="relative w-[500px] h-[500px]">
                <AnimatedDiv
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full border border-white/5 border-dashed"
                />
                <AnimatedDiv
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full border border-white/5"
                />
                <AnimatedDiv
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-20 right-20 w-72 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl rotate-[-6deg]"
                >
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-3 font-mono text-xs opacity-60">
                    <div className="flex gap-2">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-400">future</span> ={" "}
                      <span className="text-primary">await</span> build();
                    </div>
                    <div className="flex gap-2 pl-4">
                      <span className="text-blue-400">return</span>{" "}
                      <span className="text-green-400">
                        &quot;Oftisoft&quot;
                      </span>
                      ;
                    </div>
                    <div className="w-full h-px bg-white/10 my-2" />
                    <div className="flex gap-2 text-sm opacity-50">
                      {"// System Optimized"}
                    </div>
                  </div>
                </AnimatedDiv>
              </div>
            </AnimatedDiv>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <Link
                href="/"
                className="text-2xl xl:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
              >
                Oftisoft
              </Link>
              <p className="text-muted-foreground mt-2 text-sm xl:text-base">
                Premium Software Solutions
              </p>
            </div>

            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <AnimatedDiv
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex gap-1 mb-4">
                    {[
                      ...Array(AUTH_TESTIMONIALS[currentTestimonial].stars),
                    ].map((_, i) => (
                      <AnimatedDiv
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="text-yellow-500">★</span>
                      </AnimatedDiv>
                    ))}
                  </div>
                  <h3 className="text-xl xl:text-2xl font-medium text-white mb-6 leading-relaxed">
                    &quot;{AUTH_TESTIMONIALS[currentTestimonial].quote}&quot;
                  </h3>
                  <div>
                    <p className="font-bold text-white">
                      {AUTH_TESTIMONIALS[currentTestimonial].author}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {AUTH_TESTIMONIALS[currentTestimonial].role}
                    </p>
                  </div>
                </AnimatedDiv>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-6 xl:gap-8">
              {AUTH_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <div className="p-2 rounded-full bg-white/5 border border-white/10 text-primary shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM (40%) */}
        <div className="w-full lg:w-[40%] bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <AnimatedDiv
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md space-y-6 sm:space-y-8"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sign in to your dashboard to manage projects.
              </p>
            </div>

            {isSuccess ? (
              <AnimatedDiv
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-green-500">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Login Successful!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Redirecting to dashboard...
                </p>
              </AnimatedDiv>
            ) : requires2FA ? (
              <form
                onSubmit={handle2FASubmit}
                className="space-y-4 sm:space-y-6"
              >
                <div className="text-center">
                  <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFACode}
                    onChange={(e) =>
                      setTwoFACode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="text-center text-2xl  font-mono"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={twoFACode.length !== 6}
                  className="w-full h-10 sm:h-12 font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Verify & Login
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email">Email Address</Label>
                    {emailNotVerified && !otpVerified && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        disabled={resendSending}
                        onClick={handleResendVerification}
                        className="text-xs h-auto p-0 font-medium text-amber-600 dark:text-amber-400"
                      >
                        {resendSending ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            Sending...
                          </>
                        ) : (
                          "Resend OTP?"
                        )}
                      </Button>
                    )}
                    {otpVerified && (
                      <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <MailCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="name@company.com"
                      className={cn(
                        "pl-10 sm:pl-12 h-10 sm:h-11",
                        errors.email &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                  {emailNotVerified && !otpVerified && (
                    <div className="flex gap-2 items-start">
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verifyOtp}
                        onChange={(e) =>
                          setVerifyOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 h-10 text-center tracking-widest font-mono"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={verifyOtp.length !== 6 || otpVerifying}
                        onClick={handleVerifyOtp}
                        className="h-10 whitespace-nowrap"
                      >
                        {otpVerifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="link"
                        asChild
                        className="text-xs h-auto p-0 font-medium"
                      >
                        <Link href="/email-login">
                          Login with OTP
                        </Link>
                      </Button>
                      <span className="text-muted-foreground">|</span>
                      <Button
                        variant="link"
                        asChild
                        className="text-xs h-auto p-0 font-medium"
                      >
                        <Link href="/forgot-password">Forgot Password?</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="password"
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={cn(
                        "pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-11",
                        errors.password &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="remember"
                    render={({ field }) => (
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground font-normal cursor-pointer"
                  >
                    Remember me for 30 days
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={authLoading}
                  className={cn(
                    "w-full h-10 sm:h-12 font-bold rounded-xl",
                    "bg-gradient-to-r from-primary to-secondary",
                    "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
                    "shadow-lg shadow-primary/25 transition-all",
                  )}
                  size="lg"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="relative my-6 sm:my-8">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 sm:h-11 rounded-xl gap-2 font-medium"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={!!oauthLoading}
                  >
                    {oauthLoading === "google" ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    <span>Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 sm:h-11 rounded-xl gap-2 font-medium"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={!!oauthLoading}
                  >
                    {oauthLoading === "github" ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    ) : (
                      <svg
                        className="h-5 w-5 shrink-0 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    <span>GitHub</span>
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    asChild
                    className="h-auto p-0 font-bold"
                  >
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1"
                    >
                      create one now
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </p>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  <Button variant="link" asChild className="h-auto p-0 text-xs">
                    <Link href="/verify-email?sent=true">
                      Need to verify your email?
                    </Link>
                  </Button>
                </p>
              </form>
            )}
          </AnimatedDiv>
        </div>
      </div>
      {/* LEFT SIDE - HERO (60%) */}
    </div>
  );
}
