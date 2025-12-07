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

  const uploadTitle = document.getElementById("upload-title");
  const uploadFile = document.getElementById("upload-file");
  const uploadBtn = document.getElementById("upload-btn");
  const uploadStatus = document.getElementById("upload-status");
  const uploadedList = document.getElementById("uploaded-list");

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

  // ---- Load uploaded PDF comics list ----
  async function loadUploadedComics() {
    if (!uploadedList) return;

    uploadedList.innerHTML = "<li>Loading uploaded comics...</li>";

    try {
      const res = await fetch(`${BASE_URL}/api/uploaded-comics`);
      const data = await res.json();

      uploadedList.innerHTML = "";
      if (!data.length) {
        uploadedList.innerHTML = "<li>No uploaded comics yet.</li>";
        return;
      }

      data.forEach((comic) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="${comic.fileUrl}" target="_blank">
            📘 ${comic.title}
          </a>`;
        uploadedList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      uploadedList.innerHTML = "<li>Failed to load files ❌</li>";
    }
  }

  // ---- Upload PDF to backend ----
  async function uploadComic() {
    if (!uploadTitle.value || !uploadFile.files[0]) {
      uploadStatus.textContent = "Please enter title and choose a PDF ❌";
      uploadStatus.className = "status error";
      return;
    }

    uploadStatus.textContent = "Uploading…";
    uploadStatus.className = "status info";

    const formData = new FormData();
    formData.append("title", uploadTitle.value);
    formData.append("file", uploadFile.files[0]);

    try {
      const res = await fetch(`${BASE_URL}/api/upload-comic`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        uploadStatus.textContent = "Comic uploaded successfully ✔️";
        uploadStatus.className = "status success";

        uploadTitle.value = "";
        uploadFile.value = "";

        loadUploadedComics();
      } else {
        uploadStatus.textContent = "Upload failed ❌";
        uploadStatus.className = "status error";
      }
    } catch (err) {
      uploadStatus.textContent = "Server error ❌";
      uploadStatus.className = "status error";
      console.error(err);
    }
  }

  // ---- Send feedback to backend ----
  async function sendFeedback() {
    const name = nameInput.value.trim();
    const message = feedbackInput.value.trim();

    if (!message) {
      feedbackStatus.textContent = "Enter feedback ❗";
      feedbackStatus.className = "status error";
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error();

      feedbackStatus.textContent = "Feedback sent 😎";
      feedbackStatus.className = "status success";

      feedbackInput.value = "";
      nameInput.value = "";
    } catch {
      feedbackStatus.textContent = "Failed to send feedback ❌";
      feedbackStatus.className = "status error";
    }
  }

  // ---- EVENT LISTENERS ----
  if (loadBtn)
    loadBtn.addEventListener("click", () => {
      loadComics();
      loadUploadedComics();
    });

  if (uploadBtn) uploadBtn.addEventListener("click", uploadComic);

  if (feedbackBtn) feedbackBtn.addEventListener("click", sendFeedback);

  // Load uploaded list on page load
  loadUploadedComics();
});
