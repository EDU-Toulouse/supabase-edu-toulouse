"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface CreateTeamButtonProps {
  userId: string;
}

export function CreateTeamButton({ userId }: CreateTeamButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const createTeamMutation = useMutation({
    mutationFn: async () => {
      // Validate form
      if (!name.trim()) {
        throw new Error("Team name is required");
      }

      // Create the team
      const { data, error } = await supabase
        .from("teams")
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            owner_id: userId,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Add the owner as a team member with 'owner' role
      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: data.id,
            user_id: userId,
            role: "owner",
          },
        ]);

      if (memberError) {
        // Clean up the team if member creation fails
        await supabase.from("teams").delete().eq("id", data.id);

        throw new Error("Failed to add owner to team");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Team created successfully!");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/teams/${data.id}`);
    },
    onError: (error) => {
      toast.error(
        `Failed to create team: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTeamMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create Team</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Team</DialogTitle>
            <DialogDescription>
              Create your own team and invite others to join.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Description (optional)</Label>
              <Input
                id="team-description"
                placeholder="Describe your team"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={createTeamMutation.isPending || !name.trim()}
            >
              {createTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
