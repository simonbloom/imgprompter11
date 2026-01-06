"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Key, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "imgprompter_replicate_api_key";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);

  // Sync inputValue when apiKey prop changes (e.g., loaded from localStorage)
  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onApiKeyChange(value);

    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
    onApiKeyChange("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="space-y-2">
      <label className="mono-label flex items-center gap-2">
        <Key className="w-3 h-3" />
        Replicate API Key
      </label>

      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          value={showKey ? inputValue : inputValue}
          onChange={handleInputChange}
          placeholder="r8_..."
          className={cn(
            "w-full px-3 py-2 pr-20",
            "bg-[var(--bg-secondary)] border border-[var(--border-color)]",
            "text-sm font-mono",
            "placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:border-[var(--text-muted)]",
            "transition-colors"
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Clear key"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        <a
          href="https://replicate.com/account/api-tokens"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-[var(--text-secondary)] underline underline-offset-2"
        >
          Get your API key from Replicate
          <ExternalLink className="w-3 h-3" />
        </a>
        <span className="mx-2">·</span>
        <span>Stored locally in your browser</span>
      </p>
    </div>
  );
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || "";
    }
    return "";
  });

  return { apiKey, setApiKey };
}
