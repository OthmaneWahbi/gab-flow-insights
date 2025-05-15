
import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface UploadHistoryItem {
  id: string;
  timestamp: Date;
  filename: string;
}

export interface ATMData {
  numeroGAB: number;
  nomGAB: string;
  cashDisponible: number;
  nbrJour: number;
  consoMoyenne7j?: number;
  aInvestir?: number;
}

interface AppContextType {
  currentUploadId: string | null;
  uploadHistory: UploadHistoryItem[];
  atmData: ATMData[] | null;
  isLoading: boolean;
  darkMode: boolean;
  addUpload: (id: string, filename: string) => void;
  setCurrentUploadId: (id: string | null) => void;
  setAtmData: (data: ATMData[] | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [atmData, setAtmData] = useState<ATMData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const addUpload = (id: string, filename: string) => {
    const newItem: UploadHistoryItem = {
      id,
      timestamp: new Date(),
      filename,
    };
    setUploadHistory(prev => [newItem, ...prev]);
    setCurrentUploadId(id);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <AppContext.Provider
      value={{
        currentUploadId,
        uploadHistory,
        atmData,
        isLoading,
        darkMode,
        addUpload,
        setCurrentUploadId,
        setAtmData,
        setIsLoading,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
