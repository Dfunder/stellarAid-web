'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Printer, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Section {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
  children: ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  lastUpdated,
  sections,
  children,
}) => {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const currentSection = sectionElements.find(el => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 200;
      });
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 py-12 px-6 print:bg-white print:border-none print:py-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 text-sm">Last Updated: {lastUpdated}</p>
          </div>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>Print Page</span>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Table of Contents - Sticky Desktop */}
        <aside className="lg:w-1/4 print:hidden">
          <div className="sticky top-24">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Table of Contents</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-center group py-2 text-sm transition-colors ${
                    activeSection === section.id
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ChevronRight
                    className={`w-4 h-4 mr-2 transition-transform ${
                      activeSection === section.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                  />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-3xl prose prose-blue prose-slate print:max-w-none">
          <style jsx global>{`
            @media print {
              .print\\:hidden { display: none !important; }
              body { font-size: 12pt; color: #000; background: #fff; }
              a { text-decoration: underline; color: #000; }
              @page { margin: 2cm; }
            }
            html { scroll-behavior: smooth; }
          `}</style>
          <div className="legal-content text-gray-800 leading-relaxed space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
