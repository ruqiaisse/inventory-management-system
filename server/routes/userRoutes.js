const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getUsers,
  getUserById,
  updateUsers,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, allowRoles("admin"), getUsers);
router.get("/:id", protect, allowRoles("admin"), getUserById);
router.put("/:id", protect, allowRoles("admin"), updateUsers);
router.delete("/:id", protect, allowRoles("admin"), deleteUser);

module.exports = router;