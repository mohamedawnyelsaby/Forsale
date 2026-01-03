'use client';
import React, { createContext, useContext } from 'react';
const PiContext = createContext<any>(null);
export const PiNetworkProvider = ({ children }: { children: React.ReactNode }) => (
  <PiContext.Provider value={{ user: null }}>{children}</PiContext.Provider>
);
export const usePiNetwork = () => useContext(PiContext);
