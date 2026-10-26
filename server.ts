import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { gameEngine } from './server/gameEngine.ts';
import { authService } from './server/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ------------------------------------------------------------------
// AUTHENTICATION API ENDPOINTS
// ------------------------------------------------------------------

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, displayName, avatar } = req.body;
    const result = authService.register(email, password, displayName, avatar);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// Get Current User Profile (Session check)
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.replace('Bearer ', '') || (req.query.sessionToken as string);
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session provided' });
    }
    const user = authService.getUserBySession(sessionToken);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Profile
app.all(['/api/auth/profile'], (req: Request, res: Response, next) => {
  if (req.method !== 'POST' && req.method !== 'PATCH') return next();
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { displayName, avatar } = req.body;
    const updated = authService.updateProfile(sessionToken, { displayName, avatar });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = authService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Request failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader?.replace('Bearer ', '');
    if (sessionToken) {
      authService.logout(sessionToken);
    }
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
});

// ------------------------------------------------------------------
// ROOMS & MULTIPLAYER API ENDPOINTS
// ------------------------------------------------------------------

// 1. Create Room
app.post('/api/rooms/create', (req: Request, res: Response) => {
  try {
    const hostName = req.body.hostName || req.body.playerName || 'Club Host';
    const { avatar, totalRounds } = req.body;
    const result = gameEngine.createRoom(hostName, avatar, totalRounds);
    const state = gameEngine.getPublicState(result.roomCode, result.playerToken);
    res.json({ ...result, state });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create room' });
  }
});

// 2. Join Room
app.post('/api/rooms/join', (req: Request, res: Response) => {
  try {
    const { roomCode, playerName, avatar } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }
    const result = gameEngine.joinRoom(roomCode, playerName, avatar);
    const state = gameEngine.getPublicState(roomCode, result.playerToken);
    res.json({ ...result, state });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to join room' });
  }
});

// 3. Reconnect Player
app.post('/api/rooms/:code/reconnect', (req: Request, res: Response) => {
  try {
    const { playerToken } = req.body;
    const { code } = req.params;
    if (!playerToken) {
      return res.status(401).json({ error: 'Player token required' });
    }
    const result = gameEngine.reconnectPlayer(code, playerToken);
    const state = gameEngine.getPublicState(code, playerToken);
    res.json({ playerId: result.playerId, state });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to reconnect' });
  }
});

// 4. Leave Room
app.post('/api/rooms/:code/leave', (req: Request, res: Response) => {
  try {
    const { playerToken } = req.body;
    const { code } = req.params;
    if (playerToken) {
      gameEngine.leaveRoom(code, playerToken);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to leave room' });
  }
});

// 5. Get State (REST Sync)
app.get('/api/rooms/:code/sync', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string | undefined;
    const token = authHeader?.replace('Bearer ', '') || queryToken;

    const state = gameEngine.getPublicState(code, token);
    res.json(state);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Room not found' });
  }
});

// 6. Server-Sent Events (SSE) Stream
app.get('/api/rooms/:code/stream', (req: Request, res: Response) => {
  const { code } = req.params;
  const token = req.query.token as string;

  if (!token) {
    return res.status(401).send('Missing player token');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  gameEngine.registerSSE(code, token, res);
});

// 7. Toggle Ready
app.post('/api/rooms/:code/ready', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken } = req.body;
    const isReady = gameEngine.toggleReady(code, playerToken);
    res.json({ isReady });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Start Match
app.post('/api/rooms/:code/start', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken } = req.body;
    gameEngine.startMatch(code, playerToken);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Acknowledge Briefing (Phase A)
app.post('/api/rooms/:code/briefing-ready', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken } = req.body;
    gameEngine.acknowledgeBriefing(code, playerToken);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 10. Submit Challenge Answer (Phase B & C)
app.post('/api/rooms/:code/submit', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken, submission } = req.body;
    gameEngine.submitAnswer(code, playerToken, submission);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Submit Suspicion Vote (Phase D)
app.post('/api/rooms/:code/vote', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken, targetPlayerId } = req.body;
    gameEngine.submitVote(code, playerToken, targetPlayerId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 12. Rematch (Play Again)
app.post('/api/rooms/:code/rematch', (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerToken } = req.body;
    gameEngine.rematch(code, playerToken);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------------------------------------------------------
// FRONTEND & PWA STATIC ASSETS (Vite in Dev, Dist in Prod)
// ------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXORA] Server listening on port ${PORT}`);
  });
}

startServer();
