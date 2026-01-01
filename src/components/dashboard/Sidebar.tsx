"use client";

import React from "react";
import { FileText, LayoutDashboard, File, Clock, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/hooks/useDashboard";

interface SidebarProps {
  user: UserProfile;
  onUpgrade: () => void;
}

export function Sidebar({ user, onUpgrade }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b border-border">
        <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground">PDFOtter</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 bg-secondary/50">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <File className="w-4 h-4" />
          My Documents
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Clock className="w-4 h-4" />
          Recent
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </nav>

      <div className="p-4 mt-auto">
        {user.isFree && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Go Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Save documents, unlimited signatures, and more.
            </p>
            <Button size="sm" className="w-full text-xs" onClick={onUpgrade}>
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

