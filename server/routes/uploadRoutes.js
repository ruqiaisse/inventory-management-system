const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const { uploadImage, deleteImage } = require("../controllers/uploadController");

const router = express.Router();

router.post("/", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("[Upload] Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadImage);

router.delete("/", protect, deleteImage);

module.exports = router;
