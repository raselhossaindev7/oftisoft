"use client";
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Loader2, TimerReset } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
import { Separator } from "@/components/ui/separator";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [step, setStep] = useState<"input" | "success">("input");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "success" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const onSubmit = async (data: ForgotFormData) => {
    const id = toast.loading("Sending reset link...");
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setStep("success");
      toast.success("Check your email for reset instructions", { id });
    } catch {
      toast.error("Failed to send. Please try again.", { id });
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    const id = toast.loading("Resending...");
    try {
      await forgotPassword(submittedEmail);
      setCountdown(60);
      setCanResend(false);
      toast.success("Reset link sent again", { id });
    } catch {
      toast.error("Failed to resend.", { id });
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

        <AnimatedDiv layout>
          <Card className="shadow-lg sm:shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 md:p-8 pt-6 sm:pt-6">
              <AnimatePresence mode="wait">
                {step === "input" ? (
                  <AnimatedDiv
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CardHeader className="p-0 mb-6 sm:mb-8">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TimerReset className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl text-center">
                        Forgot Password?
                      </CardTitle>
                      <CardDescription className="text-center text-xs sm:text-sm">
                        No worries! Enter your email and we&apos;ll send you
                        reset, instructions.
                      </CardDescription>
                    </CardHeader>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
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
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-10 sm:h-11 font-semibold"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  </AnimatedDiv>
                ) : (
                  <AnimatedDiv
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <AnimatedDiv
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-green-500"
                    >
                      <Mail className="w-8 h-8 sm:w-10 sm:h-10" />
                    </AnimatedDiv>

                    <CardHeader className="p-0 mb-4 sm:mb-6">
                      <CardTitle className="text-xl sm:text-2xl">
                        Check your email
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        We sent a password reset link to <br />
                        <span className="font-semibold text-foreground">
                          your email address
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left space-y-2 sm:space-y-3">
                      <p className="text-xs font-semibold uppercase  text-muted-foreground">
                        Next Steps:
                      </p>
                      <ul className="text-xs sm:text-sm space-y-2">
                        <Animated
                          as="li"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex gap-2"
                        >
                          <span className="text-primary">•</span> Click the
                          link, in the email
                        </Animated>
                        <Animated
                          as="li"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex gap-2"
                        >
                          <span className="text-primary">•</span> Enter your
                          new, password
                        </Animated>
                        <Animated
                          as="li"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex gap-2"
                        >
                          <span className="text-primary">•</span> Log in with
                          new, credentials
                        </Animated>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary disabled:opacity-50 h-auto py-1"
                        disabled={!canResend}
                        onClick={handleResend}
                      >
                        {canResend
                          ? "Resend Email"
                          : `Resend in 00:${countdown.toString().padStart(2, "0")}`}
                      </Button>
                    </div>
                  </AnimatedDiv>
                )}
              </AnimatePresence>

              <Separator className="my-6 sm:my-8" />

              <div className="text-center">
                <Button
                  variant="link"
                  asChild
                  className="text-muted-foreground hover:text-foreground font-semibold h-auto p-0 gap-2 group"
                >
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedDiv>
      </div>
    </div>
  );
}
