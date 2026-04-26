import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";

const app = express();
const port = 3000;

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//DATABASE CONNECTION
await mongoose.connect(process.env.MONGO_URL);

const blogSchema = new mongoose.Schema({
  blogname: String,
  author: String,
  content: String,
  image: String,
});

const Blog = mongoose.model("Blog", blogSchema);

//IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

//DEFAULT BLOGS
const defaultBlogs = [
  {
    blogname: "Why Discipline Beats Motivation",
    author: "Admin",
    content: "Motivation comes and goes, but discipline stays...",
    image: "default1.jpg",
  },
  {
    blogname: "The Power of Consistency",
    author: "Admin",
    content: "Small steps every day lead to massive success...",
    image: "default2.jpg",
  },
  {
    blogname: "Focus in a Distracted World",
    author: "Admin",
    content:
      "Your attention is your most valuable asset. In today’s world, distractions are everywhere. From constant notifications on your phone to endless scrolling on social media, your mind is constantly being pulled in different directions. What used to take minutes now takes hours, not because the task is difficult, but because your focus is fragmented. Focus is no longer just a skill—it’s a superpower. The ability to sit down and give your full attention to one task is becoming increasingly rare. But those who can do it consistently are the ones who stand out. They produce better work, think more clearly, and make faster progress. The problem is not a lack of time. It’s a lack of attention. Every time you switch tasks, your brain pays a cost. It takes time to refocus, and over time this reduces your efficiency and drains your mental energy. What feels like “multitasking” is actually slowing you down. To regain control, you need to be intentional. Start by eliminating unnecessary distractions. Turn off notifications. Keep your phone away when working. Create a workspace that encourages deep work. Even small changes can make a big difference. Train your focus like a muscle. At first, it will be hard. Your mind will wander. You’ll feel the urge to check your phone. But the more you resist, the stronger your focus becomes. Over time, you’ll be able to work longer and deeper without getting distracted. The people who succeed in this world are not the busiest—they are the most focused. Protect your attention. Guard it carefully. Because where your attention goes, your life follows.",
    image: "default3.jpg",
  },
];

async function seedBlogs() {
  const count = await Blog.countDocuments();

  if (count === 0) {
    await Blog.insertMany(defaultBlogs);
    console.log("Default blogs added");
  }
}
seedBlogs();

//ROUTES

// HOME
app.get("/", async (req, res) => {
  const users = await Blog.find().sort({ _id: -1 });
  res.render("index", { users });
});

// NEW BLOG PAGE
app.get("/new", (req, res) => {
  res.render("new");
});

// CREATE BLOG
app.post("/new", upload.single("image"), async (req, res) => {
  const { blogname, author, content } = req.body;

  const newBlog = new Blog({
    blogname,
    author,
    content,
    image: req.file ? req.file.filename : null,
  });

  await newBlog.save();
  res.redirect("/");
});

// VIEW BLOG
app.get("/content/:id", async (req, res) => {
  const user = await Blog.findById(req.params.id);
  res.render("content", { user });
});

// EDIT PAGE
app.get("/edit/:id", async (req, res) => {
  const user = await Blog.findById(req.params.id);
  res.render("edit", { user });
});

// UPDATE
app.post("/edit/:id", upload.single("image"), async (req, res) => {
  const { blogname, author, content } = req.body;

  const updateData = {
    blogname,
    author,
    content,
  };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  await Blog.findByIdAndUpdate(req.params.id, updateData);

  res.redirect("/");
});

// DELETE
app.post("/delete/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// SEARCH
app.get("/search", async (req, res) => {
  const query = req.query.q;

  const users = await Blog.find({
    blogname: { $regex: query, $options: "i" },
  });

  res.render("index", { users });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
