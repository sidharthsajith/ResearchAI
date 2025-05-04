import { useState, useRef, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ResponseArea from './components/ResponseArea';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const socketRef = useRef(null);
  const responseContentRef = useRef(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Export to PDF function
  const exportToPDF = async () => {
    if (!response) return;
    
    // Initialize PDF with font support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Add font
    pdf.setFont('helvetica');
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // 20mm margins
    const contentWidth = pageWidth - (margin * 2);
    
    // Parse markdown to sections
    const sections = parseMarkdownToSections(response);
    
    let y = margin;
    let pageCount = 1;
    
    // Process each section
    sections.forEach(section => {
      // Check if we need a new page
      if (y > pageHeight - margin - 10) {
        pdf.addPage();
        y = margin;
        pageCount++;
      }
      
      // Handle different section types
      if (section.type === 'heading') {
        // Add some space before headings
        if (y > margin) y += 5;
        
        pdf.setFontSize(section.level === 1 ? 18 : section.level === 2 ? 16 : 14);
        pdf.setFont('helvetica', 'bold');
        
        const lines = pdf.splitTextToSize(section.content, contentWidth);
        pdf.text(lines, margin, y);
        y += (lines.length * (section.level === 1 ? 8 : 7)) + 5;
      } 
      else if (section.type === 'paragraph') {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const lines = pdf.splitTextToSize(section.content, contentWidth);
        
        // Check if paragraph will overflow to next page
        if (y + (lines.length * 5) > pageHeight - margin) {
          // If near bottom of page, start on next page
          if (y > pageHeight - margin - 30) {
            pdf.addPage();
            y = margin;
            pageCount++;
          }
        }
        
        pdf.text(lines, margin, y);
        y += (lines.length * 5) + 5;
      }
      else if (section.type === 'list') {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        section.items.forEach(item => {
          // Check if list item will overflow
          if (y > pageHeight - margin - 15) {
            pdf.addPage();
            y = margin;
            pageCount++;
          }
          
          const itemText = `• ${item}`;
          const lines = pdf.splitTextToSize(itemText, contentWidth - 5);
          pdf.text(lines, margin + 5, y);
          y += (lines.length * 5) + 3;
        });
        
        y += 2; // Extra space after list
      }
      
      // Add footer to each page
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10);
    });
    
    // Save the PDF
    const cleanFileName = query.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`${cleanFileName}_research.pdf`);
  };
  
  // Helper function to parse markdown into structured sections
  const parseMarkdownToSections = (markdown) => {
    const sections = [];
    const lines = markdown.split('\n');
    
    let currentSection = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        if (currentSection && currentSection.type === 'paragraph') {
          sections.push(currentSection);
          currentSection = null;
        }
        return;
      }
      
      // Heading detection
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2]
        };
        
        sections.push(currentSection);
        currentSection = null;
        return;
      }
      
      // List item detection
      const listItemMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
      if (listItemMatch) {
        if (currentSection && currentSection.type !== 'list') {
          sections.push(currentSection);
          currentSection = null;
        }
        
        if (!currentSection || currentSection.type !== 'list') {
          currentSection = {
            type: 'list',
            items: []
          };
        }
        
        currentSection.items.push(listItemMatch[1]);
        return;
      }
      
      // Paragraph handling
      if (!currentSection || currentSection.type !== 'paragraph') {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          type: 'paragraph',
          content: trimmedLine
        };
      } else {
        currentSection.content += ' ' + trimmedLine;
      }
    });
    
    // Add the last section if exists
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const connectWebSocket = () => {
    // Close existing connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Create new WebSocket connection
    const socket = new WebSocket('ws://localhost:8000/ws');
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please try again.');
      setIsLoading(false);
    };
    
    socketRef.current = socket;
  };

  // Connect WebSocket on component mount
  useEffect(() => {
    connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setResponse('');
    setIsLoading(true);
    setError(null);
    
    // Add to search history
    setSearchHistory(prev => [
      { id: Date.now(), query: searchQuery }, 
      ...prev.slice(0, 9)
    ]);

    try {
      // Ensure connection is open
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
        // Small delay to ensure connection is established
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Send the query
      socketRef.current.send(JSON.stringify({ query: searchQuery }));
      
      // Set up message handler for this specific request
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            setError(data.error);
            setIsLoading(false);
          } else if (data.answer !== undefined) {
            setResponse(prev => prev + data.answer);
          }
        } catch (e) {
          console.error('Error parsing response:', e);
          setError('Error processing response');
        }
      };
    } catch (err) {
      console.error('Request error:', err);
      setError('Failed to send request. Please try again.');
    }
  };

  // When we receive the last chunk, stop loading
  useEffect(() => {
    if (response && isLoading) {
      // This is a simplistic approach - in a real app, the backend should 
      // send a "completed" signal, but we'll use a timeout for now
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [response, isLoading]);

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="sidebar">
        <h2>SearchGPT 😎</h2>
        <button 
          className="theme-toggle-button" 
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="history-container">
          <h3>Recent Searches</h3>
          <ul className="search-history">
            {searchHistory.map(item => (
              <li key={item.id} onClick={() => handleSubmit(item.query)}>
                {item.query}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="main-content">
        <SearchBar onSubmit={handleSubmit} isLoading={isLoading} />
        
        {(response || isLoading || error) && (
          <>
            <ResponseArea 
              query={query}
              response={response} 
              isLoading={isLoading}
              error={error}
              ref={responseContentRef}
            />
            
            {response && !isLoading && (
              <div className="export-button-container">
                <button 
                  className="export-pdf-button"
                  onClick={exportToPDF}
                  disabled={isLoading}
                >
                  Export to PDF
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;