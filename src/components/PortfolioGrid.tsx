"use client";

import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";

export type PortfolioGridItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export function PortfolioGrid({ items }: { items: PortfolioGridItem[] }) {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div
        role="grid"
        aria-label="Portfolio"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      />
    );
  }

  const currentIndex = activeIndex < items.length ? activeIndex : 0;

  const focusIndex = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  };

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    focusIndex(next);
  };

  return (
    <div
      role="grid"
      aria-label="Portfolio"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div role="row" className="contents">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            role="gridcell"
            tabIndex={index === currentIndex ? 0 : -1}
            aria-label={item.label}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(event) => moveFocus(event, index)}
            className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
