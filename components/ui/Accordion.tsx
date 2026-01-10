"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  summary?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Accordion({
  title,
  summary,
  isOpen,
  onToggle,
  isCompleted = false,
  children,
  icon,
}: AccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div className="border border-[var(--border-color)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "w-full flex items-center justify-between p-4",
          "text-left transition-colors",
          "hover:bg-[var(--bg-secondary)]/50",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--accent-ai)]"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCompleted ? (
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          ) : icon ? (
            <span className="flex-shrink-0 text-[var(--text-muted)]">{icon}</span>
          ) : null}
          <span className="font-medium text-[var(--text-primary)]">{title}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {!isOpen && summary && (
            <span className="text-sm text-[var(--text-muted)] truncate max-w-[200px]">
              {summary}
            </span>
          )}
          <ChevronRight
            className={cn(
              "w-4 h-4 text-[var(--text-muted)] transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </div>
      </button>

      <div
        style={{
          height: isOpen ? height : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out"
        )}
      >
        <div ref={contentRef} className="px-4 pt-4 pb-5 border-t border-[var(--border-color)]">
          {children}
        </div>
      </div>
    </div>
  );
}
