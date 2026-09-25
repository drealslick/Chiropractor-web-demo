import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that when navigating to any page or route,
 * the viewport resets to the top of the new page immediately.
 * If a hash anchor is present (e.g. #faq), it scrolls to that anchor element.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If there's an anchor hash, find the element and scroll to it smoothly
      const elementId = hash.replace('#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Default: Reset scroll immediately to the very top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    // Cross-browser mobile safeguard
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
};
