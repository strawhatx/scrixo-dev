"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => (
    <div className="h-dvh flex items-center justify-center bg-background text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export default function EditorPage() {
  return <Editor />;
}
