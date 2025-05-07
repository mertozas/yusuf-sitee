import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent, ContentItem } from '@/context/SiteContentContext';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Github, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { getContentBySection, getContentByKey, contents } = useSiteContent();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ContentItem | null>(null);
  const [projectDetail, setProjectDetail] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  
  useEffect(() => {
    // Projeyi bul
    const foundProject = contents.find(item => item.id === id && item.type === 'project' && item.section === 'projects');
    
    if (foundProject) {
      setProject(foundProject);
      
      // Proje detay içeriğini dil seçimine göre getir
      const detailContent = language === 'tr' 
        ? (foundProject.tr_detail || '') 
        : (foundProject.en_detail || '');
      setProjectDetail(detailContent);
      
      // Proje açıklamasını bul
      const descriptionItem = contents.find(
        item => item.section === 'projects' && 
               item.key === `${foundProject.key}Description` && 
               item.type === 'text'
      );
      
      if (descriptionItem) {
        const descText = language === 'tr' 
          ? (descriptionItem.tr_value || descriptionItem.value || '') 
          : (descriptionItem.en_value || descriptionItem.value || '');
        setProjectDescription(descText);
      }
      
      // Proje görselini bul
      const imageItem = contents.find(
        item => item.section === 'projects' && 
               item.key === `${foundProject.key}Image` && 
               item.type === 'image'
      );
      
      // Proje kapak görselini getir (varsa)
      const imgUrl = imageItem 
        ? (language === 'tr' ? (imageItem.tr_value || imageItem.value || '') : (imageItem.en_value || imageItem.value || ''))
        : '';
      
      setCoverImage(foundProject.coverImage || imgUrl || 'https://via.placeholder.com/1200x600?text=Project+Image');
    } else {
      toast({
        title: language === 'tr' ? 'Proje bulunamadı' : 'Project not found',
        description: language === 'tr' ? 'İstediğiniz proje bulunamadı' : 'The requested project could not be found',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  }, [id, language, contents]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container">
            <div className="animate-pulse flex flex-col space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container">
            <h1 className="text-2xl font-bold mb-4">
              {language === 'en' ? 'Project not found' : 'Proje bulunamadı'}
            </h1>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Projects' : 'Projelere Dön'}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Proje başlığını dil seçimine göre getir
  const projectTitle = language === 'tr' 
    ? (project.tr_value || project.value) 
    : (project.en_value || project.value);

  return (
    <Layout>
      <div className="pt-32 pb-16">
        <div className="container">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-8 hover:text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Projects' : 'Projelere Dön'}
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-[400px] w-full">
              <img
                src={coverImage}
                alt={projectTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                <h1 className="text-4xl font-bold text-white mb-2">{projectTitle}</h1>
                <p className="text-gray-200">{project.description}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                {projectDescription && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                      {language === 'en' ? 'Project Overview' : 'Proje Genel Bakış'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {projectDescription}
                    </p>
                  </div>
                )}

                {projectDetail && (
                  <div className="mb-8 prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: projectDetail }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail; 