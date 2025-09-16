const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// =========================
// POST /api/upload - Upload a file
// =========================
router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "No file uploaded" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const relativeUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${baseUrl}${relativeUrl}`;

    console.log("UPLOAD REQUEST RECEIVED", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      savedPath: path.join(uploadsDir, req.file.filename),
    });

    return res.status(200).json({
      ok: true,
      filename: req.file.filename,
      url: absoluteUrl,
      relativeUrl,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ ok: false, message: "Upload failed" });
  }
});

// =========================
// GET /api/upload/:filename - Serve uploaded file
// =========================
router.get("/:filename", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, message: "File not found" });
  }
  res.sendFile(filePath);
});

module.exports = router;
