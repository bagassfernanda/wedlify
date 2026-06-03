/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import WeddingDemo from './components/WeddingDemo';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <div className="min-h-screen selection:bg-brand-gold/20 selection:text-brand-gold">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WeddingDemo />
        <Testimonials />
        <Pricing />
        <OrderForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
