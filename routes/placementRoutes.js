const express = require("express");
const { getPlacements, getPlacementById, applyPlacement, createPlacement } = require("../controllers/placementController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getPlacements);
router.get("/:id", auth, getPlacementById);
router.post("/:id/apply", auth, requireRole('student'), applyPlacement);
router.post("/", auth, requireRole('faculty', 'admin'), createPlacement);

module.exports = router;