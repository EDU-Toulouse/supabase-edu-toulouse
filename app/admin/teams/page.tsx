"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/supabase/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createBrowserClient } from "@supabase/ssr";
import { TeamsList } from "@/components/admin/TeamsList";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { User } from "@supabase/supabase-js";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Align AdminTeamData strictly with TeamWithDetails where needed
// Note: This assumes TeamsList *requires* TeamWithDetails structure.
// We will create placeholder data if needed during mapping.
interface AdminTeamData {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  profiles: {
    // Must match TeamWithDetails['profiles'] - non-nullable
    id: string;
    username: string;
    avatar_url: string | null;
  };
  members: [{ count: number }] | []; // Match TeamWithDetails['members']
}

export default function AdminTeamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use TeamWithDetails directly if AdminTeamData is identical,
  // otherwise keep AdminTeamData and ensure mapping creates compatible objects.
  const [teams, setTeams] = useState<AdminTeamData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user and check admin status first
        const currentUser = await getUser();
        if (!currentUser) {
          redirect("/login");
          return;
        }
        setUser(currentUser);

        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUser.id)
          .single();

        if (!profile?.is_admin) {
          redirect("/"); // Redirect if not admin
          return;
        }

        // Fetch teams data
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select(
            `
            *,
            profiles:owner_id (
              id,
              username,
              avatar_url
            ),
            members:team_members (
              count
            )
          `
          )
          .order("created_at", { ascending: false });

        if (teamsError)
          throw new Error(`Teams fetch failed: ${teamsError.message}`);

        // Map data strictly according to TeamWithDetails expectations for TeamsList
        const formattedTeams = (teamsData || []).map(
          (team: any): AdminTeamData => {
            // Explicit return type
            const ownerProfile = team.profiles
              ? {
                  id: team.profiles.id,
                  username: team.profiles.username ?? "Unknown Owner", // Default non-null username
                  avatar_url: team.profiles.avatar_url ?? null,
                }
              : {
                  // Create placeholder profile if null/undefined
                  id: team.owner_id ?? "unknown-profile-id", // Use owner_id or placeholder
                  username: "Unknown Owner",
                  avatar_url: null,
                };

            // Ensure members is an array, defaulting to empty array
            const teamMembers = team.members
              ? Array.isArray(team.members)
                ? team.members
                : []
              : [];
            // Further ensure it matches [{ count: number }] | [] type if needed
            const validMembers: [{ count: number }] | [] =
              teamMembers.length > 0 &&
              typeof teamMembers[0]?.count === "number"
                ? [{ count: teamMembers[0].count }]
                : [];

            return {
              id: team.id,
              created_at: team.created_at,
              name: team.name,
              description: team.description ?? null,
              logo_url: team.logo_url ?? null,
              owner_id: team.owner_id,
              profiles: ownerProfile, // Assign the guaranteed profile object
              members: validMembers, // Assign the correctly typed members array
            };
          }
        );

        setTeams(formattedTeams);
      } catch (err: any) {
        console.error("[ Client ] Error fetching admin teams data:", err);
        setError(err.message || "Failed to load teams data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // supabase client dependency is stable

  const animationProps = (variants: any, delay = 0) =>
    !prefersReducedMotion
      ? {
          variants,
          initial: "hidden",
          animate: "visible",
          transition: { delay },
        }
      : {};

  return (
    <PageTransitionWrapper>
      <div className="py-8">
        <motion.div {...animationProps(fadeIn)}>
          <AdminHeader />
        </motion.div>

        <motion.div
          className="mt-8 space-y-6"
          {...animationProps(staggerContainer, 0.1)}
        >
          {/* Section Header can be added here if needed, wrapped in motion.div */}

          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <motion.div {...animationProps(fadeIn, 0.2)} className="mt-8">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Teams</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/admin">Back to Dashboard</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && !error && user && (
            <motion.div {...animationProps(fadeIn, 0.2)}>
              {/* Pass the correctly typed teams data to TeamsList */}
              <TeamsList initialTeams={teams} currentUserId={user.id} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
