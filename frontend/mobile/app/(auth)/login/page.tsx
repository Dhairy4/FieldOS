"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@fieldos/shared";
import { Input } from "@fieldos/shared";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@fieldos/shared";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Placeholder for auth API call
      // await authApi.login({ email, password });
      router.push("/");
    } catch (err) {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 px-4">
      <Card className="w-full md:w-[400px]">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your FieldOS technician account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md border border-input bg-background">
              <User className="h-4 w-4 text-muted-foreground" />
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
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}