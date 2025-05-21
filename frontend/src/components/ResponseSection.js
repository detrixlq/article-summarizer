import React from "react";

function ResponseSection({ responseText, sectionSummary }) {
  return (
    <div className="response-section mt-6">
      <h2 className="text-xl font-bold mb-2">Processed Text</h2>
      {/* Regular Summary */}
      {responseText && (
        <div className="relative">
          <textarea
            readOnly
            value={responseText}
            rows="5"
            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none resize-none"
          ></textarea>
        </div>
      )}
      {/* Sectional Summary */}
      {sectionSummary.length > 0 && (
        <div className="space-y-4">
          {sectionSummary.map((section, index) => (
            <div key={index} className="border rounded-md p-3 relative">
              <h3 className="font-semibold mb-1">Section {index + 1}</h3>
              <p className="text-sm whitespace-pre-line">{section}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResponseSection;