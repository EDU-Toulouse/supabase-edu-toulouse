"use client"; // Need client component for hooks and potentially stateful profile logic

import { useEffect, useState } from "react";
// import { Metadata } from "next"; // Removed Metadata import
import { redirect } from "next/navigation";
// import { UserProfile } from "@/components/profile/UserProfile"; // Keep removed if UserProfile defined inline
// import { getUserTeams } from "@/lib/supabase/teams"; // Keep removed
// import { getUserEvents } from "@/lib/supabase/events"; // Keep removed
import { createBrowserClient } from "@supabase/ssr"; // Use browser client
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, Calendar, Shield, UserCircle } from "lucide-react";
import { EventList } from "@/components/events/EventList";

// Metadata export removed

// Adjusted types to accept null for optional fields
interface ProfileData {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  discord_username?: string | null;
  is_admin?: boolean | null;
  bio: string | null;
  // Add other profile fields as needed
}

interface TeamData {
  id: string;
  created_at: string;
  name: string;
  description?: string | null; // Allow null
  logo_url?: string | null;
  owner_id: string;
  // Add other team fields as needed
}

interface EventData {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  max_participants: number | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  game_title: string | null;
  platform: string | null;
  prize_pool: string | null;
  organizer_id: string;
  team_size: number | null;
  is_team_event: boolean;
  registration_deadline: string | null;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // Memoize client creation if needed, but here it's simple
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user session using browser client
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError)
          throw new Error(`Session fetch failed: ${sessionError.message}`);

        if (!session || !session.user) {
          redirect("/login"); // Redirect if not logged in
          return;
        }
        const currentUser = session.user;
        setUserData(currentUser);

        // Fetch profile data using browser client
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, discord_username, bio")
          .eq("id", currentUser.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // Ignore 'No rows found' error if profile doesn't exist yet
          throw new Error(`Profile fetch failed: ${profileError.message}`);
        }
        setProfile(profileData);

        // Fetch user's teams using the browser client
        const { data: teamMemberships, error: teamMembershipError } =
          await supabase
            .from("team_members")
            .select(
              `
            team_id,
            teams (*)
          `
            )
            .eq("user_id", currentUser.id);

        if (teamMembershipError) {
          throw new Error(
            `Team membership fetch failed: ${teamMembershipError.message}`
          );
        }

        const userTeamsData = (teamMemberships || [])
          .map((membership) => membership.teams)
          .filter((team): team is NonNullable<typeof team> => team !== null);

        // Map team data (can refine type later if needed)
        const formattedTeams = userTeamsData.map(
          (team: any): TeamData => ({
            id: team.id,
            created_at: team.created_at,
            name: team.name,
            description: team.description ?? null,
            logo_url: team.logo_url ?? null,
            owner_id: team.owner_id,
            // Add members/profiles mapping here if needed by a TeamsList component
          })
        );
        setTeams(formattedTeams);

        // Fetch registered events using browser client
        const { data: eventRegistrations, error: registrationError } =
          await supabase
            .from("event_registrations")
            .select(
              `
            event_id,
            events (*)
          `
            )
            .eq("user_id", currentUser.id)
            .eq("status", "confirmed"); // Only show confirmed registrations

        if (registrationError) {
          throw new Error(
            `Event registration fetch failed: ${registrationError.message}`
          );
        }

        // Ensure eventRegistrations is treated as an array containing objects with an 'events' property
        const validRegistrations = (eventRegistrations || []).filter(
          (reg) => reg && reg.events
        );

        // Move mapping logic inside try block and use correct data structure
        const formattedEvents = validRegistrations.map(
          (registration: { events: any }): EventData => {
            const event = registration.events; // Access the nested event object
            const isValidStatus = (
              s: any
            ): s is "upcoming" | "ongoing" | "completed" | "cancelled" => {
              return ["upcoming", "ongoing", "completed", "cancelled"].includes(
                s
              );
            };
            const validStatus = isValidStatus(event.status)
              ? event.status
              : "upcoming";

            return {
              id: event.id, // Use event.id now
              created_at: event.created_at,
              title: event.title,
              description: event.description ?? "",
              image_url: event.image_url ?? null,
              start_date: event.start_date,
              end_date: event.end_date ?? "",
              location: event.location ?? null,
              max_participants: event.max_participants ?? null,
              status: validStatus,
              game_title: event.game_title ?? null, // Keep defaulting nulls
              platform: event.platform ?? null, // Keep defaulting nulls
              prize_pool: event.prize_pool ?? null, // Keep defaulting nulls
              organizer_id: event.organizer_id,
              team_size: event.team_size ?? null,
              is_team_event: event.is_team_event ?? false,
              registration_deadline: event.registration_deadline ?? null,
            };
          }
        );
        setRegisteredEvents(formattedEvents);
      } catch (err: any) {
        console.error("[ Client ] Error fetching profile data:", err);
        setError(err.message || "Failed to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // supabase client dependency is stable

  // Restore handleLogout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    redirect("/");
  };

  // Restore animationProps helper
  const animationProps = (variants: any, delay = 0) =>
    !prefersReducedMotion
      ? {
          variants,
          initial: "hidden",
          animate: "visible",
          transition: { delay },
        }
      : {};

  // Restore conditional rendering and JSX structure
  if (loading) {
    return (
      <PageTransitionWrapper>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransitionWrapper>
    );
  }

  if (error) {
    return (
      <PageTransitionWrapper>
        <div className="container mx-auto px-4 py-8">
          <motion.div {...animationProps(fadeIn)}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </Alert>
          </motion.div>
        </div>
      </PageTransitionWrapper>
    );
  }

  if (!userData) {
    // This case should ideally be handled by the initial redirect
    // but added as a fallback.
    return (
      <PageTransitionWrapper>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Redirecting to login...</p>
        </div>
      </PageTransitionWrapper>
    );
  }

  return (
    <PageTransitionWrapper>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6"
          {...animationProps(fadeIn)}
        >
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-primary">
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              alt={profile?.username ?? "User avatar"}
            />
            <AvatarFallback className="text-4xl">
              {profile?.username ? (
                profile.username.charAt(0).toUpperCase()
              ) : (
                <UserCircle className="h-16 w-16" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">
              {profile?.username ?? userData.email ?? "User Profile"}
            </h1>
            {profile?.username && userData.email && (
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            )}
            {profile?.discord_username && (
              <p className="text-sm text-muted-foreground mt-1">
                Discord: {profile.discord_username}
              </p>
            )}
            {profile?.bio && (
              <p className="mt-2 text-sm max-w-prose">{profile.bio}</p>
            )}
            <div className="mt-4 flex justify-center md:justify-start space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div {...animationProps(fadeIn, 0.1)}>
          <Separator className="my-8" />
        </motion.div>

        <motion.div
          className="space-y-6"
          {...animationProps(staggerContainer, 0.1)}
        >
          {/* Registered Events Section */}
          <motion.div {...animationProps(fadeIn, 0.2)}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" /> My Registered Events
            </h2>
            {registeredEvents.length > 0 ? (
              <EventList initialEvents={registeredEvents} />
            ) : (
              <p className="text-muted-foreground">
                You haven&apos;t registered for any events yet.
                <Link
                  href="/events"
                  className="text-primary hover:underline ml-2"
                >
                  Browse events
                </Link>
              </p>
            )}
          </motion.div>

          {/* Teams Section (Placeholder) */}
          {/* You would fetch and display user's teams similarly */}
          <motion.div {...animationProps(fadeIn, 0.3)}>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2 h-5 w-5" /> My Teams
            </h2>
            <p className="text-muted-foreground">
              Team information will be displayed here.
              <Link href="/teams" className="text-primary hover:underline ml-2">
                View teams
              </Link>
            </p>
            {/* <TeamsList initialTeams={userTeams} currentUserId={user.id} /> */}
          </motion.div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
