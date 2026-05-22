"use client";
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";
import { AUTH_TESTIMONIALS, AUTH_FEATURES } from "@/lib/auth-ui-data";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

const features = AUTH_FEATURES;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function EmailLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % AUTH_TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, step]);

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Sending OTP...");

    try {
      const response = await fetch(`${API_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (response.ok) {
        setEmail(data.email);
        setStep("otp");
        setCountdown(60);
        setCanResend(false);
        toast.success("OTP sent to your email!", { id: loadingToast });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send OTP", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOtp = async (data: OtpFormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading("Verifying OTP...");

    try {
      const response = await fetch(`${API_URL}/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp: data.otp }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Login successful!", { id: loadingToast });
        setStep("success");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.message || "Invalid OTP", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Resending OTP...");

    try {
      const response = await fetch(`${API_URL}/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setCountdown(60);
        setCanResend(false);
        toast.success("New OTP sent!", { id: loadingToast });
      } else {
        toast.error("Failed to resend OTP", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpValue("otp", value);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex container mx-auto items-center justify-center h-[100vh]">
        {/* LEFT SIDE - HERO (60%) */}
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
              {features.map((feature, i) => (
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
                {step === "email" && "Email Login"}
                {step === "otp" && "Enter OTP"}
                {step === "success" && "Login Successful!"}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {step === "email" && "Login with email verification code."}
                {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                {step === "success" && "Redirecting to dashboard..."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "success" ? (
                <AnimatedDiv
                  key="success"
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
              ) : step === "email" ? (
                <Animated
                  as="form"
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmitEmail(onSubmitEmail)}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                      <Input
                        id="email"
                        {...registerEmail("email")}
                        type="email"
                        placeholder="name@company.com"
                        className={cn(
                          "pl-10 sm:pl-12 h-10 sm:h-11",
                          emailErrors.email &&
                            "border-destructive focus-visible:ring-destructive/20",
                        )}
                        aria-invalid={!!emailErrors.email}
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="text-xs text-destructive">
                        {emailErrors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-10 sm:h-12 font-bold rounded-xl",
                      "bg-gradient-to-r from-primary to-secondary",
                      "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
                      "shadow-lg shadow-primary/25 transition-all",
                    )}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6 sm:my-8">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase text-muted-foreground">
                      Or
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full h-10 sm:h-11 rounded-xl gap-2 font-medium"
                  >
                    <Link href="/login">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Login with Password
                    </Link>
                  </Button>

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
                        Create one now
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </p>
                </Animated>
              ) : (
                <Animated
                  as="form"
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmitOtp(onSubmitOtp)}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative group">
                      <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                      <Input
                        id="otp"
                        {...registerOtp("otp")}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        onChange={handleOtpChange}
                        className={cn(
                          "pl-10 sm:pl-12 h-10 sm:h-11 text-center text-lg  font-mono",
                          otpErrors.otp &&
                            "border-destructive focus-visible:ring-destructive/20",
                        )}
                        aria-invalid={!!otpErrors.otp}
                      />
                    </div>
                    {otpErrors.otp && (
                      <p className="text-xs text-destructive">
                        {otpErrors.otp.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend OTP
                        </button>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Resend in {countdown}s
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("email")}
                      disabled={isLoading}
                      className="flex-1 h-10 sm:h-11 rounded-xl gap-2 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "flex-[2] h-10 sm:h-11 font-bold rounded-xl",
                        "bg-gradient-to-r from-primary to-secondary",
                        "hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]",
                        "shadow-lg shadow-primary/25 transition-all",
                      )}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Login
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    Check your spam folder if you don&apos;t see the email.
                  </p>
                </Animated>
              )}
            </AnimatePresence>
          </AnimatedDiv>
        </div>
      </div>
    </div>
  );
}
