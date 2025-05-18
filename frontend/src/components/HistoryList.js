// src/components/HistoryList.js

import React, { useEffect, useState } from 'react';
import { getHistory } from '../api';

const HistoryList = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data.history);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      {history.length === 0 ? (
        <p>No summaries found in history.</p>
      ) : (
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              <strong>Original Text:</strong> {item.original_text}
              <br />
              <strong>Summary:</strong> {item.summary}
              <br />
              <small>{new Date(item.timestamp).toLocaleString()}</small>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList;