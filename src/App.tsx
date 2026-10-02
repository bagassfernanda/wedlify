/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import AccountApp from './AccountApp';
import { useRoute } from './lib/router';
import Navbar from './components/Navbar';
import WelcomeScreen from './components/WelcomeScreen';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import TemplateCatalog from './components/TemplateCatalog';
import WeddingDemo from './components/WeddingDemo';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import OrderForm from './components/OrderForm';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  const route = useRoute();
  const previousRoute = useRef(route);
  const [hasEntered, setHasEntered] = useState(() => {
    return window.location.hash.length > 0 || sessionStorage.getItem('wedlify-entered') === 'true';
  });
  const [selectedTemplate, setSelectedTemplate] = useState({
    name: '',
    version: 0,
  });
  const [selectedPackage, setSelectedPackage] = useState({
    name: '',
    version: 0,
  });

  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplate((current) => ({
      name: templateName,
      version: current.version + 1,
    }));
  };

  const handleSelectPackage = (packageName: string) => {
    setSelectedPackage((current) => ({
      name: packageName,
      version: current.version + 1,
    }));
  };

  const handleEnter = () => {
    sessionStorage.setItem('wedlify-entered', 'true');
    setHasEntered(true);

    window.setTimeout(() => {
      document.getElementById('home')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  useEffect(() => {
    // Saat kembali dari halaman akun, gulir ke bagian landing page yang dituju.
    if (previousRoute.current !== null && route === null) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    }

    previousRoute.current = route;
  }, [route]);

  if (route !== null) {
    return (
      <AccountApp
        route={route}
        preset={{ templateName: selectedTemplate.name, packageName: selectedPackage.name }}
      />
    );
  }

  if (!hasEntered) {
    return <WelcomeScreen onEnter={handleEnter} />;
  }

  return (
    <div className="min-h-screen selection:bg-brand-gold/20 selection:text-brand-gold">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <TemplateCatalog onSelectTemplate={handleSelectTemplate} />
        <WeddingDemo />
        <Testimonials />
        <Pricing
          selectedPackageName={selectedPackage.name}
          onSelectPackage={handleSelectPackage}
        />
        <OrderForm
          selectedTemplateName={selectedTemplate.name}
          selectionVersion={selectedTemplate.version}
          selectedPackageName={selectedPackage.name}
          packageSelectionVersion={selectedPackage.version}
        />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
