import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';
import CreditSimulator from '../components/CreditSimulator';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}

      {/* Conteúdo principal */}
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <TestimonialsSection />
        <section id="credit-simulator">
          <CreditSimulator />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
