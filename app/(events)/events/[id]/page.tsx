"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
// import { EventDetail } from "@/components/events/EventDetail"; // Remove import for non-existent component
import {
  Loader2,
  AlertCircle,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react"; // Add icons and CheckCircle2 icon
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations/variants";
import { useReducedMotion } from "@/lib/animations/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For organizer
import { Badge } from "@/components/ui/badge"; // For status
import { Separator } from "@/components/ui/separator"; // For layout
import { format } from "date-fns"; // For date formatting
import { getUser } from "@/lib/supabase/actions"; // Need user context
import { User } from "@supabase/supabase-js"; // User type
import { toast } from "sonner"; // Import toast from sonner

// Define EventData type (adjust as needed)
interface EventDetailData {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  max_participants: number | null;
  team_size: number | null;
  is_team_event: boolean;
  registration_deadline: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizer_id: string;
  profiles: {
    // Organizer profile
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  registrations: { count: number }[]; // Simplified registrations count
}

// Metadata generation removed

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventDetailData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Added state for user
  const [isRegistered, setIsRegistered] = useState(false); // Added state for registration status
  const [registrationLoading, setRegistrationLoading] = useState(false); // State for button action
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  ); // State for button error
  const prefersReducedMotion = useReducedMotion();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsRegistered(false); // Reset registration status on fetch
      try {
        // Fetch user first
        const user = await getUser();
        setCurrentUser(user);

        // Fetch event details
        const { data, error: fetchError } = await supabase
          .from("events")
          .select(
            `
            *,
            profiles:organizer_id ( id, username, avatar_url ),
            registrations:event_registrations ( count )
          `
          )
          .eq("id", eventId)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            throw new Error("Event not found.");
          } else {
            throw new Error(`Event fetch failed: ${fetchError.message}`);
          }
        }

        if (!data) {
          throw new Error("Event not found.");
        }

        // Corrected mapping based on the simplified query
        const formattedData: EventDetailData = {
          id: data.id,
          created_at: data.created_at,
          title: data.title,
          description: data.description ?? "",
          image_url: data.image_url ?? null,
          start_date: data.start_date,
          end_date: data.end_date ?? null, // Keep end_date potentially null
          location: data.location ?? null,
          max_participants: data.max_participants ?? null,
          team_size: data.team_size ?? null,
          is_team_event: data.is_team_event ?? false,
          registration_deadline: data.registration_deadline ?? null,
          status: data.status ?? "upcoming", // Default status
          organizer_id: data.organizer_id,
          profiles: data.profiles
            ? {
                id: data.profiles.id,
                username: data.profiles.username ?? "Unknown Organizer",
                avatar_url: data.profiles.avatar_url ?? null,
              }
            : null,
          registrations: data.registrations ?? [], // Default to empty array
        };

        setEventData(formattedData);

        // If user exists, check their registration status for this event
        if (user) {
          const { data: registrationData, error: regError } = await supabase
            .from("event_registrations")
            .select("id")
            .eq("event_id", eventId)
            .eq("user_id", user.id)
            .maybeSingle(); // Check if a registration exists

          if (regError) {
            console.error("Error checking registration status:", regError);
            // Decide if this error should block the page or just disable reg button
            setRegistrationError("Could not check registration status.");
          } else if (registrationData) {
            setIsRegistered(true);
          }
        }
      } catch (err: any) {
        console.error("[ Client ] Error fetching event details:", err);
        setError(err.message || "Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, supabase]); // Add supabase as dependency

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
  if (error || !eventData) {
    return (
      <PageTransitionWrapper>
        <div className="container mx-auto px-4 py-8">
          <motion.div {...animationProps}>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Event</AlertTitle>
              <AlertDescription>
                {error || "Event data could not be loaded."}
                <div className="mt-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/events">Back to Events</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </PageTransitionWrapper>
    );
  }

  // --- Success State - Render Event Details Directly ---
  const {
    title,
    description,
    image_url,
    start_date,
    end_date,
    location,
    max_participants,
    team_size,
    is_team_event,
    registration_deadline,
    status,
    profiles,
    registrations,
  } = eventData;

  const startDateFormatted = format(
    new Date(start_date),
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  );
  const endDateFormatted = end_date
    ? format(new Date(end_date), "h:mm a")
    : null;
  const deadlineDate = registration_deadline
    ? new Date(registration_deadline)
    : null;
  const deadlineFormatted = deadlineDate
    ? format(deadlineDate, "MMMM d, yyyy 'at' h:mm a")
    : null;
  const registrationOpen = !deadlineDate || deadlineDate > new Date();
  const totalRegistrations = registrations?.[0]?.count ?? 0;

  const getStatusBadgeVariant = (status: EventDetailData["status"]) => {
    switch (status) {
      case "upcoming":
        return "secondary";
      case "ongoing":
        return "default";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // --- Registration Handlers ---
  const handleRegister = async () => {
    if (!currentUser || !eventData) return;
    setRegistrationLoading(true);
    setRegistrationError(null);
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .insert({ event_id: eventId, user_id: currentUser.id })
        .select();

      if (error) throw error;
      setIsRegistered(true);
      toast.success("Successfully registered for this event!");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setRegistrationError(
        err.message || "Registration failed. Please try again."
      );
      toast.error("Registration failed. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!currentUser || !eventData) return;
    setRegistrationLoading(true);
    setRegistrationError(null);
    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", currentUser.id)
        .select();

      if (error) throw error;
      setIsRegistered(false);
      toast.success("Successfully unregistered from this event");
    } catch (err: any) {
      console.error("Unregistration failed:", err);
      setRegistrationError(
        err.message || "Unregistration failed. Please try again."
      );
      toast.error("Unregistration failed. Please try again.");
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <PageTransitionWrapper>
      <motion.div className="container mx-auto px-4 py-8" {...animationProps}>
        {/* Header Section */}
        <div className="relative mb-8">
          {image_url && (
            <img
              src={image_url}
              alt={`${title} banner`}
              className="w-full h-48 md:h-64 object-cover rounded-lg shadow-md"
            />
          )}
          <div
            className={`absolute top-2 right-2 ${
              image_url ? "bg-background/80 backdrop-blur-sm" : "bg-background"
            } p-1 rounded-md`}
          >
            <Badge
              variant={getStatusBadgeVariant(status)}
              className="capitalize"
            >
              {status}
            </Badge>
          </div>
          <div
            className={`${
              image_url
                ? "absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg"
                : "mt-4"
            }`}
          >
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                image_url ? "text-primary-foreground" : "text-primary"
              }`}
            >
              {title}
            </h1>
            {profiles && (
              <div className="flex items-center mt-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage
                    src={profiles.avatar_url ?? undefined}
                    alt={profiles.username ?? "organizer"}
                  />
                  <AvatarFallback>
                    {profiles.username?.charAt(0) ?? "O"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`text-xs ${
                    image_url
                      ? "text-muted-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Organized by {profiles.username ?? "Unknown"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Description & Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {description}
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-2">Details</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  {startDateFormatted}
                  {endDateFormatted ? ` - ${endDateFormatted}` : ""}
                </li>
                {location && (
                  <li className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    {location}
                  </li>
                )}
                {is_team_event && team_size && (
                  <li className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    Team Event ({team_size} members/team)
                  </li>
                )}
                {max_participants && (
                  <li className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    Max Participants: {max_participants}
                  </li>
                )}
                {totalRegistrations > 0 && (
                  <li className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    Registered: {totalRegistrations}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column: Registration Info */}
          <div>
            <div className="bg-card p-4 rounded-lg border sticky top-24 space-y-4">
              <h3 className="font-semibold text-lg">Registration</h3>
              {deadlineFormatted && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {registrationOpen
                    ? `Closes: ${deadlineFormatted}`
                    : `Closed: ${deadlineFormatted}`}
                </div>
              )}
              {!registrationOpen && (
                <p className="text-sm text-destructive">
                  Registration has closed.
                </p>
              )}
              {/* Registration Error Display */}
              {registrationError && (
                <Alert variant="destructive" className="text-xs p-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <AlertDescription>{registrationError}</AlertDescription>
                </Alert>
              )}

              {/* Conditional Button Logic */}
              {!currentUser && (
                <Button asChild className="w-full">
                  <Link href={`/login?redirect=/events/${eventId}`}>
                    Login to Register
                  </Link>
                </Button>
              )}
              {/* Use individual registration logic for ALL events if user is logged in */}
              {currentUser && (
                <Button
                  onClick={() => {
                    if (isRegistered) {
                      handleUnregister();
                    } else {
                      handleRegister();
                    }
                  }}
                  disabled={!registrationOpen || registrationLoading}
                  variant={isRegistered ? "outline" : "default"}
                  className={`w-full ${
                    isRegistered ? "border-green-500 text-green-600" : ""
                  }`}
                >
                  {registrationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isRegistered ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  ) : null}
                  {isRegistered ? "Registered" : "Register Now"}
                </Button>
              )}

              {/* Show confirmation below button when registered */}
              {isRegistered && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  You&apos;re all set! We&apos;ll send event updates to your
                  email.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </PageTransitionWrapper>
  );
}
