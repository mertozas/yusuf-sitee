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

  // Firebase'den verileri yükle
  useEffect(() => {
    const contentsRef = ref(database, 'contents');
    const unsubscribe = onValue(contentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contentsArray = Object.values(data) as ContentItem[];
        setContents(contentsArray);
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