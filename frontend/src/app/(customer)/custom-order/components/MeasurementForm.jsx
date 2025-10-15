import { useState } from 'react';
import { Ruler, Info, BookmarkPlus, Shirt } from 'lucide-react';

/**
 * Measurement Form Component - Step 4
 * 
 * Comprehensive measurement input with:
 * - Standard size chart selection
 * - Custom measurement inputs
 * - Shirt style selection
 * - Save measurements option
 * - Tooltips and guides
 * 
 * @param {boolean} useStandardSize - Whether using standard size
 * @param {string} standardSize - Selected standard size
 * @param {object} measurements - All measurement values
 * @param {boolean} saveMeasurements - Whether to save measurements
 * @param {string} measurementLabel - Label for saved measurements
 * @param {function} onToggleStandardSize - Handler for standard size toggle
 * @param {function} onStandardSizeChange - Handler for size selection
 * @param {function} onMeasurementChange - Handler for measurement changes
 * @param {function} onSaveMeasurementsChange - Handler for save toggle
 * @param {function} onLabelChange - Handler for label change
 * @param {object} errors - Validation errors
 */

// Standard Size Chart Data
const SIZE_CHART = {
  XS: {
    shoulder: 13.5, bust: 18, waist: 17.5, hip: 19, armhole: 8.5, 
    wrist: 10, sleeveLength: 21, normal: 37, cape: 35, withShalwar: 32, 
    mgirl: 34, trouserLength: 38, trouserWaist: 29, shalwarLength: 40
  },
  S: {
    shoulder: 14, bust: 19, waist: 18.5, hip: 20.5, armhole: 9,
    wrist: 11, sleeveLength: 21.5, normal: 38, cape: 36, withShalwar: 33,
    mgirl: 35, trouserLength: 39, trouserWaist: 30, shalwarLength: 41
  },
  M: {
    shoulder: 14.5, bust: 20.5, waist: 20, hip: 22, armhole: 9.75,
    wrist: 12, sleeveLength: 22, normal: 40, cape: 38, withShalwar: 36,
    mgirl: 36, trouserLength: 40, trouserWaist: 32, shalwarLength: 42
  },
  L: {
    shoulder: 15, bust: 22.5, waist: 22, hip: 24.5, armhole: 11,
    wrist: 13, sleeveLength: 22.5, normal: 40, cape: 39, withShalwar: 36,
    mgirl: 38, trouserLength: 41, trouserWaist: 34, shalwarLength: 43
  },
  XL: {
    shoulder: 16, bust: 24.5, waist: 24, hip: 26.5, armhole: 11.75,
    wrist: 14, sleeveLength: 23, normal: 41, cape: 40, withShalwar: 37,
    mgirl: 39, trouserLength: 42, trouserWaist: 35, shalwarLength: 44
  }
};

// Shirt style options
const SHIRT_STYLES = [
  { id: 'normal', label: 'Normal Length', description: 'Standard shirt length' },
  { id: 'cape', label: 'Cape Length', description: 'Shorter cape style' },
  { id: 'with-shalwar', label: 'With Shalwar', description: 'Shorter for shalwar pairing' },
  { id: 'mgirl', label: 'M-Girl Length', description: 'Modern girl style' },
];

export default function MeasurementForm({
  useStandardSize,
  standardSize,
  measurements,
  saveMeasurements,
  measurementLabel,
  onToggleStandardSize,
  onStandardSizeChange,
  onMeasurementChange,
  onSaveMeasurementsChange,
  onLabelChange,
  errors,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  /**
   * Apply standard size measurements
   */
  const applyStandardSize = (size) => {
    onStandardSizeChange(size);
    
    if (!size) return;

    const sizeData = SIZE_CHART[size];
    const style = measurements.shirtStyle || 'normal';
    
    // Map shirt length based on style
    const shirtLengthMap = {
      normal: sizeData.normal,
      cape: sizeData.cape,
      'with-shalwar': sizeData.withShalwar,
      mgirl: sizeData.mgirl,
    };

    // Apply all measurements
    onMeasurementChange('shoulderWidth', sizeData.shoulder);
    onMeasurementChange('bust', sizeData.bust);
    onMeasurementChange('waist', sizeData.waist);
    onMeasurementChange('hip', sizeData.hip);
    onMeasurementChange('armHole', sizeData.armhole);
    onMeasurementChange('wrist', sizeData.wrist);
    onMeasurementChange('sleeveLength', sizeData.sleeveLength);
    onMeasurementChange('shirtLength', shirtLengthMap[style]);
    onMeasurementChange('trouserLength', sizeData.trouserLength);
    onMeasurementChange('trouserWaist', sizeData.trouserWaist);
  };

  /**
   * Handle shirt style change and update shirt length
   */
  const handleShirtStyleChange = (style) => {
    onMeasurementChange('shirtStyle', style);
    
    // Update shirt length if using standard size
    if (useStandardSize && standardSize) {
      const sizeData = SIZE_CHART[standardSize];
      const lengthMap = {
        normal: sizeData.normal,
        cape: sizeData.cape,
        'with-shalwar': sizeData.withShalwar,
        mgirl: sizeData.mgirl,
      };
      onMeasurementChange('shirtLength', lengthMap[style]);
    }
  };

  /**
   * Measurement field component
   */
  const MeasurementField = ({ label, field, tooltip, required = false }) => (
    <div className="relative">
      <label className="block mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {tooltip && (
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip(field)}
              onMouseLeave={() => setActiveTooltip(null)}
              className="text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            step="0.5"
            value={measurements[field]}
            onChange={(e) => onMeasurementChange(field, e.target.value)}
            disabled={useStandardSize && standardSize}
            placeholder="0.0"
            className={`
              w-full px-3 py-2 pr-16 border-2 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-4 focus:ring-purple-200
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${errors[`measurements.${field}`]
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-purple-500'
              }
            `}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            inches
          </span>
        </div>
      </label>

      {/* Tooltip */}
      {activeTooltip === field && tooltip && (
        <div className="absolute z-10 bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          {tooltip}
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Error Message */}
      {errors[`measurements.${field}`] && (
        <p className="mt-1 text-xs text-red-600">{errors[`measurements.${field}`]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Your Measurements
        </h2>
        <p className="text-gray-600">
          Choose a standard size or enter custom measurements for a perfect fit
        </p>
      </div>

      {/* Standard Size Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <Ruler className="w-5 h-5 text-purple-600" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useStandardSize}
            onChange={(e) => onToggleStandardSize(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <span className="font-medium text-gray-900">
            Use Standard Size Chart
          </span>
        </label>
      </div>

      {/* Standard Size Selection */}
      {useStandardSize && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Select Your Size</h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.keys(SIZE_CHART).map((size) => (
              <button
                key={size}
                onClick={() => applyStandardSize(size)}
                className={`
                  py-3 px-4 rounded-xl font-semibold transition-all duration-200
                  ${standardSize === size
                    ? 'bg-gradient-to-br from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>

          {errors.standardSize && (
            <p className="text-sm text-red-600 font-medium">{errors.standardSize}</p>
          )}

          {/* Size Chart Reference */}
          {standardSize && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Standard size <strong>{standardSize}</strong> measurements applied. 
                You can still customize individual measurements below if needed.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shirt Style Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Shirt Style</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {SHIRT_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleShirtStyleChange(style.id)}
              className={`
                p-4 rounded-xl text-left transition-all duration-200 border-2
                ${measurements.shirtStyle === style.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300'
                }
              `}
            >
              <p className="font-semibold text-gray-900">{style.label}</p>
              <p className="text-sm text-gray-600 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Measurement Sections */}
      <div className="space-y-6">
        {/* Upper Body Measurements */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
            Upper Body Measurements
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <MeasurementField
              label="Shirt Length"
              field="shirtLength"
              tooltip="Measure from shoulder to desired length"
              required
            />
            <MeasurementField
              label="Shoulder Width"
              field="shoulderWidth"
              tooltip="Measure across shoulders from one end to other"
              required
            />
            <MeasurementField
              label="Sleeve Length"
              field="sleeveLength"
              tooltip="Measure from shoulder to wrist"
            />
            <MeasurementField
              label="Arm Hole"
              field="armHole"
              tooltip="Circumference around arm hole"
            />
            <MeasurementField
              label="Bust/Chest"
              field="bust"
              tooltip="Measure around fullest part of bust"
              required
            />
            <MeasurementField
              label="Waist"
              field="waist"
              tooltip="Measure around natural waistline"
              required
            />
            <MeasurementField
              label="Hip"
              field="hip"
              tooltip="Measure around fullest part of hips"
            />
            <MeasurementField
              label="Wrist Circumference"
              field="wrist"
              tooltip="Measure around wrist bone"
            />
            <MeasurementField
              label="Front Neck Depth"
              field="frontNeckDepth"
              tooltip="Depth of neckline from shoulder"
            />
            <MeasurementField
              label="Back Neck Depth"
              field="backNeckDepth"
              tooltip="Depth of back neckline"
            />
          </div>
        </div>

        {/* Lower Body Measurements */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
            Lower Body Measurements
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <MeasurementField
              label="Trouser Length"
              field="trouserLength"
              tooltip="Measure from waist to ankle"
            />
            <MeasurementField
              label="Trouser Waist"
              field="trouserWaist"
              tooltip="Waist circumference for trouser"
            />
            <MeasurementField
              label="Trouser Hip"
              field="trouserHip"
              tooltip="Hip measurement for trouser"
            />
            <MeasurementField
              label="Thigh"
              field="thigh"
              tooltip="Circumference around fullest part of thigh"
            />
            <MeasurementField
              label="Bottom (Pajama/Trouser)"
              field="bottom"
              tooltip="Bottom opening width"
            />
            <MeasurementField
              label="Knee Length"
              field="kneeLength"
              tooltip="Measure from waist to knee"
            />
          </div>
        </div>

        {/* Dupatta Measurements */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">
            Dupatta (Optional)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <MeasurementField
              label="Dupatta Length"
              field="dupattaLength"
              tooltip="Desired length of dupatta"
            />
            <MeasurementField
              label="Dupatta Width"
              field="dupattaWidth"
              tooltip="Desired width of dupatta"
            />
          </div>
        </div>
      </div>

      {/* Save Measurements Option */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveMeasurements}
            onChange={(e) => onSaveMeasurementsChange(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900">
                Save these measurements to my profile
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Quickly reuse these measurements for future orders
            </p>
          </div>
        </label>

        {saveMeasurements && (
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                Label these measurements as:
              </span>
              <input
                type="text"
                value={measurementLabel}
                onChange={(e) => onLabelChange(e.target.value)}
                placeholder="e.g., My Size, Sister's Size, Mom's Size"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
              />
            </label>
          </div>
        )}
      </div>

      {/* Measurement Guide */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          How to Measure Yourself
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Use a flexible measuring tape</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Wear fitted clothing or measure over a slip</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Stand straight and relax your body</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Don't pull the tape too tight or too loose</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Ask someone to help for accurate measurements</span>
          </li>
        </ul>
        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium underline">
          Watch Video Guide →
        </button>
      </div>
    </div>
  );
}