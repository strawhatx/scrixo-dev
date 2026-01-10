import { create } from 'zustand';

interface FileState {
  file: File | null;
  setFile: (file: File | null) => void;
}

export const useFileStore = create<FileState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));

