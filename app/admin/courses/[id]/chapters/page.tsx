import { redirect } from "next/navigation";

export default async function AdminChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/courses/${id}`);
}