// ═══════════════════════════════════════════════
//  CHATBOT.JS — AI Chat Assistant
// ═══════════════════════════════════════════════

(function () {
  const fab     = document.getElementById('chat-fab');
  const popup   = document.getElementById('chat-popup');
  const closeBtn = document.getElementById('chat-close');
  const form    = document.getElementById('chat-form');
  const input   = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');

  let isOpen = false;

  // ── Toggle chat ────────────────────────────────
  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    popup.classList.toggle('open', isOpen);
    if (isOpen) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    popup.classList.remove('open');
  });

  // ── Send message ───────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // User bubble
    appendMessage(text, 'user');
    input.value = '';

    // Typing indicator
    const typing = appendMessage('Thinking…', 'bot');
    typing.classList.add('typing');

    try {
      const data = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      }).then(r => r.json());

      typing.remove();
      appendMessage(data.reply, 'bot');
    } catch {
      typing.remove();
      appendMessage('Sorry, something went wrong. Try again!', 'bot');
    }
  });

  function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = `<div class="chat-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // Update icons after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
  });
})();
