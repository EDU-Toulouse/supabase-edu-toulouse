"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

interface RegistrationButtonProps {
  eventId: string;
  isTeamEvent: boolean;
  registrationOpen: boolean;
  userId?: string;
}

export function RegistrationButton({
  eventId,
  isTeamEvent,
  registrationOpen,
  userId,
}: RegistrationButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Check if user is already registered and get registration details
  const {
    data: registrationData,
    isLoading,
    error: checkError,
    refetch,
  } = useQuery({
    queryKey: ["eventRegistration", eventId, userId],
    queryFn: async () => {
      try {
        if (!userId) return { isRegistered: false };

        // Check individual registration
        const { data: userReg, error: userRegError } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", eventId)
          .eq("user_id", userId)
          .maybeSingle();

        if (userRegError) {
          console.error("Error checking user registration:", userRegError);
          return { isRegistered: false };
        }

        if (userReg)
          return {
            isRegistered: true,
            registration: userReg,
            type: "individual",
          };

        // For team events, check if any of user's teams are registered
        if (isTeamEvent) {
          // Get user's teams
          const { data: teams, error: teamsError } = await supabase
            .from("team_members")
            .select("team_id")
            .eq("user_id", userId);

          if (teamsError) {
            console.error("Error fetching user teams:", teamsError);
            return { isRegistered: false };
          }

          if (teams.length > 0) {
            // Check if any team is registered
            const { data: teamReg, error: teamRegError } = await supabase
              .from("event_registrations")
              .select("*")
              .eq("event_id", eventId)
              .in(
                "team_id",
                teams.map((t) => t.team_id)
              )
              .maybeSingle();

            if (teamRegError) {
              console.error("Error checking team registration:", teamRegError);
              return { isRegistered: false };
            }

            if (teamReg) {
              return {
                isRegistered: true,
                registration: teamReg,
                type: "team",
              };
            }
          }
        }

        return { isRegistered: false };
      } catch (error) {
        console.error("Error checking registration:", error);
        return { isRegistered: false };
      }
    },
    enabled: !!userId,
  });

  // Function to handle registration
  const registerForEvent = async () => {
    if (!userId) {
      // Redirect to login
      return;
    }

    if (isTeamEvent) {
      // For team events, show team selection dialog
      router.push(`/events/${eventId}/register`);
      return;
    }

    setIsRegistering(true);

    try {
      // For individual events, register directly
      const { error } = await supabase.from("event_registrations").insert([
        {
          event_id: eventId,
          user_id: userId,
          status: "confirmed",
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("You have successfully registered for this event!");
      refetch();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register for the event. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Function to handle unregistration
  const unregisterFromEvent = async () => {
    if (
      !userId ||
      !registrationData?.isRegistered ||
      !registrationData?.registration
    ) {
      return;
    }

    setIsUnregistering(true);

    try {
      console.log(
        "Attempting to delete registration with ID:",
        registrationData.registration.id
      );

      const { data, error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registrationData.registration.id)
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Delete response:", data);

      toast.success("You have successfully unregistered from this event");
      refetch();
    } catch (error) {
      console.error("Unregistration error:", error);
      toast.error("Failed to unregister from the event. Please try again.");
    } finally {
      setIsUnregistering(false);
    }
  };

  if (!userId) {
    return (
      <Button asChild className="w-full">
        <Link href="/api/auth/login">Login to Register</Link>
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (checkError) {
    return (
      <div className="text-destructive flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">
          Error checking registration status. Please refresh.
        </span>
      </div>
    );
  }

  if (registrationData?.isRegistered) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            {isUnregistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unregistering...
              </>
            ) : (
              "Registered - Click to Unregister"
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unregistration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unregister from this event?
              {registrationData.type === "team"
                ? " This will remove your team from the event."
                : " This will remove you from the event."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={unregisterFromEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Unregister
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full"
          disabled={!registrationOpen || isRegistering}
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register for Event"
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
          <AlertDialogDescription>
            {isTeamEvent
              ? "You're about to register for a team event. You'll need to select or create a team."
              : "You're about to register for this event as an individual participant."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={registerForEvent}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
