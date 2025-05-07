import React from 'react';
import Layout from '../components/layout/Layout';
import Gallery from '../components/gallery/Gallery';

const GalleryPage = () => {
  return (
    <Layout>
      <div className="pt-32 pb-16">
        <Gallery />
      </div>
    </Layout>
  );
};

export default GalleryPage; 