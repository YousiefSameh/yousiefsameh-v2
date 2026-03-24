import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Plus, User } from "lucide-react";

export function ClientsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <User className="h-10 w-10 text-muted-foreground/50" />
      <div>
        <p className="font-medium">No clients yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first client to get started.
        </p>  
      </div>
      <Button asChild size="lg" className="mt-2">
        <Link href="/admin/clients/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Link>
      </Button>
    </div>
  );
}