"use client";

import React from "react";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/hooks/useDashboard";

interface HeaderProps {
  user: UserProfile;
  onAuthAction: () => void;
}

export function Header({ user, onAuthAction }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-10 h-9" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.isFree ? "Free Plan" : "Pro Plan"}
            </p>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer"
            onClick={onAuthAction}
          >
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}

