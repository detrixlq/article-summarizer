import React from "react";

function CitationAnalysis({ citationData, entities }) {
  return (
    <aside className="fixed top-14 right-0 w-80 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto p-6">
      <h2 className="text-xl font-bold mb-4">Citation Analysis</h2>
      <div className="space-y-4 text-sm">
        <div>
          <p>
            <span className="font-semibold">Total References:</span>{" "}
            {citationData.total_references}
          </p>
          <p>
            <span className="font-semibold">Total Author Citations:</span>{" "}
            {citationData.total_author_citations}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Top References</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.references.slice(0, 5).map((ref, index) => (
              <li key={index}>
                {ref.Reference} <span>({ref.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Top Author Citations</h3>
          <ul className="list-disc list-inside space-y-1">
            {citationData.author_citations.slice(0, 5).map((auth, index) => (
              <li key={index}>
                {auth["Author Citation"]} <span>({auth.Frequency})</span>
              </li>
            ))}
          </ul>
        </div>
        {entities && entities.length > 0 && (
          <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
            <h3 className="font-semibold mb-2">Key Terms</h3>
            <ul className="flex flex-wrap gap-2">
              {entities.map((entity, index) => (
                <li key={index} className="px-3 py-1 bg-gray-200 rounded-full text-xs">
                  {entity.term} <span>({entity.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CitationAnalysis;