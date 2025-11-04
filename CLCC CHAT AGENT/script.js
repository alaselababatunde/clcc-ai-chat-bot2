const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

// ✅ Your backend endpoint
const API_URL = "https://techdisciples-techdisciplesai.hf.space/ai-chat";

// ✅ Your API key (must match the backend's API_SECRET)
const API_KEY = "techdisciplesai404";

// Function to add messages to chat
function addMessage(sender, message) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = `<p>${message}</p>`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send user query to backend
async function sendMessage() {
    const query = userInput.value.trim();
    if (!query) return;

    addMessage("user", query);
    userInput.value = "";

    // Show loading message
    const loadingMsg = document.createElement("div");
    loadingMsg.classList.add("message", "bot");
    loadingMsg.innerHTML = `<p><em>Tech Disciples AI is thinking...</em></p>`;
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Replace loading message with AI response
        chatBox.removeChild(loadingMsg);
        addMessage("bot", data.reply || "⚠️ No response received from AI.");

    } catch (error) {
        console.error("Error:", error);
        chatBox.removeChild(loadingMsg);
        addMessage("bot", "⚠️ Connection failed or server error. Please try again.");
    }
}

// Send message on button click
sendButton.addEventListener("click", sendMessage);

// Send message on Enter key
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
