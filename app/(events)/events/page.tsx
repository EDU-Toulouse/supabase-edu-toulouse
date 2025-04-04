"use client";

import { useEffect, useState } from "react";
import { EventList } from "@/components/events/EventList";
// import { getEvents } from "@/lib/supabase/events"; // Removed server-only import
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { createBrowserClient } from "@supabase/ssr"; // Import browser client

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
  game_title?: string | null;
  platform?: string | null;
  prize_pool?: string | null;
  organizer_id: string;
  team_size: number | null;
  is_team_event: boolean;
  registration_deadline: string | null;
}

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
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
        // Fetch events directly using the browser client
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*") // Select all columns for simplicity, adjust if needed
          .order("start_date", { ascending: true }); // Optional: order events

        if (eventsError) {
          throw new Error(`Events fetch failed: ${eventsError.message}`);
        }

        const formattedEvents = (eventsData || []).map((event: any) => {
          // Helper function to validate status
          const isValidStatus = (
            s: any
          ): s is "upcoming" | "ongoing" | "completed" | "cancelled" => {
            return ["upcoming", "ongoing", "completed", "cancelled"].includes(
              s
            );
          };
          const validStatus = isValidStatus(event.status)
            ? event.status
            : "upcoming"; // Default to upcoming

          return {
            id: event.id,
            created_at: event.created_at,
            title: event.title,
            description: event.description ?? "",
            image_url: event.image_url ?? null,
            start_date: event.start_date,
            end_date: event.end_date ?? "",
            location: event.location ?? null,
            max_participants: event.max_participants ?? null,
            status: validStatus, // Use validated or default status
            game_title: event.game_title ?? null,
            platform: event.platform ?? null,
            prize_pool: event.prize_pool ?? null,
            organizer_id: event.organizer_id,
            team_size: event.team_size ?? null,
            is_team_event: event.is_team_event ?? false, // Default boolean
            registration_deadline: event.registration_deadline ?? null,
          } as EventData;
        });
        setEvents(formattedEvents);
      } catch (err: any) {
        console.error("[ Client ] Error fetching events data:", err);
        setError(
          err.message ||
            "Failed to load events data. Ensure database is set up."
        );
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
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upcoming esports and digital events in Toulouse
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
                <AlertTitle>Error Loading Events</AlertTitle>
                <AlertDescription>
                  {error}
                  <p className="mt-2 text-xs">
                    Check Supabase setup (SUPABASE.md).
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/">Return to Home</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && !error && events.length === 0 && (
            <motion.div {...animationProps(fadeIn, 0.2)} className="py-8">
              <Alert className="max-w-2xl mx-auto bg-muted/50 border-dashed">
                <Database className="h-4 w-4" />
                <AlertTitle>No Events Scheduled</AlertTitle>
                <AlertDescription>
                  No upcoming events found. Please check back later!
                  <div className="mt-4">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/">Return to Home</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!loading && !error && events.length > 0 && (
            <motion.div className="mt-6" {...animationProps(fadeIn, 0.2)}>
              <EventList initialEvents={events} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}
