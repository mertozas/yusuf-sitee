import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteContent, ContentItem } from '@/context/SiteContentContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from '@/components/ui/file-upload';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ContentItem['section']>('home');
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>('tr'); // Aktif dil sekmesi
  
  // Site içerik ve dil context'lerini kullan
  const { 
    contents, 
    setContents, 
    updateContent, 
    addContent, 
    deleteContent, 
    saveChanges,
    hasUnsavedChanges,
    getContentBySection,
    getContentByKey
  } = useSiteContent();
  
  const { language, setLanguage } = useLanguage();

  // Projeler bölümü ilk açıldığında proje detay başlığının olup olmadığını kontrol et
  useEffect(() => {
    if (activeSection === 'projects') {
      const hasProjectDetailsTitle = getContentByKey('projects', 'projectDetailsTitle');
      
      // Eğer proje detay başlığı yoksa, oluştur
      if (!hasProjectDetailsTitle) {
        const newProjectDetailsTitle: ContentItem = {
          id: Date.now().toString(),
          section: 'projects',
          type: 'title',
          key: 'projectDetailsTitle',
          value: 'Proje Detayları',
          tr_value: 'Proje Detayları',
          en_value: 'Project Details',
          description: 'Proje detay başlığı',
          order: contents.filter(item => item.section === 'projects').length + 1,
          showEmpty: false
        };
        
        addContent(newProjectDetailsTitle);
      }
    }
  }, [activeSection, getContentByKey, addContent, contents]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin');
  };

  // Yeni öğe ekleme
  const handleAddItem = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      section: activeSection,
      type: activeSection === 'social' ? 'social' : 'text',
      key: `new_${Date.now()}`,
      value: '',
      tr_value: '',
      en_value: '',
      description: activeSection === 'social' ? 'Sosyal Medya Hesabı' : 'Yeni öğe',
      order: contents.filter(item => item.section === activeSection).length + 1,
      showEmpty: false,
      socialType: activeSection === 'social' ? 'facebook' : undefined
    };
    
    addContent(newItem);
    setEditingItem(newItem);
  };

  // Öğe silme
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Bu öğeyi silmek istediğinize emin misiniz?')) {
      deleteContent(id);
      if (editingItem && editingItem.id === id) {
        setEditingItem(null);
      }
    }
  };

  // Öğe güncelleme
  const handleUpdateItem = () => {
    if (editingItem) {
      updateContent(editingItem);
      setEditingItem(null);
      setImagePreview(null);
      setVideoPreview(null);
    }
  };

  // Değişiklikleri kaydet
  const handleSaveChanges = () => {
    setIsLoading(true);
    // Site genelinde değişiklikleri kaydet
    saveChanges();
    
    // Başarılı bildirim göster
    toast({
      title: "Değişiklikler Kaydedildi",
      description: "Tüm değişiklikler başarıyla kaydedildi ve sitede güncellendi.",
      variant: "default",
    });
    
    setIsLoading(false);
  };

  // Görseller için önizleme
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, langField?: 'tr_value' | 'en_value') => {
    if (editingItem) {
      const value = e.target.value;
      
      // Dile özgü alan varsa o alanı güncelle
      if (langField) {
        setEditingItem({...editingItem, [langField]: value});
      } else {
        // Ana value değerini güncelle
        setEditingItem({...editingItem, value});
      }
      
      // Eğer görsel, Hakkında bölümünün profil fotoğrafı ise, 
      // hem value hem de dil değerlerini güncelle
      if (editingItem.section === 'about' && editingItem.key === 'aboutImage') {
        if (langField === 'tr_value') {
          // Türkçe değeri güncelleniyorsa value'yu da güncelle
          setEditingItem({...editingItem, tr_value: value, value});
        } else if (langField === 'en_value') {
          // İngilizce değeri güncelleniyorsa value'yu tr_value ile güncelle 
          // (eğer tr_value varsa)
          if (editingItem.tr_value) {
            setEditingItem({...editingItem, en_value: value});
          } else {
            setEditingItem({...editingItem, en_value: value, value});
          }
        } else {
          // Ana değer güncelleniyorsa tüm dil değerlerini de güncelle
          setEditingItem({...editingItem, value, tr_value: value, en_value: value});
        }
      }
      
      setImagePreview(value);
    }
  };

  // Dili değiştir (Önizleme için)
  const handleLanguageChange = (lang: 'tr' | 'en') => {
    setLanguage(lang);
  };

  // Video URL değişikliği
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingItem) {
      const url = e.target.value;
      setEditingItem({...editingItem, videoUrl: url});
      setVideoPreview(url);
    }
  };

  // Dosya yükleme başarılı olduğunda
  const handleFileUploadSuccess = (fileUrl: string, langField?: 'tr_value' | 'en_value') => {
    if (editingItem) {
      // Dile özgü alan varsa o alanı güncelle
      if (langField) {
        setEditingItem({...editingItem, [langField]: fileUrl});
      } else {
        // Ana value değerini güncelle
        setEditingItem({...editingItem, value: fileUrl});
      }
      
      // Eğer görsel, Hakkında bölümünün profil fotoğrafı ise, 
      // hem value hem de dil değerlerini güncelle
      if (editingItem.section === 'about' && editingItem.key === 'aboutImage') {
        if (langField === 'tr_value') {
          // Türkçe değeri güncelleniyorsa value'yu da güncelle
          setEditingItem({...editingItem, tr_value: fileUrl, value: fileUrl});
        } else if (langField === 'en_value') {
          // İngilizce değeri güncelleniyorsa value'yu tr_value ile güncelle 
          // (eğer tr_value varsa)
          if (editingItem.tr_value) {
            setEditingItem({...editingItem, en_value: fileUrl});
          } else {
            setEditingItem({...editingItem, en_value: fileUrl, value: fileUrl});
          }
        } else {
          // Ana değer güncelleniyorsa tüm dil değerlerini de güncelle
          setEditingItem({...editingItem, value: fileUrl, tr_value: fileUrl, en_value: fileUrl});
        }
      }
      
      setImagePreview(fileUrl);
    }
  };

  // Video dosyası yükleme başarılı olduğunda
  const handleVideoUploadSuccess = (fileUrl: string) => {
    if (editingItem) {
      setEditingItem({...editingItem, videoUrl: fileUrl, type: 'video'});
      setVideoPreview(fileUrl);
    }
  };

  // Aktif sekmeye göre içerikleri filtrele
  const filteredContents = getContentBySection(activeSection);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-extrabold text-white">
                Yusuf Çelik | Site Yönetim Paneli
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Dil Seçici */}
              <div className="flex items-center bg-slate-700 rounded-md p-1 mr-4">
                <button
                  onClick={() => handleLanguageChange('tr')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'tr' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🇹🇷 Türkçe
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
              
              {hasUnsavedChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-all"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Yan Menü */}
          <div className="md:w-1/4">
            <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700 sticky top-24">
              <div className="bg-slate-700 px-4 py-3">
                <h2 className="text-lg font-extrabold text-white">Site Bölümleri</h2>
              </div>
              <nav className="p-2 space-y-1">
                <button
                  onClick={() => {setActiveSection('home'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'home' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  🏠 Ana Sayfa
                </button>
                <button
                  onClick={() => {setActiveSection('about'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'about' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  👤 Hakkında
                </button>
                <button
                  onClick={() => {setActiveSection('events'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'events' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  📅 Etkinlikler
                </button>
                <button
                  onClick={() => {setActiveSection('gallery'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'gallery' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  🖼️ Galeri
                </button>
                <button
                  onClick={() => {setActiveSection('projects'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'projects' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  🎯 Projeler
                </button>
                <button
                  onClick={() => {setActiveSection('social'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'social' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  🔗 Sosyal Medya Hesapları
                </button>
                <button
                  onClick={() => {setActiveSection('contact'); setEditingItem(null);}}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all font-medium ${activeSection === 'contact' 
                    ? 'bg-blue-600 text-white font-bold shadow-md' 
                    : 'hover:bg-slate-700 text-slate-200 hover:text-white'}`}
                >
                  ✉️ İletişim
                </button>
              </nav>
            </div>
          </div>

          {/* Ana İçerik */}
          <div className="md:w-3/4 space-y-6">
            {/* İçerik Başlığı */}
            <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
              <div className="bg-slate-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-extrabold text-white">
                    {activeSection === 'home' && '🏠 Ana Sayfa İçeriği'}
                    {activeSection === 'about' && '👤 Hakkında İçeriği'}
                    {activeSection === 'events' && '📅 Etkinlikler İçeriği'}
                    {activeSection === 'gallery' && '🖼️ Galeri İçeriği'}
                    {activeSection === 'projects' && '🎯 Projeler İçeriği'}
                    {activeSection === 'social' && '🔗 Sosyal Medya Hesapları'}
                    {activeSection === 'contact' && '✉️ İletişim İçeriği'}
                  </h2>
                  <button
                    onClick={handleAddItem}
                    className="bg-green-600 text-white font-bold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-green-500 transition-all shadow-md"
                  >
                    + Yeni Öğe Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* İçerik Listesi */}
            {isLoading ? (
              <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center border border-slate-700">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-500 rounded-full mb-2"></div>
                <p className="text-white font-medium">İçerikler yükleniyor...</p>
              </div>
            ) : filteredContents.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center border border-slate-700">
                <div className="inline-block p-4 rounded-full bg-slate-700 text-slate-300 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-white text-lg font-medium">Bu bölümde henüz içerik bulunmuyor.</p>
                <p className="text-slate-300 mt-1">Yeni içerik eklemek için "Yeni Öğe Ekle" butonunu kullanabilirsiniz.</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-600">
                    <thead>
                      <tr className="bg-slate-700">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          TÜR
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          AÇIKLAMA
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                          {language === 'tr' ? 'TÜRKÇE DEĞER' : 'İNGİLİZCE DEĞER'}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                          İŞLEMLER
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-600">
                      {filteredContents.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                              ${item.type === 'image' ? 'bg-purple-600 text-white' : 
                                item.type === 'title' ? 'bg-yellow-600 text-white' :
                                item.type === 'text' ? 'bg-blue-600 text-white' :
                                item.type === 'event' ? 'bg-green-600 text-white' :
                                item.type === 'gallery' ? 'bg-pink-600 text-white' :
                                item.type === 'project' ? 'bg-indigo-600 text-white' :
                                item.type === 'video' ? 'bg-red-600 text-white' :
                                item.type === 'social' ? 'bg-teal-600 text-white' :
                                'bg-gray-600 text-white'}`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                            {item.description}
                            {item.showEmpty && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-800 text-yellow-200 rounded-full">
                                Boş içerik göster
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-white max-w-xs truncate">
                            {(item.type === 'image' || item.type === 'gallery') ? (
                              <div className="flex items-center">
                                <img 
                                  src={language === 'tr' ? (item.tr_value || item.value) : (item.en_value || item.value)} 
                                  alt={item.description} 
                                  className="h-12 w-20 object-cover rounded border border-slate-600 shadow-sm"
                                  onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Görsel+Yüklenemedi'}
                                />
                                <span className="ml-2 text-xs text-slate-300 font-medium truncate max-w-[150px]">
                                  {language === 'tr' ? (item.tr_value || item.value) : (item.en_value || item.value)}
                                </span>
                              </div>
                            ) : item.type === 'video' ? (
                              <div className="flex items-center">
                                <div className="h-12 w-20 bg-slate-700 flex items-center justify-center rounded border border-slate-600 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                  </svg>
                                </div>
                                <span className="ml-2 text-xs text-slate-300 font-medium truncate max-w-[150px]">
                                  {item.videoUrl || "Video URL eksik"}
                                </span>
                              </div>
                            ) : item.type === 'social' ? (
                              <div className="flex items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                                  ${item.socialType === 'facebook' ? 'bg-blue-600' : 
                                    item.socialType === 'x' ? 'bg-sky-500' :
                                    item.socialType === 'instagram' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500' :
                                    item.socialType === 'youtube' ? 'bg-red-600' :
                                    item.socialType === 'linkedin' ? 'bg-blue-700' :
                                    item.socialType === 'tiktok' ? 'bg-black' :
                                    'bg-slate-500'}`
                                }>
                                  {item.socialType === 'facebook' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                    </svg>
                                  )}
                                  {item.socialType === 'x' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                  )}
                                  {item.socialType === 'instagram' && (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                      </svg>
                                    </div>
                                  )}
                                  {item.socialType === 'youtube' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                  )}
                                  {item.socialType === 'linkedin' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                                    </svg>
                                  )}
                                  {item.socialType === 'tiktok' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                    </svg>
                                  )}
                                  {item.socialType === 'other' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                    </svg>
                                  )}
                                </div>
                                <span className="ml-2 text-xs text-slate-300 font-medium truncate max-w-[150px]">
                                  {item.socialUrl || "URL eksik"} 
                                  {item.showEmpty && <span className="ml-2 text-yellow-300">(Gizli)</span>}
                                </span>
                              </div>
                            ) : (
                              <div className="max-w-xs truncate font-medium text-white">
                                {language === 'tr' ? (item.tr_value || item.value) : (item.en_value || item.value) || (
                                  <span className="italic text-gray-400">Boş</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => setEditingItem(item)}
                              className="text-white font-bold bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors mr-2 shadow-sm"
                            >
                              Düzenle
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-white font-bold bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors shadow-sm"
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Düzenleme Formu */}
            {editingItem && (
              <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
                <div className="bg-slate-700 px-6 py-4">
                  <h3 className="text-lg font-extrabold text-white">
                    {editingItem.id.startsWith('new_') ? 'Yeni İçerik Ekle' : 'İçerik Düzenle'}
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Tip</label>
                    <select 
                      value={editingItem.type}
                      onChange={(e) => setEditingItem({...editingItem, type: e.target.value as ContentItem['type']})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="text">Metin</option>
                      <option value="title">Başlık</option>
                      <option value="subtitle">Alt Başlık</option>
                      <option value="image">Görsel</option>
                      <option value="link">Bağlantı</option>
                      <option value="event">Etkinlik</option>
                      <option value="project">Proje</option>
                      <option value="gallery">Galeri</option>
                      <option value="video">Video</option>
                      <option value="social">Sosyal Medya</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Anahtar (Benzersiz Kimlik)</label>
                    <input 
                      type="text" 
                      value={editingItem.key}
                      onChange={(e) => setEditingItem({...editingItem, key: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İçerik anahtarı (örn: heroImage, aboutTitle)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Açıklama</label>
                    <input 
                      type="text" 
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="İçerik açıklaması"
                    />
                  </div>

                  {/* Dil Tabları */}
                  <div className="border border-slate-600 rounded-md mt-4">
                    <div className="bg-slate-700 p-2 border-b border-slate-600">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white">İçerik Değerleri</h4>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab('tr')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              activeTab === 'tr' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:text-white'
                            }`}
                          >
                            🇹🇷 Türkçe
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('en')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              activeTab === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300 hover:text-white'
                            }`}
                          >
                            🇬🇧 İngilizce
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* Türkçe değer */}
                      {activeTab === 'tr' && (
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">Türkçe Değer</label>
                          {editingItem.type === 'image' || editingItem.type === 'gallery' ? (
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={editingItem.tr_value || ''}
                                onChange={(e) => handleImageChange(e, 'tr_value')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Görsel URL'i"
                              />
                              
                              {/* Dosya Yükleme Komponenti */}
                              <div className="mt-4 p-3 border border-blue-600/30 rounded-md bg-blue-600/10">
                                <h4 className="text-sm font-bold text-blue-400 mb-2">Bilgisayardan Yükle</h4>
                                <FileUpload 
                                  onUploadSuccess={(url) => handleFileUploadSuccess(url, 'tr_value')} 
                                  label="Görsel Yükle" 
                                  uploadFolder={editingItem.section}
                                />
                              </div>
                              
                              {imagePreview && (
                                <div className="mt-2">
                                  <p className="text-sm text-slate-300 mb-1">Görsel Önizleme:</p>
                                  <img 
                                    src={imagePreview} 
                                    alt="Önizleme" 
                                    className="h-32 object-contain border border-slate-600 rounded-md shadow-sm"
                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Görsel+Yüklenemedi'}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea 
                              value={editingItem.tr_value || ''}
                              onChange={(e) => setEditingItem({...editingItem, tr_value: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={4}
                              placeholder="Türkçe içerik"
                            />
                          )}
                        </div>
                      )}
                      
                      {/* İngilizce değer */}
                      {activeTab === 'en' && (
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">İngilizce Değer</label>
                          {editingItem.type === 'image' || editingItem.type === 'gallery' ? (
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={editingItem.en_value || ''}
                                onChange={(e) => handleImageChange(e, 'en_value')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Görsel URL'i"
                              />
                              
                              {/* Dosya Yükleme Komponenti */}
                              <div className="mt-4 p-3 border border-blue-600/30 rounded-md bg-blue-600/10">
                                <h4 className="text-sm font-bold text-blue-400 mb-2">Bilgisayardan Yükle</h4>
                                <FileUpload 
                                  onUploadSuccess={(url) => handleFileUploadSuccess(url, 'en_value')} 
                                  label="Görsel Yükle" 
                                  uploadFolder={editingItem.section}
                                />
                              </div>
                              
                              {imagePreview && (
                                <div className="mt-2">
                                  <p className="text-sm text-slate-300 mb-1">Görsel Önizleme:</p>
                                  <img 
                                    src={imagePreview} 
                                    alt="Önizleme" 
                                    className="h-32 object-contain border border-slate-600 rounded-md shadow-sm"
                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Görsel+Yüklenemedi'}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea 
                              value={editingItem.en_value || ''}
                              onChange={(e) => setEditingItem({...editingItem, en_value: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={4}
                              placeholder="İngilizce içerik"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Ana sayfa özel ayarları */}
                  {editingItem.section === 'home' && (
                    <div className="mt-4 p-4 border border-yellow-600/30 rounded-md bg-yellow-600/10">
                      <h4 className="text-sm font-bold text-yellow-400 mb-2">Ana Sayfa Özel Ayarları</h4>
                      
                      {editingItem.key === 'heroTitle' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-hero-title"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-hero-title" className="ml-2 block text-sm text-yellow-300">
                            Ana sayfa başlığını kaldır (sadece bu başlık gizlenecek)
                          </label>
                        </div>
                      )}
                      
                      {editingItem.key === 'heroSubtitle' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-hero-subtitle"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-hero-subtitle" className="ml-2 block text-sm text-yellow-300">
                            Ana sayfa alt başlığını kaldır (sadece bu alt başlık gizlenecek)
                          </label>
                        </div>
                      )}
                      
                      {editingItem.key === 'heroText' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-hero-text"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-hero-text" className="ml-2 block text-sm text-yellow-300">
                            Ana sayfa açıklama metnini kaldır (sadece bu açıklama metni gizlenecek)
                          </label>
                        </div>
                      )}
                      
                      {/* Hero içeriğinin tamamını gizleme özelliği */}
                      {(editingItem.key === 'heroTitle' || editingItem.key === 'heroSubtitle' || editingItem.key === 'heroText') && (
                        <div className="mt-4 pt-3 border-t border-yellow-600/30">
                          <p className="text-xs text-yellow-300 mb-2">
                            <span className="font-semibold">Önemli:</span> Aşağıdaki buton tüm ana sayfa yazılarını tek seferde gizler veya gösterir.
                          </p>
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-yellow-500 text-xs leading-4 font-medium rounded-md text-yellow-300 bg-transparent hover:bg-yellow-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            onClick={() => {
                              // Tüm Hero yazılarını gizle
                              const contentIds = ['heroTitle', 'heroSubtitle', 'heroText'];
                              const shouldHide = !contentIds.every(key => {
                                const item = contents.find(c => c.section === 'home' && c.key === key);
                                return item?.showEmpty === true;
                              });
                              
                              // Hero başlık, alt başlık ve metin içeriklerini güncelle
                              setContents(prevContents => prevContents.map(item => {
                                if (item.section === 'home' && contentIds.includes(item.key)) {
                                  return { ...item, showEmpty: shouldHide };
                                }
                                return item;
                              }));
                              
                              // Eğer şu an düzenlenen öğe bu içeriklerden biriyse, onu da güncelle
                              if (contentIds.includes(editingItem.key)) {
                                setEditingItem({ ...editingItem, showEmpty: shouldHide });
                              }
                              
                              // Bildirim göster
                              toast({
                                title: shouldHide ? "Ana Sayfa Yazıları Gizlendi" : "Ana Sayfa Yazıları Gösterildi",
                                description: shouldHide 
                                  ? "Ana sayfada artık sadece arka plan görseli görünecek."
                                  : "Ana sayfa yazıları tekrar görünür hale getirildi.",
                                variant: "default",
                              });
                            }}
                          >
                            {contents.filter(c => 
                              c.section === 'home' && 
                              ['heroTitle', 'heroSubtitle', 'heroText'].includes(c.key) && 
                              c.showEmpty === true
                            ).length === 3 
                              ? "Tüm Ana Sayfa Yazılarını Göster" 
                              : "Tüm Ana Sayfa Yazılarını Gizle"
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Hakkında sayfası özel ayarları */}
                  {editingItem.section === 'about' && (
                    <div className="mt-4 p-4 border border-blue-600/30 rounded-md bg-blue-600/10">
                      <h4 className="text-sm font-bold text-blue-400 mb-2">Hakkında Sayfası Özel Ayarları</h4>
                      
                      {/* Hakkında başlık kontrolü */}
                      {editingItem.key === 'aboutTitle' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-about-title"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-about-title" className="ml-2 block text-sm text-blue-300">
                            Hakkında başlığını gizle
                          </label>
                        </div>
                      )}
                      
                      {/* Hakkında metni kontrolü */}
                      {editingItem.key === 'aboutText' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-about-text"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-about-text" className="ml-2 block text-sm text-blue-300">
                            Hakkında metnini gizle
                          </label>
                        </div>
                      )}
                      
                      {/* Hakkında görsel kontrolü */}
                      {editingItem.key === 'aboutImage' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-about-image"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-about-image" className="ml-2 block text-sm text-blue-300">
                            Hakkında görselini gizle
                          </label>
                        </div>
                      )}
                      
                      {/* Alıntı kontrolü */}
                      {editingItem.key === 'aboutQuote' && (
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="hide-about-quote"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-about-quote" className="ml-2 block text-sm text-blue-300">
                            Alıntıyı gizle
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Sosyal medya özel ayarları */}
                  {editingItem.section === 'social' && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Sosyal Medya Tipi</label>
                        <select 
                          value={editingItem.socialType || 'other'}
                          onChange={(e) => setEditingItem({...editingItem, socialType: e.target.value as ContentItem['socialType']})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="x">X (Twitter)</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="tiktok">TikTok</option>
                          <option value="other">Diğer</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">Sosyal Medya URL</label>
                        <input 
                          type="text" 
                          value={editingItem.socialUrl || ''}
                          onChange={(e) => setEditingItem({...editingItem, socialUrl: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.instagram.com/kullaniciadi"
                        />
                        <p className="text-xs text-slate-400 mt-1">Sosyal medya profilinizin tam URL'sini girin</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Galeri özel alanları */}
                  {(editingItem.type === 'gallery' || editingItem.type === 'image') && (
                    <div>
                      <div className="mt-4 p-4 border border-purple-600/30 rounded-md bg-purple-600/10">
                        <h4 className="text-sm font-bold text-purple-400 mb-2">Görsel Açıklaması</h4>
                        <p className="text-xs text-purple-300 mb-3">
                          Bu açıklama, galeri görüntülenirken fotoğrafın üzerine gelindiğinde gösterilecek metindir. 
                          Her iki dilde de ayrı ayrı tanımlayabilirsiniz.
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">Açıklama (Türkçe)</label>
                            <input 
                              type="text" 
                              value={editingItem.tr_description || editingItem.description || ''}
                              onChange={(e) => setEditingItem({...editingItem, tr_description: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Görselin Türkçe açıklaması"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">Açıklama (İngilizce)</label>
                            <input 
                              type="text" 
                              value={editingItem.en_description || editingItem.description || ''}
                              onChange={(e) => setEditingItem({...editingItem, en_description: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Görselin İngilizce açıklaması"
                            />
                          </div>
                          
                          <div className="mt-2">
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-2 border border-purple-500 text-xs leading-4 font-medium rounded-md text-purple-300 bg-transparent hover:bg-purple-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              onClick={() => {
                                // Türkçe açıklamayı temel alarak İngilizce açıklamayı güncelle
                                if (editingItem.tr_description) {
                                  setEditingItem({
                                    ...editingItem, 
                                    description: editingItem.tr_description,
                                    en_description: editingItem.tr_description
                                  });
                                  
                                  toast({
                                    title: "Açıklama güncellendi",
                                    description: "Aynı açıklama tüm diller için ayarlandı.",
                                    variant: "default",
                                  });
                                }
                              }}
                            >
                              Türkçe açıklamayı her iki dil için de kullan
                            </button>
                          </div>
                          
                          {/* Galeride görüntüleme kontrolü */}
                          <div className="flex items-center mt-4 pt-4 border-t border-slate-600">
                            <input
                              type="checkbox"
                              id="hide-gallery-item"
                              checked={editingItem.showEmpty || false}
                              onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                            />
                            <label htmlFor="hide-gallery-item" className="ml-2 block text-sm text-purple-300">
                              Bu görseli sitede gösterme
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Etkinlik özel alanları */}
                  {editingItem.type === 'event' && (
                    <div>
                      <div className="mt-4 p-4 border border-green-600/30 rounded-md bg-green-600/10">
                        <h4 className="text-sm font-bold text-green-400 mb-2">Etkinlik Bilgileri</h4>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-white mb-1">Tarih</label>
                          <input 
                            type="date" 
                            value={editingItem.date || ''}
                            onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-white mb-1">Bilet Linki</label>
                          <input 
                            type="text" 
                            value={editingItem.ticketLink || ''}
                            onChange={(e) => setEditingItem({...editingItem, ticketLink: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/bilet-satin-al"
                          />
                          <p className="text-xs text-slate-400 mt-1">Bilet alınabilecek web sitesinin linki. Eğer bilet satışı yoksa boş bırakın.</p>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="hide-event"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-event" className="ml-2 block text-sm text-green-300">
                            Bu etkinliği sitede gösterme
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Video özel alanları */}
                  {editingItem.type === 'video' && (
                    <div>
                      <div className="mt-4 p-4 border border-red-600/30 rounded-md bg-red-600/10">
                        <h4 className="text-sm font-bold text-red-400 mb-2">Video Bilgileri</h4>
                        
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-white mb-1">Video URL</label>
                          <input 
                            type="text" 
                            value={editingItem.videoUrl || ''}
                            onChange={handleVideoUrlChange}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://www.youtube.com/embed/VIDEO_ID veya https://player.vimeo.com/video/VIDEO_ID"
                          />
                          <p className="text-xs text-slate-400 mt-1">YouTube veya Vimeo video embed URL'si. Örnek: https://www.youtube.com/embed/VIDEO_ID</p>
                        </div>
                        
                        {/* Video Dosyası Yükleme Komponenti */}
                        <div className="mt-4 p-3 border border-red-600/30 rounded-md bg-red-600/10">
                          <h4 className="text-sm font-bold text-red-400 mb-2">Video Dosyası Yükle</h4>
                          <p className="text-xs text-red-300 mb-3">
                            Bilgisayarınızdan doğrudan video yükleyebilirsiniz. Yüklenen video sisteme kaydedilecek ve videoUrl alanı otomatik olarak güncellenecektir.
                          </p>
                          <FileUpload 
                            onUploadSuccess={handleVideoUploadSuccess} 
                            label="Video Yükle" 
                            acceptedFileTypes="video/*" 
                            maxSizeMB={30}
                            uploadFolder="videos"
                            isVideo={true}
                          />
                        </div>
                        
                        {videoPreview && (
                          <div className="mt-4 border border-slate-600 rounded-md p-3">
                            <p className="text-sm text-slate-300 mb-2">Video Önizleme:</p>
                            <div className="aspect-video border border-slate-500 rounded">
                              <iframe
                                src={videoPreview}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Video Önizleme"
                              ></iframe>
                            </div>
                          </div>
                        )}

                        {/* Video gösterme/gizleme kontrolü */}
                        <div className="flex items-center mt-4 pt-4 border-t border-slate-600">
                          <input
                            type="checkbox"
                            id="hide-video"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-video" className="ml-2 block text-sm text-red-300">
                            Bu videoyu sitede gösterme
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Proje detay sayfası özel ayarları */}
                  {editingItem.section === 'projects' && editingItem.type === 'project' && (
                    <div className="mt-4 p-4 border border-indigo-600/30 rounded-md bg-indigo-600/10">
                      <h4 className="text-sm font-bold text-indigo-400 mb-2">Proje Detay Sayfası İçeriği</h4>
                      <p className="text-xs text-indigo-300 mb-3">
                        Bu içerik, proje detay sayfasında gösterilecektir. Her iki dilde de ayrı ayrı tanımlayabilirsiniz.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">Detay İçeriği (Türkçe)</label>
                          <textarea 
                            value={editingItem.tr_detail || ''}
                            onChange={(e) => setEditingItem({...editingItem, tr_detail: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={6}
                            placeholder="Projenin Türkçe detay içeriği"
                          />
                          <p className="text-xs text-slate-400 mt-1">HTML formatını destekler. Paragraf için &lt;p&gt; etiketlerini kullanabilirsiniz.</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">Detay İçeriği (İngilizce)</label>
                          <textarea 
                            value={editingItem.en_detail || ''}
                            onChange={(e) => setEditingItem({...editingItem, en_detail: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={6}
                            placeholder="Projenin İngilizce detay içeriği"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-1">Proje Kapak Görseli</label>
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={editingItem.coverImage || ''}
                              onChange={(e) => setEditingItem({...editingItem, coverImage: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Kapak görseli URL'i"
                            />
                            
                            {/* Dosya Yükleme Komponenti */}
                            <div className="mt-2 p-3 border border-indigo-600/30 rounded-md bg-indigo-600/10">
                              <h4 className="text-sm font-bold text-indigo-400 mb-2">Bilgisayardan Yükle</h4>
                              <FileUpload 
                                onUploadSuccess={(url) => setEditingItem({...editingItem, coverImage: url})} 
                                label="Kapak Görseli Yükle" 
                                uploadFolder="projects"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Proje gösterme/gizleme kontrolü */}
                        <div className="flex items-center mt-4 pt-4 border-t border-slate-600">
                          <input
                            type="checkbox"
                            id="hide-project"
                            checked={editingItem.showEmpty || false}
                            onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <label htmlFor="hide-project" className="ml-2 block text-sm text-indigo-300">
                            Bu projeyi sitede gösterme
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Proje açıklaması özel ayarları */}
                  {editingItem.section === 'projects' && editingItem.type === 'text' && editingItem.key.includes('Description') && (
                    <div className="mt-4 p-4 border border-indigo-600/30 rounded-md bg-indigo-600/10">
                      <h4 className="text-sm font-bold text-indigo-400 mb-2">Proje Açıklaması Ayarları</h4>
                      
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="hide-project-description"
                          checked={editingItem.showEmpty || false}
                          onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <label htmlFor="hide-project-description" className="ml-2 block text-sm text-indigo-300">
                          Bu proje açıklamasını gizle
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Proje detay başlığı ayarları */}
                  {editingItem.section === 'projects' && editingItem.key === 'projectDetailsTitle' && (
                    <div className="mt-4 p-4 border border-indigo-600/30 rounded-md bg-indigo-600/10">
                      <h4 className="text-sm font-bold text-indigo-400 mb-2">Proje Detay Başlığı Ayarları</h4>
                      
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="hide-project-details-title"
                          checked={editingItem.showEmpty || false}
                          onChange={(e) => setEditingItem({...editingItem, showEmpty: e.target.checked})}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <label htmlFor="hide-project-details-title" className="ml-2 block text-sm text-indigo-300">
                          Proje detay başlığını gizle
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Sıralama</label>
                    <input 
                      type="number" 
                      value={editingItem.order || 0}
                      onChange={(e) => setEditingItem({...editingItem, order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sıralama numarası"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 border border-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleUpdateItem}
                      className="px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-all shadow-sm"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 