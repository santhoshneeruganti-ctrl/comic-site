const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(cors());
app.use(express.json());

// serve uploaded files
const uploadFolder = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadFolder));

// multer setup for PDF upload
const upload = multer({
  dest: uploadFolder,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max per file
  },
});

// dummy comics data (from before)
let comics = [
  {
    _id: "1",
    title: "Thunder Code: Issue #1",
    description: "Origin story of a college coder superhero.",
    coverUrl: "https://via.placeholder.com/300x400?text=Comic+Cover+1",
  },
  {
    _id: "2",
    title: "The Debugger Rises",
    description: "A villain who deletes memories like variables.",
    coverUrl: "https://via.placeholder.com/300x400?text=Comic+Cover+2",
  },
];

// uploaded comics list (PDFs)
let uploadedComics = [];

let feedbacks = [];

// test route
app.get("/", (req, res) => {
  res.send("Comic backend running 😎");
});

// get default comics
app.get("/api/comics", (req, res) => {
  res.json(comics);
});

// get uploaded comics
app.get("/api/uploaded-comics", (req, res) => {
  res.json(uploadedComics);
});

// upload comic PDF
app.post("/api/upload-comic", upload.single("file"), (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    return res
      .status(400)
      .json({ msg: "Title and PDF file are required." });
  }

  // URL to access this file from frontend
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

  const newComic = {
    id: uploadedComics.length + 1,
    title,
    fileUrl,
    originalName: file.originalname,
    createdAt: new Date().toISOString(),
  };

  uploadedComics.push(newComic);
  console.log("New uploaded comic:", newComic);

  res.status(201).json({
    msg: "Comic uploaded successfully!",
    comic: newComic,
  });
});

// feedback route
app.post("/api/feedback", (req, res) => {
  const { name, message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ msg: "Feedback message is required." });
  }

  const fb = {
    id: feedbacks.length + 1,
    name: name || "Anonymous",
    message,
    createdAt: new Date().toISOString(),
  };

  feedbacks.push(fb);
  console.log("New feedback:", fb);

  res.status(201).json({
    msg: "Thanks for your feedback, agent!",
    feedback: fb,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
