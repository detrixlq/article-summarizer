// components/TextForm.jsx
import React from 'react';

const TextForm = ({ inputText, onTextChange, onFileUpload, handleSubmit, loading }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={inputText}
        onChange={onTextChange}
        rows="6"
        placeholder="Paste your scientific text here or upload a file."
        className="w-full p-3 border rounded resize-none dark:bg-gray-700 dark:text-white"
      ></textarea>
      <input
        type="file"
        accept=".txt,.pdf"
        onChange={onFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Summarize'}
      </button>
    </form>
  );
};

export default TextForm;