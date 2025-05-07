import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';

const Hero = () => {
  const { language } = useLanguage();
  const { getContentByKey, contents } = useSiteContent();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [heroSettings, setHeroSettings] = useState({
    title: '',
    subtitle: '',
    text: '',
    image: ''
  });

  // İçerikleri yükle ve hazırla
  useEffect(() => {
    // İçerikleri getir
    const heroTitleContent = getContentByKey('home', 'heroTitle');
    const heroSubtitleContent = getContentByKey('home', 'heroSubtitle');
    const heroImageContent = getContentByKey('home', 'heroImage');
    const heroTextContent = getContentByKey('home', 'heroText');

    // Sabit içerikler - veritabanından gelmezse ve showEmpty değeri false ise gösterilecek
    const defaultContent = {
      tr: {
        title: "YUSUF ÇELİK",
        subtitle: "Profesyonel Çellist",
        text: "Ödüllü çellist Yusuf Çelik ile klasik müziğin büyülü dünyasına hoş geldiniz."
      },
      en: {
        title: "YUSUF CELIK",
        subtitle: "Professional Cellist",
        text: "Welcome to the enchanting world of classical music with award-winning cellist Yusuf Celik."
      }
    };

    // Dil ve içerik durumunu kontrol et (boş içerik gösterme ayarı)
    const getContentValue = (contentItem: any, defaultValue: string) => {
      if (!contentItem) return defaultValue;
      
      // İçerik boş bırakılmak isteniyorsa (showEmpty true ise) boş döndür
      if (contentItem.showEmpty) {
        return '';  // Boş string döndür, hiçbir şey gösterme
      }
      
      // Değilse dile göre içeriği getir, varsayılan değere geri dön
      if (language === 'tr') {
        // tr_value boşsa ama showEmpty false ise, varsayılan değer göster
        return contentItem.tr_value || contentItem.value || defaultValue;
      } else {
        // en_value boşsa ama showEmpty false ise, varsayılan değer göster
        return contentItem.en_value || contentItem.value || defaultValue;
      }
    };

    // Her içerik öğesi için değerleri hesapla
    const title = getContentValue(heroTitleContent, defaultContent[language].title);
    const subtitle = getContentValue(heroSubtitleContent, defaultContent[language].subtitle);
    const text = getContentValue(heroTextContent, defaultContent[language].text);
    
    // Arkaplan resmi - Dil seçimine göre doğru resmi kullan
    const image = language === 'tr'
      ? (heroImageContent?.tr_value || heroImageContent?.value || "https://via.placeholder.com/1920x1080?text=Görsel+Bulunamadı") 
      : (heroImageContent?.en_value || heroImageContent?.value || "https://via.placeholder.com/1920x1080?text=Image+Not+Found");

    // Hero ayarlarını güncelle
    setHeroSettings({
      title,
      subtitle,
      text,
      image
    });

    // Yükleme durumunu kapat
    setIsLoading(false);
  }, [getContentByKey, language, contents]); // contents'i dependency array'e ekledik

  return (
    <section 
      id="home" 
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${heroSettings.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Arka plan görselini optimize etmek için bir img elementi kullanma seçeneği */}
        <img 
          src={heroSettings.image}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0 }} // Görsel zaten arka planda olduğu için gizliyoruz
          onLoad={(e) => {
            // Görsel yüklendiğinde container'ın bg-image stilini güncelliyoruz
            const img = e.target as HTMLImageElement;
            const container = img.parentElement;
            if (container) {
              container.style.backgroundImage = `url('${heroSettings.image}')`;
            }
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Content - Sadece yükleme tamamlandığında ve içerik varsa göster */}
      {!isLoading && (
        <div className="container relative z-10 text-center text-white">
          {heroSettings.title && (
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fadeIn">
              {heroSettings.title}
            </h1>
          )}
          
          {heroSettings.subtitle && (
            <h2 className="text-2xl md:text-3xl font-light mb-8 animate-fadeIn animation-delay-300">
              {heroSettings.subtitle}
            </h2>
          )}
          
          {heroSettings.text && (
            <p className="max-w-2xl mx-auto text-lg opacity-90 mb-8 animate-fadeIn animation-delay-600">
              {heroSettings.text}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default Hero;
