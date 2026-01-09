const crypto = require('crypto');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies
} = require('../middleware/auth.middleware');
const {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendEmailVerifiedNotification,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendAccountLockedEmail
} = require('../utils/emailService');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, whatsapp } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, password, and phone.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please login or use a different email.',
        conflictType: 'email',
        conflictField: 'email'
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered. Please use a different number.',
        conflictType: 'phone',
        conflictField: 'phone'
      });
    }

    // Generate email verification token (32 bytes = 64 hex characters)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password, // Will be hashed by pre-save middleware
      phone,
      whatsapp: whatsapp || phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      role: 'customer'
    });

    // Send welcome email with verification link (non-blocking)
    sendWelcomeEmail(user.email, user.fullName, verificationToken)
      .catch(emailError => console.error('Failed to send welcome email:', emailError));

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user with password field (normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later or reset your password.',
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment failed login attempts
      await user.incLoginAttempts();

      // Check if account should be locked after this attempt
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked) {
        // Send account locked email
        try {
          await sendAccountLockedEmail(user.email, user.fullName, updatedUser.lockUntil);
        } catch (emailError) {
          console.error('Failed to send account locked email:', emailError);
        }

        return res.status(423).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 2 hours.',
          lockUntil: updatedUser.lockUntil
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        attemptsRemaining: Math.max(0, 5 - updatedUser.loginAttempts)
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies with rememberMe option
    setAuthCookies(res, accessToken, refreshToken, rememberMe);

    // Merge guest cart with user cart if guestCart is provided
    let mergedCart = null;
    if (req.body.guestCart && Array.isArray(req.body.guestCart) && req.body.guestCart.length > 0) {
      const Cart = require('../models/Cart');
      const guestCart = req.body.guestCart;
      
      try {
        let cart = await Cart.findOne({ userId: user._id });
        
        if (!cart) {
          cart = new Cart({ userId: user._id, items: [] });
        }

        // Merge items: existing cart takes priority, add new items from guest cart
        const existingItemsMap = new Map();
        cart.items.forEach(item => {
          const key = `${item.productId}_${JSON.stringify(item.customizations || {})}`;
          existingItemsMap.set(key, item);
        });

        // Process incoming guest cart items
        for (const item of guestCart) {
          const key = `${item.productId}_${JSON.stringify(item.customizations || {})}`;
          
          if (existingItemsMap.has(key)) {
            // Update quantity
            const existingItem = existingItemsMap.get(key);
            existingItem.quantity = Math.min(existingItem.quantity + item.quantity, 99);
          } else {
            // Add new item
            existingItemsMap.set(key, {
              productId: item.productId,
              quantity: Math.min(item.quantity, 99),
              priceAtAdd: item.priceAtAdd,
              customizations: item.customizations,
              isCustom: item.isCustom,
              addedAt: new Date()
            });
          }
        }

        // Validate and update cart
        const validItems = [];
        const Product = require('../models/Product');
        
        for (const [key, item] of existingItemsMap) {
          const product = await Product.findById(item.productId);
          
          if (!product || !product.isActive || product.isDeleted) {
            continue;
          }

          const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
          const validQuantity = stockAvailable > 0 ? Math.min(item.quantity, stockAvailable) : item.quantity;

          if (validQuantity > 0) {
            validItems.push({
              ...item,
              quantity: validQuantity
            });
          }
        }

        cart.items = validItems;
        cart.lastSynced = new Date();
        await cart.save();

        mergedCart = {
          items: validItems,
          totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
          message: 'Guest cart merged successfully'
        };
      } catch (cartError) {
        console.error('Cart merge error:', cartError);
        // Don't fail login if cart merge fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          profileImage: user.profileImage
        },
        tokens: {
          accessToken,
          refreshToken
        },
        cart: mergedCart
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // Clear authentication cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful!'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.'
    });
  }
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public (requires refresh token)
 */
const refreshToken = async (req, res) => {
  try {
    // User is already verified by verifyRefreshToken middleware
    const user = req.user;

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Optionally generate new refresh token (token rotation)
    const newRefreshToken = generateRefreshToken(user._id);

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token. Please login again.'
    });
  }
};

/**
 * Verify email with token
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.'
      });
    }

    // Find user with matching token and check expiration
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified.'
      });
    }

    // Mark email as verified and clear token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send success notification email
    try {
      await sendEmailVerifiedNotification(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send verification success email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You now have full access to your account.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  }
};

/**
 * Resend email verification link
 * @route POST /api/auth/resend-verification
 * @access Private
 */
const resendVerification = async (req, res) => {
  try {
    const user = req.user;

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified.'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully! Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email. Please try again.'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.fullName, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Clear reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again.'
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password.'
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Find user with matching token and check expiration
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Reset login attempts if account was locked
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    // Send password reset success email
    try {
      await sendPasswordResetSuccessEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send password reset success email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by verifyToken middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          whatsapp: user.whatsapp,
          role: user.role,
          emailVerified: user.emailVerified,
          profileImage: user.profileImage,
          addresses: user.addresses,
          preferences: user.preferences,
          customerType: user.customerType,
          totalOrders: user.totalOrders,
          totalSpent: user.totalSpent,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
};

/**
 * Change password for authenticated user
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password.'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Send password change notification
    try {
      await sendPasswordResetSuccessEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Failed to send password change notification:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to change password. Please try again.'
    });
  }
};

/**
 * Admin login with role verification
 * @route POST /api/auth/admin-login
 * @access Public
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user with password field (normally excluded)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify user has admin privileges
    if (user.role !== 'admin' && user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Your account is temporarily locked due to multiple failed login attempts. Please try again later or reset your password.',
        lockUntil: user.lockUntil
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment failed login attempts
      await user.incLoginAttempts();

      // Check if account should be locked after this attempt
      const updatedUser = await User.findById(user._id);
      if (updatedUser.isLocked) {
        // Send account locked email
        try {
          await sendAccountLockedEmail(user.email, user.fullName, updatedUser.lockUntil);
        } catch (emailError) {
          console.error('Failed to send account locked email:', emailError);
        }

        return res.status(423).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 2 hours.',
          lockUntil: updatedUser.lockUntil
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        attemptsRemaining: Math.max(0, 5 - updatedUser.loginAttempts)
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken, true); // Always remember admin sessions

    res.status(200).json({
      success: true,
      message: 'Admin login successful!',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          profileImage: user.profileImage
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin login failed. Please try again later.'
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) {
      // Check if phone is already taken by another user
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered to another account'
        });
      }
      user.phone = phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again later.'
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
  updateProfile
};