import React, { useState, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { processFile } from '@/lib/upload-service';

interface FileUploadProps {
  onUploadSuccess: (fileUrl: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  label?: string;
  uploadFolder?: string;
  isVideo?: boolean;
}

const FileUpload = ({
  onUploadSuccess,
  acceptedFileTypes = "image/*",
  maxSizeMB = 5,
  label = "Resim Yükle",
  uploadFolder = "gallery",
  isVideo = false
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipini kontrol et
    if (!file.type.match(acceptedFileTypes)) {
      toast({
        title: "Hata",
        description: `Sadece ${acceptedFileTypes} tipindeki dosyalar kabul edilmektedir.`,
        variant: "destructive",
      });
      return;
    }

    // Dosya boyutunu kontrol et (MB cinsinden)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "Hata",
        description: `Dosya boyutu ${maxSizeMB}MB'tan küçük olmalıdır.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Yükleme simülasyonu başlat
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90; // %90'da beklet, dosya işleme tamamlandığında %100'e geçecek
          }
          return newProgress;
        });
      }, 50);

      // Dosyayı işle (gerçek bir uygulamada bu, sunucuya yükleme olacak)
      const fileUrl = await processFile(file, isVideo);
      
      // İşlem tamamlandı, %100'e tamamla
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Başarı mesajı göster
      toast({
        title: "Başarılı",
        description: "Dosya başarıyla yüklendi.",
        variant: "default",
      });
      
      // Başarı callback'ini çağır
      onUploadSuccess(fileUrl);
      
      // Input alanını temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setIsUploading(false);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Dosya yükleme hatası:", error);
      
      toast({
        title: "Hata",
        description: "Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mt-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      <div className="flex flex-col items-start">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className={`px-4 py-2 border border-slate-600 rounded-md text-white ${
            isUploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          {isUploading ? 'Yükleniyor...' : label}
        </button>
        
        {isUploading && (
          <div className="w-full mt-2">
            <div className="w-full h-2 bg-slate-700 rounded-full mt-1">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {uploadProgress}% Yüklendi
            </div>
          </div>
        )}
        
        <p className="text-xs text-slate-400 mt-1">
          {isVideo 
            ? 'Desteklenen formatlar: MP4, WebM, Ogg (maks. 30MB)' 
            : 'Desteklenen formatlar: JPG, PNG, WebP, GIF (maks. 5MB)'}
        </p>
      </div>
    </div>
  );
};

export default FileUpload; 