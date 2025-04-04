"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Team } from "@/lib/supabase/teams";
import { Event } from "@/lib/supabase/events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronLeft, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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

interface EventRegistrationFormProps {
  event: Event;
  userId: string;
  teams: Team[];
}

export function EventRegistrationForm({
  event,
  userId,
  teams,
}: EventRegistrationFormProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams.length === 1 ? teams[0].id : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnregistering, setIsUnregistering] = useState(false);
  const [registeredTeamIds, setRegisteredTeamIds] = useState<string[]>([]);
  const [selectedTeamRegistration, setSelectedTeamRegistration] =
    useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check which teams are already registered on component mount
  useEffect(() => {
    const checkRegisteredTeams = async () => {
      try {
        const teamIds = teams.map((team) => team.id);

        const { data, error } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", event.id)
          .in("team_id", teamIds);

        if (error) {
          console.error("Error checking team registrations:", error);
          return;
        }

        if (data && data.length > 0) {
          setRegisteredTeamIds(data.map((reg) => reg.team_id));
        }
      } catch (error) {
        console.error("Error checking registered teams:", error);
      }
    };

    checkRegisteredTeams();
  }, [event.id, teams, supabase]);

  // Update selected team registration when team changes
  useEffect(() => {
    if (selectedTeamId && registeredTeamIds.includes(selectedTeamId)) {
      const getRegistrationDetails = async () => {
        const { data, error } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", event.id)
          .eq("team_id", selectedTeamId)
          .single();

        if (error) {
          console.error("Error getting registration details:", error);
          return;
        }

        setSelectedTeamRegistration(data);
      };

      getRegistrationDetails();
    } else {
      setSelectedTeamRegistration(null);
    }
  }, [selectedTeamId, registeredTeamIds, event.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeamId) {
      toast.error("Please select a team");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already registered
      const { data: existingReg, error: checkError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", event.id)
        .eq("team_id", selectedTeamId)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Error checking registration: ${checkError.message}`);
      }

      if (existingReg) {
        toast.info("This team is already registered for this event");
        router.push(`/events/${event.id}`);
        return;
      }

      // Register team for event
      const { error } = await supabase.from("event_registrations").insert([
        {
          event_id: event.id,
          team_id: selectedTeamId,
          status: "confirmed",
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success(
        "Your team has been successfully registered for this event!"
      );
      router.push(`/events/${event.id}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register for the event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    if (!selectedTeamRegistration) {
      return;
    }

    setIsUnregistering(true);

    try {
      console.log(
        "Attempting to delete registration with ID:",
        selectedTeamRegistration.id
      );

      const { data, error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", selectedTeamRegistration.id)
        .select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Delete response:", data);

      toast.success(
        "Your team has been successfully unregistered from this event"
      );

      // Update registered teams list
      setRegisteredTeamIds(
        registeredTeamIds.filter((id) => id !== selectedTeamId)
      );
      setSelectedTeamRegistration(null);

      router.push(`/events/${event.id}`);
    } catch (error) {
      console.error("Unregistration error:", error);
      toast.error("Failed to unregister from the event. Please try again.");
    } finally {
      setIsUnregistering(false);
    }
  };

  const selectedTeam = teams.find((team) => team.id === selectedTeamId);
  const isTeamRegistered = selectedTeamId
    ? registeredTeamIds.includes(selectedTeamId)
    : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/events/${event.id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <CardTitle>Team Registration</CardTitle>
        </div>
        <CardDescription>
          {registeredTeamIds.length > 0
            ? "Manage your team registrations for this event."
            : "Select which team you would like to register for this event."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Team</label>
              <Select
                value={selectedTeamId}
                onValueChange={setSelectedTeamId}
                disabled={isSubmitting || isUnregistering}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} {registeredTeamIds.includes(team.id) && "✓"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeam && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-1">Team: {selectedTeam.name}</h3>
                {selectedTeam.description && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedTeam.description}
                  </p>
                )}
                {isTeamRegistered && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 font-medium flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      This team is already registered for this event
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-1">Event: {event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        {isTeamRegistered ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                disabled={isUnregistering}
              >
                {isUnregistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unregistering...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Unregister Team
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Unregistration</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to unregister {selectedTeam?.name} from
                  this event? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUnregister}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Unregister
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            className="w-full"
            disabled={!selectedTeamId || isSubmitting || isTeamRegistered}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Register Team
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
