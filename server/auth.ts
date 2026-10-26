import crypto from 'crypto';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: number;
}

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

export class AuthService {
  private users: Map<string, StoredUser> = new Map(); // email (lowercase) -> user
  private sessions: Map<string, string> = new Map(); // sessionToken -> userId
  private resetTokens: Map<string, string> = new Map(); // email -> resetToken

  constructor() {
    // Seed a friendly demo account for quick testing if needed
    this.register('chaos@nexora.club', 'Password123!', 'ChaosCaptain', 'avatar-1');
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  public register(
    email: string,
    password: string,
    displayName: string,
    avatar: string
  ): { user: UserProfile; sessionToken: string } {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;

    const user: StoredUser = {
      id: userId,
      email: normalizedEmail,
      displayName: displayName.trim().slice(0, 20) || 'Club Member',
      avatar: avatar || 'avatar-1',
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: Date.now(),
      salt,
      passwordHash
    };

    this.users.set(normalizedEmail, user);

    const sessionToken = crypto.randomUUID();
    this.sessions.set(sessionToken, userId);

    return {
      user: this.sanitizeUser(user),
      sessionToken
    };
  }

  public login(email: string, password: string): { user: UserProfile; sessionToken: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const hash = this.hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const sessionToken = crypto.randomUUID();
    this.sessions.set(sessionToken, user.id);

    return {
      user: this.sanitizeUser(user),
      sessionToken
    };
  }

  public getUserBySession(sessionToken: string): UserProfile | null {
    const userId = this.sessions.get(sessionToken);
    if (!userId) return null;

    for (const user of this.users.values()) {
      if (user.id === userId) {
        return this.sanitizeUser(user);
      }
    }
    return null;
  }

  public updateProfile(
    sessionToken: string,
    updates: { displayName?: string; avatar?: string }
  ): UserProfile {
    const userId = this.sessions.get(sessionToken);
    if (!userId) throw new Error('Unauthorized');

    let matchedUser: StoredUser | null = null;
    for (const user of this.users.values()) {
      if (user.id === userId) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) throw new Error('User not found');

    if (updates.displayName) {
      matchedUser.displayName = updates.displayName.trim().slice(0, 20);
    }
    if (updates.avatar) {
      matchedUser.avatar = updates.avatar;
    }

    return this.sanitizeUser(matchedUser);
  }

  public forgotPassword(email: string): { message: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      // Don't leak whether user exists
      return { message: 'If an account matches this email, a reset link has been dispatched!' };
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetTokens.set(normalizedEmail, resetToken);

    return {
      message: `Password reset dispatched to ${normalizedEmail}! (Demo mode: Use temporary reset token '${resetToken}')`
    };
  }

  public logout(sessionToken: string): void {
    this.sessions.delete(sessionToken);
  }

  public recordGameResult(userId: string, won: boolean): void {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        user.gamesPlayed++;
        if (won) user.gamesWon++;
        break;
      }
    }
  }

  private sanitizeUser(user: StoredUser): UserProfile {
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
