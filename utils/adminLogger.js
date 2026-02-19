const { AdminLog } = require("../models");

const logAdminAction = async (adminId, action, targetUserId = null) => {
  try {
    await AdminLog.create({
      admin_id: adminId,
      action: action,
      target_user_id: targetUserId
    });
  } catch (err) {
    console.error("Admin log failed:", err.message);
  }
};

module.exports = logAdminAction;
