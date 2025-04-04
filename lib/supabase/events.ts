import { createClient } from "./server";
import { Database } from "./types";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export async function getEvents() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true })
      .eq("status", "upcoming");

    if (error) {
      console.error("Error fetching events:", error);
      throw new Error(
        `Error fetching events: ${error.message} (${error.code})`
      );
    }

    return data as Event[];
  } catch (error) {
    console.error("Error in getEvents:", error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getEvent(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    throw new Error("Event not found");
  }

  return data as Event;
}

export async function getEventRegistrations(eventId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      `
      *,
      profiles(id, username, avatar_url),
      teams(id, name, logo_url)
    `
    )
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching event registrations:", error);
    return [];
  }

  return data;
}

export async function getUserEvents(userId: string) {
  try {
    const supabase = createClient();

    // Get events the user has registered for
    const { data: userRegistrations, error: userRegError } = await supabase
      .from("event_registrations")
      .select(
        `
        event_id,
        events(*)
      `
      )
      .eq("user_id", userId);

    if (userRegError) {
      console.error("Error fetching user events:", userRegError);
      throw new Error(
        `Error fetching user events: ${userRegError.message} (${userRegError.code})`
      );
    }

    // Get events the user's teams have registered for
    const { data: teamIds, error: teamIdsError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", userId);

    if (teamIdsError) {
      console.error("Error fetching user team IDs:", teamIdsError);
      // Use type assertion and safely access data
      return (userRegistrations || []).map((reg) => reg.events) as Event[];
    }

    if (teamIds.length === 0) {
      // Use type assertion and safely access data
      return (userRegistrations || []).map((reg) => reg.events) as Event[];
    }

    const { data: teamRegistrations, error: teamRegError } = await supabase
      .from("event_registrations")
      .select(
        `
        event_id,
        events(*)
      `
      )
      .in(
        "team_id",
        teamIds.map((t) => t.team_id)
      );

    if (teamRegError) {
      console.error("Error fetching team events:", teamRegError);
      // Use type assertion and safely access data
      return (userRegistrations || []).map((reg) => reg.events) as Event[];
    }

    // Safely handle possibly undefined data
    const userEvents = (userRegistrations || []).map((reg) => reg.events || {});
    const teamEvents = (teamRegistrations || []).map((reg) => reg.events || {});

    // Combine user and team events, removing duplicates
    const allEvents = [...userEvents, ...teamEvents];

    // Remove duplicates by event ID and ensure events have an id
    const uniqueEvents = Array.from(
      new Map(
        allEvents
          .filter(
            (event) => event && typeof event === "object" && "id" in event
          )
          .map((event) => [event.id, event])
      ).values()
    );

    return uniqueEvents as Event[];
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}
