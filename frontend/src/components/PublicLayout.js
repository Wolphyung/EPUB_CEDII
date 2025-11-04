import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher'; 

const PublicLayout = ({ children }) => {
  const { t } = useTranslation();

  return (
    <div>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 30px', 
        backgroundColor: '#f8f8f8'
      }}>
        {/* Navigation avec clés de traduction */}
        <nav style={{ display: 'flex', gap: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>{t('accueil')}</Link>
            <Link to="/publications" style={{ textDecoration: 'none' }}>{t('publications')}</Link>
            <Link to="/membres" style={{ textDecoration: 'none' }}>{t('membres')}</Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>{t('connexion')}</Link> 
        </nav>
        
        {/* SÉLECTEUR DE LANGUE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{t('language_selector')}:</span>
            <LanguageSwitcher />
        </div>
      </header>

      {/* Les 'children' sont le contenu spécifique à la page (PublicationsList, etc.) */}
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        {children}
      </main>
      
      {/* Pied de page traduit */}
      <footer style={{ textAlign: 'center', padding: '10px', borderTop: '1px solid #eee' }}>
        <p>&copy; 2025 - {t('tous_droits_réservés')}</p>
      </footer>
    </div>
  );
};

export default PublicLayout;