import React from "react";

export default function CitationSidebar({ citationData }) {
  if (!citationData) return null;

  return (
    <aside
      className="fixed top-14 right-0 h-[calc(100%-2rem)] w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto p-6"
    >
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Citation Analysis</h2>
      <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
        <div>
          <p><span className="font-semibold">Total References:</span> {citationData.total_references}</p>
          <p><span className="font-semibold">Total Author Citations:</span> {citationData.total_author_citations}</p>
        </div>
        <div>
          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2">Top References</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.references.slice(0, 5).map((ref, index) => (
              <li key={index}>
                <span className="text-gray-700 dark:text-gray-200">{ref.Reference}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400 text-xs">({ref.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-indigo-500 dark:text-indigo-300 mb-2">Top Author Citations</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.author_citations.slice(0, 5).map((auth, index) => (
              <li key={index}>
                <span className="text-gray-700 dark:text-gray-200">{auth.Author}</span>{' '}
                <span className="text-gray-500 dark:text-gray-400 text-xs">({auth.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
