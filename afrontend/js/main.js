const loadBtn = document.getElementById("load-btn");
const comicList = document.getElementById("comic-list");
const statusEl = document.getElementById("status");

const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

// ---- IMP: backend base URL (4000 port) ----
const BASE_URL = "http://localhost:4000";

// Load comics from backend
async function loadComics() {
  statusEl.textContent = "Loading comics from server...";

  try {
    const res = await fetch(`${BASE_URL}/api/comics`);
    const data = await res.json();

    comicList.innerHTML = "";

    data.forEach((comic) => {
      const card = document.createElement("div");
      card.className = "comic-card";

      card.innerHTML = `
        <h3>${comic.title}</h3>
        <p>${comic.description}</p>
        ${
          comic.coverUrl
            ? `<img src="${comic.coverUrl}" alt="${comic.title}" style="width:100%; margin-top:6px;">`
            : ""
        }
      `;

      comicList.appendChild(card);
    });

    statusEl.textContent = "Comics loaded successfully ✅";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load comics. Check backend.";
  }
}

if (loadBtn) {
  loadBtn.addEventListener("click", loadComics);
}

// Feedback form
if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!message) {
      feedbackStatus.textContent = "Please enter feedback message.";
      return;
    }

    feedbackStatus.textContent = "Sending feedback...";

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const data = await res.json();
      feedbackStatus.textContent = data.msg || "Feedback sent!";
      feedbackForm.reset();
    } catch (err) {
      console.error(err);
      feedbackStatus.textContent = "Failed to send feedback.";
    }
  });
}
