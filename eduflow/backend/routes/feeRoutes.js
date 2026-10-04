const express = require("express");
const router = express.Router();
const { protect, authorize, hasPermission } = require("../middleware/auth");

const {
  createFeeStructure, getFeeStructures, updateFeeStructure, deleteFeeStructure,
} = require("../controllers/feeStructureController");
const {
  generateDues, getDuesByClass, collectPayment, getReceipt, payOwnFee, getMyDues, getChildDues,
} = require("../controllers/feeCollectionController");
const {
  createConcession, getConcessions, updateConcession, deleteConcession,
} = require("../controllers/concessionController");
const {
  dayBook, classReport, defaulters, studentLedger, financeOverview,
} = require("../controllers/feeReportsController");

router.use(protect, hasPermission("view_fees"));

// Self-service (Student / Parent) - must come before the admin/teacher routes below
router.get("/my-dues", authorize("student"), getMyDues);
router.get("/child-dues", authorize("parent"), getChildDues);
router.post("/pay-self", authorize("student"), payOwnFee);

// Fee Structure
router.route("/structure").get(getFeeStructures).post(authorize("admin"), createFeeStructure);
router.route("/structure/:id").put(authorize("admin"), updateFeeStructure).delete(authorize("admin"), deleteFeeStructure);

// Collection
router.post("/generate-dues", authorize("admin"), generateDues);
router.get("/dues", getDuesByClass);
router.post("/collect", hasPermission("collect_fees"), collectPayment);
router.get("/receipt/:id", getReceipt);

// Concession
router.route("/concession").get(getConcessions).post(authorize("admin"), createConcession);
router.route("/concession/:id").put(authorize("admin"), updateConcession).delete(authorize("admin"), deleteConcession);

// Reports
router.get("/reports/day-book", dayBook);
router.get("/reports/class/:classId", classReport);
router.get("/reports/defaulters", defaulters);
router.get("/reports/ledger/:studentId", studentLedger);
router.get("/reports/finance", financeOverview);

module.exports = router;
