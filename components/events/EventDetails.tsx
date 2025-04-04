"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface EventDetailsProps {
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date;
  teamSize: number | null;
  maxParticipants: number | null;
  registrationDeadline: Date | null;
  registrations: any[]; // This would ideally be typed more specifically
}

export function EventDetails({
  description,
  location,
  startDate,
  endDate,
  teamSize,
  maxParticipants,
  registrationDeadline,
  registrations,
}: EventDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-4">Description</CardTitle>
          <div className="prose dark:prose-invert">
            <p className="whitespace-pre-line">{description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-4">Event Information</CardTitle>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-muted-foreground">
                  {format(startDate, "EEEE, MMMM d, yyyy")}
                  <br />
                  {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                </p>
              </div>
            </div>

            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-muted-foreground">{location}</p>
                </div>
              </div>
            )}

            {teamSize && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Team Size</h3>
                  <p className="text-muted-foreground">
                    {teamSize} players per team
                  </p>
                </div>
              </div>
            )}

            {maxParticipants && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Capacity</h3>
                  <p className="text-muted-foreground">
                    {maxParticipants} maximum participants
                  </p>
                </div>
              </div>
            )}

            {registrationDeadline && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Registration Deadline</h3>
                  <p className="text-muted-foreground">
                    {format(registrationDeadline, "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CardTitle className="mb-4">Participants</CardTitle>

          {registrations.length > 0 ? (
            <div>
              <p className="mb-4">
                {registrations.length}{" "}
                {registrations.length === 1 ? "participant" : "participants"}{" "}
                registered
              </p>

              <div className="space-y-2">
                {/* We could display registered participants here */}
                <p className="text-sm text-muted-foreground">
                  Participant details available on request
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No participants have registered yet. Be the first one to join!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
