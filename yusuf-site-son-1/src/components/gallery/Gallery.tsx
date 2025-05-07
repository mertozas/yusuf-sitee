import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

type MediaItem = {
  id: string;
  type: 'photo' | 'video';
  thumbnail: string;
  source: string;
  title: string;
};

const Gallery = () => {
  const { t, language } = useLanguage();
  const { getContentBySection, getContentValue } = useSiteContent();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Galeri başlığını getir
  const galleryTitle = getContentValue('gallery', 'galleryTitle') || t('galleryTitle');
  
  // Fotoğraflar ve videolar için etiketleri getir
  const photosLabel = t('photos');
  const videosLabel = t('videos');

  // Galeri öğelerini getir
  const galleryItems = getContentBySection('gallery')
    .filter(item => {
      // Gizlenmesi istenen öğeleri filtrele
      if (item.showEmpty) return false;
      
      // Dile göre içerik kontrolü
      const hasContent = language === 'tr' 
        ? Boolean(item.tr_value || item.value) 
        : Boolean(item.en_value || item.value);
      
      return (item.type === 'gallery' || item.type === 'video') && hasContent;
    })
    .map(item => {
      // MediaItem formatına dönüştür
      const url = language === 'tr' ? (item.tr_value || item.value) : (item.en_value || item.value);
      // Video tipi varsa veya URL video adresiyse, video olarak işaretle
      const isVideo = item.type === 'video' || (url.includes('youtube.com') || url.includes('vimeo.com'));
      
      // Video URL'si varsa, doğrudan onu kullan
      const videoUrl = item.videoUrl || '';
      
      // Dile göre açıklamayı seç
      const title = language === 'tr'
        ? (item.tr_description || item.description || '')
        : (item.en_description || item.description || '');
      
      return {
        id: item.id,
        type: isVideo ? 'video' : 'photo',
        thumbnail: isVideo 
          ? videoUrl.includes('youtube.com/embed') 
            ? `https://img.youtube.com/vi/${getYoutubeId(videoUrl || url)}/hqdefault.jpg` 
            : `https://via.placeholder.com/480x270?text=Video+Önizleme`
          : url,
        source: isVideo ? (videoUrl || url) : url,
        title: title
      } as MediaItem;
    });

  // YouTube video ID'sini al
  function getYoutubeId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  // Medya türüne göre ayır ve sırala
  const photos = galleryItems
    .filter(item => item.type === 'photo')
    .sort((a, b) => a.id.localeCompare(b.id));
    
  const videos = galleryItems
    .filter(item => item.type === 'video')
    .sort((a, b) => a.id.localeCompare(b.id));

  // Hiç medya yoksa bileşeni gösterme
  if (galleryItems.length === 0 && !galleryTitle) {
    return null;
  }

  return (
    <section id="gallery" className="section">
      <div className="container">
        {galleryTitle && <h2 className="section-title">{galleryTitle}</h2>}
        
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="mb-8 bg-transparent border-b border-black/20 w-full justify-start gap-8">
            <TabsTrigger 
              value="photos"
              className="data-[state=active]:text-gold data-[state=active]:border-gold pb-2 border-b-2 border-transparent rounded-none"
            >
              {photosLabel}
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:text-gold data-[state=active]:border-gold pb-2 border-b-2 border-transparent rounded-none"
            >
              {videosLabel}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.length > 0 ? (
                photos.map(photo => (
                  <Dialog key={photo.id} open={selectedItem?.id === photo.id} onOpenChange={(open) => !open && setSelectedItem(null)}>
                    <DialogTrigger asChild>
                      <div 
                        className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                        onClick={() => setSelectedItem(photo)}
                      >
                        <img 
                          src={photo.thumbnail} 
                          alt={photo.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        {photo.title && (
                          <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-black text-lg font-medium">{photo.title}</span>
                          </div>
                        )}
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-white border-gold/50 p-2 sm:p-4 md:p-6">
                      <DialogClose className="absolute right-2 top-2 z-10 bg-black/50 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Kapat</span>
                      </DialogClose>
                      <div className="mt-4">
                        <img 
                          src={photo.source} 
                          alt={photo.title} 
                          className="w-full h-auto" 
                        />
                        {photo.title && (
                          <p className="text-black text-center mt-4">{photo.title}</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  Henüz fotoğraf eklenmemiş
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="videos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.length > 0 ? (
                videos.map(video => (
                  <Dialog key={video.id} open={selectedItem?.id === video.id} onOpenChange={(open) => !open && setSelectedItem(null)}>
                    <DialogTrigger asChild>
                      <div 
                        className="aspect-video overflow-hidden rounded-lg cursor-pointer group relative"
                        onClick={() => setSelectedItem(video)}
                      >
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                        {video.title && (
                          <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-black text-lg font-medium">{video.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-gold/80 p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-white border-gold/50 p-2 sm:p-4 md:p-6">
                      <DialogClose className="absolute right-2 top-2 z-10 bg-black/50 text-white rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Kapat</span>
                      </DialogClose>
                      <div className="mt-4">
                        <div className="aspect-video">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={video.source} 
                            title={video.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                        {video.title && (
                          <p className="text-black text-center mt-4">{video.title}</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  Henüz video eklenmemiş
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default Gallery;
