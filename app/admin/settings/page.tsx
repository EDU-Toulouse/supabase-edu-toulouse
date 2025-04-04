import { Metadata } from "next";
import { getUser } from "@/lib/supabase/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformSettings } from "@/components/admin/PlatformSettings";

export const metadata: Metadata = {
  title: "Platform Settings | Admin Dashboard | EDU-Toulouse",
  description: "Manage platform settings for EDU-Toulouse",
};

export default async function AdminSettingsPage() {
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

  return (
    <div className="container py-8">
      <AdminHeader />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure the core settings of your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-8 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">
                    Appearance settings coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-8 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">
                    Advanced settings coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
