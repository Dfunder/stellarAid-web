"use client";

import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";

export type PortfolioGridItem = {
  id: string;
  label: string;
  content: ReactNode;
  onActivate?: () => void;
};

const interactiveSelector =
  'a[href], button:not([disabled]), [role="button"], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PortfolioGrid({ items }: { items: PortfolioGridItem[] }) {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabbableIndex = Math.min(activeIndex, Math.max(0, items.length - 1));

  const focusItem = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  };

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const item = items[index];
    if (!item) return;

    if (event.key === "Enter" || event.key === " ") {
      if (event.target !== event.currentTarget) return;
      const interactive = itemRefs.current[index]?.querySelector<HTMLElement>(
        interactiveSelector,
      );
      if (!item.onActivate && !interactive) return;
      event.preventDefault();
      if (item.onActivate) item.onActivate();
      else interactive?.click();
      return;
    }

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
    focusItem(next);
  };

  return (
    <div role="grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div role="row" className="contents">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(element) => { itemRefs.current[index] = element; }}
            role="gridcell"
            tabIndex={index === tabbableIndex ? 0 : -1}
            aria-label={item.label}
            aria-roledescription="portfolio item"
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
