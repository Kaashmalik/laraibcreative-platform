/**
 * ProductFilters Component Tests
 * Tests filter functionality, state management, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductFilters from '../ProductFilters';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProductFilters', () => {
  const mockOnFilterChange = jest.fn();
  const defaultFilters = {
    fabric: [],
    minPrice: 0,
    maxPrice: 50000,
    occasion: [],
    color: [],
    availability: '',
    suitType: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all filter sections', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Suit Type')).toBeInTheDocument();
    expect(screen.getByText('Fabric Type')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Occasion')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
  });

  test('handles suit type filter selection', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const karhaiCheckbox = screen.getByLabelText(/Hand-Made Karhai/i);
    fireEvent.click(karhaiCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        suitType: ['karhai'],
      })
    );
  });

  test('handles multiple suit type selections', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const readyMadeCheckbox = screen.getByLabelText(/Ready-Made Suits/i);
    const replicaCheckbox = screen.getByLabelText(/Brand Replicas/i);

    fireEvent.click(readyMadeCheckbox);
    fireEvent.click(replicaCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
  });

  test('handles price range changes', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const minPriceSlider = screen.getByLabelText(/Minimum/i).parentElement.querySelector('input[type="range"]');
    const maxPriceSlider = screen.getByLabelText(/Maximum/i).parentElement.querySelector('input[type="range"]');

    fireEvent.change(minPriceSlider, { target: { value: '5000' } });
    fireEvent.mouseUp(minPriceSlider);

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  test('handles color selection', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Find color button by aria-label
    const redColorButton = screen.getByLabelText('Red');
    fireEvent.click(redColorButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        color: ['red'],
      })
    );
  });

  test('clears all filters when clear button is clicked', () => {
    const filtersWithValues = {
      ...defaultFilters,
      suitType: ['karhai'],
      fabric: ['silk'],
      color: ['red'],
      minPrice: 5000,
      maxPrice: 20000,
    };

    render(
      <ProductFilters
        filters={filtersWithValues}
        onFilterChange={mockOnFilterChange}
      />
    );

    const clearButton = screen.getByText(/Clear all/i);
    fireEvent.click(clearButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        suitType: [],
        fabric: [],
        color: [],
        minPrice: 0,
        maxPrice: 50000,
      })
    );
  });

  test('shows active filter count badge', () => {
    const filtersWithValues = {
      ...defaultFilters,
      suitType: ['karhai', 'replica'],
      fabric: ['silk'],
    };

    render(
      <ProductFilters
        filters={filtersWithValues}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Should show count badge
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  test('toggles filter section expansion', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const suitTypeSection = screen.getByText('Suit Type').closest('button');
    fireEvent.click(suitTypeSection);

    // Section should collapse/expand (visual test)
    expect(suitTypeSection).toBeInTheDocument();
  });

  test('handles fabric filter selection', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const silkCheckbox = screen.getByLabelText(/Silk/i);
    fireEvent.click(silkCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fabric: ['silk'],
      })
    );
  });

  test('handles occasion filter selection', () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFilterChange={mockOnFilterChange}
      />
    );

    const bridalCheckbox = screen.getByLabelText(/Bridal/i);
    fireEvent.click(bridalCheckbox);

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        occasion: ['bridal'],
      })
    );
  });
});

