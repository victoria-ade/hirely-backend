const User = require('../models/User');
const bcrypt = require('bcrypt.js');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
      {userId},
      process.env.JWT_SECRET,
      {expiresIn: '7d'}
    );
  
};

// To register a new user through the route of POST /api/auth/register which the public can have access to.
const register = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;

    // to check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({message: 'Email already in use'});
    }

    // to hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // to create the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword, role,
    });

    // to return user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// to login in a user through the route of POST /api/auth/login and to be accessed by the public
const login = async (req, res) => {
  try{
    const {email, password} = req.body;

    //to check if user exists
    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message: 'Invalid email or password'});
    }

    //to check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: 'Inalid email or password'});
    }

    // to return user data + token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email:  user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch(error) {
    res.status(500).json({message: error.message});
  }
};

// to get the current logged in user through thr route of GET /api/auth/me to be accessed privately
const getMe = async (req, res) => {
  res.status(200).json(register.user);
};

module.exports = {register, login, getMe};