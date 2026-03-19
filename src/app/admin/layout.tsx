import AdminTemplate from "@/components/templates/admin-template";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminTemplate>{children}</AdminTemplate>;
}
