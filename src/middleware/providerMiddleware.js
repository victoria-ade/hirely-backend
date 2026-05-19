const providerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'provider') {
    next();
  } else {
    res. status(403).json({message : 'Access denied. Providers only.'})
  }
};

module.exports = {providerOnly};