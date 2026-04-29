'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Mail } from 'lucide-react';
import { faqData, categoryLabels, categoryDescriptions } from '@/data/faqData';

interface FAQAccordionItemProps {
  question: string;
  answer: string;
  relatedArticles?: { title: string; url: string }[];
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({
  question,
  answer,
  relatedArticles,
  isExpanded,
  onToggle,
}: FAQAccordionItemProps) {
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleVote = (vote: 'yes' | 'no') => {
    setHelpful(vote);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200"
        aria-expanded={isExpanded}
        aria-controls={`faq-answer-${question.replace(/\s/g, '-')}`}
      >
        <span className="text-base font-semibold text-gray-900 pr-4">
          {question}
        </span>
        {isExpanded ? (
          <ChevronUp
            className="w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-300"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300"
            aria-hidden="true"
          />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded
            ? 'max-h-[500px] opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-4 border-t border-gray-100">
          <p
            id={`faq-answer-${question.replace(/\s/g, '-')}`}
            className="text-gray-600 leading-relaxed mb-4"
          >
            {answer}
          </p>

          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Related Articles
              </h4>
              <ul className="space-y-1">
                {relatedArticles.map((article, idx) => (
                  <li key={idx}>
                    <a
                      href={article.url}
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Was this helpful?</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleVote('yes')}
                  disabled={helpful !== null}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    helpful === 'yes'
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : helpful !== null
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                  }`}
                  aria-pressed={helpful === 'yes'}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-1.455 0-2.843-.839-3.454-2.157a.5.5 0 01.096-.699l2.975-2.975a2 2 0 00.56-1.179l.032-.33c.108-.877.502-1.704 1.118-2.305l.063-.063z"
                    />
                  </svg>
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleVote('no')}
                  disabled={helpful !== null}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    helpful === 'no'
                      ? 'bg-red-100 text-red-700 cursor-default'
                      : helpful !== null
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                  }`}
                  aria-pressed={helpful === 'no'}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  No
                </button>
              </div>
              {showThankYou && (
                <span className="text-sm text-green-600 animate-fade-in">
                  Thank you for your feedback!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'donors' | 'creators' | 'stellar' | 'fees'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const categoryKeys = ['all', 'donors', 'creators', 'stellar', 'fees'] as const;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;

      const matchesSearch =
        !debouncedSearchQuery ||
        faq.question.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, debouncedSearchQuery]);

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@stellaraid.org';
  };

  const searchResultsCount = filteredFaqs.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using StellarAid. Can&apos;t find what you&apos;re
            looking for? Contact our support team below.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions and answers..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              aria-label="Search FAQ"
            />
          </div>
          {searchQuery && (
            <p className="text-center mt-2 text-sm text-gray-500">
              Found {searchResultsCount} result{searchResultsCount !== 1 ? 's' : ''}
              {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
            </p>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4" role="tablist">
            {categoryKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeCategory === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                role="tab"
                aria-selected={activeCategory === key}
                aria-controls="faq-list"
              >
                {key === 'all' ? 'All Categories' : categoryLabels[key]}
              </button>
            ))}
          </div>

          {activeCategory !== 'all' && (
            <p className="text-center text-sm text-gray-500 transition-opacity duration-200">
              {categoryDescriptions[activeCategory]}
            </p>
          )}
        </div>

        <div
          id="faq-list"
          className="space-y-3 mb-10"
          role="region"
          aria-label="FAQ items"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <FAQAccordionItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                relatedArticles={faq.relatedArticles}
                isExpanded={expandedItems.has(faq.id)}
                onToggle={() => toggleExpanded(faq.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Mail
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                aria-hidden="true"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>

        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Still have questions? Our support team is here to help.
          </p>
          <button
            type="button"
            onClick={handleContactSupport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
