"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TeamInviteProps {
  teamId: string;
  teamName: string;
}

export function TeamInvite({ teamId, teamName }: TeamInviteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  async function generateInviteCode() {
    setIsLoading(true);

    try {
      // In a real app, we would call the API to create a new invitation code
      // const response = await fetch("/api/teams/invites", {
      //   method: "POST",
      //   body: JSON.stringify({ teamId }),
      // });
      // const data = await response.json();
      // setInviteCode(data.code);

      // For now, we'll just generate a mock code
      const mockCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      // You would typically associate this code with the teamId in the database
      console.log(`Generated invite code for team: ${teamId}`);
      setInviteCode(mockCode);

      toast.success("Invitation code generated!");
    } catch (error) {
      toast.error("Failed to generate invitation code");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function copyInviteLink() {
    if (!inviteCode) return;

    const inviteLink = `${window.location.origin}/teams/join?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Invitations</CardTitle>
        <CardDescription>
          Generate an invitation code to invite new members
        </CardDescription>
      </CardHeader>

      <CardContent>
        {inviteCode ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Invitation code:</p>
              <div className="flex gap-2">
                <Input value={inviteCode} readOnly className="font-mono" />
                <Button variant="outline" size="icon" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This code will expire in 7 days
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Generate a code that others can use to join {teamName}
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={generateInviteCode}
          disabled={isLoading}
          variant={inviteCode ? "outline" : "default"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : inviteCode ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate new code
            </>
          ) : (
            "Generate invitation code"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
