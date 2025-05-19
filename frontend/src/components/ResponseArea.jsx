// components/ResponseArea.jsx
import React from 'react';

const ResponseArea = ({ responseText, onCopy }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Summary</h2>
      <div className="relative border p-4 rounded bg-white dark:bg-gray-700">
        <pre className="whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-white">{responseText}</pre>
        {responseText && (
          <button
            onClick={onCopy}
            className="absolute top-2 right-2 text-sm text-blue-600 hover:underline"
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
};

export default ResponseArea;
