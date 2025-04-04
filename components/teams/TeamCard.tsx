"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Team } from "@/lib/supabase/teams";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-40 w-full">
        {team.logo_url ? (
          <Image
            src={team.logo_url}
            alt={team.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="bg-stone-200 dark:bg-stone-800 h-full w-full flex items-center justify-center">
            <Users className="h-12 w-12 text-stone-400 dark:text-stone-600" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          Created on {new Date(team.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
          {team.description || "No description provided"}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/teams/${team.id}`}>View Team</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
