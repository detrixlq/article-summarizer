import React from "react";

export default function MainForm({
  inputText,
  setInputText,
  file,
  setFile,
  loading,
  handleSubmit,
  handleTextChange,
  handleFileUpload,
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Enter Article Text
        </label>
        <textarea
          id="text"
          value={inputText}
          onChange={handleTextChange}
          rows="5"
          placeholder="Paste article text here..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="file"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Or Upload a File (.docx, .pdf)
        </label>
        <input
          type="file"
          id="file"
          name="file"
          accept=".docx,.pdf"
          onChange={handleFileUpload}
          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-200 dark:hover:file:bg-indigo-800"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? "Processing..." : "Process Text"}
      </button>
    </form>
  );
}
