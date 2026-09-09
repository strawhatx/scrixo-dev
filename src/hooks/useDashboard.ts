"use client";

import { useState, useCallback } from "react";
import { useFileStore } from "@/store/useFileStore";
import { useRouter } from "next/navigation";

export interface User {
  isFree: boolean;
  name: string;
  email: string;
  id?: string;
}

export interface Document {
  id: string;
  name: string;
  file_path: string;
  updated_at: string;
  user_id: string;
}

const GUEST: User = {
  isFree: true,
  name: "Guest User",
  email: "guest@example.com",
};

/** Auth/cloud docs are off this iteration. */
export function useDashboard() {
  const [user] = useState<User>(GUEST);
  const [documents] = useState<Document[]>([]);
  const router = useRouter();
  const setFile = useFileStore((state) => state.setFile);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      router.push("/edit/new");
    },
    [router, setFile]
  );

  return {
    user,
    documents,
    loading: false,
    isUploading: false,
    handleFileSelect,
    signIn: async () => {},
    signOut: async () => {},
  };
}
