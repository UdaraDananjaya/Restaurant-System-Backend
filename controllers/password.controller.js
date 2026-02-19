const { User } = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/* ================= REQUEST RESET ================= */

exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      // Security: Don't reveal if email exists
      return res.json({ message: "If account exists, reset link sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await user.update({
      reset_token: tokenHash,
      reset_token_expiry: expires
    });

    // Normally send email — for now return token (DEV MODE)
    res.json({
      message: "Reset token generated",
      resetToken: rawToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset request failed" });
  }
};

/* ================= RESET PASSWORD ================= */

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_token: tokenHash
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if token is expired
    if (!user.reset_token_expiry || user.reset_token_expiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};

