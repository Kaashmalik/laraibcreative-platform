import { Sparkles, Image as ImageIcon, CheckCircle } from 'lucide-react';

/**
 * Service Type Selection Component - Step 1
 * 
 * Allows users to choose between:
 * 1. Fully Custom - Describe your own design
 * 2. Brand Article Copy - Upload reference images
 * 
 * @param {string} serviceType - Current selected service type
 * @param {string} designIdea - Design description (for fully custom)
 * @param {function} onChange - Handler for form changes
 * @param {object} errors - Validation errors
 */

export default function ServiceTypeSelection({
  serviceType,
  designIdea,
  onChange,
  errors,
}) {
  const serviceOptions = [
    {
      id: 'fully-custom',
      title: 'Fully Custom Design',
      description: 'Describe your design idea and we\'ll bring it to life',
      icon: Sparkles,
      features: [
        'Share your vision with us',
        'Custom design creation',
        'Personalized embellishments',
        'Unique one-of-a-kind piece',
      ],
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
      hoverColor: 'hover:border-purple-500',
      selectedColor: 'border-purple-600 bg-purple-50',
    },
    {
      id: 'brand-article',
      title: 'Copy Brand Article',
      description: 'Upload photos of any design you want us to replicate',
      icon: ImageIcon,
      features: [
        'Upload reference images',
        'Exact replica stitching',
        'Designer brand copies',
        'Perfect for Instagram finds',
      ],
      color: 'from-pink-500 to-rose-500',
      borderColor: 'border-pink-300',
      hoverColor: 'hover:border-pink-500',
      selectedColor: 'border-pink-600 bg-pink-50',
    },
  ];

  /**
   * Handle service type selection
   */
  const handleServiceTypeSelect = (type) => {
    onChange('serviceType', type);
    
    // Clear design idea if switching to brand article
    if (type === 'brand-article' && designIdea) {
      onChange('designIdea', '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Service Type
        </h2>
        <p className="text-gray-600">
          Select how you'd like to create your custom outfit
        </p>
      </div>

      {/* Service Type Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {serviceOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = serviceType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleServiceTypeSelect(option.id)}
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
      {errors.serviceType && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-red-700 text-sm font-medium">{errors.serviceType}</p>
        </div>
      )}

      {/* Design Idea Textarea (Only for Fully Custom) */}
      {serviceType === 'fully-custom' && (
        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="text-gray-900 font-semibold text-lg mb-2 block">
              Describe Your Design Idea
            </span>
            <span className="text-gray-600 text-sm block mb-3">
              Tell us about your dream outfit. Include details like colors, style, embellishments, neckline, sleeves, etc.
            </span>
            <textarea
              value={designIdea}
              onChange={(e) => onChange('designIdea', e.target.value)}
              placeholder="Example: I want a royal blue velvet suit with golden zari work on the neckline and sleeves. The shirt should be knee-length with a straight cut, paired with matching cigarette pants. I'd like intricate embroidery on the front and back, similar to traditional Pakistani bridal designs but in a modern style..."
              rows={8}
              className={`
                w-full px-4 py-3 border-2 rounded-xl resize-none
                focus:outline-none focus:ring-4 focus:ring-purple-200
                transition-all duration-200
                ${errors.designIdea 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-purple-500'
                }
              `}
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Be as detailed as possible for the best results
              </p>
              <p className="text-xs text-gray-500">
                {designIdea.length} characters
              </p>
            </div>
          </label>

          {/* Error Message for Design Idea */}
          {errors.designIdea && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <p className="text-red-700 text-sm font-medium">{errors.designIdea}</p>
            </div>
          )}

          {/* Tips Section */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Pro Tips for Better Results
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Mention the occasion (wedding, party, casual, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Specify fabric preferences if you have any</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Include inspiration sources (Pinterest, Instagram, celebrities)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>Describe the fit you prefer (loose, fitted, flowy)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Info Card for Brand Article */}
      {serviceType === 'brand-article' && (
        <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-600" />
            What happens next?
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            In the next step, you'll upload 2-6 clear photos of the design you want us to copy. Our expert tailors will replicate it perfectly.
          </p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-0.5">•</span>
              <span>Front, back, and side views recommended</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-0.5">•</span>
              <span>Close-up shots of embroidery or special details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 mt-0.5">•</span>
              <span>Better quality photos = more accurate replica</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}