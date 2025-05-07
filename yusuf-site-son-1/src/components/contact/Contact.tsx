import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { Check } from 'lucide-react';
import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // You'll need to replace this
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // You'll need to replace this
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // You'll need to replace this

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." })
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const { t, language } = useLanguage();
  const { getContentByKey, contents } = useSiteContent();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [contactData, setContactData] = useState({
    title: '',
    text: '',
    email: 'yusufcellist@icloud.com'
  });

  // İçerik değişikliklerini izle
  useEffect(() => {
    // İçerik öğelerini çek
    const contactTitleItem = getContentByKey('contact', 'contactTitle');
    const contactTextItem = getContentByKey('contact', 'contactText');
    const contactEmailItem = getContentByKey('contact', 'contactEmail');

    // Dil desteği ile içerikleri al
    const getLocalizedValue = (item: any, defaultValue: string) => {
      if (!item) return defaultValue;
      if (item.showEmpty) return '';
      
      return language === 'tr' 
        ? (item.tr_value || item.value || defaultValue)
        : (item.en_value || item.value || defaultValue);
    };

    // Varsayılan değerler
    const defaultValues = {
      tr: {
        title: 'İletişime Geç',
        text: 'Rezervasyonlar, işbirlikleri veya herhangi bir sorunuz için aşağıdaki formu doldurun.',
        email: 'yusufcellist@icloud.com'
      },
      en: {
        title: 'Get in Touch',
        text: 'For bookings, collaborations or any inquiries, please fill out the form below.',
        email: 'yusufcellist@icloud.com'
      }
    };

    // Değerleri hesapla
    const title = getLocalizedValue(contactTitleItem, defaultValues[language].title);
    const text = getLocalizedValue(contactTextItem, defaultValues[language].text);
    const email = getLocalizedValue(contactEmailItem, defaultValues[language].email);

    // State'i güncelle
    setContactData({
      title,
      text,
      email
    });
  }, [getContentByKey, language, contents]);

  // Form etiketleri
  const nameLabel = t('nameLabel');
  const emailLabel = t('emailLabel');
  const messageLabel = t('messageLabel');
  const submitButtonLabel = t('submitButton');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const templateParams = {
        to_email: contactData.email,
        from_name: data.name,
        from_email: data.email,
        message: data.message
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      toast({
        title: language === 'en' ? "Message sent" : "Mesaj gönderildi",
        description: language === 'en' 
          ? "Thank you for your message. We'll get back to you soon!"
          : "Mesajınız için teşekkürler. En kısa sürede size dönüş yapacağız!",
      });
      
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: language === 'en' ? "Error" : "Hata",
        description: language === 'en'
          ? "Something went wrong. Please try again."
          : "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // İçerik yoksa bileşeni gösterme
  if (!contactData.title && !contactData.text) {
    return null;
  }

  return (
    <section id="contact" className="section bg-secondary/20 dark:bg-black/50">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          {contactData.title && <h2 className="section-title mx-auto">{contactData.title}</h2>}
          {contactData.text && (
            <p className="text-lg text-muted-foreground mt-4">
              {contactData.text}
            </p>
          )}
        </div>

        {isSubmitted ? (
          <div className="max-w-md mx-auto text-center p-8 border border-gold rounded-lg bg-background">
            <div className="mb-4 mx-auto w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-gold" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {language === 'en' ? 'Thank You!' : 'Teşekkürler!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Your message has been sent successfully. We\'ll get back to you soon!'
                : 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız!'}
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      {nameLabel && <FormLabel>{nameLabel}</FormLabel>}
                      <FormControl>
                        <Input placeholder={language === 'en' ? "John Doe" : "Adınız Soyadınız"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      {emailLabel && <FormLabel>{emailLabel}</FormLabel>}
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      {messageLabel && <FormLabel>{messageLabel}</FormLabel>}
                      <FormControl>
                        <Textarea 
                          placeholder={language === 'en' ? "Your message..." : "Mesajınız..."} 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (language === 'en' ? "Sending..." : "Gönderiliyor...") 
                    : submitButtonLabel}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
