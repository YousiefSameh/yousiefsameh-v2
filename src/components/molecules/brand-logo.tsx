"use client";

import Link from "next/link";

export function BrandLogo() {
  return (
    <div className="text-center">
      <Link href="/" className="inline-block mb-4">
        <span className="text-2xl font-bold tracking-tight">
          Yousief<span className="text-primary">.</span>
        </span>
      </Link>
    </div>
  );
}
