import { Shirt, Copy, Sparkles, CheckCircle } from 'lucide-react';

/**
 * Suit Type Selection Component - Step 0
 * 
 * Allows users to choose between:
 * 1. Ready-Made - Standard suits from catalog
 * 2. Replica - Copy existing designs from images
 * 3. Karhai - Hand-made suits with embroidery patterns
 * 
 * @param {string} suitType - Current selected suit type
 * @param {function} onChange - Handler for form changes
 * @param {object} errors - Validation errors
 */

export default function SuitTypeSelection({
  suitType,
  onChange,
  errors,
}) {
  const suitOptions = [
    {
      id: 'ready-made',
      title: 'Ready-Made Suit',
      description: 'Choose from our curated collection of ready-to-wear suits',
      icon: Shirt,
      features: [
        'Pre-designed styles',
        'Quick delivery (5-7 days)',
        'Standard sizes available',
        'Affordable pricing',
      ],
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
      hoverColor: 'hover:border-blue-500',
      selectedColor: 'border-blue-600 bg-blue-50',
    },
    {
      id: 'replica',
      title: 'Replica Suit',
      description: 'Upload photos and we\'ll create an exact replica',
      icon: Copy,
      features: [
        'Upload reference images',
        'Exact design replication',
        'Designer brand copies',
        'Perfect for Instagram finds',
      ],
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
      hoverColor: 'hover:border-purple-500',
      selectedColor: 'border-purple-600 bg-purple-50',
    },
    {
      id: 'karhai',
      title: 'Karhai Suit',
      description: 'Hand-made suits with intricate embroidery patterns',
      icon: Sparkles,
      features: [
        'Hand-embroidered designs',
        'Custom pattern selection',
        'Premium quality work',
        'Unique one-of-a-kind piece',
      ],
      color: 'from-rose-500 to-orange-500',
      borderColor: 'border-rose-300',
      hoverColor: 'hover:border-rose-500',
      selectedColor: 'border-rose-600 bg-rose-50',
    },
  ];

  /**
   * Handle suit type selection
   */
  const handleSuitTypeSelect = (type) => {
    onChange('suitType', type);
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Suit Type
        </h2>
        <p className="text-gray-600">
          Select the type of suit you want to order
        </p>
      </div>

      {/* Suit Type Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {suitOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = suitType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSuitTypeSelect(option.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${isSelected ? option.selectedColor : 'border-gray-200 hover:border-gray-300'}
                hover:shadow-lg active:scale-98
                focus:outline-none focus:ring-4 focus:ring-purple-200
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
                </div>
              )}

              {/* Icon with Gradient */}
              <div
                className={`
                  w-16 h-16 rounded-xl bg-gradient-to-br ${option.color}
                  flex items-center justify-center mb-4 shadow-lg
                  ${isSelected ? 'scale-110' : ''}
                  transition-transform duration-300
                `}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {option.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mt-1.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {errors.suitType && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-red-700 text-sm font-medium">{errors.suitType}</p>
        </div>
      )}
    </div>
  );
}

