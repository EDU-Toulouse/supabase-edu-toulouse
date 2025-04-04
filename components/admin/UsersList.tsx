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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Check,
  X,
  Shield,
  User,
  Clock,
  CalendarClock,
} from "lucide-react";
import Image from "next/image";

type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  discord_username: string | null;
  created_at: string;
  is_admin: boolean;
};

interface UsersListProps {
  initialUsers: UserProfile[];
  currentUserId: string;
}

export function UsersList({ initialUsers, currentUserId }: UsersListProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const supabase = createClient();

  // Filter users based on search
  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.discord_username
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : users;

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own admin status");
      return;
    }

    setIsUpdating(userId);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        )
      );

      toast.success(
        `User admin status ${!currentStatus ? "granted" : "revoked"}`
      );
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Discord</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px] text-center">Admin</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.username || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {user.username || "Anonymous"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.id === currentUserId ? "You" : ""}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.discord_username || (
                      <span className="text-muted-foreground">Not linked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={user.is_admin}
                        disabled={
                          isUpdating === user.id || user.id === currentUserId
                        }
                        onCheckedChange={() =>
                          toggleAdminStatus(user.id, user.is_admin)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        toast.info(
                          `Feature coming soon: View ${user.username}'s details`
                        );
                      }}
                    >
                      View
                    </Button>
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
