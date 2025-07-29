import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, 
  Download, 
  Check, 
  Eye, 
  Code2, 
  Maximize2,
  Minimize2 
} from 'lucide-react';

const OPENAI_API_KEY = window.env?.OPENAI_API_KEY;

const CodeOutput = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadCode = () => {
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
      typescript: 'ts',
      sql: 'sql',
      json: 'json',
      xml: 'xml',
      yaml: 'yml'
    };

    const extension = fileExtensions[language] || 'txt';
    const filename = `generated_code_${Date.now()}.${extension}`;
    
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const getLanguageIcon = () => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      java: '☕',
      cpp: '⚡',
      csharp: '💎',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀',
      typescript: '📘',
      sql: '🗃️',
      json: '📋',
      xml: '📄',
      yaml: '⚙️'
    };
    return icons[language] || '📝';
  };

  const getCodeStats = () => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const words = code.split(/\s+/).filter(word => word.length > 0).length;
    
    return { lines, chars, words };
  };

  const renderPreview = () => {
    if (language === 'html') {
      return (
        <div className="code-preview">
          <div className="preview-header">
            <h4>🌐 HTML Preview</h4>
          </div>
          <iframe
            srcDoc={code}
            title="HTML Preview"
            className="html-preview-frame"
            sandbox="allow-scripts"
          />
        </div>
      );
    }
    
    if (language === 'css') {
      const htmlWithCSS = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${code}</style>
        </head>
        <body>
          <div class="demo-content">
            <h1>CSS Preview</h1>
            <p>This is a sample paragraph to demonstrate your CSS.</p>
            <button>Sample Button</button>
            <div class="box">Sample Box</div>
          </div>
        </body>
        </html>
      `;
      
      return (
        <div className="code-preview">
          <div className="preview-header">
            <h4>🎨 CSS Preview</h4>
          </div>
          <iframe
            srcDoc={htmlWithCSS}
            title="CSS Preview"
            className="css-preview-frame"
            sandbox="allow-scripts"
          />
        </div>
      );
    }

    return null;
  };

  const stats = getCodeStats();
  const canPreview = ['html', 'css'].includes(language);

  return (
    <div className={`code-output ${isExpanded ? 'expanded' : ''}`}>
      <div className="code-header">
        <div className="language-info">
          <span className="language-icon">{getLanguageIcon()}</span>
          <span className="language-name">{language.toUpperCase()}</span>
          <div className="code-stats">
            <span>{stats.lines} lines</span>
            <span>{stats.chars} chars</span>
            <span>{stats.words} words</span>
          </div>
        </div>
        
        <div className="code-actions">
          {canPreview && (
            <button 
              onClick={togglePreview}
              className={`action-btn ${showPreview ? 'active' : ''}`}
              title="Toggle Preview"
            >
              <Eye size={16} />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="action-btn"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <button 
            onClick={copyToClipboard}
            className={`action-btn ${copied ? 'success' : ''}`}
            title="Copy to Clipboard"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button 
            onClick={downloadCode}
            className="action-btn primary"
            title="Download File"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="code-content">
        {showPreview && canPreview && (
          <div className="preview-container">
            {renderPreview()}
          </div>
        )}
        
        <div className={`code-container ${showPreview ? 'split-view' : ''}`}>
          <SyntaxHighlighter 
            language={language}
            style={vscDarkPlus}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            lineNumberStyle={{
              color: 'rgba(255, 255, 255, 0.3)',
              paddingRight: '1em',
              minWidth: '3em'
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Code quality indicators */}
      <div className="code-footer">
        <div className="quality-indicators">
          {code.includes('function') && (
            <span className="indicator">🔧 Functions detected</span>
          )}
          {code.includes('class') && (
            <span className="indicator">🏗️ Classes detected</span>
          )}
          {code.includes('//') || code.includes('#') && (
            <span className="indicator">📝 Comments included</span>
          )}
          {code.includes('try') || code.includes('catch') && (
            <span className="indicator">🛡️ Error handling</span>
          )}
        </div>
        
        <div className="generation-info">
          <span className="timestamp">
            Generated at {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeOutput;