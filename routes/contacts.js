const router = require("express").Router();
const Contact = require("../models/Contact");
const User = require("../models/User");
const auth = require("../middleware/auth");
const Joi = require("joi");

router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/", auth, async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string(),
    pancard: Joi.string(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, email, phone, pancard } = req.body;
  try {
    const contact = await new Contact({
      name,
      email,
      phone,
      pancard,
      user: req.user._id,
    });

    const savedContact = await contact.save();
    res.json(savedContact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, pancard } = req.body;
  const contactField = {};

  if (name) contactField.name = name;
  if (email) contactField.email = email;
  if (phone) contactField.phone = phone;
  if (pancard) contactField.pancard = pancard;

  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    if (contact.user.toString() !== req.user._id)
      res.status(401).json({ msg: "Not authorized" });

    contact = await Contact.findOneAndUpdate(
      { _id: req.params.id },
      { $set: contactField },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    if (contact.user.toString() !== req.user._id)
      res.status(401).json({ msg: "Not authorized" });

    await Contact.findOneAndRemove({ _id: req.params.id });
    res.json({ msg: "Contact removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
