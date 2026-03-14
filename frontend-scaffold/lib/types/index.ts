/**
 * TypeScript types — mirror of PRODUCT_SPEC.md Section 4 and backend/schemas/story_models.py
 * Do NOT add fields not in PRODUCT_SPEC.md without updating the spec first.
 */

export interface CharacterRelationship {
  character_id: string;
  relationship_type: string;
  dynamic: string;
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "background";
  appearance: string;
  personality: string[];
  motivation: string;
  fear: string;
  desire: string;
  relationships: CharacterRelationship[];
  speech_style: string;
  performance_style: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  music_suggestion: string;
  characters_present: string[];
  available_actions: string[];
}

export interface BranchChoice {
  id: string;
  label: string;
  consequence: string;
  unlocks_scene_id?: string | null;
}

export interface BranchNode {
  id: string;
  trigger_condition: string;
  scene_id: string;
  choices: BranchChoice[];
}

export interface WorldMapNode {
  id: string;
  label: string;
  position: { x: number; y: number };
}

export interface WorldMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
  condition?: string | null;
}

export interface WorldMap {
  nodes: WorldMapNode[];
  edges: WorldMapEdge[];
}

export interface StoryPack {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  raw_text: string;
  themes: string[];
  style_tags: string[];
  experience_type: "solo" | "multiplayer" | "workshop";
}

export interface ParsedWorld {
  story_pack: StoryPack;
  characters: Character[];
  scenes: Scene[];
  branch_nodes: BranchNode[];
  world_map: WorldMap;
}

export interface APIResponse<T = unknown> {
  data: T | null;
  error: string | null;
}
