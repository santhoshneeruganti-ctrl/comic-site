// Render backend URL
const BASE_URL = "https://comic-backend-cy7c.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("load-comics-btn");
  const comicList = document.getElementById("comic-list");
  const statusMessage = document.getElementById("status-message");

  const uploadTitle = document.getElementById("upload-title");
  const uploadFile = document.getElementById("upload-file");
  const uploadBtn = document.getElementById("upload-btn");
  const uploadStatus = document.getElementById("upload-status");
  const uploadedList = document.getElementById("uploaded-list");

  const nameInput = document.getElementById("agent-name");
  const feedbackInput = document.getElementById("agent-feedback");
  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackStatus = document.getElementById("feedback-status");

  // viewer elements
  const viewerOverlay = document.getElementById("viewer-overlay");
  const viewerFrame = document.getElementById("viewer-frame");
  const viewerClose = document.getElementById("viewer-close");

  // ---------- Load static comics ----------
  async function loadComics() {
    if (!statusMessage) return;
    statusMessage.textContent = "Loading comics from HQ…";

    try {
      const res = await fetch(`${BASE_URL}/api/comics`);
      if (!res.ok) throw new Error();

      const comics = await res.json();
      if (!comicList) return;

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

      statusMessage.textContent = "Comics loaded ✅";
    } catch (e) {
      console.error(e);
      statusMessage.textContent = "Failed to load comics ❌";
    }
  }

  // ---------- Load uploaded comics ----------
  async function loadUploadedComics() {
    if (!uploadedList) return;
    uploadedList.innerHTML = "<li>Loading uploaded comics…</li>";

    try {
      const res = await fetch(`${BASE_URL}/api/uploaded-comics`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      uploadedList.innerHTML = "";

      if (!data.length) {
        uploadedList.innerHTML = "<li>No uploaded comics yet.</li>";
        return;
      }

      data.forEach((comic) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>📘 ${comic.title}</span>
          <div>
            <button class="btn secondary btn-view" data-url="${comic.fileUrl}">
              View
            </button>
            <button class="btn danger btn-delete" data-id="${comic.id}">
              Delete
            </button>
          </div>
        `;
        uploadedList.appendChild(li);
      });

      // attach view listeners
      document.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.getAttribute("data-url");
          if (!url) return;
          if (viewerFrame && viewerOverlay) {
            viewerFrame.src = url;
            viewerOverlay.classList.remove("hidden");
          } else {
            // fallback: open in new tab
            window.open(url, "_blank");
          }
        });
      });

      // attach delete listeners
      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          if (!id) return;
          const ok = confirm("Delete this comic, agent?");
          if (!ok) return;

          try {
            const res = await fetch(`${BASE_URL}/api/uploaded-comics/${id}`, {
              method: "DELETE",
            });
            if (!res.ok) throw new Error();
            loadUploadedComics();
          } catch (e) {
            alert("Delete failed ❌");
          }
        });
      });
    } catch (e) {
      console.error(e);
      uploadedList.innerHTML = "<li>Failed to load uploaded comics ❌</li>";
    }
  }

  // ---------- Upload new comic ----------
  async function uploadComic() {
    if (!uploadTitle || !uploadFile || !uploadStatus) return;

    const title = uploadTitle.value.trim();
    const file = uploadFile.files[0];

    if (!title || !file) {
      uploadStatus.textContent = "Enter title and choose a PDF ❗";
      return;
    }
    if (file.type !== "application/pdf") {
      uploadStatus.textContent = "Only PDF files allowed ❌";
      return;
    }

    uploadStatus.textContent = "Uploading…";

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/api/upload-comic`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        uploadStatus.textContent = data.msg || "Upload failed ❌";
        return;
      }

      uploadStatus.textContent = data.msg || "Uploaded ✅";
      uploadTitle.value = "";
      uploadFile.value = "";
      loadUploadedComics();
    } catch (e) {
      console.error(e);
      uploadStatus.textContent = "Server error ❌";
    }
  }

  // ---------- Feedback ----------
  async function sendFeedback() {
    if (!feedbackInput || !feedbackStatus) return;

    const name = nameInput ? nameInput.value.trim() : "";
    const message = feedbackInput.value.trim();
    if (!message) {
      feedbackStatus.textContent = "Enter your feedback ❗";
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        feedbackStatus.textContent = data.msg || "Failed ❌";
        return;
      }

      feedbackStatus.textContent = data.msg || "Feedback sent ✅";
      if (nameInput) nameInput.value = "";
      feedbackInput.value = "";
    } catch (e) {
      console.error(e);
      feedbackStatus.textContent = "Server error ❌";
    }
  }

  // ---------- Viewer close ----------
  if (viewerClose && viewerOverlay && viewerFrame) {
    viewerClose.addEventListener("click", () => {
      viewerOverlay.classList.add("hidden");
      viewerFrame.src = "";
    });

    // overlay click outside also close
    viewerOverlay.addEventListener("click", (e) => {
      if (e.target === viewerOverlay) {
        viewerOverlay.classList.add("hidden");
        viewerFrame.src = "";
      }
    });
  }

  // ---------- Event Listeners ----------
  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      loadComics();
      loadUploadedComics();
    });
  }

  if (uploadBtn) uploadBtn.addEventListener("click", uploadComic);
  if (feedbackBtn) feedbackBtn.addEventListener("click", sendFeedback);

  // Initial load of uploaded comics
  loadUploadedComics();
});
