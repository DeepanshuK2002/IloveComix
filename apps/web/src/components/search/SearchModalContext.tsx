"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SearchModal } from "./SearchModal";

interface SearchModalContextType {
  isOpen: boolean;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
}

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const openSearch = (query = "") => {
    setInitialQuery(query);
    setIsOpen(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setInitialQuery("");
  };

  // Global keyboard shortcut: Cmd+K / Ctrl+K / / to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInput)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SearchModalContext.Provider value={{ isOpen, openSearch, closeSearch }}>
      {children}
      <SearchModal
        isOpen={isOpen}
        onClose={closeSearch}
        initialQuery={initialQuery}
      />
    </SearchModalContext.Provider>
  );
}

export function useSearchModal() {
  const context = useContext(SearchModalContext);
  if (!context) {
    throw new Error("useSearchModal must be used within a SearchModalProvider");
  }
  return context;
}
