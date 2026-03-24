import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Eye, Edit } from "lucide-react";
import { DeleteClientButton } from "./DeleteClientButton";

interface ClientRowActionsProps {
  clientId: string;
  clientAccessToken: string | null;
}

export function ClientRowActions({
  clientId,
  clientAccessToken,
}: ClientRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="ghost" size="icon">
        <Link href={`/portal/${clientAccessToken}`} target="_blank">
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link href={`/admin/clients/${clientId}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <DeleteClientButton clientId={clientId} />
    </div>
  );
}
