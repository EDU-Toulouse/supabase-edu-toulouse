import { Metadata } from "next";
import { getEvent } from "@/lib/supabase/events";
import { getUser } from "@/lib/supabase/actions";
import { getUserTeams } from "@/lib/supabase/teams";
import { redirect, notFound } from "next/navigation";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";

type RegistrationPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params,
}: RegistrationPageProps): Promise<Metadata> {
  // Extract the ID first to avoid the dynamic API warning
  const id = params.id;

  try {
    const event = await getEvent(id);

    return {
      title: `Register for ${event.title} | EDU-Toulouse`,
      description: `Select a team to register for ${event.title}`,
    };
  } catch (error) {
    return {
      title: "Event Registration | EDU-Toulouse",
      description: "Register for an event",
    };
  }
}

export default async function EventRegistrationPage({
  params,
}: RegistrationPageProps) {
  // Extract the ID first to avoid the dynamic API warning
  const id = params.id;

  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/login");
  }

  let event;
  try {
    event = await getEvent(id);
  } catch {
    notFound();
  }

  // Only team events should use this page
  if (!event.is_team_event) {
    return redirect(`/events/${id}`);
  }

  // Get user's teams
  const teams = await getUserTeams(user.id);

  if (!teams || teams.length === 0) {
    // If user has no teams, redirect to teams page
    // We could also just render a component that says they need to create a team first
    return redirect(
      `/teams?message=create-team-first&returnTo=/events/${id}/register`
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Register for {event.title}</h1>

      <div className="max-w-2xl mx-auto">
        <EventRegistrationForm event={event} userId={user.id} teams={teams} />
      </div>
    </div>
  );
}
