import React from "react";
import { Metadata } from "next";
import { getEvent } from "@/lib/supabase/events";

type EventLayoutProps = {
  children: React.ReactNode;
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params,
}: EventLayoutProps): Promise<Metadata> {
  try {
    const id = params.id;
    const event = await getEvent(id);

    return {
      title: `${event.title} | EDU-Toulouse`,
      description: event.description,
    };
  } catch (error) {
    return {
      title: "Event Not Found | EDU-Toulouse",
      description: "The requested event could not be found",
    };
  }
}

export default function EventLayout({ children }: EventLayoutProps) {
  return <>{children}</>;
}
