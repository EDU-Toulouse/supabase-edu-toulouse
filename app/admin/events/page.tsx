"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/supabase/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { createBrowserClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { User } from "@supabase/supabase-js";
import { Loader2, AlertCircle, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Assuming an AdminEventsList component exists or we adapt EventList
import { EventList } from "@/components/events/EventList";
import { Separator } from "@/components/ui/separator";

// Define Event type for Admin page, including organizer details
interface AdminEventData {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  max_participants: number | null;
  team_size: number | null;
  is_team_event: boolean;
  registration_deadline: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizer_id: string;
  profiles: {
    // Organizer profile
    username: string | null;
    avatar_url: string | null;
  } | null;
  // Add participant/team counts if needed by the list component
}

// Metadata removed for client component

export default function AdminEventsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AdminEventData[]>([]);
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

        // Fetch events data with organizer profile
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            `
            *,
            profiles:organizer_id (
              username,
              avatar_url
            )
          `
          )
          .order("start_date", { ascending: true });

        if (eventsError)
          throw new Error(`Events fetch failed: ${eventsError.message}`);

        // Map data and ensure null defaults
        const formattedEvents = (eventsData || []).map(
          (event: any): AdminEventData => ({
            id: event.id,
            created_at: event.created_at,
            title: event.title,
            description: event.description ?? "", // Default description
            image_url: event.image_url ?? null,
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location ?? null,
            max_participants: event.max_participants ?? null,
            team_size: event.team_size ?? null,
            is_team_event: event.is_team_event,
            registration_deadline: event.registration_deadline ?? null,
            status: event.status ?? "upcoming",
            organizer_id: event.organizer_id,
            profiles: event.profiles
              ? {
                  // Handle potentially null organizer profile
                  username: event.profiles.username ?? "Unknown Organizer",
                  avatar_url: event.profiles.avatar_url ?? null,
                }
              : {
                  username: "Unknown Organizer",
                  avatar_url: null,
                },
          })
        );

        setEvents(formattedEvents);
      } catch (err: any) {
        console.error("[ Client ] Error fetching admin events data:", err);
        setError(err.message || "Failed to load events data.");
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
          <motion.div
            className="flex items-center justify-between"
            {...animationProps(fadeIn, 0.1)}
          >
            <h2 className="text-xl font-semibold tracking-tight">
              Manage Events
            </h2>
            <Button asChild size="sm">
              <Link href="/admin/events/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </motion.div>
          <motion.div {...animationProps(fadeIn, 0.2)}>
            <Separator className="my-4" />
          </motion.div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <motion.div {...animationProps(fadeIn, 0.2)} className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Events</AlertTitle>
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

          {!loading && !error && user ? (
            <motion.div {...animationProps(fadeIn, 0.3)}>
              {events.length === 0 ? (
                <motion.div
                  {...animationProps(fadeIn, 0.4)}
                  className="text-center text-muted-foreground py-8"
                >
                  No events found.
                </motion.div>
              ) : (
                <EventList
                  initialEvents={events.map(({ profiles, ...rest }) => rest)}
                />
              )}
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
