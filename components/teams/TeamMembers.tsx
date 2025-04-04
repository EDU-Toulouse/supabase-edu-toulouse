"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Crown,
  Shield,
  MoreHorizontal,
  UserMinus,
  Shield as ShieldIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TeamMembersProps {
  members: any[];
  teamId: string;
  userRole: string | null;
}

export function TeamMembers({ members, teamId, userRole }: TeamMembersProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isTeamAdmin = userRole === "owner" || userRole === "captain";

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: string;
    }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Team member role updated");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: (error) => {
      toast.error(
        `Failed to update role: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Team member removed");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
    onError: (error) => {
      toast.error(
        `Failed to remove member: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  const makeAdmin = (memberId: string) => {
    updateRoleMutation.mutate({ memberId, newRole: "captain" });
  };

  const removeAdmin = (memberId: string) => {
    updateRoleMutation.mutate({ memberId, newRole: "member" });
  };

  const removeMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the team?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  // Sort members: owner first, then captains, then regular members
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, captain: 1, member: 2 };
    return (
      roleOrder[a.role as keyof typeof roleOrder] -
      roleOrder[b.role as keyof typeof roleOrder]
    );
  });

  function getRoleBadge(role: string) {
    if (role === "owner") {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Crown className="h-3 w-3" /> Owner
        </span>
      );
    } else if (role === "captain") {
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
          <Shield className="h-3 w-3" /> Captain
        </span>
      );
    } else {
      return (
        <span className="text-xs font-medium text-muted-foreground">
          Member
        </span>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          {members.length} member{members.length !== 1 ? "s" : ""} in this team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMembers.map((member) => {
            const profile = member.profiles || {};
            const memberName =
              profile.username || profile.discord_username || "Unknown User";
            const isCurrentUser = user?.id === member.user_id;
            const canManageMember =
              isTeamAdmin && !isCurrentUser && member.role !== "owner";

            return (
              <div
                key={member.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        {memberName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{memberName}</div>
                    <div className="text-sm text-muted-foreground">
                      {profile.discord_username || ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}

                  {canManageMember &&
                    userRole === "owner" &&
                    member.role !== "owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === "member" ? (
                            <DropdownMenuItem
                              onClick={() => makeAdmin(member.id)}
                            >
                              <ShieldIcon className="h-4 w-4 mr-2" />
                              Make Captain
                            </DropdownMenuItem>
                          ) : member.role === "captain" ? (
                            <DropdownMenuItem
                              onClick={() => removeAdmin(member.id)}
                            >
                              <ShieldIcon className="h-4 w-4 mr-2" />
                              Remove Captain Status
                            </DropdownMenuItem>
                          ) : null}

                          <DropdownMenuItem
                            onClick={() => removeMember(member.id)}
                            className="text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No members in this team yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
