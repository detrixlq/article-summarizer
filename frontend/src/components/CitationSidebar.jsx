// components/CitationSidebar.jsx
import React from 'react';

const CitationSidebar = ({ citationData }) => {
  return (
    <div className="fixed top-0 right-0 w-64 h-full bg-gray-100 dark:bg-gray-800 shadow overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Citations</h2>
      <ul className="space-y-2">
        {citationData.map((citation, index) => (
          <li key={index} className="text-sm border-b pb-2 border-gray-300 dark:border-gray-600">
            {citation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CitationSidebar;