const form = document.getElementById("chat-form");
const messageInput = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const chatContainer = document.getElementById("chat-container");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!message && !file) return;

  appendMessage(message, "user");

  const formData = new FormData();
  formData.append("message", message);
  if (file) formData.append("file", file);

  messageInput.value = "";
  fileInput.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  appendMessage(data.reply, "ai");
});

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
