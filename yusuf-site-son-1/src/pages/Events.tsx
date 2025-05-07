import React from 'react';
import Layout from '../components/layout/Layout';
import Events from '../components/events/Events';

const EventsPage = () => {
  return (
    <Layout>
      <div className="pt-32 pb-16">
        <Events />
      </div>
    </Layout>
  );
};

export default EventsPage; 