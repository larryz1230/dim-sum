import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'sound-on';

interface SoundContextType {
  soundOn: boolean;
  setSoundOn: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundOn, setSoundOnState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(soundOn));
    } catch {
      // ignore
    }
  }, [soundOn]);

  const setSoundOn = (value: boolean | ((prev: boolean) => boolean)) => {
    setSoundOnState(value);
  };

  return (
    <SoundContext.Provider value={{ soundOn, setSoundOn }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const ctx = useContext(SoundContext);
  if (ctx === undefined) {
    throw new Error('useSound needs SoundProvider');
  }
  return ctx;
};
