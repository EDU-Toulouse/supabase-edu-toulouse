import { ImageResponse } from "next/og";
import { getEvent } from "@/lib/supabase/events";

export const runtime = "edge";

type EventPageParams = {
  params: {
    id: string;
  };
};

export async function generateImageMetadata({ params }: EventPageParams) {
  try {
    const id = params.id;
    const event = await getEvent(id);

    return [
      {
        contentType: "image/png",
        size: { width: 1200, height: 630 },
        alt: `${event.title} | EDU-Toulouse`,
      },
    ];
  } catch (error) {
    return [
      {
        contentType: "image/png",
        size: { width: 1200, height: 630 },
        alt: "Event Not Found | EDU-Toulouse",
      },
    ];
  }
}

export default async function OpenGraphImage({ params }: EventPageParams) {
  try {
    const id = params.id;
    const event = await getEvent(id);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1E293B",
            color: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {event.title}
          </div>
          {event.description && (
            <div
              style={{
                fontSize: 30,
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              {event.description.length > 120
                ? `${event.description.substring(0, 120)}...`
                : event.description}
            </div>
          )}
          <div
            style={{
              fontSize: 24,
              position: "absolute",
              bottom: 40,
              color: "#94A3B8",
            }}
          >
            EDU-Toulouse
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1E293B",
            color: "white",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Event Not Found
          </div>
          <div
            style={{
              fontSize: 24,
              position: "absolute",
              bottom: 40,
              color: "#94A3B8",
            }}
          >
            EDU-Toulouse
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
