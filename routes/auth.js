const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const auth = require("../middleware/auth");
require("dotenv").config();
router.get("/", auth, async (req, res) => {
  const user = await User.findById({ _id: req.user._id }).select("-password");
  res.json(user);
});

router.post("/", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(12),
  });
  const { error } = schema.validate(req.body);

  if (error) return res.status(400).json({ error: error.details[0].message });
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User doesn't exist" });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass)
    return res.status(401).json({ msg: "Password doesn't match" });

  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.json({ token });
  try {
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
