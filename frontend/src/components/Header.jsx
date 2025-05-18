import React from "react";
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import ModelDropdown from "./ModelDropdown";

export default function Header({
  selectedModel,
  setSelectedModel,
  darkMode,
  handleToggleDarkMode,
  isTransitioning,
  themeTarget,
}) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 z-50 fixed top-0 left-0 w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Summarizer</h1>

        <ModelDropdown selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

        <button
          onClick={handleToggleDarkMode}
          className="relative w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-50"
        >
          <span className="absolute transition-all duration-500 transform scale-100 opacity-100 dark:scale-0 dark:opacity-0 rotate-0 dark:-rotate-90">
            <SunIcon className="w-6 h-6 text-yellow-500" />
          </span>
          <span className="absolute transition-all duration-500 transform scale-0 opacity-0 dark:scale-100 dark:opacity-100 rotate-90 dark:rotate-0">
            <MoonIcon className="w-6 h-6 text-indigo-300" />
          </span>
        </button>

        {isTransitioning && (
          <div
            className={`fixed inset-0 z-40 pointer-events-none transition-transform duration-700 ease-in-out`}
            style={{
              clipPath: `circle(0% at ${themeTarget?.x}px ${themeTarget?.y}px)`,
              backgroundColor: darkMode ? '#f9fafb' : '#111827',
              animation: `${darkMode ? 'collapseToCenter' : 'expandFromCenter'} 0.7s ease-in-out forwards`,
            }}
          ></div>
        )}
      </div>
    </header>
  );
}
