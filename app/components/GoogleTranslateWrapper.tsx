"use client";

import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    googleTranslateLoaded?: boolean;
  }
}

export default function GoogleTranslateWrapper() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    // Prevent duplicate initialization
    if (scriptLoadedRef.current) {
      return;
    }
    scriptLoadedRef.current = true;

    // Add styles
    const style = document.createElement("style");
    style.id = "google-translate-styles";
    style.innerHTML = `
      /* Hide Google Translate top banner */
      .goog-te-banner-frame.skiptranslate { 
        display: none !important; 
      }
      body { 
        top: 0 !important; 
      }
      iframe.skiptranslate {
        display: none !important;
      }
      body.translated-ltr {
        top: 0 !important;
      }
      
      /* Position the widget */
      #google_translate_element {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 9999 !important;
      }
      
      /* Hide the top bar */
      #goog-gt-tt, .goog-te-balloon-frame {
        display: none !important;
      }
      
      /* Style the main button */
      .goog-te-gadget-simple {
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(135deg, #000 0%, #1a1a1a 100%) !important;
        border: 2px solid rgba(163, 230, 53, 0.4) !important;
        -webkit-border-radius: 16px;
        -moz-border-radius: 16px;
        border-radius: 16px !important;
        padding: 12px 20px !important;
        -webkit-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(163, 230, 53, 0.1) !important;
        -moz-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(163, 230, 53, 0.1) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(163, 230, 53, 0.1) !important;
        transition: all 0.3s ease !important;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .goog-te-gadget-simple:hover {
        border-color: rgba(163, 230, 53, 0.7) !important;
        -webkit-box-shadow: 0 10px 40px rgba(163, 230, 53, 0.2) !important;
        -moz-box-shadow: 0 10px 40px rgba(163, 230, 53, 0.2) !important;
        box-shadow: 0 10px 40px rgba(163, 230, 53, 0.2) !important;
        transform: translateY(-2px) !important;
      }
      
      /* Style the text */
      .goog-te-menu-value span {
        color: #a3e635 !important;
        font-weight: 600 !important;
        font-size: 14px !important;
      }
      
      .goog-te-menu-value span:first-child {
        color: #a3e635 !important;
      }
      
      /* Hide powered by link */
      .goog-te-gadget-simple a {
        display: none !important;
      }
      
      /*-webkit-border-radius: 12px;
        -moz-border-radius: 12px;
         Style dropdown menu */
      .goog-te-menu-frame {
        border-radius: 12px !important;
        border: 2px solid rgba(163, 230, 53, 0.3) !important;
      }
      
      .goog-te-menu2 {
        background: #000 !important;
        border: none !important;
        max-height: 400px !important;
      }
      
      .goog-te-menu2-item div {
        color: #a3e635 !important;
        font-weight: 500 !important;
      }
      
      .goog-te-menu2-item-selected div {
        background: rgba(163, 230, 53, 0.2) !important;
        color: #bef264 !important;
      }
      
      .goog-te-menu2-item:hover div {
        background: rgba(163, 230, 53, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      const element = containerRef.current;
      if (
        element &&
        window.google &&
        window.google.translate &&
        !element.hasChildNodes()
      ) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "auto",
              includedLanguages:
                "en,ro,es,fr,de,it,pt,ru,zh-CN,ja,ko,ar,hi,tr,pl,nl",
              autoDisplay: false,
              multilanguagePage: true,
              layout:
                window.google.translate.TranslateElement.InlineLayout.VERTICAL,
            },
            "google_translate_element"
          );
        } catch (error) {
          console.error("Google Translate initialization error:", error);
        }
      }
    };

    // Load script
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      key="google-translate-widget"
      ref={containerRef}
      id="google_translate_element"
      suppressHydrationWarning
    />
  );
}
