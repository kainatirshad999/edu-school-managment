const express = require("express");
const router = express.Router();
const { protect, hasPermission } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { createMaterial, getMaterials, deleteMaterial } = require("../controllers/studyMaterialController");

router.use(protect, hasPermission("view_study_material"));

router.get("/", getMaterials);
router.post("/", hasPermission("upload_study_material"), upload.single("file"), createMaterial);
router.delete("/:id", hasPermission("upload_study_material"), deleteMaterial);

module.exports = router;
