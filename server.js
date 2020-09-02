const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const contactRoute = require("./routes/contacts");
const authRoute = require("./routes/auth");
const connectDB = require("./config/db.js");
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/contacts", contactRoute);
app.use("/api/auth", authRoute);

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Server running at port ${PORT}`);
});
