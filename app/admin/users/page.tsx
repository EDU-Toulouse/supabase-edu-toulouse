import { Metadata } from "next";
import { getUser } from "@/lib/supabase/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/server";
import { UsersList } from "@/components/admin/UsersList";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Manage Users | Admin Dashboard | EDU-Toulouse",
  description: "Manage users on the EDU-Toulouse platform",
};

export default async function AdminUsersPage() {
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  const supabase = createClient();

  // Get profile to check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return redirect("/");
  }

  // Get users with their profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="container py-8">
      <AdminHeader />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
        <UsersList initialUsers={users || []} currentUserId={user.id} />
      </div>
    </div>
  );
}
