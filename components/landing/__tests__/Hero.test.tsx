import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import '@testing-library/jest-dom';
import Hero from '@/app/components/landing/Hero';

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

describe('Hero Component', () => {
  it('renders main accessible h1 heading immediately for LCP', () => {
    render(<Hero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Creative Talent/i);
    expect(heading).toHaveTextContent(/Meets Global Opportunity/i);
  });

  it('renders the Stellar Network badge', () => {
    render(<Hero />);

    expect(screen.getByText(/Powered by the Stellar Network/i)).toBeInTheDocument();
  });

  it('renders primary CTA navigation buttons with valid hrefs', () => {
    render(<Hero />);

    const exploreLink = screen.getByRole('link', { name: /Explore Creatives/i });
    expect(exploreLink).toBeInTheDocument();
    expect(exploreLink).toHaveAttribute('href', '/explore');

    const earnLink = screen.getByRole('link', { name: /Start Earning/i });
    expect(earnLink).toBeInTheDocument();
    expect(earnLink).toHaveAttribute('href', '/register');
  });

  it('renders social proof stat labels and values', () => {
    render(<Hero />);

    expect(screen.getByText('Creative Profiles')).toBeInTheDocument();
    expect(screen.getByText('Funds Raised')).toBeInTheDocument();
    expect(screen.getByText('Countries Reached')).toBeInTheDocument();
  });

  it('renders priority hero artwork image with descriptive alt text', () => {
    render(<Hero />);

    const artwork = screen.getByRole('img', {
      name: /A vibrant collage of creative artworks floating in a purple-to-orange gradient space/i,
    });
    expect(artwork).toBeInTheDocument();
  });
});
