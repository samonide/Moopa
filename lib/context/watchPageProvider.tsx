import React, { createContext, useContext, useState, ReactNode } from "react";

interface PlayerState {
  currentTime: number;
  isPlaying: boolean;
}

interface RatingModalState {
  isOpen: boolean;
  isFullscreen: boolean;
}

interface WatchPageContextType {
  theaterMode: boolean;
  setTheaterMode: (value: boolean) => void;
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  playerState: PlayerState;
  setPlayerState: (value: PlayerState) => void;
  autoplay: boolean | null;
  setAutoPlay: (value: boolean | null) => void;
  autoNext: boolean | null | string;
  setAutoNext: (value: boolean | null | string) => void;
  marked: number;
  setMarked: (value: number) => void;
  userData: any;
  setUserData: (value: any) => void;
  dataMedia: any;
  setDataMedia: (value: any) => void;
  ratingModalState: RatingModalState;
  setRatingModalState: (value: RatingModalState) => void;
  track: any;
  setTrack: (value: any) => void;
}

export const WatchPageContext = createContext<WatchPageContextType | undefined>(undefined);

export const WatchPageProvider = ({ children }: { children: ReactNode }) => {
  const [theaterMode, setTheaterMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    isPlaying: false,
  });
  const [autoplay, setAutoPlay] = useState<boolean | null>(null);
  const [autoNext, setAutoNext] = useState<boolean | null | string>(null);
  const [marked, setMarked] = useState(0);

  const [userData, setUserData] = useState<any>(null);
  const [dataMedia, setDataMedia] = useState<any>(null);

  const [ratingModalState, setRatingModalState] = useState<RatingModalState>({
    isOpen: false,
    isFullscreen: false,
  });

  const [track, setTrack] = useState<any>(null);

  return (
    <WatchPageContext.Provider
      value={{
        theaterMode,
        setTheaterMode,
        aspectRatio,
        setAspectRatio,
        playerState,
        setPlayerState,
        userData,
        setUserData,
        autoplay,
        setAutoPlay,
        marked,
        setMarked,
        track,
        setTrack,
        dataMedia,
        setDataMedia,
        autoNext,
        setAutoNext,
        ratingModalState,
        setRatingModalState,
      }}
    >
      {children}
    </WatchPageContext.Provider>
  );
};

export function useWatchProvider() {
  const context = useContext(WatchPageContext);
  if (!context) {
    throw new Error("useWatchProvider must be used within a WatchPageProvider");
  }
  return context;
}
