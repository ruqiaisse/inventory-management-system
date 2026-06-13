const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

// GET USERS (admin only)
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER (admin only)
const updateUsers = async (req, res) => {
  try {
    const allowed = ["name", "email", "role", "isActive"];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity(`Updated user: ${user.name}`, "users", req.user ? req.user._id : null);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER (admin only)
const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user && req.user._id.toString() === targetId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(targetId);

    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity(`Deleted user: ${user.name}`, "users", req.user ? req.user._id : null);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUsers,
  deleteUser,
};