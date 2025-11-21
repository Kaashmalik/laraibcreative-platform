import { Sparkles, Info } from 'lucide-react';

/**
 * Karhai Pattern Selection Component
 * 
 * Allows users to select embroidery patterns for karhai suits:
 * - Embroidery type (zardozi, aari, sequins, beads, thread, mixed)
 * - Complexity level (simple, moderate, intricate, heavy)
 * - Coverage (minimal, partial, full, heavy)
 * 
 * @param {object} karhaiPattern - Current karhai pattern selection
 * @param {function} onChange - Handler for pattern changes
 * @param {object} errors - Validation errors
 */

const EMBROIDERY_TYPES = [
  { value: 'zardozi', label: 'Zardozi', description: 'Gold and silver thread work', priceMultiplier: 1.5 },
  { value: 'aari', label: 'Aari', description: 'Traditional hand embroidery', priceMultiplier: 1.3 },
  { value: 'sequins', label: 'Sequins', description: 'Shimmering sequin work', priceMultiplier: 1.2 },
  { value: 'beads', label: 'Beads', description: 'Beaded embellishments', priceMultiplier: 1.4 },
  { value: 'thread', label: 'Thread Work', description: 'Colorful thread embroidery', priceMultiplier: 1.1 },
  { value: 'mixed', label: 'Mixed', description: 'Combination of techniques', priceMultiplier: 1.6 },
  { value: 'none', label: 'No Embroidery', description: 'Plain suit without embroidery', priceMultiplier: 1.0 },
];

const COMPLEXITY_LEVELS = [
  { value: 'simple', label: 'Simple', description: 'Basic patterns, minimal detail', priceMultiplier: 1.0 },
  { value: 'moderate', label: 'Moderate', description: 'Moderate detail and patterns', priceMultiplier: 1.2 },
  { value: 'intricate', label: 'Intricate', description: 'Detailed and complex patterns', priceMultiplier: 1.5 },
  { value: 'heavy', label: 'Heavy', description: 'Extensive embroidery coverage', priceMultiplier: 2.0 },
];

const COVERAGE_OPTIONS = [
  { value: 'minimal', label: 'Minimal', description: 'Small accents only', priceMultiplier: 1.0 },
  { value: 'partial', label: 'Partial', description: 'Some areas covered', priceMultiplier: 1.3 },
  { value: 'full', label: 'Full', description: 'Complete coverage', priceMultiplier: 1.8 },
  { value: 'heavy', label: 'Heavy', description: 'Maximum coverage', priceMultiplier: 2.5 },
];

export default function KarhaiPatternSelection({
  karhaiPattern = {},
  onChange,
  errors,
}) {
  const handleChange = (field, value) => {
    onChange('karhaiPattern', {
      ...karhaiPattern,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-rose-600" />
          Karhai Embroidery Pattern Selection
        </h2>
        <p className="text-gray-600">
          Customize your hand-made karhai suit with beautiful embroidery
        </p>
      </div>

      {/* Embroidery Type Selection */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-900 font-semibold text-lg mb-3 block">
            Embroidery Type <span className="text-red-500">*</span>
          </span>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EMBROIDERY_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('embroideryType', type.value)}
                className={`
                  p-4 rounded-xl text-left border-2 transition-all duration-200
                  ${karhaiPattern.embroideryType === type.value
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-300 hover:border-rose-300'
                  }
                `}
              >
                <p className="font-semibold text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </label>
        {errors['karhaiPattern.embroideryType'] && (
          <p className="text-sm text-red-600">{errors['karhaiPattern.embroideryType']}</p>
        )}
      </div>

      {/* Complexity Level Selection */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-900 font-semibold text-lg mb-3 block">
            Complexity Level <span className="text-red-500">*</span>
          </span>
          <div className="grid md:grid-cols-2 gap-3">
            {COMPLEXITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => handleChange('complexity', level.value)}
                className={`
                  p-4 rounded-xl text-left border-2 transition-all duration-200
                  ${karhaiPattern.complexity === level.value
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-300 hover:border-rose-300'
                  }
                `}
              >
                <p className="font-semibold text-gray-900">{level.label}</p>
                <p className="text-sm text-gray-600 mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </label>
        {errors['karhaiPattern.complexity'] && (
          <p className="text-sm text-red-600">{errors['karhaiPattern.complexity']}</p>
        )}
      </div>

      {/* Coverage Selection */}
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-900 font-semibold text-lg mb-3 block">
            Embroidery Coverage <span className="text-red-500">*</span>
          </span>
          <div className="grid md:grid-cols-2 gap-3">
            {COVERAGE_OPTIONS.map((coverage) => (
              <button
                key={coverage.value}
                type="button"
                onClick={() => handleChange('coverage', coverage.value)}
                className={`
                  p-4 rounded-xl text-left border-2 transition-all duration-200
                  ${karhaiPattern.coverage === coverage.value
                    ? 'border-rose-500 bg-rose-50 shadow-md'
                    : 'border-gray-300 hover:border-rose-300'
                  }
                `}
              >
                <p className="font-semibold text-gray-900">{coverage.label}</p>
                <p className="text-sm text-gray-600 mt-1">{coverage.description}</p>
              </button>
            ))}
          </div>
        </label>
        {errors['karhaiPattern.coverage'] && (
          <p className="text-sm text-red-600">{errors['karhaiPattern.coverage']}</p>
        )}
      </div>

      {/* Additional Description */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-gray-900 font-semibold text-lg mb-2 block">
            Additional Pattern Details (Optional)
          </span>
          <textarea
            value={karhaiPattern.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe any specific patterns, motifs, or design elements you'd like..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-rose-200 focus:border-rose-500 transition-all duration-200"
          />
        </label>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl border border-rose-200">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-600" />
          Karhai Suit Information
        </h4>
        <ul className="space-y-1 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-rose-600 mt-0.5">•</span>
            <span>Karhai suits are hand-made with premium embroidery work</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-600 mt-0.5">•</span>
            <span>Delivery time: 15-21 days (depending on complexity)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-600 mt-0.5">•</span>
            <span>Price varies based on embroidery type, complexity, and coverage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-600 mt-0.5">•</span>
            <span>Our expert artisans will bring your vision to life</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

