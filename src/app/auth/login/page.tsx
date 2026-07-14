"use client";

import { AuthTemplate } from "@/components/templates/auth-template";
import { BrandLogo } from "@/components/molecules/brand-logo";
import { LoginForm } from "@/app/auth/_components/login-form";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push("/admin");
    }
  }, [session, router]);
  return (
    <AuthTemplate header={<BrandLogo />}>
      <LoginForm />
    </AuthTemplate>
  );
}
