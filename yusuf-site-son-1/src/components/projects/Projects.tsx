import React, { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/context/SiteContentContext';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Type tanımları
interface ProjectItem {
  id: string;
  key: string;
  value: string;
  tr_value?: string;
  en_value?: string;
  tr_detail?: string;
  en_detail?: string;
  type: string;
  projectId?: string;
  [key: string]: any;
}

interface ProjectCardProps {
  project: ProjectItem;
  language: string;
  getProjectDescription: (project: ProjectItem) => string;
  getProjectImage: (project: ProjectItem) => string;
  onSelect: (id: string) => void;
  t: (key: string) => string;
}

interface ProjectDetailModalProps {
  selectedProjectData: ProjectItem | null;
  getProjectDescription: (project: ProjectItem) => string;
  getProjectImage: (project: ProjectItem) => string;
  language: string;
  t: (key: string) => string;
  projectDetailsTitle: string;
  showProjectDetailsTitle: boolean;
  onClose: () => void;
}

// Proje kartı için memo bileşeni
const ProjectCard = React.memo(function ProjectCard({ 
  project, 
  language, 
  getProjectDescription, 
  getProjectImage, 
  onSelect,
  t
}: ProjectCardProps) {
  // Proje başlığı
  const projectTitle = language === 'tr' 
    ? (project.tr_value || project.value)
    : (project.en_value || project.value);
    
  // Proje açıklaması
  const projectDescription = getProjectDescription(project);
  
  // Proje görseli
  const projectImage = getProjectImage(project) || 'https://via.placeholder.com/600x400?text=Project+Image';
  
  return (
    <div
      key={project.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onClick={() => onSelect(project.id)}
    >
      <div className="relative h-48">
        <img
          src={projectImage}
          alt={projectTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-lg font-medium">
            {t('viewDetails')}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{projectTitle}</h3>
        {projectDescription && (
          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
            {projectDescription}
          </p>
        )}
      </div>
    </div>
  );
});

// Modal içeriği için memo bileşeni
const ProjectDetailModal = React.memo(function ProjectDetailModal({ 
  selectedProjectData, 
  getProjectDescription, 
  getProjectImage, 
  language,
  t,
  projectDetailsTitle,
  showProjectDetailsTitle,
  onClose
}: ProjectDetailModalProps) {
  if (!selectedProjectData) return null;
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        {language === 'tr' 
          ? (selectedProjectData.tr_value || selectedProjectData.value)
          : (selectedProjectData.en_value || selectedProjectData.value)
        }
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {getProjectDescription(selectedProjectData)}
      </p>
      <div className="aspect-video overflow-hidden rounded-lg mb-6">
        <img 
          src={getProjectImage(selectedProjectData) || 'https://via.placeholder.com/1200x800?text=Project+Image'} 
          alt={language === 'tr' 
            ? (selectedProjectData.tr_value || selectedProjectData.value)
            : (selectedProjectData.en_value || selectedProjectData.value)
          } 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Proje detay sayfası içeriği varsa göster */}
      {(selectedProjectData.tr_detail || selectedProjectData.en_detail) && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          {showProjectDetailsTitle && (
            <h3 className="text-xl font-bold mb-4">
              {projectDetailsTitle}
            </h3>
          )}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ 
              __html: language === 'tr' 
                ? (selectedProjectData.tr_detail || '') 
                : (selectedProjectData.en_detail || '') 
            }}
          />
        </div>
      )}
    </div>
  );
});

const Projects = () => {
  const { t, language } = useLanguage();
  const { getContentBySection, getContentValue, contents } = useSiteContent();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Başlıkları language değişkenine bağlı olarak memoize et
  const { projectsTitle, projectDetailsTitle } = useMemo(() => {
    return {
      projectsTitle: language === 'tr' 
        ? getContentValue('projects', 'projectsTitle') || 'Son Projeler'
        : getContentValue('projects', 'projectsTitle') || 'Recent Projects',
      projectDetailsTitle: getContentValue('projects', 'projectDetailsTitle') || 
        (language === 'tr' ? 'Proje Detayları' : 'Project Details')
    };
  }, [language, getContentValue]);

  // Projeler için detay başlığını göster/gizle kontrolü
  const showProjectDetailsTitle = useMemo(() => {
    return !getContentBySection('projects')
      .find(item => item.key === 'projectDetailsTitle')?.showEmpty;
  }, [getContentBySection]);

  // Projeleri getir ve filtrele
  const projectItems = useMemo(() => {
    return getContentBySection('projects')
      .filter(item => {
        // Gizlenmesi istenen öğeleri filtrele
        if (item.showEmpty) return false;
        
        // Dile göre içerik kontrolü
        const hasContent = language === 'tr' 
          ? Boolean(item.tr_value || item.value) 
          : Boolean(item.en_value || item.value);
        
        return item.type === 'project' && hasContent;
      });
  }, [getContentBySection, language]);

  // Projeler için açıklama metinlerini getir
  const getProjectDescription = useCallback((project) => {
    // Önce projectId ile bağlantılı açıklama bileşenini ara
    const projectId = project.projectId || project.id;
    
    const descriptionItem = contents.find(
      item => (item.projectId === projectId && item.type === 'text') || 
              (item.key === `${project.key}Description` && item.type === 'text')
    );
    
    if (!descriptionItem) return '';
    
    // Eğer açıklama gizlenecekse boş string döndür
    if (descriptionItem.showEmpty) return '';
    
    return language === 'tr'
      ? (descriptionItem.tr_value || descriptionItem.value || '')
      : (descriptionItem.en_value || descriptionItem.value || '');
  }, [contents, language]);

  // Projeler için görsel URL'leri getir
  const getProjectImage = useCallback((project) => {
    // Önce projectId ile bağlantılı görsel bileşenini ara
    const projectId = project.projectId || project.id;
    
    const imageItem = contents.find(
      item => (item.projectId === projectId && item.type === 'image') || 
              (item.key === `${project.key}Image` && item.type === 'image')
    );
    
    if (!imageItem) return '';
    
    return language === 'tr'
      ? (imageItem.tr_value || imageItem.value || '')
      : (imageItem.en_value || imageItem.value || '');
  }, [contents, language]);

  // Seçilen projenin detaylarını belirle
  const selectedProjectData = useMemo(() => {
    return selectedProject
      ? projectItems.find(item => item.id === selectedProject)
      : null;
  }, [selectedProject, projectItems]);

  // Project seçimi fonksiyonu
  const handleProjectSelect = useCallback((id) => {
    setSelectedProject(id);
  }, []);

  // Modal kapatma fonksiyonu
  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  if (projectItems.length === 0 && !projectsTitle) {
    return null;
  }

  return (
    <section id="projects" className="section bg-secondary/20 dark:bg-black py-24">
      <div className="container">
        {projectsTitle && <h2 className="section-title text-center mt-12">{projectsTitle}</h2>}
        
        <div className="mt-16">
          {projectItems.length > 3 && (
            <div className="flex justify-end mb-4">
              <Link 
                to="/projects" 
                className="text-gold hover:text-gold/80 font-medium transition-colors"
              >
                {t('viewAllProjects')}
              </Link>
            </div>
          )}

          {projectItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projectItems.slice(0, 3).map((project) => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  language={language}
                  getProjectDescription={getProjectDescription}
                  getProjectImage={getProjectImage}
                  onSelect={handleProjectSelect}
                  t={t}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t('noProjectsFound')}
            </div>
          )}
        </div>

        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-4xl bg-background">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t('close')}</span>
            </button>
            
            <ProjectDetailModal
              selectedProjectData={selectedProjectData}
              getProjectDescription={getProjectDescription}
              getProjectImage={getProjectImage}
              language={language}
              t={t}
              projectDetailsTitle={projectDetailsTitle}
              showProjectDetailsTitle={showProjectDetailsTitle}
              onClose={handleCloseModal}
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Projects;
