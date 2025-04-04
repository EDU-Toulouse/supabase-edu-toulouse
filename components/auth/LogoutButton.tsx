"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/actions";

export function LogoutButton() {
  return (
    <Button
      onClick={async () => {
        await signOut();
      }}
      variant="outline"
    >
      Logout
    </Button>
  );
}
