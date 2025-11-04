import React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonGroup, Button } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isActive = (lng) => i18n.language === lng;

  return (
    <ButtonGroup 
      aria-label="Language switcher" 
      size="sm" 
      // Styles pour le ButtonGroup complet
      style={{ 
        width: 'fit-content',
        margin: '0 auto',
        borderRadius: '8px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex', 
        alignItems: 'center', 
        // Fond sombre pour l'ensemble, en harmonie avec la sidebar
        background: 'rgba(0, 0, 0, 0.2)', 
      }}
    >
      {/* Icône de Globe (Font Awesome) */}
      <span 
        className="fas fa-globe" 
        style={{
          color: 'white',
          fontSize: '1rem',
          padding: '0 8px', 
          // Séparateur visuel à droite de l'icône
          borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        }}
      ></span>

      {/* Bouton Français 🇫🇷 */}
      <Button
        // Utilisation des classes Bootstrap et des styles pour l'état actif/inactif
        onClick={() => changeLanguage('fr')}
        style={{
          // Couleur active : bleu/violet comme l'élément actif dans la sidebar
          backgroundColor: isActive('fr') ? '#667eea' : 'transparent', 
          borderColor: isActive('fr') ? '#667eea' : 'transparent',
          color: 'white',
          padding: '6px 10px', 
          borderRadius: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)', // Séparateur entre drapeaux
          transition: 'background-color 0.2s',
        }}
      >
        <span role="img" aria-label="Drapeau Français">🇫🇷</span>
      </Button>

      {/* Bouton Anglais 🇬🇧 */}
      <Button
        onClick={() => changeLanguage('en')}
        style={{
          // Couleur active : bleu/violet
          backgroundColor: isActive('en') ? '#667eea' : 'transparent',
          borderColor: isActive('en') ? '#667eea' : 'transparent',
          color: 'white',
          padding: '6px 10px', 
          borderRadius: 0,
          transition: 'background-color 0.2s',
        }}
      >
        <span role="img" aria-label="Drapeau Anglais">AN</span>
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;