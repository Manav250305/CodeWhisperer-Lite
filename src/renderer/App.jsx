import React, { useState, useEffect } from 'react';
import VoiceInput from './components/VoiceInput';
import CodeOutput from './components/CodeOutput';
import LanguageSelector from './components/LanguageSelector';
import CodeHistory from './components/CodeHistory';


const App = () => {
  const [transcription, setTranscription] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [isGenerating, setIsGenerating] = useState(false);
  const [codeHistory, setCodeHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [error, setError] = useState(null);

  // Load code history from localStorage on startup
  useEffect(() => {
    const savedHistory = localStorage.getItem('codewhisperer-history');
    if (savedHistory) {
      try {
        setCodeHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    if (codeHistory.length > 0) {
      localStorage.setItem('codewhisperer-history', JSON.stringify(codeHistory));
    }
  }, [codeHistory]);

  // Listen for Electron menu events
  useEffect(() => {
    const handleNewRecording = () => {
      setTranscription('');
      setGeneratedCode('');
      setCurrentPrompt('');
      setError(null);
    };

    const handleSaveCode = () => {
      if (generatedCode) {
        saveCodeToFile();
      }
    };

    window.electron.ipcRenderer.on('new-recording', handleNewRecording);
    window.electron.ipcRenderer.on('save-code', handleSaveCode);

    return () => {
      window.electron.ipcRenderer.removeListener('new-recording', handleNewRecording);
      window.electron.ipcRenderer.removeListener('save-code', handleSaveCode);
    };
  }, [generatedCode]);

  const handleTranscription = async (audioPath) => {
    setError(null);
    setIsGenerating(true);
    
    try {
      // Step 1: Transcribe audio
      const transcribedText = await window.electron.ipcRenderer.invoke('transcribe-audio', audioPath);
      setTranscription(transcribedText);
      setCurrentPrompt(transcribedText);
      
      // Step 2: Generate code
      const code = await window.electron.ipcRenderer.invoke('generate-code', transcribedText, selectedLanguage);
      setGeneratedCode(code);
      
      // Step 3: Add to history
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        prompt: transcribedText,
        code: code,
        language: selectedLanguage
      };
      
      setCodeHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // Keep last 50 items
      
      // Show success notification
      window.electron.ipcRenderer.invoke('show-notification', 
        'Code Generated!', 
        `Successfully generated ${selectedLanguage} code from your voice input.`
      );
      
    } catch (error) {
      console.error('Processing failed:', error);
      setError(error.message || 'Failed to process voice input');
      
      // Show error notification
      window.electron.ipcRenderer.invoke('show-notification', 
        'Error', 
        'Failed to process voice input. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistorySelect = (historyItem) => {
    setTranscription(historyItem.prompt);
    setGeneratedCode(historyItem.code);
    setSelectedLanguage(historyItem.language);
    setCurrentPrompt(historyItem.prompt);
  };

  const saveCodeToFile = async () => {
    if (!generatedCode) return;
    
    const fileExtensions = {
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      typescript: 'ts'
    };
    
    const extension = fileExtensions[selectedLanguage] || 'txt';
    const filename = `generated_code_${Date.now()}.${extension}`;
    
    try {
      const result = await window.electron.ipcRenderer.invoke('save-code-file', generatedCode, filename);
      if (result.success && !result.canceled) {
        window.electron.ipcRenderer.invoke('show-notification', 
          'File Saved!', 
          `Code saved to ${result.path}`
        );
      }
    } catch (error) {
      console.error('Failed to save file:', error);
      setError('Failed to save file');
    }
  };

  const clearHistory = () => {
    setCodeHistory([]);
    localStorage.removeItem('codewhisperer-history');
  };

  const regenerateCode = async () => {
    if (!currentPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const code = await window.electron.ipcRenderer.invoke('generate-code', currentPrompt, selectedLanguage);
      setGeneratedCode(code);
      
      // Update the most recent history item
      if (codeHistory.length > 0) {
        const updatedHistory = [...codeHistory];
        updatedHistory[0] = {
          ...updatedHistory[0],
          code: code,
          language: selectedLanguage,
          timestamp: new Date().toISOString()
        };
        setCodeHistory(updatedHistory);
      }
    } catch (error) {
      setError(error.message || 'Failed to regenerate code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🎙️ CodeWhisperer Lite</h1>
            <p className="tagline">Voice-powered code generation</p>
          </div>
          
          <div className="header-controls">
            <LanguageSelector 
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-content">
          {/* Voice Input Section */}
          <div className="input-section">
            <VoiceInput 
              onTranscriptionComplete={handleTranscription}
              isGenerating={isGenerating}
            />
            
            {transcription && (
              <div className="transcription-display">
                <h3>📝 You said:</h3>
                <div className="transcription-text">
                  "{transcription}"
                </div>
              </div>
            )}
            
            {error && (
              <div className="error-display">
                <h3>❌ Error:</h3>
                <p>{error?.toString()}</p>
              </div>
            )}
          </div>

          {/* Code Output Section */}
          <div className="output-section">
            {isGenerating && (
              <div className="loading-display">
                <div className="spinner"></div>
                <p>🤖 Generating {selectedLanguage} code...</p>
              </div>
            )}
            
            {generatedCode && !isGenerating && (
              <div className="code-container">
                <div className="code-actions">
                  <button 
                    onClick={regenerateCode} 
                    className="btn-secondary"
                    disabled={isGenerating}
                  >
                    🔄 Regenerate
                  </button>
                  <button 
                    onClick={saveCodeToFile} 
                    className="btn-primary"
                  >
                    💾 Save File
                  </button>
                </div>
                
                <CodeOutput 
                  code={generatedCode} 
                  language={selectedLanguage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar for History */}
        <aside className="sidebar">
          <CodeHistory 
            history={codeHistory}
            onSelectItem={handleHistorySelect}
            onClearHistory={clearHistory}
          />
        </aside>
      </main>

      {/* Footer with tips */}
      <footer className="app-footer">
        <div className="tips">
          <h4>💡 Tips for better results:</h4>
          <ul>
            <li>Be specific: "Create a function that calculates fibonacci"</li>
            <li>Include context: "Make a React component with a red button"</li>
            <li>Specify requirements: "Add error handling and comments"</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default App;