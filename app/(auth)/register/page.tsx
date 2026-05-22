"use client";
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";
import { AUTH_TESTIMONIALS, AUTH_FEATURES } from "@/lib/auth-ui-data";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % AUTH_TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    const id = toast.loading("Creating your account...");
    try {
      const result = await registerUser(
        data.name,
        data.email,
        data.phone,
        data.password,
      );
      if (result.success) {
        toast.success(
          "Account created! Please check your email to verify your account.",
          { id },
        );
        setIsSuccess(true);
        router.push(
          `/verify-email?sent=true&email=${encodeURIComponent(data.email)}`,
        );
      } else {
        toast.error(result.error ?? "Registration failed", { id });
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { id });
    }
  };

  return (
    <div className="min-h-screen w-full ">
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
                  className="absolute top-20 right-20 w-72 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl -rotate-6"
                >
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-3 font-mono text-xs opacity-60">
                    <div className="flex gap-2">
                      <span className="text-purple-400">const</span>{" "}
                      <span className="text-blue-400">account</span> ={" "}
                      <span className="text-primary">await</span> register();
                    </div>
                    <div className="flex gap-2 pl-4">
                      <span className="text-blue-400">return</span>{" "}
                      <span className="text-green-400">
                        &quot;Welcome!&quot;
                      </span>
                      ;
                    </div>
                    <div className="w-full h-px bg-white/10 my-2" />
                    <div className="flex gap-2 text-sm opacity-50">
                      // Create your account
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
                Create Account
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Fill in your details to get started.
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
                  Account Created!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Please check your email to verify your account before logging
                  in.
                </p>
              </AnimatedDiv>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="name"
                      {...register("name")}
                      type="text"
                      placeholder="John Doe"
                      className={cn(
                        "pl-10 sm:pl-12 h-10 sm:h-11",
                        errors.name &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!errors.name}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="email"
                      {...register("email")}
                      type="email"
                      placeholder="john@example.com"
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="phone"
                      {...register("phone")}
                      type="tel"
                      inputMode="numeric"
                      placeholder="+1 234 567 8900"
                      className={cn(
                        "pl-10 sm:pl-12 h-10 sm:h-11",
                        errors.phone &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                    <Input
                      id="password"
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password (min 8 characters)"
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <Separator className="my-6 sm:my-8" />

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    asChild
                    className="h-auto p-0 font-bold"
                  >
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 group"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Back to Login
                    </Link>
                  </Button>
                </p>
              </form>
            )}
          </AnimatedDiv>
        </div>
      </div>
    </div>
  );
}
