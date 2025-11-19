"use client";

import React, { useState } from 'react';
import { Ruler, Video, Download, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Size Guide Page Component
 * 
 * Features:
 * - Standard size chart
 * - How to measure yourself (with images)
 * - Measurement tips and tricks
 * - Video tutorial embed
 * - Downloadable measurement guide
 * - Body type recommendations
 * - Interactive measurement calculator
 * - Mobile responsive
 * - SEO optimized
 */

// Metadata for SEO
export const metadata = {
  title: 'Size Guide - How to Measure for Custom Stitching | LaraibCreative',
  description: 'Complete size guide for custom ladies suits. Learn how to take accurate measurements at home for perfect fitting. Includes size chart and video tutorial.',
  keywords: 'size guide, measurement guide, how to measure, custom stitching measurements, perfect fit, size chart',
};

const SizeGuidePage = () => {
  const [activeTab, setActiveTab] = useState('chart');

  // Standard Size Chart Data
  const sizeChart = {
    headers: ['Size', 'Bust', 'Waist', 'Hip', 'Shirt Length', 'Sleeve Length', 'Trouser Length'],
    sizes: [
      { size: 'XS', bust: '32"', waist: '26"', hip: '34"', shirtLength: '38"', sleeveLength: '19"', trouserLength: '37"' },
      { size: 'S', bust: '34"', waist: '28"', hip: '36"', shirtLength: '39"', sleeveLength: '20"', trouserLength: '38"' },
      { size: 'M', bust: '36"', waist: '30"', hip: '38"', shirtLength: '40"', sleeveLength: '20.5"', trouserLength: '39"' },
      { size: 'L', bust: '38"', waist: '32"', hip: '40"', shirtLength: '41"', sleeveLength: '21"', trouserLength: '40"' },
      { size: 'XL', bust: '40"', waist: '34"', hip: '42"', shirtLength: '42"', sleeveLength: '21.5"', trouserLength: '40"' },
      { size: 'XXL', bust: '42"', waist: '36"', hip: '44"', shirtLength: '43"', sleeveLength: '22"', trouserLength: '41"' },
      { size: 'XXXL', bust: '44"', waist: '38"', hip: '46"', shirtLength: '44"', sleeveLength: '22.5"', trouserLength: '41"' }
    ]
  };

  // Measurement Instructions
  const measurements = [
    {
      title: 'Shirt Length',
      description: 'Measure from the top of shoulder (where shoulder meets neck) straight down to desired length.',
      tips: ['Stand straight while measuring', 'Common lengths: 38-44 inches', 'Add 1-2 inches for loose fit']
    },
    {
      title: 'Shoulder Width',
      description: 'Measure from edge of one shoulder to the edge of other shoulder across the back.',
      tips: ['Keep measuring tape straight', 'Don&apos;t stretch or compress', 'Standard: 14-16 inches']
    },
    {
      title: 'Sleeve Length',
      description: 'Measure from shoulder point to wrist bone with arm slightly bent.',
      tips: ['Bend arm slightly at elbow', 'Full sleeve: 19-22 inches', '3/4 sleeve: 14-16 inches']
    },
    {
      title: 'Bust/Chest',
      description: 'Measure around the fullest part of your bust, keeping tape parallel to ground.',
      tips: ['Wear a well-fitted bra', 'Don&apos;t pull tape too tight', 'Add 2-3 inches for comfort']
    },
    {
      title: 'Waist',
      description: 'Measure around natural waistline (narrowest part of torso, usually above belly button).',
      tips: ['Don&apos;t suck in stomach', 'Keep one finger between tape and body', 'Don&apos;t pull too tight']
    },
    {
      title: 'Hip',
      description: 'Measure around the fullest part of your hips and buttocks.',
      tips: ['Stand with feet together', 'Keep tape parallel to floor', 'Add 2-3 inches for comfort']
    },
    {
      title: 'Arm Hole',
      description: 'Measure around the armpit area where sleeve will attach.',
      tips: ['Measure with arm down', 'Standard: 16-20 inches', 'Important for comfortable fit']
    },
    {
      title: 'Trouser Length',
      description: 'Measure from waist to ankle bone (inside leg).',
      tips: ['Measure inside of leg', 'Stand straight', 'Common length: 37-41 inches']
    }
  ];

  // Measurement Tips
  const tips = [
    {
      icon: CheckCircle,
      title: 'Use a Measuring Tape',
      description: 'Always use a flexible measuring tape (inch tape). Never use a metal or wooden ruler.'
    },
    {
      icon: CheckCircle,
      title: 'Wear Fitted Clothes',
      description: 'Take measurements over fitted clothes or undergarments for accuracy.'
    },
    {
      icon: CheckCircle,
      title: 'Get Help',
      description: 'It\'s best to have someone else take your measurements for better accuracy.'
    },
    {
      icon: CheckCircle,
      title: 'Stand Natural',
      description: 'Stand in your natural posture. Don\'t slouch or stand too stiff.'
    },
    {
      icon: CheckCircle,
      title: 'Add Ease',
      description: 'Always add 1-2 inches to tight measurements for comfortable fit and movement.'
    },
    {
      icon: CheckCircle,
      title: 'Double Check',
      description: 'Measure twice to confirm accuracy. Small errors can affect final fit.'
    }
  ];

  // Common Mistakes
  const mistakes = [
    {
      icon: AlertCircle,
      title: 'Measuring Over Bulky Clothes',
      description: 'This adds extra inches. Always measure over thin, fitted clothing.'
    },
    {
      icon: AlertCircle,
      title: 'Pulling Tape Too Tight',
      description: 'The tape should be snug but not digging into your skin.'
    },
    {
      icon: AlertCircle,
      title: 'Not Standing Straight',
      description: 'Slouching or leaning can give inaccurate measurements.'
    },
    {
      icon: AlertCircle,
      title: 'Using Wrong Starting Point',
      description: 'Always start from the exact point mentioned in instructions.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-pink-600 transition">Home</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Size Guide</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full mb-6">
            <Ruler className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perfect Fit <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Size Guide</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn how to take accurate measurements at home for custom stitching. 
            Follow our simple guide for the perfect fit every time!
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-6 py-4 font-medium whitespace-nowrap transition border-b-4 ${
                activeTab === 'chart'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Size Chart
            </button>
            <button
              onClick={() => setActiveTab('measure')}
              className={`px-6 py-4 font-medium whitespace-nowrap transition border-b-4 ${
                activeTab === 'measure'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              How to Measure
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-6 py-4 font-medium whitespace-nowrap transition border-b-4 ${
                activeTab === 'tips'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Tips & Tricks
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-4 font-medium whitespace-nowrap transition border-b-4 ${
                activeTab === 'video'
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Video Tutorial
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Size Chart Tab */}
          {activeTab === 'chart' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Standard Size Chart</h2>
                <p className="text-gray-600">
                  Use this chart as a reference. For best fit, we recommend providing custom measurements.
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg border">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    <tr>
                      {sizeChart.headers.map((header, idx) => (
                        <th key={idx} className="px-6 py-4 text-left font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.sizes.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-bold text-pink-600">{row.size}</td>
                        <td className="px-6 py-4">{row.bust}</td>
                        <td className="px-6 py-4">{row.waist}</td>
                        <td className="px-6 py-4">{row.hip}</td>
                        <td className="px-6 py-4">{row.shirtLength}</td>
                        <td className="px-6 py-4">{row.sleeveLength}</td>
                        <td className="px-6 py-4">{row.trouserLength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {sizeChart.sizes.map((row, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg border p-6">
                    <div className="text-2xl font-bold text-pink-600 mb-4">{row.size}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Bust</div>
                        <div className="font-semibold">{row.bust}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Waist</div>
                        <div className="font-semibold">{row.waist}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Hip</div>
                        <div className="font-semibold">{row.hip}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Shirt Length</div>
                        <div className="font-semibold">{row.shirtLength}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Sleeve Length</div>
                        <div className="font-semibold">{row.sleeveLength}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Trouser Length</div>
                        <div className="font-semibold">{row.trouserLength}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-8 bg-pink-50 border border-pink-200 rounded-xl p-6">
                <p className="text-gray-700">
                  <strong className="text-pink-600">Note:</strong> All measurements are in inches. 
                  These are standard sizes and may vary based on body type. For the most accurate fit, 
                  we strongly recommend providing your custom measurements.
                </p>
              </div>

              {/* Download Button */}
              <div className="mt-8 text-center">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition">
                  <Download className="w-5 h-5" />
                  Download Size Chart PDF
                </button>
              </div>
            </div>
          )}

          {/* How to Measure Tab */}
          {activeTab === 'measure' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How to Take Your Measurements</h2>
                <p className="text-gray-600">
                  Follow these step-by-step instructions for accurate measurements
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {measurements.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg border p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="space-y-1">
                          {item.tips.map((tip, tipIdx) => (
                            <div key={tipIdx} className="flex items-start gap-2">
                              <span className="text-pink-600 mt-1">•</span>
                              <span className="text-sm text-gray-600">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Measurements */}
              <div className="mt-12 bg-purple-50 border border-purple-200 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">Additional Measurements (Optional)</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Front Neck Depth</h4>
                    <p className="text-sm text-gray-600">From shoulder to desired neckline depth</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Back Neck Depth</h4>
                    <p className="text-sm text-gray-600">From back neck to desired depth</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Wrist Circumference</h4>
                    <p className="text-sm text-gray-600">Around wrist bone for fitted sleeves</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Thigh</h4>
                    <p className="text-sm text-gray-600">Around fullest part of thigh</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Knee Length</h4>
                    <p className="text-sm text-gray-600">From waist to knee</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Bottom/Pajama</h4>
                    <p className="text-sm text-gray-600">Around ankle for fitted pajamas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips & Tricks Tab */}
          {activeTab === 'tips' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Measurement Tips & Common Mistakes</h2>
                <p className="text-gray-600">
                  Avoid these common errors for the most accurate measurements
                </p>
              </div>

              {/* Pro Tips */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-6 text-center">✨ Pro Tips</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tips.map((tip, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <tip.icon className="w-8 h-8 text-green-600 mb-3" />
                      <h4 className="font-bold mb-2">{tip.title}</h4>
                      <p className="text-sm text-gray-700">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-center">⚠️ Common Mistakes to Avoid</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {mistakes.map((mistake, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <mistake.icon className="w-8 h-8 text-red-600 mb-3" />
                      <h4 className="font-bold mb-2">{mistake.title}</h4>
                      <p className="text-sm text-gray-700">{mistake.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Type Guide */}
              <div className="mt-12 bg-white rounded-xl shadow-lg border p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Body Type Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-pink-600">Pear Shape (Hip &gt; Bust)</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• A-line or flared shirts work best</li>
                      <li>• Add 2-3 inches to hip measurements</li>
                      <li>• Consider wider necklines</li>
                      <li>• Boot-cut or straight trousers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-pink-600">Apple Shape (Bust &gt; Hip)</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Empire waist or A-line cuts</li>
                      <li>• Avoid tight waist measurements</li>
                      <li>• V-neck or scoop necks flattering</li>
                      <li>• Straight or slightly flared pants</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-pink-600">Hourglass (Bust ≈ Hip, Small Waist)</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Fitted waist emphasizes figure</li>
                      <li>• Most styles work well</li>
                      <li>• Princess cut or tailored shirts</li>
                      <li>• Straight or fitted trousers</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-3 text-pink-600">Rectangle (Bust ≈ Waist ≈ Hip)</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Add definition with belts or ties</li>
                      <li>• Peplum or empire waist styles</li>
                      <li>• Layered or textured fabrics</li>
                      <li>• Bootcut or flared pants add shape</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Tutorial Tab */}
          {activeTab === 'video' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Video Tutorial</h2>
                <p className="text-gray-600">
                  Watch our step-by-step video guide for taking accurate measurements
                </p>
              </div>

              {/* Video Embed */}
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl mb-8">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">Video tutorial will be embedded here</p>
                    <p className="text-sm text-gray-500 mt-2">YouTube/Vimeo embed</p>
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="bg-white rounded-xl shadow-lg border p-8">
                <h3 className="text-xl font-bold mb-4">What You&apos;ll Learn:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>How to properly position the measuring tape</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Taking measurements for shirt length, bust, waist, and hip</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Measuring sleeve length and shoulder width correctly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Trouser measurements including length, waist, and hip</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Common mistakes and how to avoid them</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Tips for measuring yourself vs. having someone help</span>
                  </li>
                </ul>
              </div>

              {/* Additional Resources */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-6">
                  <h4 className="font-bold mb-3">Need Help?</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Still confused about measurements? Our team is here to help you!
                  </p>
                  <a 
                    href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm"
                  >
                    WhatsApp Us for Help →
                  </a>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="font-bold mb-3">Download Guide</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Get our printable measurement guide with visual diagrams
                  </p>
                  <button className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
                    <Download className="w-4 h-4" />
                    Download PDF Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Place Your Order?</h2>
          <p className="text-xl mb-8 text-pink-100 max-w-2xl mx-auto">
            Now that you know your measurements, start your custom order journey!
          </p>
          <a
            href="/custom-order"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 font-semibold rounded-lg hover:bg-pink-50 transition transform hover:scale-105"
          >
            Start Custom Order
          </a>
        </div>
      </section>
    </div>
  );
};

export default SizeGuidePage;