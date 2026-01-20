import React, { createContext, useContext, useState } from 'react';

const PathContext = createContext({
  path: 'general',
  profession: null,
  setPath: () => {},
  setProfession: () => {},
});

export function PathProvider({ children }) {
  const [path, setPath] = useState('general');
  const [profession, setProfession] = useState(null);

  return (
    <PathContext.Provider value={{ path, profession, setPath, setProfession }}>
      {children}
    </PathContext.Provider>
  );
}

export function usePath() {
  return useContext(PathContext);
}
