
import React from 'react';
import Layout from '../components/layout/Layout';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon } from 'lucide-react';

type Event = {
  id: number;
  date: string;
  time: string;
  location: string;
  venue: string;
  ticketLink: string;
};

const AllEvents = () => {
  const { t } = useLanguage();

  const events: Event[] = [
    {
      id: 1,
      date: '2025-05-15',
      time: '20:00',
      location: 'Istanbul, Turkey',
      venue: 'Babylon',
      ticketLink: '#'
    },
    {
      id: 2,
      date: '2025-05-23',
      time: '21:00',
      location: 'London, UK',
      venue: 'O2 Academy',
      ticketLink: '#'
    },
    {
      id: 3,
      date: '2025-06-07',
      time: '19:30',
      location: 'Berlin, Germany',
      venue: 'Lido',
      ticketLink: '#'
    },
    {
      id: 4,
      date: '2025-06-15',
      time: '20:00',
      location: 'Paris, France',
      venue: 'Le Bataclan',
      ticketLink: '#'
    },
    {
      id: 5,
      date: '2025-07-01',
      time: '19:00',
      location: 'Madrid, Spain',
      venue: 'La Riviera',
      ticketLink: '#'
    },
    {
      id: 6,
      date: '2025-07-15',
      time: '20:30',
      location: 'Amsterdam, Netherlands',
      venue: 'Paradiso',
      ticketLink: '#'
    }
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Layout>
      <section className="section bg-secondary/20 dark:bg-black/50">
        <div className="container">
          <h1 className="section-title mb-12">{t('eventsTitle')}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div 
                key={event.id}
                className="border border-border dark:border-border/30 rounded-lg p-6 hover:border-gold transition-all duration-300"
              >
                <div className="flex items-start">
                  <div className="mr-6 bg-secondary dark:bg-secondary/20 p-3 rounded-md text-center min-w-[70px]">
                    <p className="text-lg font-bold">{formatDate(event.date)}</p>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-xl font-bold mb-2">{event.venue}</h3>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gold text-gold hover:bg-gold hover:text-black transition-colors"
                    >
                      {t('getTickets')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AllEvents;
