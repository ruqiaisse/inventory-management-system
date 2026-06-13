const fs = require("fs");
const path = require("path");

const uploadImage = async (req, res) => {
  try {
    console.log("[Upload] Controller - req.file:", req.file ? `${req.file.filename} (${req.file.size} bytes)` : "undefined");

    if (!req.file) {
      console.warn("[Upload] No file in request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    console.log("[Upload] Success - URL:", imageUrl);
    res.status(201).json({ imageUrl });
  } catch (error) {
    console.error("[Upload] Exception:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    const filePath = path.join("uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: "Image deleted" });
    }

    return res.json({ message: "File not found" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image" });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
