// src/contexts/ProfileContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AvatarOption {
  id: string;
  name: string;
  url: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: "avatar_1",
    name: "Ayoola",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Ayoola",
    color: "#7c3aed",
  },
  {
    id: "avatar_2",
    name: "Chidi",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Chidi",
    color: "#10b981",
  },
  {
    id: "avatar_3",
    name: "Ade",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Ade",
    color: "#f59e0b",
  },
  {
    id: "avatar_4",
    name: "Chinwe",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Chinwe",
    color: "#ef4444",
  },
  {
    id: "avatar_5",
    name: "Mercy",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Mercy",
    color: "#3b82f6",
  },
  {
    id: "avatar_6",
    name: "Blessing",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Blessing",
    color: "#ec4899",
  },
  {
    id: "avatar_7",
    name: "Ronke",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Ronke",
    color: "#8b5cf6",
  },
  {
    id: "avatar_8",
    name: "Augusta",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Augusta",
    color: "#14b8a6",
  },
  {
    id: "avatar_9",
    name: "Kunle",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Kunle",
    color: "#6366f1",
  },
];

interface UserProfile {
  username: string;
  avatarId: string;
  avatarUrl: string;
  catchphrase?: string;
  level: number;
  gamesPlayed: number;
  totalScore: number;
  isProfileSet: boolean;
}

interface ProfileContextType {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  updateProfile: (username: string, avatarId: string) => void;
  addGameStats: (score: number) => void;
  resetProfile: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Ayus",
  avatarId: "avatar_1",
  avatarUrl: AVATAR_OPTIONS[0].url,
  level: 10,
  gamesPlayed: 9,
  totalScore: 726,
  isProfileSet: true,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("insync_user_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem("insync_user_profile", JSON.stringify(profile));
  }, [profile]);

  const setProfile = (updates: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...updates }));
  };

  const updateProfile = (username: string, avatarId: string) => {
    const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];
    setProfileState((prev) => ({
      ...prev,
      username,
      avatarId,
      avatarUrl: avatar.url,
      isProfileSet: true,
    }));
  };

  const addGameStats = (score: number) => {
    setProfileState((prev) => {
      const newScore = prev.totalScore + score;
      const newGames = prev.gamesPlayed + 1;
      const newLevel = Math.floor(newScore / 100) + 1;
      return {
        ...prev,
        totalScore: newScore,
        gamesPlayed: newGames,
        level: Math.max(prev.level, newLevel),
      };
    });
  };

  const resetProfile = () => {
    setProfileState(DEFAULT_PROFILE);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, updateProfile, addGameStats, resetProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
