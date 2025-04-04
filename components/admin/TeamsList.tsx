"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Clock,
  Users,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

type TeamWithDetails = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  owner_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  members: {
    count: number;
  }[];
};

interface TeamsListProps {
  initialTeams: TeamWithDetails[];
  currentUserId: string;
}

export function TeamsList({ initialTeams, currentUserId }: TeamsListProps) {
  const [teams, setTeams] = useState<TeamWithDetails[]>(initialTeams);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  // Filter teams based on search
  const filteredTeams = searchQuery
    ? teams.filter(
        (team) =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (team.description &&
            team.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : teams;

  // Handle team deletion
  const handleDeleteTeam = async (teamId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team? This action cannot be undone and will remove all members and registrations."
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) {
        throw error;
      }

      // Update local state
      setTeams(teams.filter((t) => t.id !== teamId));
      toast.success("Team deleted successfully");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/teams/new">New Team</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Team</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No teams found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url}
                          alt={team.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{team.name}</div>
                        {team.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {team.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {team.profiles.avatar_url ? (
                        <Image
                          src={team.profiles.avatar_url}
                          alt={team.profiles.username || ""}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{team.profiles.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 w-fit"
                    >
                      <Users className="h-3 w-3" />
                      {team.members[0]?.count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {formatDistanceToNow(new Date(team.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/teams/${team.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/teams/${team.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
