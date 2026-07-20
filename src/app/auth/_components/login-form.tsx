"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { FormInput } from "@/components/molecules/form-input";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormCheckbox } from "../../../components/molecules/form-checkbox";
import { Form } from "../../../components/atoms/form";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      const { error: authError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        callbackURL: "/admin",
      });

      if (authError) {
        form.setError("root", {
          message: authError.message || "An error occurred",
        });
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error: unknown) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Form {...form}>
      <Card className="py-6">
        <CardHeader className="px-6">
          <CardTitle className="text-2xl font-semibold mb-1">
            Admin Login
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormInput
                name="email"
                control={form.control}
                label="Email"
                type="email"
                placeholder="admin@example.com"
                className="p-4"
              />
              <FormInput
                name="password"
                control={form.control}
                label="Password"
                type="password"
                placeholder="***********"
                className="p-4"
              />
              <FormCheckbox
                id="rememberMe"
                name="rememberMe"
                control={form.control}
                label="Remember me"
              />
              {form.formState.errors.root?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                size={"lg"}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground"
              >
                Back to website
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}
