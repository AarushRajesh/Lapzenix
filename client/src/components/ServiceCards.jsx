import React from 'react';
import { Monitor, Cpu, Wrench, HardDrive } from 'lucide-react';
import { logEvent, analytics } from '../firebase';

export default function ServiceCards({ onSelectService }) {
  const services = [
    { id: 'build', title: 'PC Build', icon: Monitor, desc: 'Custom tailored PCs for gaming, editing, or productivity.' },
    { id: 'parts', title: 'Parts', icon: Cpu, desc: 'New and used premium PC components at great prices.' },
    { id: 'service', title: 'Service', icon: Wrench, desc: 'Expert repair and maintenance for PCs and Laptops.' },
    { id: 'recovery', title: 'Data Recovery', icon: HardDrive, desc: 'Secure data recovery from HDD, SSD, and portable media.' },
  ];

  const handleSelect = (id) => {
    if (analytics) {
      logEvent(analytics, 'service_selected', { service: id });
    }
    onSelectService(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <div 
            key={s.id} 
            onClick={() => handleSelect(s.id)}
            className="bg-white border-2 border-border p-6 rounded-xl cursor-pointer hover:border-brand hover:shadow-xl transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-14 h-14 bg-bg text-brand rounded-full flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-bg transition-colors">
              <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-2 text-dark">{s.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
