export type GamePhase =
  | 'LOBBY'
  | 'BRIEFING'       // Phase A: Secret Briefing
  | 'CHALLENGE'      // Phase B & C: Challenge & Submission
  | 'INVESTIGATION'  // Phase D: Clues & Suspicion Voting
  | 'REVEAL'         // Phase E: Reveal & Scoring
  | 'MATCH_OVER';    // Final Results & Winner Podium

export type Role = 'SIGNAL_AGENT' | 'SABOTEUR' | 'DUELIST_ALPHA' | 'DUELIST_OMEGA';

export type ChallengeCategory =
  | 'LOGIC_PULSE'
  | 'QUICK_SIGNAL'
  | 'BLUFF_MATRIX'
  | 'MEMORY_ECHO'
  | 'PREDICTION_GRID'
  | 'SECRET_SIGNAL';

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  categoryName: string;
  title: string;
  prompt: string;
  description?: string;
  options?: string[];
  type: 'MULTIPLE_CHOICE' | 'NUMBER_INPUT' | 'PREDICTION' | 'SEQUENCE_REMEMBER';
  timeLimitSeconds: number;
  memorySequence?: string[];
  // Secret/Role guidance
  saboteurSecretGoal: string;
  agentGoal: string;
  duelGoalAlpha?: string;
  duelGoalOmega?: string;
  // Answer data (only sent to client during REVEAL phase)
  correctAnswer?: string | number;
  explanation?: string;
}

export interface ScoreItem {
  reason: string;
  points: number;
}

export interface PublicPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  challengePoints: number; // for tiebreakers
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
  briefingAcknowledged: boolean;
  hasSubmitted: boolean;
  hasVoted: boolean;
  // Only revealed in REVEAL phase or MATCH_OVER
  revealedRole?: Role;
  lastRoundGain?: number;
  lastRoundBreakdown?: ScoreItem[];
}

export interface PlayerPrivateState {
  role: Role;
  roleTitle: string;
  objective: string;
  secretInstructions: string;
}

export interface PublicSubmission {
  playerId: string;
  playerName: string;
  avatar: string;
  submission: string | number;
}

export interface PublicVote {
  voterId: string;
  targetPlayerId: string;
}

export interface RoundResult {
  roundNumber: number;
  category: ChallengeCategory;
  categoryName: string;
  challengeTitle: string;
  correctAnswer: string | number;
  explanation: string;
  saboteurId?: string;
  saboteurSuccess?: boolean;
  isDuel: boolean;
  playerSubmissions: PublicSubmission[];
  votes: PublicVote[];
  scoresGained: Record<string, number>;
  scoreBreakdowns: Record<string, ScoreItem[]>;
}

export interface PublicRoomState {
  code: string;
  hostId: string;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  timerEndsAt: number | null;
  timerTotalDuration: number;
  players: Record<string, PublicPlayer>;
  playerCount: number;
  currentChallenge: Omit<Challenge, 'correctAnswer' | 'explanation'> | null;
  roundResults: RoundResult[];
  latestResult: RoundResult | null;
  winnerIds: string[];
  tiebreakUsed: boolean;
  isDuelMode: boolean;
  // Submissions visible during investigation (anonymized or with clues)
  publicEvidence?: {
    submissionsSummary?: Record<string, number>;
    revealedClues?: string[];
  };
  // Private player state provided only if authenticated
  myPlayer?: PublicPlayer;
  myPrivateState?: PlayerPrivateState;
  mySubmission?: any;
  myVote?: string;
}
