"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Event } from "@/lib/supabase/events";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formattedDate =
    startDate.toDateString() === endDate.toDateString()
      ? `${format(startDate, "MMM d, yyyy")} • ${format(
          startDate,
          "h:mm a"
        )} - ${format(endDate, "h:mm a")}`
      : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="bg-stone-200 dark:bg-stone-800 h-full w-full flex items-center justify-center">
            <span className="text-stone-400 dark:text-stone-600">No image</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 bg-stone-950/80 py-1 px-3 text-white text-sm">
          {event.is_team_event ? "Team Event" : "Solo Event"}
        </div>
      </div>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-2">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </CardDescription>
        {event.location && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </CardDescription>
        )}
        {event.is_team_event && event.team_size && (
          <CardDescription className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Teams of {event.team_size}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3">
          {event.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
