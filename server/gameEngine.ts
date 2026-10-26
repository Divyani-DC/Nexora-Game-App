import crypto from 'crypto';
import { Response } from 'express';
import {
  Challenge,
  GamePhase,
  PublicPlayer,
  PublicRoomState,
  PlayerPrivateState,
  Role,
  RoundResult,
  ScoreItem
} from '../src/types/game.ts';
import { CHALLENGE_LIBRARY } from './challenges.ts';

interface InternalPlayer {
  id: string;
  token: string;
  name: string;
  avatar: string;
  score: number;
  challengePoints: number;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
  lastActive: number;
  briefingAcknowledged: boolean;
  hasSubmitted: boolean;
  hasVoted: boolean;
  currentRole: Role;
  privateObjective: string;
  secretInstructions: string;
  submission: string | number | null;
  vote: string | null;
  lastRoundGain?: number;
  lastRoundBreakdown?: ScoreItem[];
}

interface InternalRoom {
  code: string;
  hostId: string;
  phase: GamePhase;
  round: number;
  totalRounds: number;
  timerEndsAt: number | null;
  timerTotalDuration: number;
  currentChallenge: Challenge | null;
  players: Map<string, InternalPlayer>;
  roundResults: RoundResult[];
  latestResult: RoundResult | null;
  winnerIds: string[];
  tiebreakUsed: boolean;
  createdAt: number;
  phaseTimeout: NodeJS.Timeout | null;
  usedChallengeIds: Set<string>;
}

export class GameEngine {
  private rooms: Map<string, InternalRoom> = new Map();
  // Connected SSE client responses: roomCode -> Map<playerToken, Response>
  private sseClients: Map<string, Map<string, Response>> = new Map();

  constructor() {
    // Background interval to clean up stale rooms older than 2 hours
    setInterval(() => this.cleanupStaleRooms(), 10 * 60 * 1000);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullCode = `NX-${code}`;
    return this.rooms.has(fullCode) ? this.generateRoomCode() : fullCode;
  }

  // -------------------------------------------------------------
  // ROOM CREATION & JOINING
  // -------------------------------------------------------------
  public createRoom(hostName: string, avatar: string, totalRounds = 5): { roomCode: string; playerToken: string; playerId: string } {
    const roomCode = this.generateRoomCode();
    const playerId = `p_${crypto.randomBytes(6).toString('hex')}`;
    const playerToken = crypto.randomUUID();

    const hostPlayer: InternalPlayer = {
      id: playerId,
      token: playerToken,
      name: hostName.trim().slice(0, 16) || 'Agent 1',
      avatar: avatar || 'avatar-1',
      score: 0,
      challengePoints: 0,
      isHost: true,
      isReady: true,
      connected: true,
      lastActive: Date.now(),
      briefingAcknowledged: false,
      hasSubmitted: false,
      hasVoted: false,
      currentRole: 'SIGNAL_AGENT',
      privateObjective: '',
      secretInstructions: '',
      submission: null,
      vote: null
    };

    const room: InternalRoom = {
      code: roomCode,
      hostId: playerId,
      phase: 'LOBBY',
      round: 0,
      totalRounds: Math.min(Math.max(totalRounds, 3), 8),
      timerEndsAt: null,
      timerTotalDuration: 0,
      currentChallenge: null,
      players: new Map([[playerId, hostPlayer]]),
      roundResults: [],
      latestResult: null,
      winnerIds: [],
      tiebreakUsed: false,
      createdAt: Date.now(),
      phaseTimeout: null,
      usedChallengeIds: new Set()
    };

    this.rooms.set(roomCode, room);
    return { roomCode, playerToken, playerId };
  }

  public joinRoom(roomCode: string, playerName: string, avatar: string): { playerToken: string; playerId: string } {
    const normalizedCode = roomCode.trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      throw new Error('Room not found. Check the code and try again.');
    }

    if (room.players.size >= 8) {
      throw new Error('Room is at maximum capacity (8 players).');
    }

    if (room.phase !== 'LOBBY') {
      throw new Error('Game already in progress in this room.');
    }

    const playerId = `p_${crypto.randomBytes(6).toString('hex')}`;
    const playerToken = crypto.randomUUID();

    const newPlayer: InternalPlayer = {
      id: playerId,
      token: playerToken,
      name: playerName.trim().slice(0, 16) || `Agent ${room.players.size + 1}`,
      avatar: avatar || `avatar-${(room.players.size % 8) + 1}`,
      score: 0,
      challengePoints: 0,
      isHost: false,
      isReady: false,
      connected: true,
      lastActive: Date.now(),
      briefingAcknowledged: false,
      hasSubmitted: false,
      hasVoted: false,
      currentRole: 'SIGNAL_AGENT',
      privateObjective: '',
      secretInstructions: '',
      submission: null,
      vote: null
    };

    room.players.set(playerId, newPlayer);
    this.broadcastRoom(normalizedCode);

    return { playerToken, playerId };
  }

  public reconnectPlayer(roomCode: string, playerToken: string): { playerId: string; player: InternalPlayer } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room no longer active.');

    let matchedPlayer: InternalPlayer | null = null;
    for (const player of room.players.values()) {
      if (player.token === playerToken) {
        matchedPlayer = player;
        break;
      }
    }

    if (!matchedPlayer) throw new Error('Player credentials expired or invalid.');

    matchedPlayer.connected = true;
    matchedPlayer.lastActive = Date.now();
    this.broadcastRoom(room.code);

    return { playerId: matchedPlayer.id, player: matchedPlayer };
  }

  public leaveRoom(roomCode: string, playerToken: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return;

    let targetPlayerId: string | null = null;
    for (const [id, player] of room.players.entries()) {
      if (player.token === playerToken) {
        targetPlayerId = id;
        break;
      }
    }

    if (!targetPlayerId) return;

    const wasHost = room.players.get(targetPlayerId)?.isHost;
    room.players.delete(targetPlayerId);

    // If room is empty, clear timeout and delete
    if (room.players.size === 0) {
      if (room.phaseTimeout) clearTimeout(room.phaseTimeout);
      this.rooms.delete(room.code);
      return;
    }

    // If host left, reassign host to the first connected player
    if (wasHost) {
      const nextHost = Array.from(room.players.values()).find(p => p.connected) || Array.from(room.players.values())[0];
      if (nextHost) {
        nextHost.isHost = true;
        room.hostId = nextHost.id;
      }
    }

    this.broadcastRoom(room.code);
  }

  // -------------------------------------------------------------
  // LOBBY CONTROLS
  // -------------------------------------------------------------
  public toggleReady(roomCode: string, playerToken: string): boolean {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room not found');

    const player = this.getPlayerByToken(room, playerToken);
    if (!player) throw new Error('Unauthorized');

    player.isReady = !player.isReady;
    this.broadcastRoom(room.code);
    return player.isReady;
  }

  public startMatch(roomCode: string, playerToken: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room not found');

    const player = this.getPlayerByToken(room, playerToken);
    if (!player || !player.isHost) throw new Error('Only the host can initiate the match.');

    if (room.players.size < 2) {
      throw new Error('At least 2 players are required to start a match.');
    }

    // Reset scores & standings
    for (const p of room.players.values()) {
      p.score = 0;
      p.challengePoints = 0;
    }
    room.round = 0;
    room.roundResults = [];
    room.winnerIds = [];
    room.tiebreakUsed = false;
    room.usedChallengeIds.clear();

    this.nextRound(room);
  }

  // -------------------------------------------------------------
  // GAME ROUND & PHASE PROGRESSION (SERVER-AUTHORITATIVE)
  // -------------------------------------------------------------
  private nextRound(room: InternalRoom): void {
    if (room.phaseTimeout) {
      clearTimeout(room.phaseTimeout);
      room.phaseTimeout = null;
    }

    room.round += 1;

    if (room.round > room.totalRounds) {
      this.finishMatch(room);
      return;
    }

    // Pick a new challenge not yet used
    const availableChallenges = CHALLENGE_LIBRARY.filter(c => !room.usedChallengeIds.has(c.id));
    const challengePool = availableChallenges.length > 0 ? availableChallenges : CHALLENGE_LIBRARY;
    const challenge = challengePool[Math.floor(Math.random() * challengePool.length)];
    room.usedChallengeIds.add(challenge.id);
    room.currentChallenge = challenge;

    // Reset player round states
    for (const p of room.players.values()) {
      p.briefingAcknowledged = false;
      p.hasSubmitted = false;
      p.hasVoted = false;
      p.submission = null;
      p.vote = null;
      p.lastRoundGain = 0;
      p.lastRoundBreakdown = [];
    }

    // Assign roles & secret objectives
    const playerArray = Array.from(room.players.values());
    const isDuel = playerArray.length === 2;

    if (isDuel) {
      // 2 Players Duel Mode
      playerArray[0].currentRole = 'DUELIST_ALPHA';
      playerArray[0].privateObjective = challenge.duelGoalAlpha || 'Out-perform your rival in this round.';
      playerArray[0].secretInstructions = 'Duel Mode: Identify the pattern and predict your rival\'s selection to win this head-to-head clash.';

      playerArray[1].currentRole = 'DUELIST_OMEGA';
      playerArray[1].privateObjective = challenge.duelGoalOmega || 'Out-perform your rival in this round.';
      playerArray[1].secretInstructions = 'Duel Mode: Identify the pattern and predict your rival\'s selection to win this head-to-head clash.';
    } else {
      // 3 to 8 Players Saboteur Mode
      const saboteurIndex = Math.floor(Math.random() * playerArray.length);
      playerArray.forEach((p, idx) => {
        if (idx === saboteurIndex) {
          p.currentRole = 'SABOTEUR';
          p.privateObjective = challenge.saboteurSecretGoal;
          p.secretInstructions = 'You are the SABOTEUR. Blend in with the Signal Agents while subtly guiding the team toward deceptive or split choices.';
        } else {
          p.currentRole = 'SIGNAL_AGENT';
          p.privateObjective = challenge.agentGoal;
          p.secretInstructions = 'You are a SIGNAL AGENT. Solve the challenge accurately and watch closely for anyone attempting to sabotage the group consensus.';
        }
      });
    }

    // Start Phase A: SECRET BRIEFING (10s)
    room.phase = 'BRIEFING';
    const duration = 10;
    room.timerTotalDuration = duration;
    room.timerEndsAt = Date.now() + duration * 1000;

    room.phaseTimeout = setTimeout(() => {
      this.transitionToChallenge(room);
    }, duration * 1000);

    this.broadcastRoom(room.code);
  }

  public acknowledgeBriefing(roomCode: string, playerToken: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'BRIEFING') return;

    const player = this.getPlayerByToken(room, playerToken);
    if (!player) return;

    player.briefingAcknowledged = true;

    // If all players acknowledged, transition immediately without waiting
    const allAcknowledged = Array.from(room.players.values()).every(p => p.briefingAcknowledged || !p.connected);
    if (allAcknowledged) {
      if (room.phaseTimeout) clearTimeout(room.phaseTimeout);
      this.transitionToChallenge(room);
    } else {
      this.broadcastRoom(room.code);
    }
  }

  private transitionToChallenge(room: InternalRoom): void {
    if (room.phaseTimeout) {
      clearTimeout(room.phaseTimeout);
      room.phaseTimeout = null;
    }

    room.phase = 'CHALLENGE';
    const duration = room.currentChallenge?.timeLimitSeconds || 25;
    room.timerTotalDuration = duration;
    room.timerEndsAt = Date.now() + duration * 1000;

    room.phaseTimeout = setTimeout(() => {
      this.transitionToInvestigation(room);
    }, duration * 1000);

    this.broadcastRoom(room.code);
  }

  public submitAnswer(roomCode: string, playerToken: string, submission: string | number): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'CHALLENGE') {
      throw new Error('Not currently accepting challenge submissions.');
    }

    const player = this.getPlayerByToken(room, playerToken);
    if (!player) throw new Error('Unauthorized');

    if (player.hasSubmitted) {
      throw new Error('Submission is already locked for this round.');
    }

    player.submission = submission;
    player.hasSubmitted = true;

    // Check if all connected players submitted
    const allSubmitted = Array.from(room.players.values()).every(p => p.hasSubmitted || !p.connected);
    if (allSubmitted) {
      if (room.phaseTimeout) clearTimeout(room.phaseTimeout);
      this.transitionToInvestigation(room);
    } else {
      this.broadcastRoom(room.code);
    }
  }

  private transitionToInvestigation(room: InternalRoom): void {
    if (room.phaseTimeout) {
      clearTimeout(room.phaseTimeout);
      room.phaseTimeout = null;
    }

    room.phase = 'INVESTIGATION';
    const duration = 20; // 20s to review clues and vote
    room.timerTotalDuration = duration;
    room.timerEndsAt = Date.now() + duration * 1000;

    room.phaseTimeout = setTimeout(() => {
      this.transitionToReveal(room);
    }, duration * 1000);

    this.broadcastRoom(room.code);
  }

  public submitVote(roomCode: string, playerToken: string, targetPlayerId: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.phase !== 'INVESTIGATION') {
      throw new Error('Not currently accepting suspicion votes.');
    }

    const player = this.getPlayerByToken(room, playerToken);
    if (!player) throw new Error('Unauthorized');

    if (player.hasVoted) {
      throw new Error('Suspicion vote has already been submitted.');
    }

    // In Saboteur mode, cannot vote for oneself
    if (room.players.size > 2 && targetPlayerId === player.id) {
      throw new Error('Cannot vote for yourself as the Saboteur.');
    }

    if (!room.players.has(targetPlayerId)) {
      throw new Error('Invalid vote target.');
    }

    player.vote = targetPlayerId;
    player.hasVoted = true;

    // Check if all active players voted
    const allVoted = Array.from(room.players.values()).every(p => p.hasVoted || !p.connected);
    if (allVoted) {
      if (room.phaseTimeout) clearTimeout(room.phaseTimeout);
      this.transitionToReveal(room);
    } else {
      this.broadcastRoom(room.code);
    }
  }

  // -------------------------------------------------------------
  // PHASE E: AUTHORITATIVE REVEAL & SCORING
  // -------------------------------------------------------------
  private transitionToReveal(room: InternalRoom): void {
    if (room.phaseTimeout) {
      clearTimeout(room.phaseTimeout);
      room.phaseTimeout = null;
    }

    room.phase = 'REVEAL';
    const challenge = room.currentChallenge!;
    const isDuel = room.players.size === 2;

    const scoresGained: Record<string, number> = {};
    const scoreBreakdowns: Record<string, ScoreItem[]> = {};

    let saboteur: InternalPlayer | null = null;
    for (const p of room.players.values()) {
      if (p.currentRole === 'SABOTEUR') {
        saboteur = p;
        break;
      }
    }

    // 1. Tally Challenge Answers
    let agentsCorrectCount = 0;
    let agentsTotalCount = 0;

    for (const p of room.players.values()) {
      scoreBreakdowns[p.id] = [];
      let roundTotal = 0;

      const isCorrect = String(p.submission).trim().toLowerCase() === String(challenge.correctAnswer).trim().toLowerCase();

      if (isDuel) {
        // Duel Scoring
        if (isCorrect) {
          const pts = 100;
          roundTotal += pts;
          p.challengePoints += pts;
          scoreBreakdowns[p.id].push({ reason: 'Challenge Solved', points: pts });
        }
      } else {
        // Saboteur Mode
        if (p.currentRole === 'SIGNAL_AGENT') {
          agentsTotalCount++;
          if (isCorrect) {
            agentsCorrectCount++;
            const pts = 100;
            roundTotal += pts;
            p.challengePoints += pts;
            scoreBreakdowns[p.id].push({ reason: 'Accurate Challenge Solution', points: pts });
          }
        }
      }

      scoresGained[p.id] = roundTotal;
    }

    // 2. Tally Votes & Saboteur Objectives
    let saboteurSuccess = false;

    if (!isDuel && saboteur) {
      // How many agents voted for the saboteur?
      let correctVotesForSaboteur = 0;
      for (const p of room.players.values()) {
        if (p.currentRole === 'SIGNAL_AGENT' && p.vote === saboteur.id) {
          correctVotesForSaboteur++;
          const pts = 150;
          scoresGained[p.id] = (scoresGained[p.id] || 0) + pts;
          scoreBreakdowns[p.id].push({ reason: 'Identified the Saboteur', points: pts });
        }
      }

      // Saboteur deception check:
      // If fewer than half of the voting agents identified the saboteur, Saboteur misled the group!
      const totalVotingAgents = Array.from(room.players.values()).filter(p => p.currentRole === 'SIGNAL_AGENT').length;
      const majorityCaught = totalVotingAgents > 0 && correctVotesForSaboteur > totalVotingAgents / 2;

      if (!majorityCaught) {
        saboteurSuccess = true;
        const deceptionBonus = 150;
        scoresGained[saboteur.id] = (scoresGained[saboteur.id] || 0) + deceptionBonus;
        scoreBreakdowns[saboteur.id].push({ reason: 'Covert Sabotage Objective Fulfilled', points: deceptionBonus });

        // Extra points if majority of agents failed the challenge
        if (agentsTotalCount > 0 && agentsCorrectCount < agentsTotalCount / 2) {
          const misleadBonus = 100;
          scoresGained[saboteur.id] = (scoresGained[saboteur.id] || 0) + misleadBonus;
          scoreBreakdowns[saboteur.id].push({ reason: 'Misled Majority on Challenge Answer', points: misleadBonus });
        }
      }
    } else if (isDuel) {
      // Duel vote: did you predict your opponent's move or choice?
      const players = Array.from(room.players.values());
      const p1 = players[0];
      const p2 = players[1];

      // Duelist prediction / counter-play bonus
      if (p1 && p2) {
        if (p1.vote && p1.vote === p2.id) {
          scoresGained[p1.id] = (scoresGained[p1.id] || 0) + 50;
          scoreBreakdowns[p1.id].push({ reason: 'Duel Counter-Move Predicted', points: 50 });
        }
        if (p2.vote && p2.vote === p1.id) {
          scoresGained[p2.id] = (scoresGained[p2.id] || 0) + 50;
          scoreBreakdowns[p2.id].push({ reason: 'Duel Counter-Move Predicted', points: 50 });
        }
      }
    }

    // Apply scores to cumulative player state
    for (const [playerId, gain] of Object.entries(scoresGained)) {
      const p = room.players.get(playerId);
      if (p) {
        p.score += gain;
        p.lastRoundGain = gain;
        p.lastRoundBreakdown = scoreBreakdowns[playerId];
      }
    }

    // Build RoundResult record
    const result: RoundResult = {
      roundNumber: room.round,
      category: challenge.category,
      categoryName: challenge.categoryName,
      challengeTitle: challenge.title,
      correctAnswer: challenge.correctAnswer || '',
      explanation: challenge.explanation || '',
      saboteurId: saboteur?.id,
      saboteurSuccess,
      isDuel,
      playerSubmissions: Array.from(room.players.values()).map(p => ({
        playerId: p.id,
        playerName: p.name,
        avatar: p.avatar,
        submission: p.submission ?? 'No response'
      })),
      votes: Array.from(room.players.values())
        .filter(p => p.vote)
        .map(p => ({ voterId: p.id, targetPlayerId: p.vote! })),
      scoresGained,
      scoreBreakdowns
    };

    room.latestResult = result;
    room.roundResults.push(result);

    // Phase E duration: 12 seconds before transitioning to next round
    const duration = 12;
    room.timerTotalDuration = duration;
    room.timerEndsAt = Date.now() + duration * 1000;

    room.phaseTimeout = setTimeout(() => {
      this.nextRound(room);
    }, duration * 1000);

    this.broadcastRoom(room.code);
  }

  // -------------------------------------------------------------
  // MATCH COMPLETION & WINNER CALCULATION
  // -------------------------------------------------------------
  private finishMatch(room: InternalRoom): void {
    if (room.phaseTimeout) {
      clearTimeout(room.phaseTimeout);
      room.phaseTimeout = null;
    }

    room.phase = 'MATCH_OVER';
    room.timerEndsAt = null;

    const sortedPlayers = Array.from(room.players.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker 1: Challenge points earned from puzzles
      return b.challengePoints - a.challengePoints;
    });

    if (sortedPlayers.length > 0) {
      const topScore = sortedPlayers[0].score;
      const topChallengePts = sortedPlayers[0].challengePoints;

      // Check if tiebreaker was needed
      const sameScorePlayers = sortedPlayers.filter(p => p.score === topScore);
      if (sameScorePlayers.length > 1) {
        room.tiebreakUsed = true;
        const strictlyWinning = sameScorePlayers.filter(p => p.challengePoints === topChallengePts);
        room.winnerIds = strictlyWinning.map(p => p.id);
      } else {
        room.winnerIds = [sortedPlayers[0].id];
        room.tiebreakUsed = false;
      }
    }

    this.broadcastRoom(room.code);
  }

  public rematch(roomCode: string, playerToken: string): void {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room not found');

    const player = this.getPlayerByToken(room, playerToken);
    if (!player || !player.isHost) throw new Error('Only the host can initiate a rematch.');

    room.phase = 'LOBBY';
    room.round = 0;
    room.roundResults = [];
    room.latestResult = null;
    room.winnerIds = [];
    room.tiebreakUsed = false;
    room.usedChallengeIds.clear();

    for (const p of room.players.values()) {
      p.score = 0;
      p.challengePoints = 0;
      p.isReady = p.isHost;
      p.briefingAcknowledged = false;
      p.hasSubmitted = false;
      p.hasVoted = false;
      p.submission = null;
      p.vote = null;
    }

    this.broadcastRoom(room.code);
  }

  // -------------------------------------------------------------
  // PUBLIC STATE SANITIZATION (ZERO LEAKAGE OF PRIVATE DATA)
  // -------------------------------------------------------------
  public getPublicState(roomCode: string, playerToken?: string): PublicRoomState {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) throw new Error('Room not found');

    const publicPlayers: Record<string, PublicPlayer> = {};

    for (const p of room.players.values()) {
      publicPlayers[p.id] = {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        challengePoints: p.challengePoints,
        isHost: p.isHost,
        isReady: p.isReady,
        connected: p.connected,
        briefingAcknowledged: p.briefingAcknowledged,
        hasSubmitted: p.hasSubmitted,
        hasVoted: p.hasVoted,
        // Only reveal roles during REVEAL or MATCH_OVER
        revealedRole: (room.phase === 'REVEAL' || room.phase === 'MATCH_OVER') ? p.currentRole : undefined,
        lastRoundGain: p.lastRoundGain,
        lastRoundBreakdown: p.lastRoundBreakdown
      };
    }

    // Strip answer from challenge unless in REVEAL or MATCH_OVER
    let currentChallenge: PublicRoomState['currentChallenge'] = null;
    if (room.currentChallenge) {
      const { correctAnswer, explanation, ...publicChallenge } = room.currentChallenge;
      currentChallenge = (room.phase === 'REVEAL' || room.phase === 'MATCH_OVER')
        ? room.currentChallenge
        : publicChallenge;
    }

    let myPlayer: PublicPlayer | undefined;
    let myPrivateState: PlayerPrivateState | undefined;
    let mySubmission: any = undefined;
    let myVote: string | undefined = undefined;

    if (playerToken) {
      const internalPlayer = this.getPlayerByToken(room, playerToken);
      if (internalPlayer) {
        myPlayer = publicPlayers[internalPlayer.id];
        mySubmission = internalPlayer.submission;
        myVote = internalPlayer.vote ?? undefined;

        // Private briefing state
        let roleTitle = 'Signal Agent';
        if (internalPlayer.currentRole === 'SABOTEUR') roleTitle = 'The Saboteur';
        else if (internalPlayer.currentRole === 'DUELIST_ALPHA') roleTitle = 'Duelist Alpha';
        else if (internalPlayer.currentRole === 'DUELIST_OMEGA') roleTitle = 'Duelist Omega';

        myPrivateState = {
          role: internalPlayer.currentRole,
          roleTitle,
          objective: internalPlayer.privateObjective,
          secretInstructions: internalPlayer.secretInstructions
        };
      }
    }

    return {
      code: room.code,
      hostId: room.hostId,
      phase: room.phase,
      round: room.round,
      totalRounds: room.totalRounds,
      timerEndsAt: room.timerEndsAt,
      timerTotalDuration: room.timerTotalDuration,
      players: publicPlayers,
      playerCount: room.players.size,
      currentChallenge,
      roundResults: room.roundResults,
      latestResult: room.latestResult,
      winnerIds: room.winnerIds,
      tiebreakUsed: room.tiebreakUsed,
      isDuelMode: room.players.size === 2,
      myPlayer,
      myPrivateState,
      mySubmission,
      myVote
    };
  }

  // -------------------------------------------------------------
  // REAL-TIME SERVER-SENT EVENTS (SSE) STREAMING
  // -------------------------------------------------------------
  public registerSSE(roomCode: string, playerToken: string, res: Response): void {
    const code = roomCode.toUpperCase();
    if (!this.sseClients.has(code)) {
      this.sseClients.set(code, new Map());
    }

    const roomClients = this.sseClients.get(code)!;
    roomClients.set(playerToken, res);

    // Initial state push
    try {
      const state = this.getPublicState(code, playerToken);
      res.write(`data: ${JSON.stringify(state)}\n\n`);
    } catch {
      // Ignore if state can't be fetched yet
    }

    res.on('close', () => {
      roomClients.delete(playerToken);
      if (roomClients.size === 0) {
        this.sseClients.delete(code);
      }
    });
  }

  public broadcastRoom(roomCode: string): void {
    const code = roomCode.toUpperCase();
    const roomClients = this.sseClients.get(code);
    if (!roomClients) return;

    for (const [token, res] of roomClients.entries()) {
      try {
        const playerState = this.getPublicState(code, token);
        res.write(`data: ${JSON.stringify(playerState)}\n\n`);
      } catch (err) {
        // Handle failed write silently
      }
    }
  }

  // -------------------------------------------------------------
  // HELPER UTILITIES
  // -------------------------------------------------------------
  private getPlayerByToken(room: InternalRoom, token: string): InternalPlayer | null {
    for (const player of room.players.values()) {
      if (player.token === token) return player;
    }
    return null;
  }

  private cleanupStaleRooms(): void {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [code, room] of this.rooms.entries()) {
      if (room.createdAt < twoHoursAgo && room.players.size === 0) {
        if (room.phaseTimeout) clearTimeout(room.phaseTimeout);
        this.rooms.delete(code);
        this.sseClients.delete(code);
      }
    }
  }
}

export const gameEngine = new GameEngine();
