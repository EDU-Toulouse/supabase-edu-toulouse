"use client";

import Image from "next/image";
import { Calendar, ChevronLeft, Users } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EventHeaderProps {
  title: string;
  imageUrl: string | null;
  startDate: Date;
  isTeamEvent: boolean;
}

export function EventHeader({
  title,
  imageUrl,
  startDate,
  isTeamEvent,
}: EventHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Event Details</h1>
      </div>

      <div className="relative aspect-video w-full mb-6 rounded-xl overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="bg-muted h-full w-full flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            <Calendar className="h-4 w-4" />
            {format(startDate, "MMMM d, yyyy")}
          </span>

          {isTeamEvent ? (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
              <Users className="h-4 w-4" />
              Team Event
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-sm">
              Individual Event
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
