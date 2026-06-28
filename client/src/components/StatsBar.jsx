import React from 'react';

export default function StatsBar() {
  const stats = [
    { label: 'Builds Completed', value: '500+' },
    { label: 'Happy Customers', value: '100%' },
    { label: 'Response Time', value: '< 2 hrs' },
    { label: 'Years Experience', value: '5+' },
  ];

  return (
    <div className="bg-dark text-bg py-8">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-4 border border-brand/20 rounded-lg">
            <span className="text-3xl font-outfit font-bold text-brand mb-2">{stat.value}</span>
            <span className="text-sm uppercase tracking-wider text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
