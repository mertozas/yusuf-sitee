import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';

const About = () => {
  const { language } = useLanguage();
  const { getContentByKey, getContentValue, contents } = useSiteContent();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aboutSettings, setAboutSettings] = useState({
    title: '',
    text: '',
    quote: '',
    image: '',
    showImage: true,
    showQuote: true
  });

  // İçerikleri yükle ve hazırla
  useEffect(() => {
    // İçerikleri getir - SiteContentContext'teki gerçek keyler
    const aboutTitleContent = getContentByKey('about', 'aboutTitle');
    const aboutTextContent = getContentByKey('about', 'aboutText');
    const aboutImageContent = getContentByKey('about', 'aboutImage');
    const aboutQuoteContent = getContentByKey('about', 'aboutQuote');
    
    console.log('Alıntı içeriği:', aboutQuoteContent);

    // Sabit içerikler - varsayılan değerler
    const defaultContent = {
      tr: {
        title: 'Hakkımda',
        text: 'On yılı aşkın süredir klasik müzik icra eden ödüllü çellist. Yolculuğum prestijli müzik akademilerinde başladı ve Avrupa ve Asya\'nın önde gelen orkestralarıyla performanslara uzandı. Repertuvarım barok dönemden çağdaş klasik müziğe uzanıyor.',
        quote: 'Müzik, tüm engelleri aşan ve doğrudan ruha hitap eden evrensel bir dildir.'
      },
      en: {
        title: 'About Me',
        text: 'Award-winning cellist with over a decade of experience performing classical music. My journey began at prestigious music academies and has led to performances with renowned orchestras across Europe and Asia. My repertoire spans from baroque to contemporary classical music.',
        quote: 'Music is a universal language that transcends all barriers and speaks directly to the soul.'
      }
    };

    // İçerik değerini getir, showEmpty kontrolü ile
    const getContentValueLocal = (contentItem: any, defaultValue: string) => {
      if (!contentItem) return defaultValue;
      
      // İçerik gizlenecekse boş döndür
      if (contentItem.showEmpty) {
        return '';
      }
      
      // Dile göre içerik değerini döndür
      if (language === 'tr') {
        return contentItem.tr_value || contentItem.value || defaultValue;
      } else {
        return contentItem.en_value || contentItem.value || defaultValue;
      }
    };

    // Değerleri hesapla
    const title = getContentValueLocal(aboutTitleContent, defaultContent[language].title);
    const text = getContentValueLocal(aboutTextContent, defaultContent[language].text);
    
    // Alıntı değerini düzgün şekilde al - direkt getContentValue kullanmıyoruz
    const quote = getContentValueLocal(aboutQuoteContent, defaultContent[language].quote);
    
    // Görsel gösterilecek mi kontrolü
    const showImage = !(aboutImageContent?.showEmpty || false);
    
    // Alıntı gösterilecek mi kontrolü
    const showQuote = !(aboutQuoteContent?.showEmpty || false);
    
    // Görsel URL'ini al - Güncel dil tercihine göre
    let imageUrl = '';
    
    if (aboutImageContent) {
      // Önce dile göre değeri dene, yoksa varsayılan değeri kullan
      if (language === 'tr') {
        imageUrl = aboutImageContent.tr_value || aboutImageContent.value || '';
      } else {
        imageUrl = aboutImageContent.en_value || aboutImageContent.value || '';
      }
      
      // Hala görsel yoksa varsayılan görseli kullan
      if (!imageUrl) {
        imageUrl = "https://i.hizliresim.com/p92phyo.jpg";
      }
    } else {
      imageUrl = "https://i.hizliresim.com/p92phyo.jpg";
    }

    // Ayarları güncelle
    setAboutSettings({
      title,
      text,
      quote,
      image: imageUrl,
      showImage,
      showQuote
    });

    // Yükleme durumunu kapat
    setIsLoading(false);
  }, [getContentByKey, getContentValue, language, contents]); // dependency array'e getContentValue ekledik

  // Eğer başlık ve içerik yoksa, bölümü tamamen gizle
  if (!aboutSettings.title && !aboutSettings.text && isLoading === false) {
    return null;
  }

  return (
    <section id="about" className="section bg-secondary/20 dark:bg-black">
      <div className="container">
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image - Sadece showImage true ise göster */}
            {aboutSettings.showImage && aboutSettings.image && (
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={aboutSettings.image} 
                    alt={language === 'tr' ? "Yusuf Çelik profil fotoğrafı" : "Yusuf Celik profile photo"} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://i.hizliresim.com/p92phyo.jpg";
                    }}
                  />
                </div>
                {/* Gold border accent - Ensure visibility in both light and dark modes */}
                <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 border-4 border-gold dark:border-gold rounded-lg -z-10"></div>
              </div>
            )}

            {/* Content */}
            <div className={aboutSettings.showImage && aboutSettings.image ? "" : "col-span-full"}>
              {aboutSettings.title && (
                <h2 className="section-title">{aboutSettings.title}</h2>
              )}
              
              {aboutSettings.text && (
                <p className="text-lg mb-8 leading-relaxed">
                  {aboutSettings.text}
                </p>
              )}
              
              {/* Alıntıyı showQuote true ise göster */}
              {aboutSettings.showQuote && aboutSettings.quote && (
                <blockquote className="border-l-4 border-gold dark:border-gold pl-6 py-2 italic text-xl text-black dark:text-white">
                  "{aboutSettings.quote}"
                </blockquote>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
