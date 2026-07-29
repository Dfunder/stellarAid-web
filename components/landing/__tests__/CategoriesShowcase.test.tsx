import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import CategoriesShowcase from '../CategoriesShowcase';

beforeAll(() => {
  class MockIntersectionObserver {
    observe = () => null;
    unobserve = () => null;
    disconnect = () => null;
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe('CategoriesShowcase', () => {
  it('renders the section heading and subtitle', () => {
    render(<CategoriesShowcase />);

    expect(screen.getByText('Browse by Creative Discipline')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Categories')).toBeInTheDocument();
  });

  it('renders all 6 default categories with their names and count badges', () => {
    render(<CategoriesShowcase />);

    const categories = [
      'Illustration',
      'Graphic Design',
      'UI/UX',
      'Photography',
      'Animation',
      'Branding',
    ];

    categories.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    // Check count badges
    expect(screen.getByText('1,420 items')).toBeInTheDocument();
    expect(screen.getByText('2,150 items')).toBeInTheDocument();
    expect(screen.getByText('3,890 items')).toBeInTheDocument();
    expect(screen.getByText('980 items')).toBeInTheDocument();
    expect(screen.getByText('760 items')).toBeInTheDocument();
    expect(screen.getByText('1,120 items')).toBeInTheDocument();
  });

  it('links each category card to /explore?category=...', () => {
    render(<CategoriesShowcase />);

    const illustrationLink = screen.getByRole('link', { name: /Illustration/i });
    expect(illustrationLink).toHaveAttribute('href', '/explore?category=Illustration');

    const graphicDesignLink = screen.getByRole('link', { name: /Graphic Design/i });
    expect(graphicDesignLink).toHaveAttribute('href', '/explore?category=Graphic%20Design');

    const uiUxLink = screen.getByRole('link', { name: /UI\/UX/i });
    expect(uiUxLink).toHaveAttribute('href', '/explore?category=UI%2FUX');
  });

  it('renders "Explore All Categories" CTA button linking to /explore', () => {
    render(<CategoriesShowcase />);

    const ctaLink = screen.getByRole('link', { name: /Explore All Categories/i });
    expect(ctaLink).toHaveAttribute('href', '/explore');
  });
});
