import { useEffect, useState } from 'react';
import { PublicRoomState } from './types/game.ts';
import { api, sessionStore, AuthUser } from './services/api.ts';
import { AnimatedEnvironment, EnvironmentType } from './components/AnimatedEnvironment.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { LaunchScreen } from './components/LaunchScreen.tsx';
import { InstallWelcomeModal } from './components/InstallWelcomeModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { WelcomeScreen } from './screens/WelcomeScreen.tsx';
import { CreateRoomScreen } from './screens/CreateRoomScreen.tsx';
import { JoinRoomScreen } from './screens/JoinRoomScreen.tsx';
import { LobbyScreen } from './screens/LobbyScreen.tsx';
import { BriefingScreen } from './screens/BriefingScreen.tsx';
import { ChallengeScreen } from './screens/ChallengeScreen.tsx';
import { InvestigationScreen } from './screens/InvestigationScreen.tsx';
import { RevealScreen } from './screens/RevealScreen.tsx';
import { FinalResultsScreen } from './screens/FinalResultsScreen.tsx';
import { Mascot } from './components/ChaosCrew.tsx';
import { sound } from './services/audio.ts';

type NavView = 'WELCOME' | 'CREATE_ROOM' | 'JOIN_ROOM';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('WELCOME');
  const [roomState, setRoomState] = useState<PublicRoomState | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Load authenticated user and check URL invite parameters / auto-reconnect
  useEffect(() => {
    // 1. Check logged in user
    api
      .fetchCurrentUser()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .catch(() => {});

    // 2. URL invite param
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setInitialJoinCode(joinCode.toUpperCase());
      setCurrentView('JOIN_ROOM');
      return;
    }

    // 3. Auto-reconnect to room session if available
    const savedRoom = sessionStore.getRoomCode();
    const savedToken = sessionStore.getToken();

    if (savedRoom && savedToken) {
      setIsReconnecting(true);
      api
        .reconnect(savedRoom, savedToken)
        .then((state) => {
          setRoomState(state);
          api.subscribeToRoom(savedRoom, savedToken, (s) => setRoomState(s));
        })
        .catch(() => {
          sessionStore.clearSession();
        })
        .finally(() => {
          setIsReconnecting(false);
        });
    }
  }, []);

  // Compute active animated living world environment
  const getActiveEnvironment = (): EnvironmentType => {
    if (!roomState) {
      if (currentView === 'WELCOME') return 'CANDY_CLOUD_KINGDOM';
      return 'CHAOS_PLAYGROUND';
    }

    switch (roomState.phase) {
      case 'LOBBY':
        return 'CHAOS_PLAYGROUND';
      case 'BRIEFING':
      case 'CHALLENGE':
        return 'BRAIN_BLAST_ARENA';
      case 'INVESTIGATION':
        return 'MYSTERY_GARDEN';
      case 'REVEAL':
      case 'MATCH_OVER':
        return 'VICTORY_WONDERLAND';
      default:
        return 'CHAOS_PLAYGROUND';
    }
  };

  // Room Actions
  const handleCreateRoom = async (hostName: string, avatar: string, totalRounds: number) => {
    const data = await api.createRoom(hostName, avatar, totalRounds);
    setRoomState(data.state);
    api.subscribeToRoom(data.roomCode, data.playerToken, (s) => setRoomState(s));
  };

  const handleJoinRoom = async (code: string, playerName: string, avatar: string) => {
    const data = await api.joinRoom(code, playerName, avatar);
    setRoomState(data.state);
    api.subscribeToRoom(code, data.playerToken, (s) => setRoomState(s));
  };

  const handleLeaveRoom = async () => {
    const code = roomState?.code || sessionStore.getRoomCode();
    const token = sessionStore.getToken();
    if (code && token) {
      await api.leaveRoom(code, token);
    }
    setRoomState(null);
    setCurrentView('WELCOME');
  };

  const handleToggleReady = async () => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.toggleReady(code, token);
    }
  };

  const handleStartMatch = async () => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.startMatch(code, token);
    }
  };

  const handleAcknowledgeBriefing = async () => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.acknowledgeBriefing(code, token);
    }
  };

  const handleSubmitAnswer = async (submission: string | number) => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.submitAnswer(code, token, submission);
    }
  };

  const handleSubmitVote = async (targetPlayerId: string) => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.submitVote(code, token, targetPlayerId);
    }
  };

  const handleRematch = async () => {
    const code = roomState?.code;
    const token = sessionStore.getToken();
    if (code && token) {
      await api.rematch(code, token);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setShowProfileModal(false);
  };

  // Render current stage
  const renderContent = () => {
    if (isReconnecting) {
      return (
        <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
          <div className="toy-card-yellow p-8 text-center space-y-4 max-w-sm">
            <Mascot character="zap" expression="excited" size="md" animate={true} className="mx-auto" />
            <h3 className="font-bubble text-xl font-black text-[#302044]">
              Reconnecting to Clubhouse...
            </h3>
            <p className="text-xs font-bold text-[#756A84]">
              Holding your spot in the arena!
            </p>
          </div>
        </div>
      );
    }

    // Inside an active Room
    if (roomState) {
      switch (roomState.phase) {
        case 'LOBBY':
          return (
            <LobbyScreen
              roomState={roomState}
              onToggleReady={handleToggleReady}
              onStartMatch={handleStartMatch}
              onLeaveRoom={handleLeaveRoom}
            />
          );
        case 'BRIEFING':
          return (
            <BriefingScreen
              roomState={roomState}
              onAcknowledge={handleAcknowledgeBriefing}
            />
          );
        case 'CHALLENGE':
          return (
            <ChallengeScreen
              roomState={roomState}
              onSubmitAnswer={handleSubmitAnswer}
            />
          );
        case 'INVESTIGATION':
          return (
            <InvestigationScreen
              roomState={roomState}
              onSubmitVote={handleSubmitVote}
            />
          );
        case 'REVEAL':
          return <RevealScreen roomState={roomState} />;
        case 'MATCH_OVER':
          return (
            <FinalResultsScreen
              roomState={roomState}
              onRematch={handleRematch}
              onHome={handleLeaveRoom}
            />
          );
        default:
          return null;
      }
    }

    // Outside Room (Landing & Nav)
    switch (currentView) {
      case 'CREATE_ROOM':
        return (
          <CreateRoomScreen
            currentUser={currentUser}
            onBack={() => setCurrentView('WELCOME')}
            onSubmit={handleCreateRoom}
          />
        );
      case 'JOIN_ROOM':
        return (
          <JoinRoomScreen
            currentUser={currentUser}
            initialCode={initialJoinCode}
            onBack={() => setCurrentView('WELCOME')}
            onSubmit={handleJoinRoom}
          />
        );
      case 'WELCOME':
      default:
        return (
          <WelcomeScreen
            currentUser={currentUser}
            onCreateRoom={() => {
              sound.playClick();
              setCurrentView('CREATE_ROOM');
            }}
            onJoinRoom={() => {
              sound.playClick();
              setCurrentView('JOIN_ROOM');
            }}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenRules={() => setShowRules(true)}
            onOpenAuth={(mode) => setAuthModalMode(mode)}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#302044] selection:bg-[#FF5DA2] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Living Animated World Canvas & Interactive Characters */}
      <AnimatedEnvironment environment={getActiveEnvironment()} />

      {/* Top Navigation */}
      <Navbar
        roomCode={roomState?.code}
        currentUser={currentUser}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenRules={() => setShowRules(true)}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onOpenProfile={() => setShowProfileModal(true)}
        onLeaveRoom={roomState ? handleLeaveRoom : undefined}
        onPlayNow={
          !roomState && currentView === 'WELCOME'
            ? () => setCurrentView('CREATE_ROOM')
            : undefined
        }
      />

      {/* Main Screen Content */}
      <main className="relative z-10 flex-1">{renderContent()}</main>

      {/* Clean White Global Footer */}
      <footer className="relative z-10 py-5 px-6 text-center text-xs font-bold text-[#756A84] border-t-2 border-[#EAE4F5] bg-white/90 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-bubble text-[#FF5DA2] text-sm font-black">NEXORA: THE CHAOS CLUB</span>
          <span className="text-[#302044]/30">·</span>
          <span className="text-[#302044]">MAKE FRIENDS. BREAK RULES. CAUSE CHAOS.</span>
          <span className="text-[#302044]/30">·</span>
          <span className="text-[#9671FF]">The Living Cartoon Party Universe</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalMode !== null}
        initialMode={authModalMode || 'login'}
        onClose={() => setAuthModalMode(null)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalMode(null);
        }}
      />

      {currentUser && (
        <ProfileModal
          isOpen={showProfileModal}
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updated: AuthUser) => setCurrentUser(updated)}
          onLogout={handleLogout}
        />
      )}

      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* PWA Components */}
      <LaunchScreen />
      <InstallWelcomeModal />
      <OfflineIndicator />
    </div>
  );
}
