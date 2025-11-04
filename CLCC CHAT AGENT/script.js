// State management
let messages = [
    {
        id: '1',
        text: "Hello! I'm your AI assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
    }
];
let attachments = [];
let isTyping = false;

// DOM Elements
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const attachButton = document.getElementById('attachButton');
const fileInput = document.getElementById('fileInput');
const mediaPreviewContainer = document.getElementById('mediaPreviewContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderMessages();
    setupEventListeners();
    setupParallax();
});

// Event Listeners
function setupEventListeners() {
    sendButton.addEventListener('click', handleSendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    messageInput.addEventListener('input', updateSendButtonState);
}

// Parallax Effect
function setupParallax() {
    let scrollY = 0;
    
    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset;
        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const speed = 0.5 + (index * 0.1);
            blob.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
}

// File Handling
function handleFileSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        let type = 'document';
        
        if (file.type.startsWith('image/')) {
            type = 'image';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        }
        
        const attachment = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url,
            type,
        };
        
        attachments.push(attachment);
    });
    
    renderMediaPreview();
    updateSendButtonState();
    fileInput.value = '';
}

function removeAttachment(id) {
    const attachment = attachments.find(a => a.id === id);
    if (attachment) {
        URL.revokeObjectURL(attachment.url);
    }
    attachments = attachments.filter(a => a.id !== id);
    renderMediaPreview();
    updateSendButtonState();
}

function renderMediaPreview() {
    if (attachments.length === 0) {
        mediaPreviewContainer.innerHTML = '';
        return;
    }
    
    mediaPreviewContainer.innerHTML = attachments.map(attachment => {
        if (attachment.type === 'image') {
            return `
                <div class="media-preview-item">
                    <img src="${attachment.url}" alt="${attachment.file.name}">
                    <button class="remove-attachment" onclick="removeAttachment('${attachment.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"/>
                            <path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
            `;
        } else if (attachment.type === 'video') {
            return `
                <div class="media-preview-item">
                    <video src="${attachment.url}" muted></video>
                    <button class="remove-attachment" onclick="removeAttachment('${attachment.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"/>
                            <path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="media-preview-item document">
                    <span>${attachment.file.name}</span>
                    <button class="remove-attachment" onclick="removeAttachment('${attachment.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 6 6 18"/>
                            <path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
            `;
        }
    }).join('');
}

// Message Handling
async function handleSendMessage() {
    const text = messageInput.value.trim();
    
    if ((!text && attachments.length === 0) || isTyping) return;
    
    const userMessage = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
        attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    
    messages.push(userMessage);
    
    const currentMessage = text;
    const currentAttachments = [...attachments];
    
    messageInput.value = '';
    attachments = [];
    renderMediaPreview();
    isTyping = true;
    updateSendButtonState();
    
    renderMessages();
    
    // Call AI API endpoint
    try {
        const response = await fetch('https://techdisciples-techdisciplesai.hf.space/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'techdisciplesai404'
            },
            body: JSON.stringify({
                query: currentMessage  // API requires 'query' field
            })
        });
        
        if (!response.ok) {
            // Get error details from response
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('API Error Details:', errorData);
                errorMessage = errorData.error || errorData.detail || errorMessage;
            } catch (e) {
                console.error('Could not parse error response');
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('API Response:', data);  // Debug log
        const aiResponse = data.response || data.message || data.answer || data.output || data.result || JSON.stringify(data);
        
        const aiMessage = {
            id: (Date.now() + 1).toString(),
            text: aiResponse,
            isUser: false,
            timestamp: new Date(),
        };
        
        messages.push(aiMessage);
        isTyping = false;
        renderMessages();
        
    } catch (error) {
        console.error('Error calling AI API:', error);
        const errorMessage = {
            id: (Date.now() + 1).toString(),
            text: "I apologize, but I'm having trouble connecting right now. Please try again later.",
            isUser: false,
            timestamp: new Date(),
        };
        messages.push(errorMessage);
        isTyping = false;
        renderMessages();
    }
}

// Mock API Response
function getMockResponse(userInput, attachments) {
    const responses = [
        "That's an interesting question! Based on what you've shared, I can provide you with some helpful insights.",
        "I understand what you're asking about. Let me break this down for you in a clear and concise way.",
        "Great question! Here's what I can tell you about that topic.",
        "I'd be happy to help you with that. Let me provide you with the information you need.",
        "Thank you for sharing that with me. Here's my perspective on your query.",
    ];
    
    let response = '';
    
    if (attachments.length > 0) {
        const fileTypes = attachments.map(a => a.type).join(', ');
        response = `I can see you've shared ${attachments.length} file(s) (${fileTypes}). `;
    }
    
    const randomIndex = Math.floor(Math.random() * responses.length);
    response += responses[randomIndex] + " This is a mock response. Please connect your AI agent API endpoint to get real responses.";
    
    return response;
}

// Render Functions
function renderMessages() {
    const messageElements = messages.map(message => {
        return createMessageElement(message);
    }).join('');
    
    let html = messageElements;
    
    if (isTyping) {
        html += createTypingIndicator();
    }
    
    messagesArea.innerHTML = html;
    scrollToBottom();
}

function createMessageElement(message) {
    const time = formatTime(message.timestamp);
    const userClass = message.isUser ? 'user' : 'ai';
    
    const icon = message.isUser ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
        </svg>
    `;
    
    let attachmentsHtml = '';
    if (message.attachments && message.attachments.length > 0) {
        attachmentsHtml = `<div class="message-attachments">` + 
            message.attachments.map(attachment => {
                if (attachment.type === 'image') {
                    return `<div class="message-attachment"><img src="${attachment.url}" alt="${attachment.file.name}"></div>`;
                } else if (attachment.type === 'video') {
                    return `<div class="message-attachment"><video src="${attachment.url}" controls></video></div>`;
                } else {
                    return `<div class="message-attachment document"><span>${attachment.file.name}</span></div>`;
                }
            }).join('') + 
        `</div>`;
    }
    
    const textHtml = message.text ? `<p id="message-text-${message.id}">${message.text}</p>` : '';
    
    return `
        <div class="chat-message ${userClass}">
            <div class="message-avatar ${userClass}">
                ${icon}
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${attachmentsHtml}
                    ${textHtml}
                </div>
                <span class="message-timestamp">${time}</span>
            </div>
        </div>
    `;
}

function createTypingIndicator() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
        </svg>
    `;
    
    return `
        <div class="typing-indicator">
            <div class="message-avatar ai">
                ${icon}
            </div>
            <div class="typing-bubble">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
}

// Typing Animation for AI Messages
function animateTyping(messageId, text) {
    const element = document.getElementById(`message-text-${messageId}`);
    if (!element || !text) return;
    
    let currentIndex = 0;
    element.innerHTML = '';
    
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typing-cursor';
    element.appendChild(cursorSpan);
    
    // Store scroll position before animation
    const shouldStayAtBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 100;
    
    const interval = setInterval(() => {
        if (currentIndex <= text.length) {
            const textNode = document.createTextNode(text.slice(0, currentIndex));
            element.innerHTML = '';
            element.appendChild(textNode);
            if (currentIndex < text.length) {
                element.appendChild(cursorSpan);
            }
            currentIndex++;
            
            // Only scroll if user was already at bottom
            if (shouldStayAtBottom) {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }
        } else {
            clearInterval(interval);
        }
    }, 30);
}

// Start typing animation for the last AI message after rendering
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && !lastMessage.isUser && lastMessage.text) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    animateTyping(lastMessage.id, lastMessage.text);
                }, 50);
            }
        }
    });
});

observer.observe(messagesArea, { childList: true });

// Utility Functions
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    // Use requestAnimationFrame to ensure smooth scrolling without layout shifts
    requestAnimationFrame(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    });
}

function updateSendButtonState() {
    const hasText = messageInput.value.trim().length > 0;
    const hasAttachments = attachments.length > 0;
    const canSend = (hasText || hasAttachments) && !isTyping;
    
    sendButton.disabled = !canSend;
    attachButton.disabled = isTyping;
    messageInput.disabled = isTyping;
}

// Make removeAttachment globally accessible
window.removeAttachment = removeAttachment;

