// src/components/LanguageSwitcher.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonGroup, Button } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const isActive = (lng) => i18n.language === lng;

  return (
    <ButtonGroup 
      aria-label="Language switcher" 
      size="sm" 
      style={{ 
        width: 'fit-content',
        margin: '0 auto',
        borderRadius: '8px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex', 
        alignItems: 'center', 
        background: 'rgba(0, 0, 0, 0.2)', 
      }}
    >
      {/* Icône de Globe */}
      <span 
        className="fas fa-globe" 
        style={{
          color: 'white',
          fontSize: '1rem',
          padding: '0 8px', 
          borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        }}
      ></span>

      {/* Français */}
      <Button
        onClick={() => changeLanguage('fr')}
        style={{
          backgroundColor: isActive('fr') ? '#667eea' : 'transparent', 
          borderColor: isActive('fr') ? '#667eea' : 'transparent',
          color: 'white',
          padding: '6px 10px', 
          borderRadius: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'background-color 0.2s',
        }}
        title="Français"
      >
        FR
      </Button>

      {/* Anglais */}
      <Button
        onClick={() => changeLanguage('en')}
        style={{
          backgroundColor: isActive('en') ? '#667eea' : 'transparent',
          borderColor: isActive('en') ? '#667eea' : 'transparent',
          color: 'white',
          padding: '6px 10px', 
          borderRadius: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'background-color 0.2s',
        }}
        title="English"
      >
        EN
      </Button>

      {/* Malgache */}
      <Button
        onClick={() => changeLanguage('mg')}
        style={{
          backgroundColor: isActive('mg') ? '#667eea' : 'transparent',
          borderColor: isActive('mg') ? '#667eea' : 'transparent',
          color: 'white',
          padding: '6px 10px', 
          borderRadius: 0,
          transition: 'background-color 0.2s',
        }}
        title="Malagasy"
      >
        MG
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;