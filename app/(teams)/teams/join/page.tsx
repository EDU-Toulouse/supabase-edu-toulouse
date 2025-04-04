import { Metadata } from "next";
import { getUser } from "@/lib/supabase/actions";
import { redirect } from "next/navigation";
import { TeamJoinForm } from "@/components/teams/TeamJoinForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Join a Team | EDU-Toulouse",
  description: "Join an existing team using an invitation code",
};

export default async function JoinTeamPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const user = await getUser();

  if (!user) {
    // Redirect to login, saving the destination URL
    const returnUrl = `/teams/join${
      searchParams.code ? `?code=${searchParams.code}` : ""
    }`;

    return redirect(
      `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold">Join a Team</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Enter an invitation code to join an existing team
      </p>

      <div className="max-w-md">
        <TeamJoinForm initialCode={searchParams.code || ""} userId={user.id} />

        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Don&apos;t have a code?</AlertTitle>
          <AlertDescription>
            Team invitation codes are provided by team captains and owners. If
            you don&apos;t have a code, you can either:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Ask a team owner/captain for an invitation code</li>
              <li>Create your own team</li>
            </ul>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/teams">Browse Teams</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
