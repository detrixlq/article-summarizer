import React from "react";

export default function Response({ responseText, copyToClipboard }) {
  if (!responseText) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">Processed Text</h2>
      <div className="relative">
        <textarea
          readOnly
          value={responseText}
          rows="5"
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
        ></textarea>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-4 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm opacity-50 hover:opacity-100 transition-opacity duration-300"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
