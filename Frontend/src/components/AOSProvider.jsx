'use client';

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS CSS

export default function AOSProvider({ children }) {
  useEffect(() => {
    AOS.init({
      duration: 500, // Customize as needed
      once: false,     // Whether animation should happen only once
    });
  }, []);

  return children;
}
