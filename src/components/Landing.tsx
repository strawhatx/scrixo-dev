"use client";

import React, { useEffect, useMemo } from "react";
import {
    Check,
    FileText,
    PenLine,
    Highlighter,
    MessageSquareText,
    PencilRuler,
    Layers,
    ArrowDownToLine,
    Shield,
    Star,
    Twitter,
    TriangleAlert,
    Edit3,
    PenTool,
    Download,
    Zap,
    Sparkles,
    MousePointer2,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card } from "./ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Landing() {
    const { user, loading, signIn, signOut } = useDashboard();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const year = useMemo(() => new Date().getFullYear(), []);

    useEffect(() => {
    }, []);

    if (loading) {
        return <LandingLoadingState />;
    }

    const activeUser = user || { isFree: true, name: "Guest", email: "" };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans select-none">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
                <div className="mx-auto w-full max-w-6xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-black tracking-tight">scrixo</span>
                                    <span className="text-[11px] text-muted-foreground/70 font-semibold tracking-tight">
                                        PDF editor
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                        Tools
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/sign-pdf">Sign PDF</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/fill-pdf">Fill PDF</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/merge-pdf">Merge PDF</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/split-pdf">Split PDF</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/annotate-pdf">Annotate</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/rotate-pdf">Rotate</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/reorder-pdf">Reorder</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="h-5 w-px bg-border mx-1" />
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                                <Link
                                    href="https://github.com/nathanieljames/pdf-express"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Report Bug"
                                >
                                    REPORT BUG
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-9 w-9"
                                asChild
                            >
                                <Link href="https://x.com/heynathanielj" target="_blank" rel="noopener noreferrer" title="Twitter">
                                    <Twitter className="w-4 h-4" />
                                </Link>
                            </Button>
                            <div className="h-5 w-px bg-border mx-1" />
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-tight h-9 px-3"
                                onClick={activeUser.isFree ? signIn : signOut}
                            >
                                {activeUser.isFree ? "Log In" : "Log Out"}
                            </Button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden mt-4 pb-4 border-t border-border/60 pt-4">
                            <div className="flex flex-col gap-2">
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/sign-pdf">Sign PDF</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/fill-pdf">Fill PDF</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/merge-pdf">Merge PDF</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/split-pdf">Split PDF</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/annotate-pdf">Annotate</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/rotate-pdf">Rotate</Link>
                                </Button>
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link href="/reorder-pdf">Reorder</Link>
                                </Button>
                                <div className="h-px bg-border my-2" />
                                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                                    <Link
                                        href="https://github.com/nathanieljames/pdf-express"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Report Bug
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="justify-start"
                                    onClick={() => {
                                        activeUser.isFree ? signIn() : signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    {activeUser.isFree ? "Log In" : "Log Out"}
                                </Button>
                            </div>
                        </nav>
                    )}
                </div>
            </header>

            {/* Hero */}
            <main className="mx-auto w-full max-w-6xl px-6">
                <section className="py-14 lg:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div className="space-y-6 pt-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-bold text-muted-foreground">
                                <Shield className="h-4 w-4 text-[#ff5a3c]" />
                                No installs · No account required
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06]">
                                Edit PDFs for{" "}
                                <span className="text-[#ff5a3c]">Free</span>{" "}
                                — Right in Your Browser
                            </h1>

                            <p className="text-base md:text-lg text-muted-foreground/80 font-medium max-w-xl">
                                Add signatures, fill forms, and annotate PDFs instantly in a few clicks.
                                No installs. No account required.
                            </p>

                            <ul className="space-y-3 text-sm font-semibold text-muted-foreground/85">
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 h-6 w-6 rounded-full bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                    Upload your PDF
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 h-6 w-6 rounded-full bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                    Make your edits (type, sign, annotate)
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-0.5 h-6 w-6 rounded-full bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </span>
                                    Download instantly
                                </li>
                            </ul>

                        </div>

                        <div className="space-y-3 h-full">
                            <Link
                                href="/upload"
                                className={cn(
                                    "w-full h-full relative overflow-hidden rounded-2xl border transition-all duration-300",
                                    "bg-background cursor-pointer select-none shadow-sm",
                                    "border-border/60 hover:border-[#ff5a3c]/60 hover:ring-4 hover:ring-[#ff5a3c]/10"
                                )}
                            >
                                <div className="p-10 sm:p-12 flex items-center justify-center min-h-[300px]">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-[#ff5a3c]/10 text-[#ff5a3c] flex items-center justify-center transition-all duration-300 hover:bg-[#ff5a3c] hover:text-white hover:shadow-md">
                                            <FileText className="h-8 w-8" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-base font-semibold text-foreground">
                                                Drop your file here
                                            </div>
                                            <div className="text-[11px] font-black tracking-widest uppercase text-muted-foreground/60">
                                                or
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className={cn(
                                                "h-12 px-7 rounded-xl font-black tracking-tight transition-all duration-200",
                                                "bg-[#ff5a3c] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
                                                "hover:bg-[#ff4a2a]"
                                            )}
                                        >
                                            Upload The PDF To Edit
                                        </button>

                                        <div className="text-[11px] font-semibold text-muted-foreground/60">
                                            PDF only · Max 25MB
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* What you can do */}
                <section className="py-14 border-t border-border/60">
                    <div className="flex items-end justify-between gap-6 mb-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Access to our tools</h2>
                            <p className="text-muted-foreground/80 font-medium">
                                Core PDF editing features — no learning curve.
                            </p>
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
                        <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-white">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-blue-600 rounded-2xl">
                                    <PenTool className="size-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">Sign & Fill PDFs</h3>
                            <ul className="text-gray-600 text-center mb-5 space-y-1 text-sm">
                                <li>Add signatures</li>
                                <li>Fill forms</li>
                                <li>Insert text anywhere</li>
                            </ul>
                            <div className="flex justify-center">
                                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    FREE
                                </span>
                            </div>
                        </Card>

                        <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-purple-50 to-white">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-purple-600 rounded-2xl">
                                    <Highlighter className="size-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">Annotate & Mark Up</h3>
                            <ul className="text-gray-600 text-center mb-5 space-y-1 text-sm">
                                <li>Highlight text</li>
                                <li>Add notes & comments</li>
                                <li>Draw or underline</li>
                            </ul>
                            <div className="flex justify-center">
                                <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    FREE
                                </span>
                            </div>
                        </Card>

                        <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-green-50 to-white">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-green-600 rounded-2xl">
                                    <Download className="size-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-center">Simple PDF Tools</h3>
                            <ul className="text-gray-600 text-center mb-5 space-y-1 text-sm">
                                <li>Add, delete, or reorder pages</li>
                                <li>Rotate, split, and merge</li>
                                <li>Download instantly</li>
                            </ul>
                            <div className="flex justify-center">
                                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    FREE
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Benefits Section */}
                    <div className="w-full max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Zap className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Lightning Fast</h4>
                                    <p className="text-sm text-gray-600">Process PDFs in seconds, not minutes</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                    <Shield className="size-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">100% Private</h4>
                                    <p className="text-sm text-gray-600">Files never leave your device</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                    <Sparkles className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Always Free</h4>
                                    <p className="text-sm text-gray-600">Core features will always be free</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-14 border-t border-border/60">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                            Simple steps to get started
                        </h2>
                    </div>

                    <div className="mt-12 flex flex-col md:flex-row md:items-start md:justify-center gap-10 md:gap-8">
                        <StepCard
                            icon={FileText}
                            step="1"
                            title="Upload your PDF file"
                            description="Drag & drop or click to browse"
                        />
                        <StepCard
                            icon={Highlighter}
                            step="2"
                            title="Edit, customize, sign, merge, and more"
                            description="Annotate, fill forms, reorder pages"
                        />
                        <StepCard
                            icon={ArrowDownToLine}
                            step="3"
                            title="Download the updated file"
                            description="Free export with a small watermark"
                        />
                    </div>
                </section>

                {/* Why people use it */}
                <section className="py-14 border-t border-border/60">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div className="space-y-3">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Why people use it</h2>
                            <p className="text-muted-foreground/80 font-medium">
                                No locked features. No learning curve. Just quick edits.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-6">
                            <ul className="space-y-3 text-sm font-semibold text-muted-foreground/85">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                                    Students filling school forms
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                                    Freelancers signing contracts
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                                    Small businesses marking up documents
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 mt-0.5 text-primary" />
                                    Anyone who just needs one quick edit
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Trust + Privacy */}
                <section className="py-14 border-t border-border/60">
                    <div className="rounded-2xl border border-border bg-muted/20 p-8">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl md:text-2xl font-black tracking-tight">Your files stay private</h2>
                                <p className="text-muted-foreground/80 font-medium max-w-2xl">
                                    Files are processed in your browser or deleted automatically.
                                    We don’t read or store your documents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-14 border-t border-border/60">
                    <div className="rounded-3xl border border-border bg-card p-10 text-center space-y-4">
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight">Edit your PDF in seconds</h2>
                        <div className="flex flex-col items-center gap-3">
                            <Button
                                variant="hero"
                                size="xl"
                                asChild
                            >
                                <Link href="/upload">
                                    👉 Upload a PDF
                                </Link>
                            </Button>
                            <div className="text-xs text-muted-foreground/70 font-bold">No account required</div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 border-t border-border/60 text-center text-xs text-muted-foreground/60 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>© {year} scrixo</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

// --- Internal Components ---

function LandingLoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    items,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    items: string[];
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black tracking-tight text-lg">{title}</h3>
            </div>
            <ul className="space-y-2 text-sm font-semibold text-muted-foreground/85">
                {items.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-primary" />
                        {t}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function StepCard({
    icon: Icon,
    step,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    step: string;
    title: string;
    description: string;
}) {
    return (
        <div className="w-full max-w-sm mx-auto text-center">
            {/* Illustration-style icon */}
            <div className="relative mx-auto h-40 w-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-muted/10" />
                <div className="absolute left-10 top-6 h-24 w-16 rounded-2xl bg-white shadow-md border border-border/60 -rotate-6" />
                <div className="absolute left-14 top-8 h-24 w-16 rounded-2xl bg-white shadow-md border border-border/60 rotate-6" />
                <div className="absolute left-1/2 -translate-x-1/2 top-10 h-20 w-20 rounded-3xl bg-[#ff5a3c]/10 border border-[#ff5a3c]/20 flex items-center justify-center shadow-sm">
                    <Icon className="h-10 w-10 text-[#ff5a3c]" />
                </div>
                <div className="absolute right-8 bottom-7 h-10 w-10 rounded-2xl bg-white border border-border/60 shadow-md flex items-center justify-center rotate-6">
                    <MousePointer2 className="h-6 w-6 text-foreground/70" />
                </div>
            </div>

            {/* Big step number */}
            <div className="text-6xl md:text-7xl font-black tracking-tight text-foreground/80 leading-none mt-2">
                {step}
            </div>
            <div className="mt-3 text-lg font-black tracking-tight">{title}</div>
            <div className="mt-2 text-sm font-semibold text-muted-foreground/80">{description}</div>
        </div>
    );
}

function PricingCard({
    badge,
    title,
    items,
    highlight,
}: {
    badge: string;
    title: string;
    items: string[];
    highlight?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-2xl border bg-card p-7",
                highlight ? "border-primary/40 shadow-glow" : "border-border"
            )}
        >
            <div className="flex items-center justify-between gap-4 mb-3">
                <div
                    className={cn(
                        "text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        highlight ? "border-primary/30 text-primary" : "border-border text-muted-foreground/70"
                    )}
                >
                    {badge}
                </div>
            </div>
            <div className="font-black tracking-tight text-xl">{title}</div>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-muted-foreground/85">
                {items.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-primary" />
                        {t}
                    </li>
                ))}
            </ul>
        </div>
    );
}
