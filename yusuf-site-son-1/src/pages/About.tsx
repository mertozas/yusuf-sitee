import React from 'react';
import Layout from '../components/layout/Layout';
import About from '../components/about/About';

const AboutPage = () => {
  return (
    <Layout>
      <div className="pt-32 pb-16">
        <About />
      </div>
    </Layout>
  );
};

export default AboutPage; 