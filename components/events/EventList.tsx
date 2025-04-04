"use client";

import { useQuery } from "@tanstack/react-query";
import { Event } from "@/lib/supabase/events";
import { EventCard } from "./EventCard";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface EventListProps {
  initialEvents: Event[];
}

export function EventList({ initialEvents }: EventListProps) {
  const [filter, setFilter] = useState<"all" | "team" | "solo">("all");
  const supabase = createClient();

  const { data: events = initialEvents } = useQuery({
    queryKey: ["events", filter],
    queryFn: async () => {
      const query = supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true })
        .eq("status", "upcoming");

      if (filter === "team") {
        query.eq("is_team_event", true);
      } else if (filter === "solo") {
        query.eq("is_team_event", false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        return initialEvents;
      }

      return data as Event[];
    },
    initialData: initialEvents,
  });

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter("team")}
          className={`px-4 py-2 rounded-md ${
            filter === "team"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
          }`}
        >
          Team Events
        </button>
        <button
          onClick={() => setFilter("solo")}
          className={`px-4 py-2 rounded-md ${
            filter === "solo"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
          }`}
        >
          Solo Events
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-stone-600 dark:text-stone-400">
            No events found. Check back later for upcoming events!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
