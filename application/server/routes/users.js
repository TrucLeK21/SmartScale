import express from "express";
import User from "../models/user.js";
import protect from "../middleware/middleware.js";
import Group from "../models/group.js";

const router = express.Router();

const nameMap = {
  height: "Chiều cao",
  weight: "Cân nặng",
  date: "Ngày đo",
  age: "Tuổi",
  bmi: "BMI",
  bmr: "BMR",
  tdee: "TDEE",
  lbm: "Khối lượng không mỡ",
  fatPercentage: "Phần trăm mỡ",
  waterPercentage: "Phần trăm nước",
  boneMass: "Khối lượng xương",
  muscleMass: "Khối lượng cơ",
  proteinPercentage: "Phần trăm protein",
  visceralFat: "Mỡ nội tạng",
  idealWeight: "Cân nặng lý tưởng",
};

const unitMap = {
  height: "cm",
  weight: "kg",
  age: null,
  bmi: null,
  bmr: "kcal",
  tdee: "kcal",
  lbm: "kg",
  fatPercentage: "%",
  waterPercentage: "%",
  boneMass: "kg",
  muscleMass: "kg",
  proteinPercentage: "%",
  visceralFat: null,
  idealWeight: "kg",
  date: null,
};
//put api

router.put(`/update`, protect, async (req, res) => {
  const { fullName, dateOfBirth, gender, height, weight = null, activityFactor } = req.body;

  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (fullName) user.fullName = fullName;

    const updatedUser = await user.addRecord({weight, height, dateOfBirth, gender, activityFactor });

    res.status(200).json({
      message: 'Cập nhật user thành công',
      user: updatedUser,
    });

  } catch (e) {
    res.status(500).json(e.message);
  }
});

// get api
router.get(`/profile`, protect, async (req, res) => {
  try {
    let user = await User.findOne({ id: req.user.id });


    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

//get lastest record 
router.get(`/latestRecord`, protect, async (req, res) => {
  try {
    let user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const latestRecord = user.records.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.toObject();
    if (!latestRecord) return res.status(200).json([]);

    const result = Object.keys(latestRecord).map((key) => ({
      key: key,
      name: nameMap[key] || key,
      value: latestRecord[key] || null,
      unit: unitMap[key] || null
    }));

    return res.status(200).json(result);
  }
  catch (e) {
    res.status(500).json(e.message);
  }
});

router.get(`/latestRecord/:memId`, protect, async (req, res) => {
  const { memId } = req.params;
  try {
    let user = await User.findOne({ id: req.user.id });
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

    const latestRecord = member.records.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.toObject();
    if (!latestRecord) return res.status(200).json([]);
    const result = Object.keys(latestRecord).map((key) => ({
      key: key,
      name: nameMap[key] || key,
      value: latestRecord[key] || null,
      unit: unitMap[key] || null
    }));

    return res.status(200).json(result);
  }
  catch (e) {
    res.status(500).json(e.message);
  }
});

export default router;

// get record of 1 specific metric 
router.get(`/records/:metric`, protect, async (req, res) => {
  try {
    const { metric } = req.params;
    const memId = req.headers['userid'];

    let user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    let member = await User.findOne({ id: memId });

    const allowedMetrics = ['height', 'weight', 'bmi', 'bmr', 'tdee', 'lbm', 'fatPercentage', 'waterPercentage', 'boneMass', 'muscleMass', 'proteinPercentage', 'visceralFat', 'idealWeight'];
    if (!allowedMetrics.includes(metric)) {
      return res.status(400).json({ message: `Metric "${metric}" không hợp lệ. Vui lòng chọn từ danh sách: ${allowedMetrics.join(', ')}` });
    }


    if (member) {
      let group = await Group.findOne({ id: member.group });
      if (!group) {
        return res.status(404).json({ message: "group not found" });
      }

      if (!(group.members.includes(user.id) && group.members.includes(member.id))) {
        return res.status(400).json({ message: "user and member are not in a same group" });
      }

      const records = member.records.map(record => ({
        key: metric,
        date: record.date,
        value: record[metric],
        unit: unitMap[metric] || null,
      }));

      // Sắp xếp records theo từ cũ nhất đến mới nhất (theo trường date)
      records.sort((a, b) => new Date(a.date) - new Date(b.date));
      return res.status(200).json(records);
    }

    const records = user.records.map(record => ({
      key: metric,
      date: record.date,
      value: record[metric],
      unit: unitMap[metric] || null,
    }));

    // Sắp xếp records theo từ cũ nhất đến mới nhất (theo trường date)
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(records);

  } catch (error) {
    res.status(500).json(e.message);
  }
});

