import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'tr';

type Translations = {
  [key: string]: {
    en: string;
    tr: string;
  };
};

const translations: Translations = {
  // Navigation
  home: { en: 'Home', tr: 'Ana Sayfa' },
  about: { en: 'About', tr: 'Hakkında' },
  events: { en: 'Events', tr: 'Etkinlikler' },
  gallery: { en: 'Gallery', tr: 'Galeri' },
  projects: { en: 'Projects', tr: 'Projeler' },
  contact: { en: 'Contact', tr: 'İletişim' },
  
  // Hero Section
  heroTitle: { en: 'YUSUF ÇELİK', tr: 'YUSUF ÇELİK' },
  heroSubtitle: { en: 'Professional Cellist', tr: 'Profesyonel Çellist' },
  listenNow: { en: 'Watch Performance', tr: 'Performansı İzle' },
  learnMore: { en: 'Learn More', tr: 'Daha Fazla' },
  
  // About Section
  aboutTitle: { en: 'About Me', tr: 'Hakkımda' },
  aboutText: { 
    en: 'Award-winning cellist with over a decade of experience performing classical music. My journey began at prestigious music academies and has led to performances with renowned orchestras across Europe and Asia. My repertoire spans from baroque to contemporary classical music.',
    tr: 'On yılı aşkın süredir klasik müzik icra eden ödüllü çellist. Yolculuğum prestijli müzik akademilerinde başladı ve Avrupa ve Asya\'nın önde gelen orkestralarıyla performanslara uzandı. Repertuvarım barok dönemden çağdaş klasik müziğe uzanıyor.'
  },
  aboutQuote: {
    en: 'Music is the universal language that transcends all barriers and speaks directly to the soul.',
    tr: 'Müzik, tüm engelleri aşan ve doğrudan ruha hitap eden evrensel bir dildir.'
  },

  // Events Section
  eventsTitle: { en: 'Upcoming Events', tr: 'Yaklaşan Etkinlikler' },
  viewAll: { en: 'View All', tr: 'Tümünü Gör' },
  getTickets: { en: 'Get Tickets', tr: 'Bilet Al' },
  viewAllEvents: { en: 'All Upcoming Events', tr: 'Tüm Yaklaşan Etkinlikler' },
  
  // Gallery Section
  galleryTitle: { en: 'Media Gallery', tr: 'Medya Galerisi' },
  photos: { en: 'Photos', tr: 'Fotoğraflar' },
  videos: { en: 'Videos', tr: 'Videolar' },
  viewGallery: { en: 'View Gallery', tr: 'Galeriyi Görüntüle' },

  // Projects Section
  projectsTitle: { en: 'Recent Projects', tr: 'Son Projeler' },
  projectTitle1: { en: 'Bach Suites', tr: 'Bach Süitleri' },
  projectTitle2: { en: 'Chamber Music Series', tr: 'Oda Müziği Serisi' },
  projectTitle3: { en: 'Contemporary Compositions', tr: 'Çağdaş Besteler' },
  viewDetails: { en: 'View Details', tr: 'Detayları Gör' },
  viewAllProjects: { en: 'All Projects', tr: 'Tüm Projeler' },
  backToProjects: { en: 'Back to Projects', tr: 'Projelere Dön' },

  // Project Details
  projectTitle: { en: 'Project Details', tr: 'Proje Detayları' },
  projectBackground: { en: 'Background', tr: 'Arka Plan' },
  projectDescription: { 
    en: 'A detailed description of the project and its significance in the classical music landscape.',
    tr: 'Projenin detaylı açıklaması ve klasik müzik dünyasındaki önemi.'
  },
  projectContent: {
    en: 'The project explores the intersection of classical repertoire and contemporary interpretation, bringing new life to timeless compositions.',
    tr: 'Proje, klasik repertuar ile çağdaş yorumun kesişimini keşfediyor ve zamansız bestelere yeni bir yaşam getiriyor.'
  },
  
  // Contact Section
  contactTitle: { en: 'Get in Touch', tr: 'İletişime Geç' },
  contactText: { 
    en: 'For bookings, collaborations or any inquiries, please fill out the form below.',
    tr: 'Rezervasyonlar, işbirlikleri veya herhangi bir sorunuz için lütfen aşağıdaki formu doldurun.'
  },
  nameLabel: { en: 'Name', tr: 'İsim' },
  emailLabel: { en: 'Email', tr: 'E-posta' },
  messageLabel: { en: 'Message', tr: 'Mesaj' },
  submitButton: { en: 'Send Message', tr: 'Mesaj Gönder' },
  
  // Footer
  followMe: { en: 'Follow Me', tr: 'Beni Takip Et' },
  copyright: { en: '© 2025 Yusuf Çelik. All rights reserved.', tr: '© 2025 Yusuf Çelik. Tüm hakları saklıdır.' },
  backToHome: { en: 'Back to Home', tr: 'Ana Sayfaya Dön' },
};

type LanguageContextType = {
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initialize state from localStorage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('appLanguage');
    return (storedLanguage === 'tr' || storedLanguage === 'en') ? storedLanguage : 'en';
  });

  // 2. Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
