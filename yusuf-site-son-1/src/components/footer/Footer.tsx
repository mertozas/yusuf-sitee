import React from 'react';
import { Facebook, Instagram, Youtube, Music, Linkedin, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';

const Footer = () => {
  const { t } = useLanguage();
  const { getContentBySection } = useSiteContent();

  // Sosyal medya linklerini getir
  const socialMediaLinks = getContentBySection('social')
    .filter(item => {
      // Sadece sosyal medya tipindeki ve gizli olmayanları dahil et
      return item.type === 'social' && !item.showEmpty && item.socialUrl;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Admin panelinden gelen sosyal medya linklerini oluştur
  const socialLinks = socialMediaLinks.map(link => {
    const getLinkIcon = () => {
      switch (link.socialType) {
        case 'facebook':
          return <Facebook className="h-4 w-4" />;
        case 'x':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          );
        case 'instagram':
          return <Instagram className="h-4 w-4" />;
        case 'youtube':
          return <Youtube className="h-4 w-4" />;
        case 'linkedin':
          return <Linkedin className="h-4 w-4" />;
        case 'tiktok':
          return <Music className="h-4 w-4" />;
        default:
          return <Share2 className="h-4 w-4" />;
      }
    };

    return {
      name: link.description || link.socialType || 'Link',
      icon: getLinkIcon(),
      url: link.socialUrl || '#'
    };
  });

  return (
    <footer className="bg-black text-white py-6">
      <div className="container">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <a href="#" className="text-xl font-serif font-bold gold-gradient mb-4">
            YUSUF ÇELİK
          </a>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-3">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-gold transition-colors duration-300 p-2 rounded-full text-white hover:text-black"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Copyright */}
          <p className="text-xs text-white/60 text-center">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
