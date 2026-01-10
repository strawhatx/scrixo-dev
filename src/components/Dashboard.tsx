"use client";

import React, { useRef, useEffect, useState } from "react";
import { FileText,  ScrollText,  Search,  Twitter } from "lucide-react";
import { PDFUpload } from "@/components/PDFUpload";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
    const { user, loading, handleFileSelect, signIn, signOut } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (loading) {
        return <DashboardLoadingState />;
    }

    const activeUser = user || { isFree: true, name: "Guest", email: "" };

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans select-none">
            {/* Main UI Area */}
            <main className="flex-1 flex flex-col items-center justify-between p-8 relative overflow-hidden">

                {/* Top Right Controls */}
                <div className="absolute top-4 right-6 z-20 flex items-center gap-2">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                        <Link href="https://github.com/nathanieljames/pdf-express" target="_blank" rel="noopener noreferrer" title="Report Bug">
                            REPORT BUG
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" asChild>
                        <Link href="https://x.com/heynathanielj" target="_blank" rel="noopener noreferrer" title="Twitter">
                            <Twitter className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-tight h-8 px-3"
                        onClick={activeUser.isFree ? signIn : signOut}
                    >
                        {activeUser.isFree ? "Log In" : "Log Out"}
                    </Button>
                </div>

                {/* Logo Section */}
                <div className="z-10 w-full max-w-4xl flex flex-col items-center mt-12">
                    <div className="flex items-center gap-6 mb-4 animate-float">
                        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-glow">
                            <ScrollText className="w-12 h-12 text-primary-foreground" />
                        </div>
                        <h1 className="text-[7rem] font-bold tracking-[-0.04em] leading-none text-foreground">
                            scrixo
                        </h1>
                    </div>

                    <p className="text-muted-foreground/80 text-lg font-medium max-w-2xl text-center mb-4">
                       Make changes to your PDF files directly in your browser for free no signup required
                    </p>

                    {/* Hidden Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                            console.log("file changed");    
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                        }}
                    />

                    {/* Dropzone Area */}
                    <div className="w-full max-w-3xl aspect-[2.8/1] flex items-center justify-center relative">
                        <PDFUpload
                            onFileSelect={handleFileSelect}
                            minimal
                            onDraggingChange={setIsDragging}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* Footer Icon Row */}
            </main>

            {/* Vertical Ad Space */}
            <aside className="w-[300px] bg-muted/30 border-l border-border hidden xl:flex xl:flex-col shrink-0">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Advertisement</span>
                    <Search className="w-3 h-3 text-muted-foreground/20" />
                </div>
                <div className="flex-1 p-4">
                    <div className="w-full h-full bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-4 text-muted-foreground/20 italic">
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium">Ad Space</p>
                            <p className="text-[10px] font-bold">300 x 600</p>
                        </div>
                        <div className="w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    </div>
                </div>
            </aside>
        </div>
    );
}

// --- Internal Components ---

function DashboardLoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function LandingButton({ icon: Icon, label, onClick, highlight }: { icon: any; label: string; onClick: () => void; highlight?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2.5 rounded-lg border transition-all text-[13px] font-semibold flex items-center justify-center gap-3",
                highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-glow hover:brightness-110"
                    : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-muted/50 shadow-sm"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function FormatLink({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
    return (
        <div className="flex flex-col items-center gap-3 cursor-default group shrink-0">
            <div className="transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-sm">
                <Icon className="w-9 h-9" style={{ color }} />
            </div>
            <span className="text-[10px] font-black tracking-tighter text-muted-foreground/30 group-hover:text-primary transition-colors uppercase">
                {label}
            </span>
        </div>
    );
}
