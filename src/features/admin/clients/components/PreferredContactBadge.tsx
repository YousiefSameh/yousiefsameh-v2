"use client";

import { Badge } from "@/components/atoms/badge";
import { PreferredContact } from "@/app/generated/prisma/browser";

interface PreferredContactBadgeProps {
  preferredContact: PreferredContact | null;
}

export function PreferredContactBadge({
  preferredContact,
}: PreferredContactBadgeProps) {
  if (!preferredContact) return null;
  return (
    <Badge variant="secondary" className="capitalize">
      {preferredContact?.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}
