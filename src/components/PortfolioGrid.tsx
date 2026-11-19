"use client";

import { type KeyboardEvent, type ReactNode, useRef } from "react";

export type PortfolioGridItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export function PortfolioGrid({ items }: { items: PortfolioGridItem[] }) {
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;

    event.preventDefault();
    itemRefs.current[next]?.focus();
  };

  return (
    <div role="grid" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={(element) => { itemRefs.current[index] = element; }}
          role="gridcell"
          tabIndex={0}
          aria-label={item.label}
          aria-roledescription="portfolio item"
          onKeyDown={(event) => moveFocus(event, index)}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
