const roleMiddleware = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Accès interdit.' });
      }
      next();
    };
  };
  
  module.exports = roleMiddleware;