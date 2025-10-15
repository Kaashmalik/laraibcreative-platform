// app/(customer)/account/layout.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Ruler, 
  Heart, 
  MapPin, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Simulate user data fetch
  useEffect(() => {
    // Replace with actual API call
    const userData = {
      name: 'Ayesha Khan',
      email: 'ayesha@example.com',
      phone: '+92 300 1234567',
      profileImage: '/images/placeholder.png'
    };
    setUser(userData);
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/account',
      icon: User,
      exact: true
    },
    {
      name: 'Orders',
      href: '/account/orders',
      icon: ShoppingBag,
      badge: 2 // Active orders count
    },
    {
      name: 'Measurements',
      href: '/account/measurements',
      icon: Ruler
    },
    {
      name: 'Wishlist',
      href: '/account/wishlist',
      icon: Heart,
      badge: 5
    },
    {
      name: 'Addresses',
      href: '/account/addresses',
      icon: MapPin
    },
    {
      name: 'Profile',
      href: '/account/profile',
      icon: User
    }
  ];

  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem('authToken');
    // Redirect to login
    router.push('/auth/login');
  };

  const isActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-900">My Account</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-4 py-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-lg mb-1
                      transition-colors
                      ${active 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-pink-100 text-pink-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-pink-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="p-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center justify-between px-4 py-3 rounded-lg mb-1
                        transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className={`
                          px-2 py-1 text-xs font-semibold rounded-full
                          ${active 
                            ? 'bg-white/20 text-white' 
                            : 'bg-pink-100 text-pink-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      ) : active ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : null}
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-t border-gray-200 pt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <nav className="flex justify-around items-center px-2 py-3">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center gap-1 px-3 py-2"
              >
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 transition-colors ${
                      active ? 'text-pink-600' : 'text-gray-400'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-bold bg-pink-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  active ? 'text-pink-600' : 'text-gray-500'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Menu className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">More</span>
          </button>
        </nav>
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="lg:hidden h-20" />
    </div>
  );
}