"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Table of Contents Component
 * Automatically generates TOC from heading tags in content
 * 
 * @param {Object} props
 * @param {string} props.content - HTML content to extract headings from
 * @param {string} props.className - Additional CSS classes
 */
export default function TableOfContents({ content, className = '' }) {
  const [headings, setHeadings] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;

    // Extract headings from HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4');
    
    const extractedHeadings = Array.from(headingElements).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      
      return {
        id,
        text: heading.textContent.trim(),
        level: parseInt(heading.tagName.charAt(1)) // h2 = 2, h3 = 3, etc.
      };
    });

    setHeadings(extractedHeadings);

    // Set up scroll spy for active heading
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = extractedHeadings.length - 1; i >= 0; i--) {
        const element = document.getElementById(extractedHeadings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(extractedHeadings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for sticky header
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-6 border border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-4 font-semibold text-gray-900"
      >
        <span>Table of Contents</span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {isExpanded && (
        <nav className="space-y-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
              className={`block py-2 px-3 rounded-md transition-colors text-sm ${
                heading.level === 2
                  ? 'font-medium text-gray-900'
                  : heading.level === 3
                  ? 'font-normal text-gray-700 ml-4'
                  : 'font-normal text-gray-600 ml-8'
              } ${
                activeId === heading.id
                  ? 'bg-pink-100 text-pink-700 border-l-2 border-pink-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

