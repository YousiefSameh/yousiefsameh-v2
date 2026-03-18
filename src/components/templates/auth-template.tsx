import type React from "react";

interface AuthTemplateProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthTemplate({ header, children }: AuthTemplateProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {header}
          {children}
        </div>
      </div>
    </div>
  );
}
