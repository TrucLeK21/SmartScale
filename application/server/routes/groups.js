import express from "express";
import protect from "../middleware/middleware.js";
import Group from "../models/group.js";
import User from "../models/user.js";

const router = express.Router();


// create route

router.post('/create', protect, async (req, res) => {
    const { name, password } = req.body;
    const userId = req.user.id;
    try {
        //kiểm tra xem user có nằm trong group nào chưa
        let group = await Group.findOne({ members: userId });
        if (group) {
            return res.status(400).json({ message: 'User in one group can not create new group' });
        }
        group = await Group.findOne({ name: name });
        if (group) {
            return res.status(400).json({ message: 'Group name is already existed' });
        }
        group = new Group({ name, password, owner: userId });
        await group.save();
        // thêm group id cho user
        let user = await User.findOne({ id: userId });
        user.group = group.id;
        user.save();

        res.status(200).json({ message: "success" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            message: e.message
        });
    }
});

router.post('/delete', protect, async (req, res) => {
    const userId = req.user.id;

    try {

        let user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        let group = await Group.findOne({ id: user.group });
        if (!group) {
            return res.status(400).json({ message: "group not found" });
        }

        if (user.id !== group.owner) {
            return res.status(400).json({
                message: "user is not owner of the group"
            });
        }

        let members = group.members;

        if (members.length > 0) {
            await User.updateMany(
                { id: { $in: members } },
                { $set: { group: null } }
            );
        }

        await Group.deleteOne({ id: group.id });

        res.status(200).json({ message: "success" });


    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.post('/join', protect, async (req, res) => {
    const userId = req.user.id;
    const { name, password } = req.body;

    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let group = await Group.findOne({ name: name });
        const isMatch = await group.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect user name or password' });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "User is already in the group" });
        }
        group.members.push(userId);
        user.group = group.id;

        group.save();
        user.save();
        res.status(200).json({ message: "success" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/leave', protect, async (req, res) => {
    const userId = req.user.id;

    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let group = await Group.findOne({ id: user.group });
        if (!group) {
            return res.status(404).json({ message: "group not found" });
        }
        // nếu group chỉ có 1 người
        if (group.members.length === 1) {
            user.group = null;
            await Group.deleteOne({ id: group.id });
            return res.status(200).json({ message: "success" });
        }
        // xử lý khi user là owner
        if (group.owner === userId) {


            //chọn ơwner mới
            const newOwnerId = group.members.find(memId => memId !== userId);
            group.owner = newOwnerId;
        }
        //loại user hiện tại ra khỏi ds 
        group.members = group.members.filter(memId => memId !== userId);
        user.group = null;

        await group.save();
        await user.save();
        res.status(200).json({ message: "success" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/kick/:userId', protect, async (req, res) => {

});

router.get('/members', protect, async (req, res) => {
    const userId = req.user.id;
    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let group = await Group.findOne({ id: user.group });
        if (!group) {
            return res.status(404).json({ message: "group not found" });
        }

        if (user.group !== group.id || !group.members.includes(user.id)) {
            return res.status(400).json({ message: "user is not in this group" });
        }

        let users = await User.find({ id: { $in: group.members } });

        res.status(200).json({
            message: "success",
            users: users.map(user => ({
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                isOwner: user.id === group.owner,
            }))
        })


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/members/:memId', protect, async (req, res) => {
    const userId = req.user.id;
    const { memId } = req.params;
    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let member = await User.findOne({ id: memId });
        if (!member) {
            return res.status(404).json({ message: "member not found" });
        }

        let group = await Group.findOne({ id: user.group });
        if (!group) {
            return res.status(404).json({ message: "group not found" });
        }

        if (!(group.members.includes(user.id) && group.members.includes(member.id))) {
            return res.status(400).json({ message: "user and member are not in a same group" });
        }
        res.status(200).json(member);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/userGroup', protect, async (req, res) => {
    try {
        let user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }

        let group = await Group.findOne({ id: user.group });
        if (!group) {
            return res.status(404).json({ message: "group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json(error.message);
    }
});
export default router;