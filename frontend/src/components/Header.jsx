// components/Header.jsx
import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import ModelDropdown from './ModelDropdown';

const Header = ({ refreshPage, handleToggleDarkMode, darkMode, themeTarget, isTransitioning, selectedModel, setSelectedModel }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-white dark:bg-gray-800 shadow px-4 py-2">
      <button
        onClick={refreshPage}
        className="text-xl font-bold text-blue-600 dark:text-blue-300 hover:opacity-75"
      >
        SciSummarizer
      </button>
      <div className="flex items-center gap-4">
        <ModelDropdown selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        <button onClick={handleToggleDarkMode} className="focus:outline-none">
          {darkMode ? <SunIcon className="w-6 h-6 text-yellow-300" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
        </button>
      </div>
      {isTransitioning && themeTarget && (
        <span
          className="absolute w-20 h-20 rounded-full bg-blue-400 opacity-20 pointer-events-none animate-ping"
          style={{ left: themeTarget.x - 40, top: themeTarget.y - 40 }}
        ></span>
      )}
    </header>
  );
};

export default Header;