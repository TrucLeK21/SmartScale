import express from "express";
import protect from "../middleware/middleware.js";
import { createGroup, deleteGroup, joinGroup, leaveGroup, getMembers, getMember, getUserGroup } from "../controllers/groupController.js";

const router = express.Router();


// create route

router.post('/create', protect, createGroup);

router.delete('/delete', protect, deleteGroup);

router.post('/join', protect, joinGroup);

router.post('/leave', protect, leaveGroup);


router.get('/members', protect, getMembers);

router.get('/members/:memId', protect, getMember);

router.get('/userGroup', protect, getUserGroup);



// router.post('/kick/:userId', protect, kickUser);
export default router;