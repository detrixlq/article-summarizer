import React from "react";

function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  history,
  setHistory,
  selectedHistory,
  setSelectedHistory,
  setInputText,
  setResponseText,
  setSectionSummary,
  setCitationData,
  setEntities,
  setUseSectional,
}) {
  const clearHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/clear-history", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      setHistory([]);
      alert("History cleared successfully!");
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Failed to clear history. Please try again.");
    }
  };

  const deleteHistoryItem = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/history/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== itemId));
    } catch {
      alert("Failed to delete item. Please try again.");
    }
  };

  return (
    <aside
      className={`sidebar bg-white dark:bg-gray-800 dark:text-gray-100 w-80 shadow-lg transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed top-0 left-0 h-full z-50 overflow-y-auto`}
    >
      <div className="p-6 space-y-6">
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white float-right"
        >
          Close
        </button>
        <h2 className="text-xl font-bold">Summary History</h2>
        <button
          onClick={clearHistory}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Clear History
        </button>
        {history.length === 0 ? (
          <p>No summaries found in history.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((item, index) => (
              <li
                key={index}
                className={`relative group border dark:border-gray-700 p-4 rounded-lg transition-colors cursor-pointer ${
                  selectedHistory === item ? "bg-indigo-100 dark:bg-indigo-900" : "bg-gray-50 dark:bg-gray-700"
                } hover:bg-indigo-100 dark:hover:bg-indigo-800`}
                onClick={() => {
                  setInputText(item.original_text);
                  if (item.section_summaries) {
                    setSectionSummary(Object.values(item.section_summaries));
                    setResponseText("");
                    setUseSectional(true);
                  } else {
                    setResponseText(item.summary);
                    setSectionSummary([]);
                    setUseSectional(false);
                  }
                  setSelectedHistory(item);
                  setCitationData(item.citations ? JSON.parse(item.citations) : []);
                  setEntities(item.entities ? JSON.parse(item.entities) : []);
                  setIsSidebarOpen(false);
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  &times;
                </button>
                <strong>Original Text:</strong>{" "}
                <span className="block text-sm line-clamp-2">{item.original_text}</span>
                <strong>Summary:</strong>{" "}
                <span className="block text-sm line-clamp-2 mt-2">{item.summary}</span>
                <small className="block mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;