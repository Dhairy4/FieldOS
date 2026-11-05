"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@fieldos/shared";
import { Input } from "@fieldos/shared";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@fieldos/shared";
import { Mail, Lock, User, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Placeholder for auth API call
      router.push("/");
    } catch (err) {
      alert("Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 px-4">
      <Card className="w-full md:w-[440px]">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join FieldOS as a field technician</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md border border-input bg-background">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="flex-1 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-md border border-input bg-background">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="name@company.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="flex-1 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-md border border-input bg-background">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="flex-1 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred language</label>
              <div className="grid grid-cols-2 gap-2">
                {["english", "hindi", "gujarati", "hinglish"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang as any)}
                    className={`px-3 py-2 rounded-md text-sm border ${
                      language === lang
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input bg-background hover:bg-secondary"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}