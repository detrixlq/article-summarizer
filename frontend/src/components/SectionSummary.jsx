import React, { useState } from "react";
import axios from "axios";

const SectionSummary = () => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/section-summary", { pdf_url: pdfUrl });
      setSummaries(res.data.summaries);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-2">Sectional Summary</h2>
      <input
        type="text"
        className="w-full border px-2 py-1 mb-2"
        placeholder="Enter PDF URL"
        value={pdfUrl}
        onChange={(e) => setPdfUrl(e.target.value)}
      />
      <button
        onClick={handleSummarize}
        className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
        disabled={!pdfUrl || loading}
      >
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {error && <div className="text-red-600 mt-2">{error}</div>}

      {Object.keys(summaries).length > 0 && (
        <div className="mt-4 space-y-4">
          {Object.entries(summaries).map(([section, summary]) => (
            <div key={section} className="bg-gray-100 p-3 rounded">
              <h3 className="font-bold">{section}</h3>
              <p>{summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionSummary;
