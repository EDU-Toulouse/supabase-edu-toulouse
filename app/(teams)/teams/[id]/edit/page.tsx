"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getUser } from "@/lib/supabase/actions";
import { User } from "@supabase/supabase-js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TeamMembers } from "@/components/teams/TeamMembers";
import { TeamInvite } from "@/components/teams/TeamInvite";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Trash,
  Upload,
  Users,
  Settings,
  Link as LinkIcon,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Form validation schema
const teamFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters." })
    .max(50, { message: "Team name must be less than 50 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .nullable(),
});

// Define team data interface
interface TeamEditData {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  team_members:
    | {
        id: string;
        user_id: string;
        role: string;
        profiles: {
          id: string;
          username: string | null;
          avatar_url: string | null;
        } | null;
      }[]
    | null;
}

export default function TeamEditPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamEditData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Define form with zod validation
  const form = useForm<z.infer<typeof teamFormSchema>>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: null,
    },
  });

  useEffect(() => {
    if (!teamId) {
      setError("Team ID is missing.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get current user
        const user = await getUser();
        setCurrentUser(user);

        if (!user) {
          router.push("/login");
          return;
        }

        // 2. Fetch team data with members
        const { data, error: teamError } = await supabase
          .from("teams")
          .select(
            `
            *,
            team_members (
              id,
              user_id,
              role,
              profiles (
                id,
                username,
                avatar_url
              )
            )
          `
          )
          .eq("id", teamId)
          .single();

        if (teamError) {
          throw new Error(`Failed to load team: ${teamError.message}`);
        }

        // 3. Check if user is owner or admin
        const membership = data.team_members.find(
          (member: any) => member.user_id === user.id
        );

        if (
          !membership ||
          (membership.role !== "owner" && membership.role !== "captain")
        ) {
          router.push(`/teams/${teamId}`);
          return;
        }

        setUserRole(membership.role);
        setTeamData(data as TeamEditData);

        // Initialize form
        form.reset({
          name: data.name,
          description: data.description,
        });

        // Set logo preview if exists
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      } catch (err: any) {
        console.error("Error loading team data:", err);
        setError(err.message || "Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, router, supabase, form]);

  const onSubmit = async (values: z.infer<typeof teamFormSchema>) => {
    if (!teamData || !currentUser) return;

    // Server-side security check - only owners can update team details
    if (userRole !== "owner") {
      toast.error("Only team owners can update team details");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name: values.name,
          description: values.description,
        })
        .eq("id", teamId);

      if (error) throw error;

      toast.success("Team updated successfully");
      // Update local data
      setTeamData({
        ...teamData,
        name: values.name,
        description: values.description,
      });
    } catch (err: any) {
      console.error("Failed to update team:", err);
      toast.error("Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !teamData) {
      return;
    }

    // Server-side security check - only owners can update team logos
    if (userRole !== "owner") {
      toast.error("Only team owners can update team logos");
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `team-logos/${teamId}-${Date.now()}.${fileExt}`;

    setUploadingLogo(true);

    try {
      // 1. Create URL preview
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);

      // 2. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      // 4. Update team record with logo URL
      const { error: updateError } = await supabase
        .from("teams")
        .update({ logo_url: urlData.publicUrl })
        .eq("id", teamId);

      if (updateError) throw updateError;

      // 5. Update local state
      setTeamData({
        ...teamData,
        logo_url: urlData.publicUrl,
      });

      toast.success("Team logo updated");
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      toast.error("Failed to upload logo");
      // Revert preview on error
      if (teamData.logo_url) {
        setLogoPreview(teamData.logo_url);
      } else {
        setLogoPreview(null);
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!teamData || !teamData.logo_url) return;

    // Server-side security check - only owners can delete team logos
    if (userRole !== "owner") {
      toast.error("Only team owners can update team logos");
      return;
    }

    try {
      // Extract filename from URL
      const urlParts = teamData.logo_url.split("/");
      const filename = urlParts[urlParts.length - 1];

      // 1. Update team record to remove logo URL
      const { error: updateError } = await supabase
        .from("teams")
        .update({ logo_url: null })
        .eq("id", teamId);

      if (updateError) throw updateError;

      // 2. Delete file from storage (best effort)
      try {
        await supabase.storage
          .from("public")
          .remove([`team-logos/${filename}`]);
      } catch (storageErr) {
        console.error(
          "Failed to delete logo file but team updated:",
          storageErr
        );
      }

      // 3. Update local state
      setTeamData({
        ...teamData,
        logo_url: null,
      });
      setLogoPreview(null);

      toast.success("Team logo removed");
    } catch (err: any) {
      console.error("Failed to remove logo:", err);
      toast.error("Failed to remove logo");
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamData || !currentUser) return;

    // Server-side security check - only owners can delete teams
    if (userRole !== "owner") {
      toast.error("Only team owners can delete teams");
      return;
    }

    setDeleting(true);
    try {
      // Delete team (cascade will handle members)
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      toast.success("Team deleted successfully");
      router.push("/teams");
    } catch (err: any) {
      console.error("Failed to delete team:", err);
      toast.error("Failed to delete team");
      setDeleting(false);
    }
  };

  const animationProps = !prefersReducedMotion
    ? { variants: fadeIn, initial: "hidden", animate: "visible" }
    : {};

  // --- Loading State ---
  if (loading) {
    return (
      <PageTransitionWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransitionWrapper>
    );
  }

  // --- Error State ---
  if (error || !teamData) {
    return (
      <PageTransitionWrapper>
        <div className="container mx-auto px-4 py-8">
          <motion.div {...animationProps}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Failed to load team data."}
                <div className="mt-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/teams">Back to Teams</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </PageTransitionWrapper>
    );
  }

  return (
    <PageTransitionWrapper>
      <motion.div className="container mx-auto px-4 py-8" {...animationProps}>
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href={`/teams/${teamId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
            </Link>
          </Button>
        </div>

        <PageHeader>
          <PageHeaderHeading>Edit Team</PageHeaderHeading>
          <PageHeaderDescription>
            Manage your team&apos;s details, members, and settings
          </PageHeaderDescription>
        </PageHeader>

        <Tabs defaultValue="details" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="details">
              <Settings className="h-4 w-4 mr-2" /> Details
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" /> Members
            </TabsTrigger>
            <TabsTrigger value="invite">
              <LinkIcon className="h-4 w-4 mr-2" /> Invite
            </TabsTrigger>
          </TabsList>

          {/* Team Details Tab */}
          <TabsContent value="details">
            {userRole !== "owner" ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Restricted</AlertTitle>
                <AlertDescription>
                  Only the team owner can edit team details.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Logo</CardTitle>
                  <CardDescription>Upload a logo for your team</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4">
                    <Avatar className="h-32 w-32 rounded-lg border">
                      {uploadingLogo ? (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <AvatarImage
                            src={logoPreview ?? undefined}
                            alt={teamData.name}
                          />
                          <AvatarFallback className="text-4xl rounded-lg">
                            {teamData.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>
                  {userRole === "owner" && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="relative overflow-hidden"
                        disabled={uploadingLogo}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                      </Button>
                      {logoPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteLogo}
                          disabled={uploadingLogo}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Info Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                  <CardDescription>
                    {userRole === "owner"
                      ? "Update your team's basic information"
                      : "Team basic information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      id="team-edit-form"
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Team Name"
                                {...field}
                                disabled={userRole !== "owner"}
                              />
                            </FormControl>
                            <FormDescription>
                              This is your team&apos;s displayed name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Team description (optional)"
                                {...field}
                                value={field.value || ""}
                                disabled={userRole !== "owner"}
                              />
                            </FormControl>
                            <FormDescription>
                              Describe your team, goals, or anything else
                              important.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {userRole === "owner" ? (
                    <>
                      <Button
                        type="submit"
                        form="team-edit-form"
                        disabled={saving || !form.formState.isDirty}
                      >
                        {saving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Team
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete &quot;{teamData.name}&quot;?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your team and remove all
                              members.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteTeam}
                              className="bg-destructive text-destructive-foreground"
                              disabled={deleting}
                            >
                              {deleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Only the team owner can edit team details
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <TeamMembers
              members={teamData.team_members || []}
              teamId={teamId}
              userRole={userRole}
            />
          </TabsContent>

          {/* Invite Tab */}
          <TabsContent value="invite">
            <TeamInvite teamId={teamId} teamName={teamData.name} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageTransitionWrapper>
  );
}
