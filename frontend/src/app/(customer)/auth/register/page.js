"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react';
import { checkPasswordStrength, getStrengthColor, getStrengthTextColor } from '@/lib/passwordStrength';
import { registerSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const { register: registerUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [conflictError, setConflictError] = useState(null); // { type: 'email' | 'phone', message: string }

  // Check password strength on password change
  useEffect(() => {
    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear conflict error when user changes email or phone
    if (conflictError && (name === 'email' || name === 'phone')) {
      setConflictError(null);
    }
    
    // Clear submit error when user starts typing
    if (errors.submit) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.submit;
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = async () => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
      return;
    }

    setSubmitting(true);
    setConflictError(null); // Clear previous conflict errors
    
    try {
      const result = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      if (result.success) {
        // Show success message about email verification
        setRegistrationSuccess(true);
        // Redirect to account page after a short delay
        setTimeout(() => {
          router.replace('/account');
        }, 3000);
      } else {
        // Check if it's a conflict error (email/phone already exists)
        if (result.conflictType) {
          setConflictError({
            type: result.conflictType,
            field: result.conflictField || result.conflictType,
            message: result.error
          });
          // Also set field-specific error
          if (result.conflictField === 'email') {
            setErrors({ email: 'This email is already registered' });
          } else if (result.conflictField === 'phone') {
            setErrors({ phone: 'This phone number is already registered' });
          }
        } else {
          setErrors({ submit: result.error || 'Registration failed' });
        }
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    router.replace('/account');
    return null;
  }

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Pakistani number: 0300-1234567
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 11) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // Show success message if registration was successful
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Please check your email</strong> and click the verification link to activate your account.
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to your account page...
          </p>
          <Link
            href="/account"
            className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md"
          >
            Go to My Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Create Account</h1>
        <p className="text-sm text-gray-600 mb-6">Join LaraibCreative to start ordering</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              required
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                errors.fullName && touched.fullName
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && touched.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                errors.email && touched.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone/Mobile Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              required
              maxLength={12}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                errors.phone && touched.phone
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
              }`}
              placeholder="0300-1234567"
            />
            {errors.phone && touched.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Enter your Pakistani mobile number</p>
          </div>

          {/* Password Field with Strength Indicator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                required
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                  errors.password && touched.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && passwordStrength && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${getStrengthTextColor(passwordStrength.strength)}`}>
                    {passwordStrength.feedback}
                  </span>
                  <span className="text-xs text-gray-500">{passwordStrength.score}%</span>
                </div>
                
                {/* Strength Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>

                {/* Password Requirements Checklist */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.length ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.lowercase ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      Lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.uppercase ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                      Uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.number ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}>
                      Number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength.checks.special ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300" />
                    )}
                    <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-500'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>

                {/* Suggestions */}
                {passwordStrength.suggestions && passwordStrength.suggestions.length > 0 && 
                 passwordStrength.suggestions[0] !== 'Great! Your password meets all requirements' && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-900 mb-1">Suggestions:</p>
                    <ul className="text-xs text-blue-700 space-y-0.5">
                      {passwordStrength.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-4 transition ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Conflict Error - Email/Phone Already Exists */}
          {conflictError && (
            <div className="p-4 rounded-lg bg-orange-50 border-2 border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    {conflictError.type === 'email' 
                      ? 'Email Already Registered' 
                      : 'Phone Number Already Registered'}
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    {conflictError.type === 'email' 
                      ? `An account with the email ${formData.email} already exists.`
                      : `The phone number ${formData.phone} is already registered.`}
                  </p>
                  {conflictError.type === 'email' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-900">What would you like to do?</p>
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/auth/login"
                          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-sm"
                        >
                          Sign In to Your Account
                        </Link>
                        <Link
                          href="/auth/forgot-password"
                          className="inline-flex items-center justify-center px-4 py-2 bg-white border-2 border-orange-300 text-orange-700 text-sm font-semibold rounded-lg hover:bg-orange-50 transition"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  )}
                  {conflictError.type === 'phone' && (
                    <div className="space-y-2">
                      <p className="text-sm text-orange-800">
                        Please use a different phone number or{' '}
                        <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">
                          sign in
                        </Link>{' '}
                        if this is your number.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* General Submit Error */}
          {errors.submit && !conflictError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>

          {/* Links */}
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/login" className="text-pink-600 hover:underline">
              Already have an account?
            </Link>
            <Link href="/" className="text-purple-600 hover:underline">
              Back home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
