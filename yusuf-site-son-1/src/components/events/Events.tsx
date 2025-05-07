import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon } from 'lucide-react';

const Events = () => {
  const { t, language } = useLanguage();
  const { getContentBySection, getContentValue } = useSiteContent();

  // Etkinlikleri getir ve aktif olanlara göre filtrele
  const eventItems = getContentBySection('events')
    .filter(item => {
      // Aktif olmayan veya gizlenmesi istenen (showEmpty true ve değeri boş olan) öğeleri filtrele
      if (item.active === false) return false;
      if (item.showEmpty) return false;
      
      // Dile göre içerik kontrolü
      const hasContent = language === 'tr' 
        ? Boolean(item.tr_value || item.value) 
        : Boolean(item.en_value || item.value);
      
      return item.type === 'event' && hasContent;
    });

  const formatDateDay = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.getDate().toString();
  };
  
  const formatDateMonth = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (language === 'tr') {
      // Türkçe ay isimleri
      const trMonths = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      return trMonths[date.getMonth()];
    } else {
      // İngilizce ay isimleri
      const enMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return enMonths[date.getMonth()];
    }
  };

  // Section başlığını getir
  const eventsTitle = t('eventsTitle');

  // Eğer gösterilecek etkinlik yoksa ve başlık boşsa, hiçbir şey gösterme
  if (eventItems.length === 0 && !eventsTitle) {
    return null;
  }

  return (
    <section id="events" className="section bg-secondary/20 dark:bg-black">
      <div className="container">
        {eventsTitle && <h2 className="section-title text-center">{eventsTitle}</h2>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {eventItems.length > 0 ? (
            eventItems.map((event) => {
              // Dile göre içerik değerini al
              const eventTitle = language === 'tr' 
                ? (event.tr_value || event.value) 
                : (event.en_value || event.value);
                
              // Eğer başlık yoksa bu öğeyi atlayın
              if (!eventTitle) return null;
              
              return (
                <div 
                  key={event.id} 
                  className="border border-border dark:border-border/30 rounded-lg p-6 hover:border-gold transition-all duration-300 h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-[100px_1fr] gap-6">
                      <div className="bg-secondary dark:bg-secondary/20 p-3 rounded-md text-center flex flex-col justify-center">
                        {event.date && (
                          <>
                            <p className="text-3xl font-bold mb-1">{formatDateDay(event.date)}</p>
                            <p className="text-sm">{formatDateMonth(event.date)}</p>
                          </>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {eventTitle}
                        </h3>
                        
                        {event.description && (
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            <span>{event.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 pl-[124px]">
                      {event.ticketLink ? (
                        <a 
                          href={event.ticketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-medium text-sm px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition-colors rounded-md min-w-[120px] text-center"
                        >
                          {language === 'tr' ? 'Bilet Al' : 'Get Tickets'}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              {t('noEventsFound')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Events;
