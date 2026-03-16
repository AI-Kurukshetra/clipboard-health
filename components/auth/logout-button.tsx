"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "local" }),
      });

      if (!response.ok) {
        setIsPending(false);
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Signing out..." : "Logout"}
    </Button>
  );
}
