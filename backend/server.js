const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000; // neeku ipudu 4000 run avutondi

// middlewares
app.use(cors());
app.use(express.json());

// ---- Comics data (GET /api/comics) ----
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

let feedbacks = [];

// test route
app.get("/", (req, res) => {
  res.send("Comic backend running 😎");
});

// get comics
app.get("/api/comics", (req, res) => {
  res.json(comics);
});

// ---- Feedback route (POST /api/feedback) ----
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

  res.status(201).json({ msg: "Thanks for your feedback, agent!", feedback: fb });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
