# NEXORA — The Ultimate Real-Time Multiplayer Party Showdown

A high-stakes, real-time multiplayer social party game combining rapid-fire micro-challenges, secret briefing objectives, bluffing, and suspenseful voting across 5 rounds for 2–8 players.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Architecture Decisions for Approval:**
> - **Full-Stack Server-Authoritative Architecture**: Built on Express + Server-Sent Events (SSE) with HTTP REST endpoints on Node.js/tsx (`server.ts`). This guarantees real cross-device multiplayer across phones, tablets, and desktop browsers without fake local-only state.
> - **Zero-Exposure Private State**: Secret roles (Signal Agent vs Saboteur), private challenge objectives, and active votes are stored strictly server-side and filtered out of public room broadcasts until the authoritative reveal phase.
> - **Dual-Mode Scalability (2 to 8 Players)**: Full 2-player "Duel Mode" (direct asymmetric prediction and bluffing challenges with fair duel scoring, omitting 3rd-player voting) and 3–8 player "Saboteur Mode" (classic social deduction with one secret Saboteur).
> - **Visual Identity**: Tailored dark gaming console aesthetic using Deep Midnight Blue (`#081426`), Electric Navy (`#10284A`), Pure White (`#FFFFFF`), Neon Pink (`#FF4FA3`), and Soft Violet (`#8B7CFF`).

---

## 1. Overview & Core Concept

- **Game Name**: NEXORA
- **Tagline**: *Think Fast. Trust Nobody. Win Together.*
- **Target Audience**: Friends, college groups, families, and casual gaming communities playing across separate mobile or desktop devices.
- **Match Structure**: 5 fast-paced rounds, each cycling through 5 sequential phases:
  1. **Phase A — Secret Briefing**: Private role assignment & hidden objective (Agent vs Saboteur in 3-8P; Duelists in 2P).
  2. **Phase B — The Challenge**: Synchronized family-friendly challenge across 6 categories (Logic Pulse, Quick Signal, Bluff Matrix, Memory Echo, Prediction Grid, Secret Signal).
  3. **Phase C — Rapid Submission**: Server-enforced countdown timer with single-submission locking.
  4. **Phase D — Investigation & Clues**: Review submissions/clues and cast secret suspicion votes.
  5. **Phase E — Reveal & Scoring**: Dramatic point reveals, saboteur unmasking, score animations, and standings update.

---

## 2. User Experience & Visual Design

### Design Tokens & Palette
- **Dominant Neutral Canvas (60%)**: Deep Midnight Blue (`#081426`) with ambient radial gradients.
- **Structural Surfaces (30%)**: Electric Navy (`#10284A`) panels with subtle luminous hairline borders (`rgba(139, 124, 255, 0.2)`).
- **High-Intent Accents (10%)**: Neon Pink (`#FF4FA3`) for primary CTAs and key game events; Soft Violet (`#8B7CFF`) for secondary badges and progress indicators.
- **Contrast Typography**: Pure White (`#FFFFFF`) display text with high-contrast slate text for body and tabular figures for scores/timers (`font-mono tabular-nums`).

### 12 Cohesive Screen Experiences
1. **Welcome / Landing**: Original NEXORA glowing mark, tagline, primary "Create Room" / "Join Room" actions, interactive rules guide, and sound controls.
2. **Create Room**: Host display name, avatar picker, round configuration (default 5 rounds), instant code generator (`NX-XXXX`).
3. **Join Room**: Room code input with auto-formatting, display name validation, instant join confirmation.
4. **Lobby**: Live player roster (2–8 slots), real-time readiness toggles, copy/share room links, host start controls (disabled when < 2 players).
5. **Private Briefing Modal/Screen**: Uniquely rendered secret objective per player with an explicit "Acknowledge" button.
6. **Challenge Arena**: Synchronized countdown ring, round category header, interactive puzzle/choice options, instant submission lock.
7. **Investigation & Voting**: Real-time evidence log, candidate player selection grid, secret vote submission.
8. **Round Reveal**: Suspenseful Saboteur identity reveal, correct answer spotlight, point breakdown toasts.
9. **Scoreboard & Standings**: Animated rank progressions, round score changes, tiebreaker calculations.
10. **Final Results / Winner Podium**: Celebratory winner showcase, match MVP stats, "Play Again" and "Return to Lobby" triggers.
11. **How to Play Guide**: Tabbed interactive walkthrough of roles, challenges, and scoring math.
12. **Settings**: Audio toggles (synthesized sound effects via Web Audio API), motion preferences (`prefers-reduced-motion`).

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Why |
|---|---|---|
| **Multiplayer Sync Engine** | Server-authoritative Express + Server-Sent Events (SSE) with REST mutation endpoints | Works natively in AI Studio container environments (`APP_URL`) across multiple devices without requiring third-party credentials or broken websockets in proxied iframes. |
| **Private Role Protection** | Server-side role stripping | The server maintains full game state in memory; `GET /api/rooms/:code` redacts secret roles and pending votes. Player-specific data is accessed only via authenticated `playerToken`. |
| **2-Player Duel Handling** | Dedicated Asymmetric Duel Mode | Standard social deduction games break with 2 players. NEXORA detects 2-player matches and runs competitive prediction/bluffing rounds with tailored duel scoring. |
| **Audio Feedback** | Native Web Audio API Synthesizer | Zero external audio asset dependencies or licensing issues; generates crisp futuristic chimes, countdown beeps, and victory fanfares directly in code. |

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      NEXORA CLIENT (React SPA)              │
│  - Zustand/React State   - Motion Transitions  - Web Audio   │
│  - Screen Router         - SSE Event Listener  - Local Token │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP POST Actions             │ Real-Time SSE
               │ (Join, Ready, Submit, Vote)   │ State Broadcasts
┌──────────────▼──────────────────────────────┴───────────────┐
│                    EXPRESS BACKEND (server.ts)              │
│  - /api/rooms (create, join, leave)                         │
│  - /api/rooms/:code/stream (Server-Sent Events)             │
│  - /api/rooms/:code/action (submit answer, cast vote)       │
│  - /api/rooms/:code/start, /next-round, /restart            │
├─────────────────────────────────────────────────────────────┤
│                 AUTHORITATIVE GAME ENGINE                   │
│  - Room Store (In-Memory with TTL Cleanup)                  │
│  - Round Phase Timer Loop (Briefing -> Play -> Vote -> Reveal)│
│  - Secret Role Assignment & Score Calculation Engine        │
│  - State Filter: Strip private roles from public broadcasts │
└─────────────────────────────────────────────────────────────┘
```

### Data Schema
- **Room**: `{ code, hostId, players: Record<string, Player>, round: number, totalRounds: number, phase: GamePhase, timerEndsAt: number, currentChallenge: Challenge, roundHistory: RoundResult[] }`
- **Player**: `{ id, token, name, avatar, score, isHost, isReady, connected, privateRole, privateObjective, currentSubmission, currentVote }`

---

## 5. Verification & Testing Strategy

1. **Two-Session Realtime Verification**: Test host creation on Session 1, join via Room Code on Session 2, verify synchronized lobby roster and readiness.
2. **Full 5-Round Match Flow**: Run complete rounds through briefing, challenge submission, investigation, and reveal.
3. **Scoring & Role Secrecy Verification**: Verify that player roles remain unrevealed until Phase E, and points calculate accurately according to approved rules (+100 answer, +150 saboteur identify/objective, +50 prediction).
4. **Mobile & Viewport Test**: Ensure single-column responsive layout without horizontal overflow on small screens.
