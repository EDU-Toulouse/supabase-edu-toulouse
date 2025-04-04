"use client";

import { useQuery } from "@tanstack/react-query";
import { Team } from "@/lib/supabase/teams";
import { TeamCard } from "./TeamCard";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface TeamsListProps {
  initialTeams: Team[];
}

export function TeamsList({ initialTeams }: TeamsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const { data: teams = initialTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching teams:", error);
        return initialTeams;
      }

      return data as Team[];
    },
    initialData: initialTeams,
  });

  // Filter teams based on search query
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description &&
        team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search teams..."
          className="w-full p-3 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-stone-600 dark:text-stone-400">
            {searchQuery
              ? `No teams found matching "${searchQuery}"`
              : "No teams found. Create a team to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
