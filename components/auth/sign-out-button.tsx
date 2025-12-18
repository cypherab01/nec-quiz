"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signOut();
        globalThis.location.href = "/login";
      }}
    >
      Sign out
    </Button>
  );
}
