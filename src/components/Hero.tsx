import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920',
    title: 'A Essência do Luxo',
    subtitle: 'Descubra fragrâncias que transcendem o tempo e definem sua presença.',
    accent: 'Oud & Gold'
  },
  {
    image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=1920',
    title: 'Elegância em Cada Gota',
    subtitle: 'Uma jornada sensorial através dos ingredientes mais raros do mundo.',
    accent: 'Pure Sophistication'
  },
  {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1920',
    title: 'Tradição e Modernidade',
    subtitle: 'O equilíbrio perfeito entre o mistério do clássico e o brilho do contemporâneo.',
    accent: 'Essenza Signature'
  }
];

export const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black z-10" />
          <img
            src={SLIDES[current].image}
            alt="Essenza D'Or Luxury"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 text-center px-6 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-gold text-[10px] uppercase tracking-[0.4em] mb-6 font-bold border-b border-gold/30 pb-2">
              {SLIDES[current].accent}
            </span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight tracking-tight text-white">
              {SLIDES[current].title}
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              {SLIDES[current].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => document.getElementById('perfumes')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-12 py-5 bg-gold text-black font-bold tracking-[0.2em] text-xs transition-all duration-500 hover:bg-white overflow-hidden rounded-full"
              >
                <span className="relative z-10">EXPLORAR COLEÇÃO</span>
              </button>
              <button className="px-12 py-5 border border-white/20 text-white font-bold tracking-[0.2em] text-xs hover:bg-white/10 transition-all duration-300 rounded-full">
                NOSSA HISTÓRIA
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-12 z-30 pointer-events-none">
        <button 
          onClick={prevSlide}
          className="p-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-gold hover:border-gold transition-all pointer-events-auto"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={nextSlide}
          className="p-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-gold hover:border-gold transition-all pointer-events-auto"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className="group relative p-2"
          >
            <div className={`h-1 transition-all duration-500 rounded-full ${
              current === index ? 'w-12 bg-gold' : 'w-4 bg-white/20 group-hover:bg-white/40'
            }`} />
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 right-12 z-30 hidden lg:flex flex-col items-center gap-4"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 [writing-mode:vertical-rl]">
          SCROLL TO EXPLORE
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
};
