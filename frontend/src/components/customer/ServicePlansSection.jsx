'use client';

import { Check, Shield, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Basic Stitching',
        price: '2,500',
        description: 'Perfect for daily wear lawn and cotton suits. Simple, elegant, and durable.',
        icon: Shield,
        features: [
            'Standard Cutting & Stitching',
            'Simple Overlock',
            'Basic Buttons & Piping',
            '7-10 Days Delivery',
            'Perfect Fit Guarantee'
        ],
        highlight: false,
        color: 'from-blue-400 to-cyan-500'
    },
    {
        name: 'Premium Boutique',
        price: '4,500',
        description: 'Designer finish for chiffon, silk, and party wear. Detailed craftsmanship.',
        icon: Zap,
        features: [
            'Premium Lining (Atal/Grip)',
            'Invisible Stitching/Hemming',
            'Fancy Buttons, Laces & Piping',
            'Complex Necklines & Sleeves',
            '5-7 Days Priority Delivery',
            'Alterations Included'
        ],
        highlight: true,
        tag: 'Most Popular',
        color: 'from-brand-pink to-brand-purple'
    },
    {
        name: 'Bridal & Formals',
        price: '12,000+',
        description: 'Masterpiece creation for Lehengas, Maxis, and heavy wedding ensembles.',
        icon: Crown,
        features: [
            'Expert Pattern Making',
            'Heavy Can-Can Attachment',
            'Zardozi/Handwork Repair',
            'Multiple Fittings/Trials',
            'Express 3-Day Delivery Available',
            'Designer Consultation'
        ],
        highlight: false,
        color: 'from-amber-400 to-orange-500'
    }
];

export default function ServicePlansSection() {
    return (
        <section className="py-16 lg:py-24 relative overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-pink/5 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-brand-purple/5 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-clip-text text-transparent gradient-text-animate inline-block">
                        Tailoring Packages
                    </h2>
                    <p className="text-lg text-gray-600">
                        Choose the perfect stitching package for your needs. From daily wear to your big day, we handle it all with precision and care.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`
                relative rounded-2xl p-8 transition-all duration-300
                ${plan.highlight ? 'bg-white shadow-xl scale-105 border-2 border-brand-pink/20 z-10' : 'bg-gray-50 border border-gray-100 hover:shadow-lg hover:-translate-y-2'}
              `}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-gradient-to-r from-brand-pink to-brand-purple text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                                        {plan.tag}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${plan.color} bg-opacity-10 text-white shadow-lg`}>
                                    <plan.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline">
                                    <span className="text-sm font-medium text-gray-500 align-top mt-1">PKR</span>
                                    <span className="text-4xl font-bold text-gray-900 mx-1">{plan.price}</span>
                                    {plan.price.includes('+') ? '' : <span className="text-gray-500">/suit</span>}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600">
                                        <span className={`mr-3 p-0.5 rounded-full bg-green-100 text-green-600 shrink-0`}>
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/custom-order"
                                className={`
                  block w-full py-3.5 rounded-xl text-center font-medium transition-all duration-200
                  ${plan.highlight
                                        ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-lg hover:shadow-brand-pink/25 hover:scale-[1.02]'
                                        : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'}
                `}
                            >
                                Book Now
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">
                        Need a custom bulk order or have specific requirements? <Link href="/contact" className="text-brand-pink font-medium hover:underline">Contact us</Link> for a quote.
                    </p>
                </div>
            </div>
        </section>
    );
}
