"""
Pydantic data models — mirror of PRODUCT_SPEC.md Section 4.
These are the canonical data objects for all AI generation and API responses.
Do NOT add fields not in PRODUCT_SPEC.md without updating the spec first.
"""
from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


class CharacterRelationship(BaseModel):
    character_id: str
    relationship_type: str  # e.g. "rival", "lover", "mentor"
    dynamic: str            # description of the dynamic


class Character(BaseModel):
    id: str
    name: str
    role: Literal["protagonist", "antagonist", "supporting", "background"]
    appearance: str
    personality: list[str]          # trait tags
    motivation: str                 # core drive
    fear: str
    desire: str
    relationships: list[CharacterRelationship] = Field(default_factory=list)
    speech_style: str               # e.g. "formal and precise", "sarcastic"
    performance_style: str          # e.g. "stoic", "dramatic"


class Scene(BaseModel):
    id: str
    name: str
    description: str
    atmosphere: str
    music_suggestion: str
    characters_present: list[str]   # character IDs
    available_actions: list[str]    # action IDs or descriptions


class BranchChoice(BaseModel):
    id: str
    label: str                      # short label shown to user
    consequence: str                # what happens if chosen
    unlocks_scene_id: str | None = None


class BranchNode(BaseModel):
    id: str
    trigger_condition: str          # e.g. "after speaking to Hermione"
    scene_id: str                   # where this branch occurs
    choices: list[BranchChoice]


class WorldMapNode(BaseModel):
    id: str                         # scene_id
    label: str
    position: dict[str, float]      # {"x": 0.0, "y": 0.0} for React Flow


class WorldMapEdge(BaseModel):
    id: str
    source: str                     # scene_id
    target: str                     # scene_id
    label: str | None = None        # e.g. "through the forest"
    condition: str | None = None    # unlock condition


class WorldMap(BaseModel):
    nodes: list[WorldMapNode]
    edges: list[WorldMapEdge]


class StoryPack(BaseModel):
    id: str
    title: str
    genre: str
    synopsis: str
    raw_text: str
    themes: list[str]
    style_tags: list[str]
    experience_type: Literal["solo", "multiplayer", "workshop"] = "solo"


# --- Composite: full parsed world returned from director_agent ---

class ParsedWorld(BaseModel):
    story_pack: StoryPack
    characters: list[Character]
    scenes: list[Scene]
    branch_nodes: list[BranchNode]
    world_map: WorldMap


# --- API request/response envelopes ---

class ParseRequest(BaseModel):
    text: str = Field(..., min_length=50, description="Raw story text to parse")
    experience_type: Literal["solo", "multiplayer", "workshop"] = "solo"


class APIResponse(BaseModel):
    data: dict | None = None
    error: str | None = None
