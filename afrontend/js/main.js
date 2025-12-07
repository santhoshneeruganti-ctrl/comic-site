 // Update your backend URL here (Render URL)
const BASE_URL = "https://comic-backend-cy7c.onrender.com";

// Load Comics Button – Function
async function loadComics() {
    const messageEl = document.getElementById("message");
    messageEl.textContent = "Loading comics...";

    try {
        const response = await fetch(`${BASE_URL}/api/comics`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch comics");
        }

        const comics = await response.json();
        const comicContainer = document.getElementById("comics");

        comicContainer.innerHTML = "";
        comics.forEach(comic => {
            const card = document.createElement("div");
            card.classList.add("comic-card");
            card.innerHTML = `
                <h3>${comic.title}</h3>
                <p>${comic.description}</p>
                <img src="${comic.coverUrl}" alt="${comic.title}" width="200">
            `;
            comicContainer.appendChild(card);
        });

        messageEl.textContent = "Comics loaded successfully ✔️";
    } catch (error) {
        messageEl.textContent = "Failed to load comics ❌";
    }
}

// Feedback posting function
async function sendFeedback() {
    const name = document.getElementById("name").value.trim();
    const feedback = document.getElementById("feedback").value.trim();
    const feedbackMessage = document.getElementById("feedbackMessage");

    if (!name || !feedback) {
        feedbackMessage.textContent = "Please enter both name and feedback ❗";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, feedback })
        });

        if (!response.ok) {
            throw new Error("Failed to send feedback");
        }

        feedbackMessage.textContent = "Feedback sent successfully 🎯";
        document.getElementById("name").value = "";
        document.getElementById("feedback").value = "";
    } catch (error) {
        feedbackMessage.textContent = "Failed to send feedback ❌";
    }
}
