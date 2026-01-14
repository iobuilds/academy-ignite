import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Courses from '@/components/Courses';
import About from '@/components/About';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';
import AnnouncementBar from '@/components/AnnouncementBar';

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50">
        <AnnouncementBar />
        <Header onRegisterClick={handleRegisterClick} />
      </div>
      <Hero onRegisterClick={handleRegisterClick} />
      <Courses onRegisterClick={handleRegisterClick} />
      <About />
      <Footer />
      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
      />
    </div>
  );
};

export default Index;
