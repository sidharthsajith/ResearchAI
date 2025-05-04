import { useEffect, useRef } from 'react';
import './ResponseArea.css';
import ReactMarkdown from 'react-markdown';

function ResponseArea({ query, response, isLoading, error }) {
  const responseRef = useRef(null);

  // Auto-scroll as content streams in
  useEffect(() => {
    if (responseRef.current) {
      const { scrollHeight, clientHeight } = responseRef.current;
      responseRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [response]);

  return (
    <div className="response-container">
      <div className="query-display">
        <h3>Research Topic:</h3>
        <p>{query}</p>
      </div>
      
      <div className="response-content" ref={responseRef}>
        <ReactMarkdown>{response}</ReactMarkdown>
        
        {isLoading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponseArea;