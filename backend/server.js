const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------- Upload folder setup ----------
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}
app.use("/uploads", express.static(uploadFolder));

const upload = multer({
  dest: uploadFolder,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ---------- Static comics (old ones) ----------
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

// ---------- Uploaded comics (PDFs) ----------
let uploadedComics = []; // {id,title,fileUrl,originalName,filePath,createdAt}

let feedbacks = [];

app.get("/", (req, res) => {
  res.send("Comic backend running 😎");
});

// GET static comics
app.get("/api/comics", (req, res) => {
  res.json(comics);
});

// GET uploaded comics list
app.get("/api/uploaded-comics", (req, res) => {
  // filePath send cheyyakunda filter chestunnam
  const publicList = uploadedComics.map(({ filePath, ...rest }) => rest);
  res.json(publicList);
});

// POST upload new comic PDF
app.post("/api/upload-comic", upload.single("file"), (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    return res.status(400).json({ msg: "Title and PDF are required." });
  }

  const id = uploadedComics.length + 1;
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

  const newComic = {
    id,
    title,
    fileUrl,
    originalName: file.originalname,
    filePath: file.path,
    createdAt: new Date().toISOString(),
  };

  uploadedComics.push(newComic);
  console.log("Uploaded comic:", newComic);

  res.status(201).json({
    msg: "Comic uploaded successfully!",
    comic: {
      id: newComic.id,
      title: newComic.title,
      fileUrl: newComic.fileUrl,
      originalName: newComic.originalName,
      createdAt: newComic.createdAt,
    },
  });
});

// DELETE uploaded comic
app.delete("/api/uploaded-comics/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = uploadedComics.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ msg: "Comic not found." });
  }

  const comic = uploadedComics[index];

  // delete file from disk (best effort)
  if (comic.filePath && fs.existsSync(comic.filePath)) {
    fs.unlink(comic.filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }

  uploadedComics.splice(index, 1);
  console.log("Deleted comic:", comic);

  res.json({ msg: "Comic deleted successfully." });
});

// FEEDBACK route
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
