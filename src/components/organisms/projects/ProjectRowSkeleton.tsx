import { Skeleton } from "@/components/atoms/skeleton";

export function ProjectRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-24 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-8" />
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </td>
    </tr>
  );
}