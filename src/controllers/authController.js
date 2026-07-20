const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Welcome to Hirely, ${user.name}! 👋</h2>
        <p style="color: #374151;">Thanks for signing up. Please verify your email address to get started.</p>
        <a 
          href="${verificationUrl}" 
          style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;"
        >
          Verify My Email
        </a>
        <p style="color: #6B7280; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px;">Hirely — Find trusted local services</p>
      </div>
    `;

    // Send response first
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });

    // Then send email completely separately — nothing after this can touch res
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your Hirely account',
        html: emailHtml,
      });
      console.log('Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Verification link is invalid or has expired.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { register, login, getMe, verifyEmail };