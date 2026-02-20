module.exports = function requireApprovedSeller(req, res, next) {
  try {
    // verifyToken must have already set req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only enforce for SELLER role
    if (req.user.role !== "SELLER") return next();

    // Block non-approved sellers from seller write actions
    if (req.user.status !== "APPROVED") {
      return res.status(403).json({
        message: `Seller account is ${req.user.status}. Approval required.`,
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Authorization failed" });
  }
};
