const jwt = require("jsonwebtoken");

/**
 * @param {Object} payload - { id, role, school }
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = generateToken;
