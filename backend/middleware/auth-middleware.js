const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role === "admin") next();
  else res.status(403).json({ error: "Admin access denied" });
}

function isProvider(req, res, next) {
  if (req.user?.role === "provider") next();
  else res.status(403).json({ error: "Provider access denied" });
}

function isCustomer(req, res, next) {
  if (req.user?.role === "customer") next();
  else res.status(403).json({ error: "Customer access denied" });
}

module.exports = { verifyToken, isAdmin, isProvider, isCustomer };
