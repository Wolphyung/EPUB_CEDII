import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setIsOpen(false);
  };

  const getCurrentFlag = () => {
    switch (i18n.language) {
      case 'fr':
        return <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>;
      case 'en':
        return <span className="fi fi-us" style={{ fontSize: '1.2rem' }}></span>;
      case 'mg':
        return <span className="fi fi-mg" style={{ fontSize: '1.2rem' }}></span>;
      default:
        return <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>;
    }
  };

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        width: 'fit-content',
        margin: '0 auto',
      }}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          minWidth: '60px',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        title="Changer la langue"
      >
        <span 
          className="fas fa-globe" 
          style={{
            color: 'white',
            fontSize: '0.9rem',
          }}
        ></span>
        <span style={{ color: 'white', fontSize: '1.2rem' }}>
          {getCurrentFlag()}
        </span>
        <span 
          className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}
          style={{
            color: 'white',
            fontSize: '0.7rem',
            marginLeft: '4px',
          }}
        ></span>
      </Button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 1000,
            minWidth: '60px',
            overflow: 'hidden',
          }}
        >
          {/* Option français */}
          <button
            onClick={() => changeLanguage('fr')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 12px',
              backgroundColor: i18n.language === 'fr' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            title="Français"
          >
            <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>
          </button>

          {/* Option anglais */}
          <button
            onClick={() => changeLanguage('en')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 12px',
              backgroundColor: i18n.language === 'en' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            title="English"
          >
            <span className="fi fi-us" style={{ fontSize: '1.2rem' }}></span>
          </button>

          {/* Option malgache */}
          <button
            onClick={() => changeLanguage('mg')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '10px 12px',
              backgroundColor: i18n.language === 'mg' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            title="Malagasy"
          >
            <span className="fi fi-mg" style={{ fontSize: '1.2rem' }}></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;