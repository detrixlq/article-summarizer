import React from 'react';

const truncateText = (text) => {
  if (!text) return '';
  return `${text.split(/[.!?]/)[0]}...`;
};

export default function HistoryList({ history, onSelect, selected }) {
  if (!history.length) return <p>No summaries found in history.</p>;

  return (
    <ul className="space-y-4">
      {history.map((item, index) => (
        <li
          key={index}
          className={`... ${selected === item ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`}
          onClick={() => onSelect(item)}
        >
          <strong>Original Text:</strong>
          <span className="...">{truncateText(item.original_text)}</span>
          <strong>Summary:</strong>
          <span className="...">{truncateText(item.summary)}</span>
          <small className="...">{new Date(item.timestamp).toLocaleString()}</small>
        </li>
      ))}
    </ul>
  );
}
