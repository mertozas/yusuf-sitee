import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('events'), href: '/events' },
    { name: t('gallery'), href: '/gallery' },
    { name: t('projects'), href: '/projects' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed w-full z-50 transition-all duration-300',
          scrolled 
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md py-3 shadow-md' 
            : 'bg-transparent py-6'
        )}
      >
        <div className="container flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-bold gold-gradient">
            YUSUF ÇELİK
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 relative">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href}
                className="hover-gold font-medium text-foreground relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLanguage}
              className="rounded-full"
            >
              <span className="text-sm font-medium">
                {language === 'en' ? 'TR' : 'EN'}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              className="rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background dark:bg-black pt-24 px-6">
          <div className="flex flex-col items-center gap-6 text-lg">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href}
                className="hover-gold font-medium py-2 relative group"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            <div className="flex items-center gap-6 mt-6">
              <Button 
                variant="ghost" 
                onClick={toggleLanguage}
                className="rounded-full"
              >
                <span className="text-sm font-medium">
                  {language === 'en' ? 'TR' : 'EN'}
                </span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
