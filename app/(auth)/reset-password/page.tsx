"use client";
import { AnimatedDiv } from "@/lib/animated";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, ArrowLeft, Loader2, KeyRound } from "lucide-react";
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

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword, verifyResetToken } = useAuth();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }
    verifyResetToken(token).then(setIsValidToken);
  }, [token, verifyResetToken]);

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;
    const id = toast.loading("Resetting password...");
    try {
      await resetPassword(token, data.password);
      toast.success("Password reset. Please sign in.", { id });
      router.push("/login");
    } catch {
      toast.error("Reset failed. Link may have expired.", { id });
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive font-medium">
                Invalid or expired reset link
              </p>
              <Button asChild variant="outline">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary" />
      <div className="absolute -top-40 -right-40 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

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
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">
                Set new password
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                Enter your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 8 characters"
                      className={cn(
                        "pl-10",
                        errors.password &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className={cn(
                        "pl-10",
                        errors.confirmPassword &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      {...register("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword.message}
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
                    "Reset password"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button variant="link" asChild className="gap-2 h-auto p-0">
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
