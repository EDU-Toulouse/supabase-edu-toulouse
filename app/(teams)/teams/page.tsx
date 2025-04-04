"use client";

import { useEffect, useState } from "react";
// import { getUserTeams } from "@/lib/supabase/teams"; // Removed server-only import
import { getUser } from "@/lib/supabase/actions"; // Keep for user check
import { TeamsList } from "@/components/teams/TeamsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { createBrowserClient } from "@supabase/ssr"; // Import browser client
import { User } from "@supabase/supabase-js";

// Define TeamData type to match expected structure by TeamsList
interface TeamData {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  // Assume TeamsList expects member count and potentially owner profile info
  members: [{ count: number }] | []; // Match TeamWithDetails structure
  profiles: {
    // Assume owner profile is needed and non-nullable
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// No longer need export const metadata for client components
// export const metadata: Metadata = {
//   title: "Teams | EDU-Toulouse",
//   description: "Join or create a team for esports events and tournaments",
// };

export default function TeamsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Initialize Supabase browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current user first (required to fetch their teams)
        const currentUser = await getUser();
        if (!currentUser) {
          // Redirect or show login prompt if no user
          // For simplicity, just set an error for now
          setError("You must be logged in to view teams.");
          setLoading(false);
          return;
        }
        setUser(currentUser);

        // Fetch teams where the user is a member using the browser client
        const { data: teamMemberships, error: membershipError } = await supabase
          .from("team_members")
          .select(
            `
            team_id,
            teams:team_id (
              *,
              members:team_members(count),
              profiles:owner_id (id, username, avatar_url)
            )
          `
          )
          .eq("user_id", currentUser.id);

        if (membershipError) {
          throw new Error(
            `Failed to fetch team memberships: ${membershipError.message}`
          );
        }

        // Extract and format the teams data from memberships
        const userTeamsData = (teamMemberships || [])
          .map((membership) => membership.teams) // Get the nested team data
          .filter((team): team is NonNullable<typeof team> => team !== null); // Filter out nulls

        const formattedTeams = userTeamsData.map((team: any): TeamData => {
          // Similar mapping logic as in admin/teams page to ensure type safety
          const ownerProfile = team.profiles
            ? {
                id: team.profiles.id,
                username: team.profiles.username ?? "Unknown Owner",
                avatar_url: team.profiles.avatar_url ?? null,
              }
            : {
                id: team.owner_id ?? "unknown-profile-id",
                username: "Unknown Owner",
                avatar_url: null,
              };

          const teamMembers = team.members
            ? Array.isArray(team.members)
              ? team.members
              : []
            : [];
          const validMembers: [{ count: number }] | [] =
            teamMembers.length > 0 && typeof teamMembers[0]?.count === "number"
              ? [{ count: teamMembers[0].count }]
              : [];

          return {
            id: team.id,
            created_at: team.created_at,
            name: team.name,
            description: team.description ?? null,
            logo_url: team.logo_url ?? null,
            owner_id: team.owner_id,
            profiles: ownerProfile,
            members: validMembers,
          };
        });

        setTeams(formattedTeams);
      } catch (err: any) {
        console.error("[ Client ] Error fetching user teams data:", err);
        setError(err.message || "Failed to load your teams. Please try again.");
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
        <motion.div className="space-y-4" {...animationProps(staggerContainer)}>
          <motion.div {...animationProps(fadeIn)}>
            <h1 className="text-2xl font-bold tracking-tight">My Teams</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Teams you are a member of.
            </p>
          </motion.div>

          <motion.div {...animationProps(fadeIn, 0.1)}>
            <Separator className="my-4" />
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <motion.div {...animationProps(fadeIn, 0.2)} className="mt-8">
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Teams</AlertTitle>
                <AlertDescription>
                  {error}
                  <div className="mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/">Return to Home</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && !error && user && teams.length === 0 && (
            <motion.div {...animationProps(fadeIn, 0.2)} className="py-8">
              <Alert className="max-w-2xl mx-auto bg-muted/50 border-dashed">
                <UsersRound className="h-4 w-4" />
                <AlertTitle>No Teams Joined</AlertTitle>
                <AlertDescription>
                  You haven't joined any teams yet.
                  {/* Add link to browse teams or create team page if available */}
                  <div className="mt-4">
                    <Button asChild variant="default" size="sm">
                      <Link href="/teams/create">Create a Team</Link>
                    </Button>
                    {/* <Button asChild variant="secondary" size="sm" className="ml-2">
                        <Link href="/teams/browse">Browse Teams</Link>
                      </Button> */}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && !error && user && teams.length > 0 && (
            <motion.div className="mt-6" {...animationProps(fadeIn, 0.2)}>
              {/* Pass currentUserId if TeamsList needs it */}
              <TeamsList initialTeams={teams} currentUserId={user.id} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
