"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamJoinFormProps {
  initialCode: string;
  userId: string;
}

export function TeamJoinForm({ initialCode, userId }: TeamJoinFormProps) {
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter an invitation code");
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, we would call the API to validate and join the team
      // const response = await fetch("/api/teams/join", {
      //   method: "POST",
      //   body: JSON.stringify({ code, userId }),
      // });

      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || "Failed to join team");
      // }

      // const { teamId } = await response.json();

      // Simulate successful team join
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Successfully joined the team!");
      router.push(`/teams`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to join team"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Enter Invitation Code</CardTitle>
          <CardDescription>
            Enter the code provided by the team owner or captain
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="code"
                placeholder="Enter invitation code (e.g. X72B5A4Z)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono"
                autoFocus={!initialCode}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Join Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
