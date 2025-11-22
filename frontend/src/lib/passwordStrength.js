/**
 * Password strength checker utility
 * Provides strength assessment and improvement suggestions
 */

/**
 * Check password strength and return detailed analysis
 * @param {string} password - Password to analyze
 * @returns {object} - { strength, score, feedback, suggestions }
 */
export function checkPasswordStrength(password) {
  if (!password) {
    return {
      strength: 'empty',
      score: 0,
      feedback: 'Enter a password',
      suggestions: [],
      checks: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
        minLength: false
      }
    };
  }

  const checks = {
    length: password.length >= 8,
    minLength: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  let score = 0;
  const suggestions = [];

  // Length scoring
  if (password.length >= 8) {
    score += 20;
  } else {
    suggestions.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score += 10;
  } else if (password.length >= 8) {
    suggestions.push('Use 12 or more characters for better security');
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Complexity scoring
  if (checks.lowercase) {
    score += 15;
  } else {
    suggestions.push('Add lowercase letters (a-z)');
  }

  if (checks.uppercase) {
    score += 15;
  } else {
    suggestions.push('Add uppercase letters (A-Z)');
  }

  if (checks.number) {
    score += 15;
  } else {
    suggestions.push('Add numbers (0-9)');
  }

  if (checks.special) {
    score += 15;
  } else {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  // Determine strength level
  let strength, feedback;
  if (score < 40) {
    strength = 'weak';
    feedback = 'Weak password';
  } else if (score < 70) {
    strength = 'fair';
    feedback = 'Fair password';
  } else if (score < 90) {
    strength = 'good';
    feedback = 'Good password';
  } else {
    strength = 'strong';
    feedback = 'Strong password';
  }

  return {
    strength,
    score: Math.min(score, 100),
    feedback,
    suggestions: suggestions.length > 0 ? suggestions : ['Great! Your password meets all requirements'],
    checks
  };
}

/**
 * Get color class for password strength indicator
 * @param {string} strength - Password strength level
 * @returns {string} - Tailwind CSS color classes
 */
export function getStrengthColor(strength) {
  switch (strength) {
    case 'empty':
      return 'bg-gray-200';
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-orange-500';
    case 'good':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-200';
  }
}

/**
 * Get text color for password strength feedback
 * @param {string} strength - Password strength level
 * @returns {string} - Tailwind CSS text color classes
 */
export function getStrengthTextColor(strength) {
  switch (strength) {
    case 'empty':
      return 'text-gray-500';
    case 'weak':
      return 'text-red-600';
    case 'fair':
      return 'text-orange-600';
    case 'good':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
}

