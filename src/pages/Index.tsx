import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Courses from '@/components/Courses';
import About from '@/components/About';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';

const Index = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsRegistrationOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header onRegisterClick={handleRegisterClick} />
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
