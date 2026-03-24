"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { RefreshCw, Copy, Check, ShieldAlert } from "lucide-react";
import { useState } from "react";
import {
  useRegenerateClientToken,
  useAdminClient,
} from "@/features/admin/clients/hooks";
import { toast } from "sonner";

interface ClientAccessCardProps {
  clientId: string;
  initialAccessToken: string | null;
  initialAccessExpiresAt: string | null;
}

export function ClientAccessCard({
  clientId,
  initialAccessToken,
  initialAccessExpiresAt,
}: ClientAccessCardProps) {
  const [copied, setCopied] = useState(false);
  const { mutate: regenerateToken, isPending } =
    useRegenerateClientToken(clientId);

  const { data: values } = useAdminClient(clientId);
  const accessToken = values?.data?.accessToken ?? initialAccessToken;
  const accessExpiresAt = values?.data?.accessExpiresAt ?? initialAccessExpiresAt;

  const isExpired = accessExpiresAt
    ? new Date(accessExpiresAt) < new Date()
    : false;

  const portalUrl = accessToken
    ? `${window.location.origin}/portal/${accessToken}`
    : null;

  function copyToken() {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRegenerate() {
    regenerateToken(30, {
      onSuccess: () => toast.success("Access token regenerated successfully"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Client Portal Access</span>
          {accessToken && (
            <Badge variant={isExpired ? "destructive" : "default"}>
              {isExpired ? "Expired" : "Active"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accessToken ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Portal Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm font-mono">
                  {portalUrl}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToken}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {accessExpiresAt && (
              <p className="text-sm text-muted-foreground">
                {isExpired ? "Expired on" : "Expires on"}{" "}
                <span
                  className={
                    isExpired ? "text-destructive font-medium" : "font-medium"
                  }
                >
                  {new Date(accessExpiresAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            <span>No access token generated yet.</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleRegenerate}
          disabled={isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Regenerating..." : "Regenerate Token (30 days)"}
        </Button>
      </CardContent>
    </Card>
  );
}
