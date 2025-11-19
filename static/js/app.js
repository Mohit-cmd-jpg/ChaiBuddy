// ================================
// SAFE STORAGE
// ================================
function loadChats() {
    try {
        return JSON.parse(localStorage.getItem("chats")) || [];
    } catch {
        return [];
    }
}
function saveChats(chats) {
    localStorage.setItem("chats", JSON.stringify(chats));
}
function getActiveChatIndex() {
    return Number(localStorage.getItem("activeChat") || -1);
}
function setActiveChatIndex(i) {
    localStorage.setItem("activeChat", i);
}

// ================================
// ELEMENTS
// ================================
const messagesContainer = document.getElementById("messages");
const inputBox = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChat");
const chatList = document.getElementById("chatList");
const typingIndicator = document.getElementById("typingIndicator");

// ================================
// UI HELPERS
// ================================
function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "message user" : "message bot";
    msg.textContent = text;
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTyping() {
    typingIndicator.classList.remove("hidden");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
function hideTyping() {
    typingIndicator.classList.add("hidden");
}

function renderChatList() {
    const chats = loadChats();
    chatList.innerHTML = "";

    chats.forEach((chat, index) => {
        const item = document.createElement("div");
        item.className = "chat-item";

        item.innerHTML = `
            <span class="chat-emoji">🫖</span>
            <span class="chat-title">${chat.title}</span>
            <span class="delete-chat" data-index="${index}">🗑️</span>
        `;

        item.querySelector(".chat-title").onclick = () => loadChat(index);
        item.querySelector(".delete-chat").onclick = (e) => {
            e.stopPropagation();
            deleteChat(index);
        };

        chatList.appendChild(item);
    });
}

function loadChat(index) {
    const chats = loadChats();
    const chat = chats[index];
    if (!chat) return;

    setActiveChatIndex(index);
    messagesContainer.innerHTML = "";

    chat.messages.forEach(m => addMessage(m.text, m.sender));
}

function deleteChat(index) {
    let chats = loadChats();
    chats.splice(index, 1);
    saveChats(chats);
    setActiveChatIndex(-1);
    messagesContainer.innerHTML = "";
    renderChatList();
}

function startNewChat() {
    const chats = loadChats();

    chats.push({
        title: "ChaiBuddy Chat",
        memory: {
            user_profile: {},
            chat_facts: {},
            preferences: {}
        },
        messages: []
    });

    saveChats(chats);
    setActiveChatIndex(chats.length - 1);
    messagesContainer.innerHTML = "";
    renderChatList();
}

newChatBtn.onclick = startNewChat;

// ================================
// SEND MESSAGE
// ================================
async function sendMessage() {
    const text = inputBox.value.trim();
    if (!text) return;

    let chats = loadChats();
    let index = getActiveChatIndex();

    if (index < 0) {
        startNewChat();
        chats = loadChats();
        index = getActiveChatIndex();
    }

    const chat = chats[index];

    addMessage(text, "user");
    chat.messages.push({ text, sender: "user" });
    saveChats(chats);

    inputBox.value = "";
    showTyping();

    const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: text,
            memory: chat.memory,
            personality: "chaibuddy"
        })
    });

    const data = await res.json();

    hideTyping();
    addMessage(data.reply, "bot");

    chat.messages.push({ text: data.reply, sender: "bot" });

    if (data.memory_update) {
        chat.memory.user_profile = {
            ...chat.memory.user_profile,
            ...(data.memory_update.user_profile || {})
        };
        chat.memory.chat_facts = {
            ...chat.memory.chat_facts,
            ...(data.memory_update.chat_facts || {})
        };
        chat.memory.preferences = {
            ...chat.memory.preferences,
            ...(data.memory_update.preferences || {})
        };
    }

    if (chat.title === "ChaiBuddy Chat" && data.generated_title) {
        chat.title = data.generated_title;
    }

    saveChats(chats);
    renderChatList();
}

sendBtn.onclick = sendMessage;

inputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ================================
// THEME TOGGLE
// ================================
const themeIcon = document.getElementById("themeIcon");

function applyTheme() {
    const theme = localStorage.getItem("theme") || "light";
    document.body.className = theme === "dark" ? "dark" : "";
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

applyTheme();

themeIcon.onclick = () => {
    const theme = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem("theme", theme);
    applyTheme();
};

// ================================
renderChatList();
