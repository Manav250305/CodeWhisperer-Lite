const OPENAI_API_KEY = window.env?.OPENAI_API_KEY;
import React, { useState } from 'react';

function CodeHistory({ history }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const availableLanguages = [...new Set(history.map(item => item.language))];

  const filteredHistory = history
    .filter(item => {
      const matchesSearch = 
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLanguage = 
        selectedLanguage === 'all' || item.language === selectedLanguage;

      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'language':
          return a.language.localeCompare(b.language);
        case 'favorites':
          const aFav = favorites.has(a.id);
          const bFav = favorites.has(b.id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        default:
          return 0;
      }
    });

  return (
    <div className="code-history-container">
      <div className="code-history-header">
        <h2>🕘 Code History</h2>
        <div className="filters">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by prompt or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="all">All Languages</option>
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="language">By Language</option>
            <option value="favorites">Favorites First</option>
          </select>
        </div>
      </div>

      <ul className="code-history-list">
        {filteredHistory.map((item) => (
          <li
            key={item.id}
            className="code-history-item"
            onClick={() =>
              setExpandedItemId((prevId) => (prevId === item.id ? null : item.id))
            }
            style={{ cursor: 'pointer' }}
          >
            <div className="item-meta">
              <span className="item-language">{item.language}</span>
              <span className="item-timestamp">{new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <div className="item-header">
              <div className="item-prompt"><strong>Prompt:</strong> {item.prompt}</div>
            </div>
            <div className={`item-code ${expandedItemId === item.id ? 'expanded' : 'collapsed'}`}>
              {expandedItemId === item.id && (
                <pre><code>{item.code}</code></pre>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

}

export default CodeHistory;
