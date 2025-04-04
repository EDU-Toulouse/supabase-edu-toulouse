"use client";

import { Team } from "@/lib/supabase/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, Users, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface TeamHeaderProps {
  team: Team;
  userRole: string | null;
}

export function TeamHeader({ team, userRole }: TeamHeaderProps) {
  const isOwner = userRole === "owner";

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teams">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Team Details</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Avatar className="w-24 h-24 rounded-md">
          {team.logo_url ? (
            <AvatarImage src={team.logo_url} alt={team.name} />
          ) : (
            <AvatarFallback className="rounded-md bg-muted text-3xl">
              {team.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold">{team.name}</h2>
            {team.description && (
              <p className="text-muted-foreground mt-2">{team.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>
                Created {format(new Date(team.created_at), "MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Team</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
