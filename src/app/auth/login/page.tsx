"use client";

import { AuthTemplate } from "@/components/templates/auth-template";
import { BrandLogo } from "@/components/molecules/brand-logo";
import { LoginForm } from "@/components/organisms/login-form";

export default function LoginPage() {
  return (
    <AuthTemplate header={<BrandLogo />}>
      <LoginForm />
    </AuthTemplate>
  );
}
