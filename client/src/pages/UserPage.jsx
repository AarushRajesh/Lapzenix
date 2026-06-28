import React, { useState } from 'react';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import ServiceCards from '../components/ServiceCards';
import EnquiryForm from '../components/EnquiryForm';
import Footer from '../components/Footer';

export default function UserPage() {
  const [selectedService, setSelectedService] = useState(null);
  
  // Create a ref for the form to scroll to it
  const formRef = React.useRef(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-bg text-dark font-sans flex flex-col">
      <Hero />
      <StatsBar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <h2 className="text-3xl font-outfit font-bold text-center mb-8">Our Services</h2>
        <ServiceCards onSelectService={handleServiceSelect} />
        
        <div ref={formRef} className="mt-16">
          <EnquiryForm initialService={selectedService} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
