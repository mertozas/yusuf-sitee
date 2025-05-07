import React from 'react';
import Layout from '../components/layout/Layout';
import Contact from '../components/contact/Contact';

const ContactPage = () => {
  return (
    <Layout>
      <div className="pt-32 pb-16">
        <Contact />
      </div>
    </Layout>
  );
};

export default ContactPage; 