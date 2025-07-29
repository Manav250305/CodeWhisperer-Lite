import React, { useState } from 'react';
import { ChevronDown, Search, Code } from 'lucide-react';

const apiKey = window.env?.OPENAI_API_KEY;

const LanguageSelector = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const languages = [
    { 
      id: 'javascript', 
      name: 'JavaScript', 
      icon: '🟨',
      description: 'Modern web development',
      extensions: ['.js'],
      popular: true
    },
    { 
      id: 'python', 
      name: 'Python', 
      icon: '🐍',
      description: 'Data science & automation',
      extensions: ['.py'],
      popular: true
    },
    { 
      id: 'html', 
      name: 'HTML', 
      icon: '🌐',
      description: 'Web markup language',
      extensions: ['.html', '.htm'],
      popular: true
    },
    { 
      id: 'css', 
      name: 'CSS', 
      icon: '🎨',
      description: 'Styling & layouts',
      extensions: ['.css'],
      popular: true
    },
    { 
      id: 'typescript', 
      name: 'TypeScript', 
      icon: '📘',
      description: 'Typed JavaScript',
      extensions: ['.ts'],
      popular: true
    },
    { 
      id: 'react', 
      name: 'React JSX', 
      icon: '⚛️',
      description: 'React components',
      extensions: ['.jsx', '.tsx'],
      popular: true
    },
    { 
      id: 'java', 
      name: 'Java', 
      icon: '☕',
      description: 'Enterprise applications',
      extensions: ['.java'],
      popular: false
    },
    { 
      id: 'cpp', 
      name: 'C++', 
      icon: '⚡',
      description: 'System programming',
      extensions: ['.cpp', '.cc', '.h'],
      popular: false
    },
    { 
      id: 'csharp', 
      name: 'C#', 
      icon: '💎',
      description: '.NET development',
      extensions: ['.cs'],
      popular: false
    },
    { 
      id: 'php', 
      name: 'PHP', 
      icon: '🐘',
      description: 'Server-side scripting',
      extensions: ['.php'],
      popular: false
    },
    { 
      id: 'ruby', 
      name: 'Ruby', 
      icon: '💎',
      description: 'Web applications',
      extensions: ['.rb'],
      popular: false
    },
    { 
      id: 'go', 
      name: 'Go', 
      icon: '🐹',
      description: 'Cloud & microservices',
      extensions: ['.go'],
      popular: false
    },
    { 
      id: 'rust', 
      name: 'Rust', 
      icon: '🦀',
      description: 'Systems programming',
      extensions: ['.rs'],
      popular: false
    },
    { 
      id: 'sql', 
      name: 'SQL', 
      icon: '🗃️',
      description: 'Database queries',
      extensions: ['.sql'],
      popular: false
    },
    { 
      id: 'bash', 
      name: 'Bash', 
      icon: '🖥️',
      description: 'Shell scripting',
      extensions: ['.sh'],
      popular: false
    },
    { 
      id: 'json', 
      name: 'JSON', 
      icon: '📋',
      description: 'Data interchange',
      extensions: ['.json'],
      popular: false
    },
    { 
      id: 'yaml', 
      name: 'YAML', 
      icon: '⚙️',
      description: 'Configuration files',
      extensions: ['.yml', '.yaml'],
      popular: false
    },
    { 
      id: 'xml', 
      name: 'XML', 
      icon: '📄',
      description: 'Markup language',
      extensions: ['.xml'],
      popular: false
    }
  ];

  const selectedLanguage = languages.find(lang => lang.id === selected);
  
  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularLanguages = filteredLanguages.filter(lang => lang.popular);
  const otherLanguages = filteredLanguages.filter(lang => !lang.popular);

  const handleSelect = (languageId) => {
    onChange(languageId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="language-selector">
      <button
        className={`selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="selected-language">
          <span className="language-icon">{selectedLanguage?.icon}</span>
          <span className="language-name">{selectedLanguage?.name}</span>
        </div>
        <ChevronDown 
          size={20} 
          className={`chevron ${isOpen ? 'rotated' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="selector-dropdown">
          {/* Search bar */}
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="language-search"
              autoFocus
            />
          </div>

          <div className="languages-list">
            {/* Popular Languages */}
            {popularLanguages.length > 0 && (
              <div className="language-group">
                <div className="group-header">
                  <Code size={14} />
                  <span>Popular</span>
                </div>
                {popularLanguages.map(language => (
                  <button
                    key={language.id}
                    className={`language-option ${selected === language.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(language.id)}
                  >
                    <div className="language-info">
                      <span className="language-icon">{language.icon}</span>
                      <div className="language-details">
                        <span className="language-name">{language.name}</span>
                        <span className="language-desc">{language.description}</span>
                      </div>
                    </div>
                    <div className="language-extensions">
                      {language.extensions.slice(0, 2).map(ext => (
                        <span key={ext} className="extension-tag">{ext}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Other Languages */}
            {otherLanguages.length > 0 && (
              <div className="language-group">
                <div className="group-header">
                  <span>More Languages</span>
                </div>
                {otherLanguages.map(language => (
                  <button
                    key={language.id}
                    className={`language-option ${selected === language.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(language.id)}
                  >
                    <div className="language-info">
                      <span className="language-icon">{language.icon}</span>
                      <div className="language-details">
                        <span className="language-name">{language.name}</span>
                        <span className="language-desc">{language.description}</span>
                      </div>
                    </div>
                    <div className="language-extensions">
                      {language.extensions.slice(0, 2).map(ext => (
                        <span key={ext} className="extension-tag">{ext}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {filteredLanguages.length === 0 && (
              <div className="no-results">
                <p>No languages found for "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Quick tips */}
          <div className="selector-footer">
            <p className="tip">
              💡 Tip: Choose the language that matches your project needs
            </p>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="selector-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;