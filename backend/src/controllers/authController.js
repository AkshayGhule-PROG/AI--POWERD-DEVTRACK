const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'developer',
  });

  sendTokenResponse(user, 201, res);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, jiraEmail, jiraDomain, githubUsername } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (jiraEmail) fieldsToUpdate.jiraEmail = jiraEmail;
  if (jiraDomain) fieldsToUpdate.jiraDomain = jiraDomain;
  if (githubUsername) fieldsToUpdate.githubUsername = githubUsername;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
};

// @desc    Update integrations (Jira / GitHub tokens)
// @route   PUT /api/auth/integrations
// @access  Private
const updateIntegrations = async (req, res) => {
  const { jiraApiToken, jiraEmail, jiraDomain, githubToken, githubUsername } = req.body;

  const user = await User.findById(req.user.id).select('+jiraApiToken +githubToken');

  if (jiraApiToken !== undefined) user.jiraApiToken = jiraApiToken;
  if (jiraEmail !== undefined) user.jiraEmail = jiraEmail;
  if (jiraDomain !== undefined) user.jiraDomain = jiraDomain;
  if (githubToken !== undefined) user.githubToken = githubToken;
  if (githubUsername !== undefined) user.githubUsername = githubUsername;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Integration credentials updated successfully' });
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      jiraEmail: user.jiraEmail,
      jiraDomain: user.jiraDomain,
      githubUsername: user.githubUsername,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { register, login, getMe, updateProfile, updateIntegrations, logout };
