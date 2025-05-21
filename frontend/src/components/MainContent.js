import React from "react";

function MainContent({
  inputText,
  setInputText,
  file,
  setFile,
  loading,
  handleSubmit,
  useSectional,
  setUseSectional,
}) {
  const fileInputRef = React.useRef(null);

  const handleTextChange = (e) => setInputText(e.target.value);
  const handleFileUpload = (e) => setFile(e.target.files[0]);

  return (
    <div className="main-content flex-grow p-8 mx-auto max-w-screen-sm pt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Scientific Article Processor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Textarea */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium">
            Enter Article Text
          </label>
          <textarea
            id="text"
            value={inputText}
            onChange={handleTextChange}
            rows="5"
            placeholder="Paste article text here..."
            disabled={!!file}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm resize-none"
          ></textarea>
        </div>

        {/* File Upload */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium">
            Or Upload a PDF File
          </label>
          <div className="flex items-center gap-4 mt-1">
            <input
              type="file"
              id="file"
              name="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={loading}
              ref={fileInputRef}
              className="block flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-sm text-red-600 underline"
              >
                Clear File
              </button>
            )}
          </div>
        </div>

        {/* Toggle Sectional Summary */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="sectional"
            checked={useSectional}
            onChange={() => setUseSectional(!useSectional)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="sectional" className="text-sm">
            Use Sectional Summary
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (!inputText.trim() && !file)}
          className={`w-full py-2 px-4 rounded-md transition-colors ${
            loading || (!inputText.trim() && !file)
              ? "bg-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? "Processing..." : "Summarize"}
        </button>
      </form>
    </div>
  );
}

export default MainContent;