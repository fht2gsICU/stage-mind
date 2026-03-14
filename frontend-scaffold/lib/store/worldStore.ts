import { create } from "zustand";
import type { ParsedWorld, Character, Scene } from "@/lib/types";

interface WorldStore {
  world: ParsedWorld | null;
  isLoading: boolean;
  error: string | null;
  setWorld: (world: ParsedWorld) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  getCharacter: (id: string) => Character | undefined;
  getScene: (id: string) => Scene | undefined;
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: null,
  isLoading: false,
  error: null,
  setWorld: (world) => set({ world, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  getCharacter: (id) => get().world?.characters.find((c) => c.id === id),
  getScene: (id) => get().world?.scenes.find((s) => s.id === id),
}));
