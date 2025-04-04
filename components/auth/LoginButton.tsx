"use client";

import { Button } from "@/components/ui/button";
import { signInWithDiscord } from "@/lib/supabase/actions";

export function LoginButton() {
  return (
    <Button
      onClick={async () => {
        await signInWithDiscord();
      }}
      className="bg-[#5865F2] hover:bg-[#4752c4] text-white"
    >
      Login with Discord
    </Button>
  );
}
