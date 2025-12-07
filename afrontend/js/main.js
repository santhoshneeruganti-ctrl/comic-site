// Use your Render backend URL (LIVE server)
const BASE_URL = "https://comic-backend-cy7c.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("load-comics-btn");
  const comicList = document.getElementById("comic-list");
  const statusMessage = document.getElementById("status-message");

  const nameInput = document.getElementById("agent-name");
  const feedbackInput = document.getElementById("agent-feedback");
  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackStatus = document.getElementById("feedback-status");

  // ---- Load comics from backend ----
  async function loadComics() {
    statusMessage.textContent = "Loading comics from HQ…";
    statusMessage.className = "status info";

    try {
      const res = await fetch(`${BASE_URL}/api/comics`);
      if (!res.ok) throw new Error("Failed to fetch comics");

      const comics = await res.json();

      comicList.innerHTML = "";
      comics.forEach((comic) => {
        const card = document.createElement("article");
        card.className = "comic-card";
        card.innerHTML = `
          <h3>${comic.title}</h3>
          <p>${comic.description}</p>
          <img src="${comic.coverUrl}" alt="${comic.title}">
        `;
        comicList.appendChild(card);
      });

      statusMessage.textContent = "Comics loaded successfully ✅";
      statusMessage.className = "status success";
    } catch (err) {
      console.error(err);
      statusMessage.textContent = "Failed to load comics. Try again later ❌";
      statusMessage.className = "status error";
    }
  }

  // ---- Send feedback to backend ----
  async function sendFeedback() {
    const name = nameInput.value.trim();
    const message = feedbackInput.value.trim();

    if (!message) {
      feedbackStatus.textContent = "Please enter your feedback message ❗";
      feedbackStatus.className = "status error";
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error("Failed to send feedback");

      feedbackStatus.textContent = "Feedback sent. HQ thanks you, agent 😎";
      feedbackStatus.className = "status success";
      feedbackInput.value = "";
      nameInput.value = "";
    } catch (err) {
      console.error(err);
      feedbackStatus.textContent = "Could not send feedback. Try again ❌";
      feedbackStatus.className = "status error";
    }
  }

  // ---- Button listeners ----
  if (loadBtn) {
    loadBtn.addEventListener("click", loadComics);
  }

  if (feedbackBtn) {
    feedbackBtn.addEventListener("click", sendFeedback);
  }
});
