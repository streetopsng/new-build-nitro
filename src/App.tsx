// src/App.tsx

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

import ProfileSetup from "./pages/ProfileSetup";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import Rules from "./pages/Rules";
import SoloSetup from "./pages/SoloSetup";
import MPEntry from "./pages/MPEntry";
import MPCreate from "./pages/MPCreate";
import MPJoin from "./pages/MPJoin";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";

import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <AudioProvider>
            <ProfileProvider>
              <Routes>
                <Route path="/" element={<MPEntry />} />
                <Route path="/splash" element={<Splash />} />
                <Route path="/home" element={<Home />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/solo-setup" element={<SoloSetup />} />
                <Route path="/mp-entry" element={<MPEntry />} />
                <Route path="/mp-create" element={<MPCreate />} />
                <Route path="/mp-join" element={<MPJoin />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<Game />} />
                <Route path="/results" element={<Results />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ProfileProvider>
          </AudioProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;

