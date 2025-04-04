"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";

interface UserAvatarProps {
  user: User | null;
}

export function UserAvatar({ user }: UserAvatarProps) {
  if (!user) return null;

  // Extract avatar URL from user metadata (Discord provides this)
  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name || user?.email;

  // Get initials for fallback
  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <Avatar>
      <AvatarImage src={avatarUrl} alt={name || "User"} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
