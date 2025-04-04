"use client";

import { useEffect, useState } from "react";
import { useParams, redirect } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
// import { TeamDetail } from "@/components/teams/TeamDetail"; // Assuming component exists
import {
  Loader2,
  AlertCircle,
  User,
  Users,
  Settings,
  Mail,
  Link as LinkIcon,
} from "lucide-react"; // Add icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For logo/members
import { Separator } from "@/components/ui/separator"; // For layout
import { getUser } from "@/lib/supabase/actions"; // Need this for user context (e.g., show edit button)
import { User as AuthUser } from "@supabase/supabase-js";

// Define TeamDetailData type
interface MemberProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface TeamDetailData {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  owner_id: string;
  profiles: {
    // Owner profile
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  team_members:
    | {
        user_id: string;
        role: string;
        profiles: MemberProfile | null;
      }[]
    | null; // Members list with profiles
}

// Metadata generation removed

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamDetailData | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null); // Store current user
  const prefersReducedMotion = useReducedMotion();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        // Fetch current user (for potential edit/manage actions)
        const user = await getUser();
        setCurrentUser(user);

        // Fetch team details including owner and members with profiles
        const { data, error: fetchError } = await supabase
          .from("teams")
          .select(
            `
            *,
            profiles:owner_id ( id, username, avatar_url ),
            team_members ( user_id, role, profiles ( id, username, avatar_url ) )
          `
          )
          .eq("id", teamId)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            throw new Error("Team not found.");
          } else {
            throw new Error(`Team fetch failed: ${fetchError.message}`);
          }
        }

        if (!data) {
          throw new Error("Team not found.");
        }

        // Map data (ensure null safety)
        const formattedData: TeamDetailData = {
          id: data.id,
          created_at: data.created_at,
          name: data.name,
          description: data.description ?? null,
          logo_url: data.logo_url ?? null,
          owner_id: data.owner_id,
          profiles: data.profiles
            ? {
                id: data.profiles.id,
                username: data.profiles.username ?? "Unknown Owner",
                avatar_url: data.profiles.avatar_url ?? null,
              }
            : null,
          team_members: (data.team_members || []).map((member: any) => ({
            user_id: member.user_id,
            role: member.role,
            profiles: member.profiles
              ? {
                  // Ensure member profile is handled
                  id: member.profiles.id,
                  username: member.profiles.username ?? "Unknown User",
                  avatar_url: member.profiles.avatar_url ?? null,
                }
              : null,
          })),
        };

        setTeamData(formattedData);
      } catch (err: any) {
        console.error("[ Client ] Error fetching team details:", err);
        setError(err.message || "Failed to load team details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, supabase]); // Add supabase dependency

  const animationProps = !prefersReducedMotion
    ? { variants: fadeIn, initial: "hidden", animate: "visible" }
    : {};

  const isOwner = currentUser?.id === teamData?.owner_id;

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
              <AlertTitle>Error Loading Team</AlertTitle>
              <AlertDescription>
                {error || "Team data could not be loaded."}
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

  // --- Success State - Render Team Details Directly ---
  const {
    name,
    description,
    logo_url,
    profiles: ownerProfile,
    team_members,
  } = teamData;

  const members = team_members || [];

  return (
    <PageTransitionWrapper>
      <motion.div className="container mx-auto px-4 py-8" {...animationProps}>
        {/* Header Section */}
        <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-8">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-lg border">
            <AvatarImage src={logo_url ?? undefined} alt={`${name} logo`} />
            <AvatarFallback className="text-4xl rounded-lg">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
            {ownerProfile && (
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground mb-3">
                <Avatar className="h-5 w-5 mr-1.5">
                  <AvatarImage
                    src={ownerProfile.avatar_url ?? undefined}
                    alt={ownerProfile.username ?? "Owner"}
                  />
                  <AvatarFallback>
                    {ownerProfile.username?.charAt(0) ?? "O"}
                  </AvatarFallback>
                </Avatar>
                Owned by {ownerProfile.username ?? "Unknown"}
              </div>
            )}
            {description && (
              <p className="text-muted-foreground mb-4 max-w-prose mx-auto md:mx-0">
                {description}
              </p>
            )}
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/teams/${teamId}/edit`}>
                  {" "}
                  {/* Link to edit page */}
                  <Settings className="mr-2 h-4 w-4" /> Manage Team
                </Link>
              </Button>
            )}
            {!isOwner && currentUser && (
              // TODO: Add Join/Leave/Invite button logic if applicable
              <Button size="sm">Join Team</Button> // Placeholder
            )}
            {!currentUser && (
              <Button size="sm" asChild>
                <Link href="/login">Login to Join</Link>
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Member List Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Members ({members.length})
          </h2>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="bg-card border rounded-lg p-3 flex items-center space-x-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={member.profiles?.avatar_url ?? undefined}
                      alt={member.profiles?.username ?? "Member"}
                    />
                    <AvatarFallback>
                      {member.profiles?.username?.charAt(0).toUpperCase() ??
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">
                      {member.profiles?.username ?? "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                  {/* Optional: Add link to member profile */}
                  {/* <Button variant="ghost" size="icon" asChild><Link href={`/user/${member.profiles?.username}`}><LinkIcon className="h-4 w-4"/></Link></Button> */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              This team has no members yet.
            </p>
          )}
        </div>
      </motion.div>
    </PageTransitionWrapper>
  );
}
