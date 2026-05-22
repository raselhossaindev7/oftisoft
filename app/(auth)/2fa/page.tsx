"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TwoFactorPage() {
  const router = useRouter();
  const { verify2FA } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (finalCode?: string[]) => {
    const codeStr = (finalCode ?? code).join("");
    if (codeStr.length !== 6) return;
    setLoading(true);
    const id = toast.loading("Verifying...");
    try {
      await verify2FA(codeStr);
      toast.success("2FA verified successfully", { id });
      router.push("/dashboard");
    } catch {
      toast.error("Invalid code. Please try again.", { id });
      setCode(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    if (newCode.every((d) => d !== "") && index === 5 && value) {
      void handleVerify(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border shadow-lg sm:shadow-xl">
        <CardHeader className="space-y-4 px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-xl sm:text-2xl">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter the 6-digit code sent to your device ending in{" "}
              <span className="font-semibold text-foreground">...8832</span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 space-y-6">
          <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
            {code.map((digit, i) => (
              <Input key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={cn(
                  "w-9 h-12 sm:w-12 sm:h-14 p-0 text-center text-lg sm:text-xl font-bold",
                  "border-2 focus-visible:ring-2"
                )}
              />
            ))}
          </div>

          <Button onClick={() => void handleVerify()}
            disabled={code.some((c) => !c) || loading}
            className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify Identity
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center px-4 sm:px-6 pb-6 sm:pb-8">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Didn&apos;t receive code?{" "}
            <Button variant="link"
              className="h-auto p-0 text-primary font-semibold hover:underline"
            >
              Resend
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
