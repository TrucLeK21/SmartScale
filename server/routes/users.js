import express from "express";
import protect from "../middleware/middleware.js";
import { updateUser, addNewRecord, getProfile, getLatestRecord, getLatestRecordOfUser, getRecordsByMetric } from "../controllers/userController.js";

const router = express.Router();

router.put(`/update`, protect, updateUser);
router.put('/addNewRecord', protect, addNewRecord);
router.get(`/profile`, protect, getProfile);
router.get(`/latestRecord`, protect, getLatestRecord);
router.get(`/latestRecord/:memId`, protect, getLatestRecordOfUser);
router.get(`/records/:metric`, protect, getRecordsByMetric);

export default router;