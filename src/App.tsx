import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { AudioProvider } from "./contexts/AudioContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { GummyGumProvider, useGummyGum } from "./contexts/GummyGumContext";
import { GummyGumLockedScreen } from "./components/GummyGumGateModal";
import { JoiningLobby } from "./components/JoiningLobby";

import ProfileSetup from "./pages/ProfileSetup";
import MPEntry from "./pages/MPEntry";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";
import SessionEnded from "./pages/SessionEnded";

import "./index.css";

// Nitro only runs from a GummyGum launch, so no route renders until the launch resolves.
function LaunchGate({ children }: { children: React.ReactNode }) {
  const { ggAccessState } = useGummyGum();
  if (ggAccessState === "checking") return <JoiningLobby connecting />;
  if (ggAccessState === "denied") return <GummyGumLockedScreen />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <GummyGumProvider>
        <AuthProvider>
          <GameProvider>
            <AudioProvider>
              <ProfileProvider>
                <LaunchGate>
                <Routes>
                  <Route path="/" element={<MPEntry />} />
                  <Route path="/profile-setup" element={<ProfileSetup />} />
                  <Route path="/lobby" element={<Lobby />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/session-ended" element={<SessionEnded />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </LaunchGate>
              </ProfileProvider>
            </AudioProvider>
          </GameProvider>
        </AuthProvider>
      </GummyGumProvider>
    </Router>
  );
}


export default App;

