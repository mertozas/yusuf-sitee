import React from 'react';
import Layout from '../components/layout/Layout';
import Projects from '../components/projects/Projects';

const ProjectsPage = () => {
  return (
    <Layout>
      <div className="pt-72 pb-16">
        <Projects />
      </div>
    </Layout>
  );
};

export default ProjectsPage; 