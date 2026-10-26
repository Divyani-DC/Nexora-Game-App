import { PublicRoomState } from '../types/game.ts';

const SESSION_STORAGE_KEY_TOKEN = 'nexora_player_token';
const SESSION_STORAGE_KEY_ROOM = 'nexora_room_code';
const SESSION_STORAGE_KEY_PLAYER_ID = 'nexora_player_id';
const LOCAL_STORAGE_KEY_AUTH = 'nexora_auth_token';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: number;
}

export const authStore = {
  getAuthToken: (): string | null => localStorage.getItem(LOCAL_STORAGE_KEY_AUTH),
  setAuthToken: (token: string) => localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, token),
  clearAuthToken: () => localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH)
};

export const sessionStore = {
  getToken: (): string | null => sessionStorage.getItem(SESSION_STORAGE_KEY_TOKEN),
  getRoomCode: (): string | null => sessionStorage.getItem(SESSION_STORAGE_KEY_ROOM),
  getPlayerId: (): string | null => sessionStorage.getItem(SESSION_STORAGE_KEY_PLAYER_ID),
  saveSession: (roomCode: string, token: string, playerId: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY_ROOM, roomCode);
    sessionStorage.setItem(SESSION_STORAGE_KEY_TOKEN, token);
    sessionStorage.setItem(SESSION_STORAGE_KEY_PLAYER_ID, playerId);
  },
  clearSession: () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY_ROOM);
    sessionStorage.removeItem(SESSION_STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(SESSION_STORAGE_KEY_PLAYER_ID);
  }
};

export class ApiClient {
  private eventSource: EventSource | null = null;
  private pollInterval: NodeJS.Timeout | null = null;

  // ------------------------------------------------------------------
  // AUTHENTICATION CLIENT METHODS
  // ------------------------------------------------------------------
  public async register(email: string, password: string, displayName: string, avatar: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, avatar })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    authStore.setAuthToken(data.sessionToken);
    return data.user;
  }

  public async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    authStore.setAuthToken(data.sessionToken);
    return data.user;
  }

  public async fetchCurrentUser(): Promise<AuthUser | null> {
    const token = authStore.getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        authStore.clearAuthToken();
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  }

  public async updateProfile(displayName: string, avatar: string): Promise<AuthUser> {
    const token = authStore.getAuthToken();
    if (!token) throw new Error('Not logged in');

    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ displayName, avatar })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Profile update failed');
    }
    return data.user;
  }

  public async forgotPassword(email: string): Promise<string> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }
    return data.message;
  }

  public async logout(): Promise<void> {
    const token = authStore.getAuthToken();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    authStore.clearAuthToken();
  }

  public async createRoom(hostName: string, avatar: string, totalRounds = 5) {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName, avatar, totalRounds })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create room');
    }
    const data = await res.json();
    sessionStore.saveSession(data.roomCode, data.playerToken, data.playerId);
    return data;
  }

  public async joinRoom(roomCode: string, playerName: string, avatar: string) {
    const res = await fetch('/api/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerName, avatar })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to join room');
    }
    const data = await res.json();
    sessionStore.saveSession(roomCode, data.playerToken, data.playerId);
    return data;
  }

  public async reconnect(roomCode: string, token: string): Promise<PublicRoomState> {
    const res = await fetch(`/api/rooms/${roomCode}/reconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Could not reconnect to game');
    }
    const data = await res.json();
    return data.state;
  }

  public async toggleReady(roomCode: string, token: string) {
    const res = await fetch(`/api/rooms/${roomCode}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to toggle ready');
    }
    return res.json();
  }

  public async startMatch(roomCode: string, token: string) {
    const res = await fetch(`/api/rooms/${roomCode}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to start match');
    }
    return res.json();
  }

  public async acknowledgeBriefing(roomCode: string, token: string) {
    const res = await fetch(`/api/rooms/${roomCode}/briefing-ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token })
    });
    return res.json();
  }

  public async submitAnswer(roomCode: string, token: string, submission: string | number) {
    const res = await fetch(`/api/rooms/${roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token, submission })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to submit answer');
    }
    return res.json();
  }

  public async submitVote(roomCode: string, token: string, targetPlayerId: string) {
    const res = await fetch(`/api/rooms/${roomCode}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token, targetPlayerId })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to submit vote');
    }
    return res.json();
  }

  public async rematch(roomCode: string, token: string) {
    const res = await fetch(`/api/rooms/${roomCode}/rematch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken: token })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to trigger rematch');
    }
    return res.json();
  }

  public async leaveRoom(roomCode: string, token: string) {
    try {
      await fetch(`/api/rooms/${roomCode}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken: token })
      });
    } catch {
      // Ignore leave errors
    } finally {
      this.closeStream();
      sessionStore.clearSession();
    }
  }

  public subscribeToRoom(
    roomCode: string,
    token: string,
    onState: (state: PublicRoomState) => void,
    onError?: (err: any) => void
  ) {
    this.closeStream();

    // 1. Initial REST Sync
    fetch(`/api/rooms/${roomCode}/sync?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(state => {
        if (!state.error) onState(state);
      })
      .catch(e => onError?.(e));

    // 2. Real-Time SSE Stream
    try {
      const sse = new EventSource(`/api/rooms/${roomCode}/stream?token=${encodeURIComponent(token)}`);
      this.eventSource = sse;

      sse.onmessage = (event) => {
        try {
          const state: PublicRoomState = JSON.parse(event.data);
          onState(state);
        } catch (e) {
          console.error('[SSE] Failed to parse room event', e);
        }
      };

      sse.onerror = (e) => {
        // SSE error, fall back to fast polling if needed
        console.warn('[SSE] Connection glitch, fallback polling active', e);
      };
    } catch (err) {
      console.warn('[SSE] EventSource init error, using polling', err);
    }

    // 3. Fallback Polling (every 1.5s) to guarantee zero desync even if SSE hiccups
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}/sync?token=${encodeURIComponent(token)}`);
        if (res.ok) {
          const state = await res.json();
          onState(state);
        }
      } catch {
        // quiet polling failure
      }
    }, 1500);
  }

  public closeStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const api = new ApiClient();
