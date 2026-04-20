// src/App.tsx (updated)

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import Splash from "./pages/Splash";
import Rules from "./pages/Rules";
import SoloSetup from "./pages/SoloSetup";
import MPEntry from "./pages/MPEntry";
import MPCreate from "./pages/MPCreate";

import Results from "./pages/Results";
import "./index.css";
import MPJoin from "./pages/MPJoin";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProvider>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/solo-setup" element={<SoloSetup />} />
            <Route path="/mp-entry" element={<MPEntry />} />
            <Route path="/mp-create" element={<MPCreate />} />
            <Route path="/mp-join" element={<MPJoin />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<Game />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
