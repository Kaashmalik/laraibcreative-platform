'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Pagination Component
 * ----------------------------------------
 * - Reusable pagination for Ads, Admin tables, etc.
 * - Accessible and responsive
 */

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center mt-6 gap-2"
      role="navigation"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-primary text-white border-primary'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </motion.div>
  );
};

export default Pagination;
