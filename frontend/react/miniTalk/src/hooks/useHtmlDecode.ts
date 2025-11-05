import { useMemo } from 'react';

export const useHtmlDecode = (text: string) => {
  return useMemo(() => {
    // Create a temporary DOM element to decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }, [text]);
};

// Alternative approach using direct replacement
export const useHtmlDecodeManual = (text: string) => {
  return useMemo(() => {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#039;/g, "'");
  }, [text]);
};