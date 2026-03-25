// ====================================================
// STORAGE MANAGEMENT
// ====================================================
const Storage = {
    loadChats() {
        try {
            return JSON.parse(localStorage.getItem("chats")) || [];
        } catch {
            return [];
        }
    },
    
    saveChats(chats) {
        localStorage.setItem("chats", JSON.stringify(chats));
    },
    
    getActiveChat() {
        const index = this.getActiveChatIndex();
        if (index < 0) return null;
        const chats = this.loadChats();
        return chats[index] || null;
    },
    
    getActiveChatIndex() {
        return Number(localStorage.getItem("activeChat") || -1);
    },
    
    setActiveChatIndex(index) {
        localStorage.setItem("activeChat", index);
    },
    
    getTheme() {
        return localStorage.getItem("theme") || "light";
    },
    
    setTheme(theme) {
        localStorage.setItem("theme", theme);
    }
};

// ====================================================
// DOM ELEMENTS
// ====================================================
const Elements = {
    emptyState: document.getElementById("emptyState"),
    messagesContainer: document.getElementById("messagesContainer"),
    messagesList: document.getElementById("messagesList"),
    typingIndicator: document.getElementById("typingIndicator"),
    input: document.getElementById("input"),
    inputWrapper: document.querySelector(".input-wrapper"),
    sendBtn: document.getElementById("sendBtn"),
    newChatBtn: document.getElementById("newChat"),
    chatList: document.getElementById("chatList"),
    themeToggle: document.getElementById("themeToggle"),
    chatSearch: document.getElementById("chatSearch"),
    messageMenu: document.getElementById("messageMenu"),
    sunIcon: document.querySelector(".sun-icon"),
    moonIcon: document.querySelector(".moon-icon")
};

// ====================================================
// THEME MANAGEMENT
// ====================================================
const Theme = {
    init() {
        const theme = Storage.getTheme();
        this.apply(theme);
        Elements.themeToggle.addEventListener("click", () => this.toggle());
    },
    
    apply(theme) {
        if (theme === "dark") {
            document.body.classList.add("dark");
            Elements.sunIcon.classList.add("hidden");
            Elements.moonIcon.classList.remove("hidden");
        } else {
            document.body.classList.remove("dark");
            Elements.sunIcon.classList.remove("hidden");
            Elements.moonIcon.classList.add("hidden");
        }
        Storage.setTheme(theme);
    },
    
    toggle() {
        const current = Storage.getTheme();
        const next = current === "dark" ? "light" : "dark";
        this.apply(next);
    }
};

// ====================================================
// CHAT MANAGEMENT
// ====================================================
const ChatManager = {
    createNewChat() {
        const chats = Storage.loadChats();
        const newChat = {
            id: Date.now(),
            title: "New Chat",
            createdAt: new Date().toISOString(),
            messages: [],
            memory: {
                user_profile: {},
                chat_facts: {},
                preferences: {}
            }
        };
        
        chats.unshift(newChat);
        Storage.saveChats(chats);
        Storage.setActiveChatIndex(0);
        this.loadChat(0);
        this.renderList();
    },
    
    loadChat(index) {
        Storage.setActiveChatIndex(index);
        const chats = Storage.loadChats();
        const chat = chats[index];
        
        if (!chat) {
            this.showEmpty();
            return;
        }
        
        this.renderMessages(chat);
    },
    
    deleteChat(index) {
        const chats = Storage.loadChats();
        chats.splice(index, 1);
        Storage.saveChats(chats);
        
        let newIndex = Storage.getActiveChatIndex();
        if (newIndex >= chats.length) {
            newIndex = Math.max(0, chats.length - 1);
        }
        
        Storage.setActiveChatIndex(newIndex);
        
        if (chats.length === 0) {
            this.showEmpty();
        } else {
            this.loadChat(newIndex);
        }
        
        this.renderList();
    },
    
    renderMessages(chat) {
        Elements.messagesList.innerHTML = "";
        Elements.messagesContainer.classList.remove("hidden");
        Elements.emptyState.classList.add("hidden");
        
        chat.messages.forEach((msg, idx) => {
            this.addMessageToDOM(msg.text, msg.sender, msg.timestamp, idx);
        });
        
        this.scrollToBottom();
    },
    
    addMessageToDOM(text, sender, timestamp = null, messageIndex = null) {
        const messageGroup = document.createElement("div");
        messageGroup.className = `message-group ${sender}`;
        messageGroup.dataset.messageIndex = messageIndex;
        
        const message = document.createElement("div");
        message.className = `message ${sender}`;
        message.textContent = text;
        
        const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (sender === "bot") {
            const actions = document.createElement("div");
            actions.className = "message-actions";
            
            const copyBtn = document.createElement("button");
            copyBtn.className = "message-action-btn";
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
            copyBtn.title = "Copy message";
            copyBtn.onclick = () => this.copyToClipboard(text);
            
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "message-action-btn";
            deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
            deleteBtn.title = "Delete message";
            deleteBtn.onclick = () => this.deleteMessage(messageIndex);
            
            actions.appendChild(copyBtn);
            actions.appendChild(deleteBtn);
            message.appendChild(actions);
        }
        
        const timestampEl = document.createElement("div");
        timestampEl.className = "message-timestamp";
        timestampEl.textContent = timeStr;
        
        messageGroup.appendChild(message);
        messageGroup.appendChild(timestampEl);
        Elements.messagesList.appendChild(messageGroup);
    },
    
    deleteMessage(index) {
        const chats = Storage.loadChats();
        const idx = Storage.getActiveChatIndex();
        if (idx < 0 || idx >= chats.length) return;
        
        const chat = chats[idx];
        if (index >= 0 && index < chat.messages.length) {
            chat.messages.splice(index, 1);
            Storage.saveChats(chats);
            this.renderMessages(chat);
        }
    },
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const feedback = document.createElement("div");
            feedback.style.cssText = "position: fixed; top: 20px; right: 20px; background: #10a37f; color: white; padding: 12px 16px; border-radius: 6px; z-index: 9999; animation: slideIn 0.3s ease-out;";
            feedback.textContent = "Copied to clipboard!";
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
        });
    },
    
    showEmpty() {
        Elements.emptyState.classList.remove("hidden");
        Elements.messagesContainer.classList.add("hidden");
    },
    
    renderList(filter = "") {
        const chats = Storage.loadChats();
const activeIndex = Storage.getActiveChatIndex();
        Elements.chatList.innerHTML = "";
        
        const filteredChats = chats.filter(chat => 
            chat.title.toLowerCase().includes(filter.toLowerCase()) ||
            (chat.messages.some(m => m.text.toLowerCase().includes(filter.toLowerCase())))
        );
        
        if (filteredChats.length === 0) {
            Elements.chatList.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--gray-400); font-size: 13px;">No chats found</div>';
            return;
        }
        
        filteredChats.forEach((chat, filteredIdx) => {
            const actualIdx = chats.indexOf(chat);
            const item = document.createElement("button");
            item.className = `chat-item ${actualIdx === activeIndex ? "active" : ""}`;
            
            const titleEl = document.createElement("span");
            titleEl.className = "chat-title";
            titleEl.textContent = chat.title;
            
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-chat";
            deleteBtn.innerHTML = "🗑️";
            deleteBtn.type = "button";
            deleteBtn.onmousedown = (e) => {
                e.stopPropagation();
                this.deleteChat(actualIdx);
            };
            
            item.appendChild(document.createElement("span")).textContent = "🫖";
            item.appendChild(titleEl);
            item.appendChild(deleteBtn);
            
            item.onclick = () => this.loadChat(actualIdx);
            Elements.chatList.appendChild(item);
        });
    },
    
    scrollToBottom() {
        setTimeout(() => {
            Elements.messagesContainer.scrollTop = Elements.messagesContainer.scrollHeight;
        }, 0);
    },
    
    updateChatTitle(newTitle) {
        const chats = Storage.loadChats();
        const idx = Storage.getActiveChatIndex();
        if (idx >= 0 && idx < chats.length) {
            chats[idx].title = newTitle;
            Storage.saveChats(chats);
            this.renderList();
        }
    }
};

// ====================================================
// MESSAGE HANDLING
// ====================================================
const MessageHandler = {
    async sendMessage() {
        const text = Elements.input.value.trim();
        if (!text) return;
        
        let chats = Storage.loadChats();
        let index = Storage.getActiveChatIndex();
        
        if (index < 0) {
            ChatManager.createNewChat();
            chats = Storage.loadChats();
            index = Storage.getActiveChatIndex();
        }
        
        const chat = chats[index];
        const timestamp = new Date().toISOString();
        
        // Add user message
        chat.messages.push({ text, sender: "user", timestamp });
        ChatManager.addMessageToDOM(text, "user", timestamp);
        Storage.saveChats(chats);
        
        Elements.input.value = "";
        Elements.input.style.height = "auto";
        this.showTyping();
        Elements.sendBtn.disabled = true;
        
        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    memory: chat.memory
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || "Unknown error");
            }
            
            this.hideTyping();
            
            const botTimestamp = data.timestamp || new Date().toISOString();
            chat.messages.push({ 
                text: data.reply, 
                sender: "bot", 
                timestamp: botTimestamp 
            });
            
            ChatManager.addMessageToDOM(data.reply, "bot", botTimestamp, chat.messages.length - 1);
            
            // Update memory
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
            
            // Update title if default
            if (chat.title === "New Chat" && data.generated_title) {
                ChatManager.updateChatTitle(data.generated_title);
            }
            
            Storage.saveChats(chats);
            ChatManager.scrollToBottom();
            
        } catch (error) {
            console.error("Error:", error);
            this.hideTyping();
            ChatManager.addMessageToDOM(
                "Sorry, I encountered an error. Please try again.",
                "bot",
                new Date().toISOString()
            );
        } finally {
            Elements.sendBtn.disabled = false;
            Elements.input.focus();
        }
    },
    
    showTyping() {
        Elements.typingIndicator.classList.remove("hidden");
        ChatManager.scrollToBottom();
    },
    
    hideTyping() {
        Elements.typingIndicator.classList.add("hidden");
    }
};

// ====================================================
// INPUT HANDLING
// ====================================================
function setupInputHandlers() {
    Elements.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (e.ctrlKey || e.metaKey) {
                MessageHandler.sendMessage();
                e.preventDefault();
            } else if (!e.shiftKey) {
                MessageHandler.sendMessage();
                e.preventDefault();
            }
        }
    });
    
    Elements.input.addEventListener("input", () => {
        Elements.input.style.height = "auto";
        Elements.input.style.height = Math.min(Elements.input.scrollHeight, 200) + "px";
    });
    
    Elements.sendBtn.addEventListener("click", () => MessageHandler.sendMessage());
    Elements.newChatBtn.addEventListener("click", () => ChatManager.createNewChat());
}

// ====================================================
// SEARCH FUNCTIONALITY
// ====================================================
function setupSearch() {
    Elements.chatSearch.addEventListener("input", (e) => {
        ChatManager.renderList(e.target.value);
    });
}

// ====================================================
// KEYBOARD SHORTCUTS
// ====================================================
function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + K for new chat
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            ChatManager.createNewChat();
        }
        
        // Focus input with /
        if (e.key === "/" && !Elements.input.matches(":focus")) {
            e.preventDefault();
            Elements.input.focus();
        }
    });
}

// ====================================================
// SUGGESTED PROMPTS
// ====================================================
function setupSuggestedPrompts() {
    const suggestionBtns = document.querySelectorAll(".suggestion-btn");
    suggestionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const prompt = btn.dataset.prompt;
            Elements.input.value = prompt;
            Elements.input.focus();
            Elements.input.style.height = "auto";
            Elements.input.style.height = Math.min(Elements.input.scrollHeight, 200) + "px";
            MessageHandler.sendMessage();
        });
    });
}

// ====================================================
// INITIALIZATION
// ====================================================
function init() {
    Theme.init();
    setupInputHandlers();
    setupSearch();
    setupKeyboardShortcuts();
    setupSuggestedPrompts();
    
    const chats = Storage.loadChats();
    if (chats.length === 0) {
        ChatManager.showEmpty();
    } else {
        const activeIndex = Storage.getActiveChatIndex();
        if (activeIndex >= 0 && activeIndex < chats.length) {
            ChatManager.loadChat(activeIndex);
        } else {
            ChatManager.showEmpty();
        }
    }
    
    ChatManager.renderList();
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
