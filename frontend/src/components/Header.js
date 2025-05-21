import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import ModelDropdown from "./ModelDropdown";

function Header({ darkMode, setDarkMode, selectedModel, setSelectedModel }) {
  const handleToggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 w-full z-50">
      <div className="max-w-screen-xl ml-4 px-4 py-3 flex items-center">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer">
          Summarizer
        </h1>
        <ModelDropdown
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <div className="ml-auto">
          <button
            onClick={handleToggleDarkMode}
            className="relative w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="absolute transition-all duration-500 transform scale-100 opacity-100 dark:scale-0 dark:opacity-0 rotate-0 dark:-rotate-90">
              <SunIcon className="w-6 h-6 text-yellow-500" />
            </span>
            <span className="absolute transition-all duration-500 transform scale-0 opacity-0 dark:scale-100 dark:opacity-100 rotate-90 dark:rotate-0">
              <MoonIcon className="w-6 h-6 text-indigo-300" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;