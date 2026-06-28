import React from 'react';

export default function Hero() {
  return (
    <div className="bg-hero-bg text-bg py-24 text-center px-4 shadow-xl">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-outfit font-bold mb-6 text-brand">Lapzenix</h1>
        <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto">
          Chennai's Premium PC Builds, Parts, Repair & Data Recovery Services.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-brand text-bg px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg"
        >
          Get a Free Quote
        </button>
      </div>
    </div>
  );
}
