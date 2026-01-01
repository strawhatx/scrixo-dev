"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useFile } from "@/lib/FileContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function useDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const router = useRouter();
  const { setFile } = useFile();
  const supabase = createClient();

  const fetchDocuments = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return;
    }
    if (data) setDocuments(data);
  }, [supabase]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (supabaseUser) {
          setUser({
            isFree: false, 
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
            email: supabaseUser.email || "",
            id: supabaseUser.id,
          });
          await fetchDocuments(supabaseUser.id);
        } else {
          setUser({
            isFree: true,
            name: "Guest User",
            email: "guest@example.com",
          });
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [supabase, fetchDocuments]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    
    if (!user || user.isFree) {
      toast.info("Free account: File kept in memory.");
      router.push("/edit/new"); 
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Uploading and saving document...");
    
    try {
      // 1. Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Create document record in Database
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert([
          { 
            name: selectedFile.name, 
            file_path: fileName,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (docError) throw docError;

      toast.dismiss(loadingToast);
      toast.success("Saved to your documents!");
      router.push(`/edit/${docData.id}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Error saving: ${error.message}`);
      router.push("/edit/new");
    } finally {
      setIsUploading(false);
    }
  }, [user, router, setFile, supabase]);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return {
    user,
    documents,
    loading,
    isUploading,
    handleFileSelect,
    signIn,
    signOut,
  };
}
