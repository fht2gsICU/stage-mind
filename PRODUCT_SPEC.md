# StageMind — Product Specification
# StageMind — 产品规格文档

> **For AI Builders:** This document is the authoritative product spec for StageMind. Use it to understand scope, data models, module boundaries, and MVP constraints before writing any code.
>
> **给 AI 构建者：** 本文档是 StageMind 的权威产品规格说明。在编写任何代码之前，请用它来理解产品范围、数据模型、模块边界和 MVP 约束。

---

## 1. Product Identity / 产品定义

### English

**StageMind** is an AI-driven interactive narrative engine. Users upload any story — a novel excerpt, screenplay, folk tale, or original world-building text — and the system automatically transforms it into an explorable, performable, and branching interactive experience.

The output is not a summary. It is a **world that can be entered**: characters to embody, scenes to walk through, choices that split timelines, dialogue that responds, actions to perform, and music that sets the mood.

### 中文

**StageMind** 是一个 AI 驱动的互动叙事引擎。用户上传任意故事——小说片段、剧本、民间传说或原创世界观设定——系统自动将其转化为可探索、可表演、可分支的互动体验。

输出不是摘要，而是一个**可以进入的世界**：可扮演的角色、可穿行的场景、分叉时间线的选择、会回应的对话、可执行的动作，以及烘托氛围的音乐。

---

## 2. One-Line Positioning / 一句话定位

**EN:** An AI engine that turns any story into an explorable, performable, branching interactive world.

**ZH:** 一个将任意故事自动转化为可探索、可表演、可分支互动世界的 AI 叙事引擎。

---

## 3. Core User Flow / 核心用户流程

```
[Upload Story Text]
       ↓
[AI: Parse & Structure]
  - Characters
  - Scenes
  - Conflicts
  - Branch Points
       ↓
[AI: Generate World]
  - Character Cards
  - Scene Cards
  - World Map
  - Interaction Nodes
       ↓
[User: Enter Experience]
  - Choose Role
  - Navigate Map
  - Dialogue / Action / Choice
  - Trigger Branches
       ↓
[User: Co-Create]
  - Edit Characters / Scenes / Branches
  - AI Regenerates Affected Content
```

---

## 4. Data Models / 数据模型

All AI generation and user edits operate on these canonical objects.

所有 AI 生成和用户编辑均基于以下标准数据对象。

### 4.1 StoryPack

```typescript
interface StoryPack {
  id: string;
  title: string;
  genre: string;                  // e.g. "fantasy", "thriller", "romance"
  synopsis: string;               // AI-generated summary
  raw_text: string;               // original user-uploaded content
  themes: string[];               // e.g. ["betrayal", "redemption"]
  style_tags: string[];           // e.g. ["musical", "dark", "comedic"]
  experience_type: "solo" | "multiplayer" | "workshop";
}
```

### 4.2 Character

```typescript
interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "background";
  appearance: string;             // physical description
  personality: string[];          // trait tags
  motivation: string;             // core drive
  fear: string;                   // core fear
  desire: string;                 // core desire
  relationships: {
    character_id: string;
    relationship_type: string;    // e.g. "rival", "lover", "mentor"
    dynamic: string;              // description of dynamic
  }[];
  speech_style: string;           // how they talk
  performance_style: string;      // movement/emotional quality
  controlled_by: "ai" | "user" | "unassigned";
}
```

### 4.3 Scene

```typescript
interface Scene {
  id: string;
  name: string;
  description: string;            // narrative description
  atmosphere: string;             // mood/tone
  music_suggestion: {
    genre: string;
    tempo: string;
    emotional_quality: string;
  };
  characters_present: string[];   // Character IDs
  available_actions: Action[];
  connected_scenes: string[];     // Scene IDs reachable from here
  trigger_events: TriggerEvent[];
}
```

### 4.4 Action

```typescript
interface Action {
  id: string;
  label: string;                  // user-facing label
  type: "dialogue" | "movement" | "choice" | "performance" | "exploration";
  description: string;
  leads_to: string | null;        // Scene ID or BranchNode ID
  performance_cue: string | null; // stage direction hint
}
```

### 4.5 BranchNode

```typescript
interface BranchNode {
  id: string;
  trigger: string;                // what causes this branch point
  description: string;
  choices: {
    label: string;
    consequence: string;          // narrative consequence description
    leads_to_scene: string;       // Scene ID
    relationship_delta: {
      character_id: string;
      change: "positive" | "negative" | "neutral";
    }[];
  }[];
  branch_type: "relationship" | "scene_order" | "motivation_rewrite" | "tone_shift";
}
```

### 4.6 WorldMap

```typescript
interface WorldMap {
  id: string;
  map_type: "linear" | "branching" | "room" | "stage" | "node_graph";
  nodes: {
    scene_id: string;
    position: { x: number; y: number };
    is_starting_point: boolean;
  }[];
  edges: {
    from_scene_id: string;
    to_scene_id: string;
    condition: string | null;     // null = always accessible
  }[];
}
```

---

## 5. System Modules / 系统模块

### Module 1 — Story Ingestion / 故事输入模块

**Purpose:** Accept raw story content from users with minimal friction.

**Inputs accepted:**
- Plain text paste
- File upload (`.txt`, `.md`, `.pdf`, `.docx`)
- Multiple document upload (combined into one StoryPack)

**Optional user-provided metadata:**
- Story genre / style
- Preferred experience type (solo / multiplayer / workshop)
- Emphasis: dialogue-heavy / action-heavy / musical / branching

**Output:** Raw `StoryPack` object (synopsis and tags not yet generated)

---

### Module 2 — AI Story Parser / AI 故事解析模块

**Purpose:** Transform raw text into structured, machine-actionable story data.

**AI tasks:**
1. Generate synopsis and theme tags
2. Extract all named characters → produce Character stubs
3. Extract all distinct locations/times → produce Scene stubs
4. Identify main conflict and sub-conflicts
5. Identify key plot events and their sequence
6. Identify natural branch points (moments where choices diverge outcomes)
7. Tag emotional arc across the story
8. Tag performance potential per scene

**Output format:** Fully populated `StoryPack`, `Character[]`, `Scene[]` stubs, `BranchNode[]` stubs

**AI constraint:** Must maintain narrative logic consistency. Conflicting extracted data should be flagged, not silently resolved.

---

### Module 3 — World Generator / 世界生成模块

**Purpose:** Transform parsed structure into a navigable spatial world.

**AI tasks:**
1. Select appropriate `map_type` based on story structure
2. Assign scenes to map nodes with spatial logic
3. Define scene connections and access conditions
4. Write full atmospheric `Scene.description` and `Scene.atmosphere`
5. Generate `music_suggestion` per scene
6. Define `trigger_events` per scene

**Output:** `WorldMap`, fully populated `Scene[]`

---

### Module 4 — Character Generator / 角色生成模块

**Purpose:** Give each character full interactive depth.

**AI tasks:**
1. Complete all Character fields from parsed story data
2. Infer `fear`, `desire`, `motivation` from story subtext if not explicit
3. Write `speech_style` and `performance_style`
4. Map all character relationships
5. Suggest `controlled_by` assignment (AI or user)

**Output:** Fully populated `Character[]`

---

### Module 5 — Interaction Generator / 互动生成模块

**Purpose:** Define all ways users can engage with the world.

**Interaction types to generate per scene:**

| Type | Description |
|------|-------------|
| `dialogue` | Real-time conversation with AI-controlled characters |
| `choice` | Key narrative decision points linked to BranchNodes |
| `exploration` | Moving between map nodes |
| `performance` | Script lines, physical cues, vocal direction |
| `movement` | Stage blocking suggestions |
| `music` | Atmospheric cue or musical moment trigger |

**Output:** `Action[]` per scene, `BranchNode[]` with full choices populated

---

### Module 6 — Branch Engine / 分支剧情模块

**Purpose:** Make the story replayable and consequential.

**Capabilities:**
- Detect all branch-eligible story moments
- Generate minimum 2 distinct choice paths per branch node
- Each path must produce meaningfully different narrative outcomes
- After user choice, AI regenerates downstream scene content to maintain consistency
- Track relationship state changes across branches

**Consistency rule:** Any AI-generated branch content must not contradict established world facts or character motivations unless that contradiction is the intended dramatic effect.

---

### Module 7 — Music & Action Generator / 音乐与动作生成模块

**Purpose:** Give the experience physical and atmospheric embodiment.

**Music outputs (text-based, no audio generation in MVP):**
- Scene atmosphere description
- Suggested music genre and tempo
- Emotional peak/valley markers in scene
- Cue points for music changes

**Action/performance outputs:**
- Basic stage blocking for scene (text directions)
- Character posture and gestural suggestions
- Performance emotional note per beat
- Multi-character coordination hints

**Output format:** Embedded in `Scene.music_suggestion`, `Action.performance_cue`, and standalone `PerformanceCue` objects per scene beat.

---

### Module 8 — Co-Creation Editor / 共创编辑模块

**Purpose:** Let users modify the world and have AI propagate changes consistently.

**User-editable fields:**
- Any field on `Character` (especially `motivation`, `relationships`)
- `Scene.description`, `Scene.atmosphere`
- `BranchNode.choices` (add, remove, rewrite)
- `WorldMap` node connections
- Music style preferences

**AI behavior on edit:**
1. Receive diff of changed fields
2. Identify all downstream content affected by change
3. Regenerate affected `Scene`, `Character` reactions, `Action`, `BranchNode` content
4. Return updated objects without breaking unaffected content

---

## 6. Page Architecture / 页面架构

### Page 1: Upload / 上传页

- Story text input (paste or file upload)
- Style/genre selector
- Experience type selector (solo / multi / workshop)
- Optional: emphasis toggles (dialogue / action / music / branching)
- CTA: "Generate My World" / "生成我的世界"

### Page 2: World Overview / 世界总览页

- Interactive `WorldMap` visualization
- Character roster with cards
- Relationship graph (optional toggle)
- Scene entry points
- CTA per scene: "Enter" / "进入"

### Page 3: Scene Experience / 场景体验页

- Scene description and atmosphere display
- Music/mood indicator
- Characters present (portraits + status)
- Dialogue box (user ↔ AI character)
- Action buttons (explore / perform / choose)
- Performance cue sidebar
- Branch choice modal (when triggered)

### Page 4: Editor / 编辑器页

- Tabbed: Characters | Scenes | Branches | Map
- Inline field editing
- "Regenerate from here" action per edit
- Change preview before confirming

### Page 5: Playback Review / 回顾页

- Timeline of user's path through the story
- Choices made and branches taken
- Character relationship changes
- Narrative summary of the experience
- Option to replay from any branch point

---

## 7. MVP Scope / MVP 范围

### Must Have (MVP)

- [ ] User can upload text story
- [ ] AI extracts: characters, scenes, main plot, branch points
- [ ] AI generates: character cards, scene cards, simple map
- [ ] At least 1 main storyline + 2 branch paths generated
- [ ] User can browse scenes
- [ ] User can have dialogue with AI-controlled character
- [ ] User can make at least 1 meaningful choice with divergent outcomes
- [ ] User can edit 1 character motivation and have AI update downstream content
- [ ] User can edit 1 branch direction

### Explicitly Out of MVP

- 3D or high-fidelity map rendering
- Real audio generation (music is text description only)
- Motion capture or gesture recognition
- Real-time multiplayer sync
- Complex image asset system
- Voice interaction

---

## 8. AI System Requirements / AI 系统能力要求

### 8.1 Extraction (解析能力)

- Named entity recognition for characters, locations, events
- Relationship inference from narrative context
- Conflict identification (main + sub)
- Branch point detection (moments of narrative ambiguity or decision)

### 8.2 Generation (生成能力)

- Character profile generation from narrative subtext
- Scene description and atmosphere writing
- Map topology generation matching story structure
- Dialogue generation in character voice
- Branch consequence writing

### 8.3 Consistency (一致性能力)

- World state tracking across branches
- Character motivation consistency enforcement
- Downstream content update on user edits
- Conflict detection between edited and existing content

### 8.4 Interactivity (互动能力)

- Real-time dialogue response as AI characters
- Branch resolution and content regeneration on user choice
- Incremental world update without full regeneration

---

## 9. Product Principles / 产品原则

These are non-negotiable design constraints. All feature decisions must respect them.

1. **World first, mechanics second** — Users must feel they've entered a complete world before any game-like feature is introduced.

2. **Character before plot** — Users form attachment through characters, not systems. Character depth drives engagement.

3. **Every choice must matter** — No cosmetic choices. Every branch must produce a meaningfully different narrative experience.

4. **AI is the director, not just the generator** — The AI continuously organizes, paces, and responds — not just produces content once.

5. **Users can rewrite** — The experience is not a closed product. Users can modify and the system regenerates.

---

## 10. Version Roadmap / 版本规划

| Version | Core Capability |
|---------|----------------|
| V1 (MVP) | Story upload → AI world generation → Interactive solo experience |
| V2 | Multiplayer mode — multiple users inhabit same world simultaneously |
| V3 | Voice interaction — speak to AI characters in real time |
| V4 | Movement/gesture recognition — physical performance feedback |
| V5 | Custom world templates — user-defined IP/universe scaffolds |

---

## 11. Success Metrics / 成功指标

### Product

- % of users who complete a full experience after uploading
- Average session duration
- Number of branch triggers per session
- % of users who use the editor to modify content

### Experience Quality

- Does the user feel they "entered the story"? (survey)
- Does character dialogue feel authentic to the source? (survey)
- Are branch outcomes meaningfully different?
- Is the world legible on first entry?

### System

- Story parse success rate (% of uploads that produce valid StoryPack)
- Character generation stability (consistent personalities across sessions)
- Branch consistency rate (no logical contradictions in generated branches)
- Time-to-world (seconds from upload to first renderable world)

---

## 12. Risk Register / 风险登记

| Risk | Mitigation |
|------|-----------|
| Copyright — user uploads commercially protected text | Platform does not provide content library; user uploads only; generated output is transformative |
| AI generates inconsistent branches | World-state constraints passed in every AI prompt; editor allows rollback |
| Experience overload on first entry | MVP limits to 1 main path + 2 branches; strong onboarding flow required |
| Character voice drift across sessions | Character profile JSON injected into every dialogue prompt |
| Multiplayer sync complexity | Deferred to V2; MVP is solo-only |

---

## 13. Summary Prompt for AI Builders / 给 AI 构建者的一句话总结

**EN:**

> Build a product where: a user uploads a story text → AI parses characters, scenes, relationships, and conflicts → AI generates a world map, character cards, scene cards, and interaction nodes → the user enters the world via dialogue, action, performance, and branching choices → the user can edit any setting and the system regenerates affected downstream content in real time.

**ZH:**

> 构建一个产品：用户上传故事文本 → AI 解析角色、场景、关系与冲突 → AI 生成世界地图、角色卡、场景卡和互动节点 → 用户通过对话、动作、表演和分支选择进入这个故事世界 → 用户可修改任意设定，系统实时重构受影响的后续内容。
