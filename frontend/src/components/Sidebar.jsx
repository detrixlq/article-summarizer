import React from "react";
import HistoryList from "./HistoryList";

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  history,
  setInputText,
  setResponseText,
  setSelectedHistory,
  setCitationData,
  clearHistory,
  selectedHistory,
}) {
  const handleSelect = (item) => {
    setInputText(item.original_text);
    setResponseText(item.summary);
    setSelectedHistory(item);
    setCitationData(item.citations ? JSON.parse(item.citations) : []);
    setIsSidebarOpen(false);
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-800 dark:text-gray-100 w-80 shadow-lg transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed top-0 left-0 h-full z-50`}
    >
      <div className="p-6 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white float-right"
        >
          Close
        </button>

        <h2 className="text-xl font-bold mb-4">Summary History</h2>

        <button
          onClick={clearHistory}
          className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 mb-4"
        >
          Clear History
        </button>

        <HistoryList
          history={history}
          onSelect={handleSelect}
          selected={selectedHistory}
        />
      </div>
    </aside>
  );
}
