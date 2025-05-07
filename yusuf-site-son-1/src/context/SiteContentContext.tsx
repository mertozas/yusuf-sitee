import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

// İçerik tipi tanımlaması
export interface ContentItem {
  id: string;
  section: 'home' | 'about' | 'events' | 'gallery' | 'projects' | 'contact' | 'social';
  type: 'text' | 'image' | 'link' | 'title' | 'subtitle' | 'event' | 'project' | 'gallery' | 'video' | 'social';
  key: string;
  value: string;       // Varsayılan değer (geriye uyumluluk için)
  tr_value?: string;   // Türkçe değer
  en_value?: string;   // İngilizce değer
  description?: string; // Açıklama (geriye uyumluluk için)
  tr_description?: string; // Türkçe açıklama
  en_description?: string; // İngilizce açıklama
  order?: number;
  date?: string;
  active?: boolean;
  showEmpty?: boolean; // Boş değerleri göster/gizle
  ticketLink?: string; // Bilet satın alma linki
  videoUrl?: string;   // Video URL'si (YouTube, Vimeo vb.)
  socialUrl?: string;  // Sosyal medya hesap linki
  socialType?: 'facebook' | 'x' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok' | 'other'; // Sosyal medya tipi
  socialIcon?: string; // Sosyal medya ikon sınıfı
  coverImage?: string; // Proje kapak görseli
  tr_detail?: string;  // Proje detay sayfası için Türkçe içerik
  en_detail?: string;  // Proje detay sayfası için İngilizce içerik
  projectId?: string;  // Projeler için bağlantı ID'si (aynı projeye ait öğeleri gruplamak için)
}

// Context tipi
interface SiteContentContextType {
  contents: ContentItem[];
  setContents: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  getContentBySection: (section: string) => ContentItem[];
  getContentByKey: (section: string, key: string) => ContentItem | undefined;
  getContentValue: (section: string, key: string) => string;
  updateContent: (updatedItem: ContentItem) => void;
  addContent: (newItem: ContentItem) => void;
  deleteContent: (id: string) => void;
  saveChanges: () => void;
  hasUnsavedChanges: boolean;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [originalContents, setOriginalContents] = useState<ContentItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { language } = useLanguage();

  // Demo içerikler
  const demoContent: ContentItem[] = [
    { id: '1', section: 'home', type: 'title', key: 'heroTitle', value: 'YUSUF ÇELİK', tr_value: 'YUSUF ÇELİK', en_value: 'YUSUF CELIK', description: 'Ana başlık', order: 1, showEmpty: false },
    { id: '2', section: 'home', type: 'subtitle', key: 'heroSubtitle', value: 'Profesyonel Çellist', tr_value: 'Profesyonel Çellist', en_value: 'Professional Cellist', description: 'Alt başlık', order: 2, showEmpty: false },
    { id: '3', section: 'home', type: 'image', key: 'heroImage', value: 'https://i.hizliresim.com/ddmpqse.jpg', tr_value: 'https://i.hizliresim.com/ddmpqse.jpg', en_value: 'https://i.hizliresim.com/ddmpqse.jpg', description: 'Ana sayfa arkaplan', order: 0, showEmpty: false },
    { id: '4', section: 'home', type: 'text', key: 'heroText', value: 'Ödüllü çellist Yusuf Çelik ile klasik müziğin büyülü dünyasına hoş geldiniz.', tr_value: 'Ödüllü çellist Yusuf Çelik ile klasik müziğin büyülü dünyasına hoş geldiniz.', en_value: 'Welcome to the enchanting world of classical music with award-winning cellist Yusuf Çelik.', description: 'Ana sayfa özet yazı', order: 3, showEmpty: false },
    { id: '5', section: 'about', type: 'title', key: 'aboutTitle', value: 'Hakkımda', tr_value: 'Hakkımda', en_value: 'About Me', description: 'Hakkımda başlık', order: 1, showEmpty: false },
    { id: '6', section: 'about', type: 'text', key: 'aboutText', value: 'On yılı aşkın süredir klasik müzik icra eden ödüllü çellist. Yolculuğum prestijli müzik akademilerinde başladı ve Avrupa ve Asya\'nın önde gelen orkestralarıyla performanslara uzandı.', tr_value: 'On yılı aşkın süredir klasik müzik icra eden ödüllü çellist. Yolculuğum prestijli müzik akademilerinde başladı ve Avrupa ve Asya\'nın önde gelen orkestralarıyla performanslara uzandı.', en_value: 'Award-winning cellist with over a decade of experience performing classical music. My journey began at prestigious music academies and has led to performances with renowned orchestras across Europe and Asia.', description: 'Hakkımda yazısı', order: 2, showEmpty: false },
    { id: '7', section: 'about', type: 'image', key: 'aboutImage', value: 'https://i.hizliresim.com/mw2d5l1.jpg', tr_value: 'https://i.hizliresim.com/mw2d5l1.jpg', en_value: 'https://i.hizliresim.com/mw2d5l1.jpg', description: 'Profil fotoğrafı', order: 0, showEmpty: false },
    { id: '21', section: 'about', type: 'subtitle', key: 'aboutQuote', value: 'Müzik, tüm engelleri aşan ve doğrudan ruha hitap eden evrensel bir dildir.', tr_value: 'Müzik, tüm engelleri aşan ve doğrudan ruha hitap eden evrensel bir dildir.', en_value: 'Music is a universal language that transcends all barriers and speaks directly to the soul.', description: 'Alıntı', order: 3, showEmpty: false },
    { id: '8', section: 'events', type: 'event', key: 'event1', value: 'İstanbul Klasik Müzik Festivali', tr_value: 'İstanbul Klasik Müzik Festivali', en_value: 'Istanbul Classical Music Festival', description: 'Etkinlik başlığı', date: '2024-05-15', active: true, order: 1, showEmpty: false },
    { id: '9', section: 'events', type: 'event', key: 'event2', value: 'Ankara Konser Salonu Solo Performans', tr_value: 'Ankara Konser Salonu Solo Performans', en_value: 'Ankara Concert Hall Solo Performance', description: 'Etkinlik başlığı', date: '2024-06-20', active: true, order: 2, showEmpty: false },
    { id: '10', section: 'gallery', type: 'gallery', key: 'gallery1', value: 'https://i.hizliresim.com/jl75bts.jpg', tr_value: 'https://i.hizliresim.com/jl75bts.jpg', en_value: 'https://i.hizliresim.com/jl75bts.jpg', description: 'Berlin Konser Salonu', order: 1, showEmpty: false },
    { id: '11', section: 'gallery', type: 'gallery', key: 'gallery2', value: 'https://i.hizliresim.com/6tly5sa.jpg', tr_value: 'https://i.hizliresim.com/6tly5sa.jpg', en_value: 'https://i.hizliresim.com/6tly5sa.jpg', description: 'Viyana Performansı', order: 2, showEmpty: false },
    { id: '12', section: 'projects', type: 'project', key: 'project1', value: 'Bach Süitleri', tr_value: 'Bach Süitleri', en_value: 'Bach Suites', description: 'Proje başlığı', order: 1, showEmpty: false },
    { id: '13', section: 'projects', type: 'text', key: 'project1Description', value: 'Bach\'ın solo çello süitlerinin modern yorumu', tr_value: 'Bach\'ın solo çello süitlerinin modern yorumu', en_value: 'A modern interpretation of Bach\'s solo cello suites', description: 'Proje açıklaması', order: 2, showEmpty: false },
    { id: '14', section: 'projects', type: 'image', key: 'project1Image', value: 'https://i.hizliresim.com/2kqvgic.jpg', tr_value: 'https://i.hizliresim.com/2kqvgic.jpg', en_value: 'https://i.hizliresim.com/2kqvgic.jpg', description: 'Proje görseli', order: 0, showEmpty: false },
    { id: '15', section: 'contact', type: 'title', key: 'contactTitle', value: 'İletişime Geç', tr_value: 'İletişime Geç', en_value: 'Get in Touch', description: 'İletişim başlık', order: 1, showEmpty: false },
    { id: '16', section: 'contact', type: 'text', key: 'contactText', value: 'Rezervasyonlar, işbirlikleri veya herhangi bir sorunuz için aşağıdaki formu doldurun.', tr_value: 'Rezervasyonlar, işbirlikleri veya herhangi bir sorunuz için aşağıdaki formu doldurun.', en_value: 'For bookings, collaborations or any inquiries, please fill out the form below.', description: 'İletişim açıklama', order: 2, showEmpty: false },
    { id: '17', section: 'contact', type: 'text', key: 'contactEmail', value: 'info@yusufcelik.com', tr_value: 'info@yusufcelik.com', en_value: 'info@yusufcelik.com', description: 'İletişim email', order: 3, showEmpty: false },
    { id: '18', section: 'social', type: 'social', key: 'socialFacebook', value: '', tr_value: '', en_value: '', description: 'Facebook', order: 1, showEmpty: false, socialType: 'facebook', socialUrl: 'https://www.facebook.com/people/Yusuf-Celik-Cellist/61552275212454/#' },
    { id: '19', section: 'social', type: 'social', key: 'socialInstagram', value: '', tr_value: '', en_value: '', description: 'Instagram', order: 2, showEmpty: false, socialType: 'instagram', socialUrl: 'https://www.instagram.com/yusuf_cellist/' },
    { id: '20', section: 'social', type: 'social', key: 'socialYoutube', value: '', tr_value: '', en_value: '', description: 'YouTube', order: 3, showEmpty: true, socialType: 'youtube', socialUrl: 'https://youtube.com' },
  ];

  // Firebase'den verileri yükle
  useEffect(() => {
    const contentsRef = ref(database, 'contents');
    const unsubscribe = onValue(contentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contentsArray = Object.values(data) as ContentItem[];
        setContents(contentsArray);
      } else {
        // Eğer hiç veri yoksa demo içerikleri yükle
        set(contentsRef, demoContent);
        setContents(demoContent);
      }
    });
    return () => unsubscribe();
  }, []);

  // İçerik ekleme
  const addContent = async (content: ContentItem) => {
    try {
      const contentsRef = ref(database, 'contents');
      const newContentRef = push(contentsRef);
      await set(newContentRef, content);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('İçerik eklenirken hata oluştu:', error);
    }
  };

  // İçerik güncelleme
  const updateContent = async (updatedItem: ContentItem) => {
    try {
      const contentRef = ref(database, `contents/${updatedItem.id}`);
      await set(contentRef, updatedItem);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('İçerik güncellenirken hata oluştu:', error);
    }
  };

  // İçerik silme
  const deleteContent = async (id: string) => {
    try {
      const contentRef = ref(database, `contents/${id}`);
      await remove(contentRef);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('İçerik silinirken hata oluştu:', error);
    }
  };

  // Değişiklikleri kaydet
  const saveChanges = async () => {
    try {
      const contentsRef = ref(database, 'contents');
      await set(contentsRef, contents);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Değişiklikler kaydedilirken hata oluştu:', error);
    }
  };

  // İlgili bölüme ait içerikleri getir
  const getContentBySection = (section: string): ContentItem[] => {
    return contents
      .filter(item => item.section === section)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Belirli bir içeriği key ile bul
  const getContentByKey = (section: string, key: string): ContentItem | undefined => {
    return contents.find(item => item.section === section && item.key === key);
  };

  // İçerik değerini dile göre getir
  const getContentValue = (section: string, key: string): string => {
    const item = getContentByKey(section, key);
    if (!item) return '';
    
    // İçerik gizleme ayarına göre kontrol et (showEmpty true olduğunda içerik gizlenecek)
    if (item.showEmpty) {
      return ''; // İçerik gizlenirse boş string döndür
    }
    
    // Dile göre değeri getir
    if (language === 'tr') {
      // Önce tr_value, yoksa value, o da yoksa boş string
      return item.tr_value || item.value || '';
    } else {
      // Önce en_value, yoksa value, o da yoksa boş string
      return item.en_value || item.value || '';
    }
  };

  return (
    <SiteContentContext.Provider value={{
      contents,
      setContents,
      getContentBySection,
      getContentByKey,
      getContentValue,
      updateContent,
      addContent,
      deleteContent,
      saveChanges,
      hasUnsavedChanges
    }}>
      {children}
    </SiteContentContext.Provider>
  );
};

// Custom hook
export const useSiteContent = (): SiteContentContextType => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}; 