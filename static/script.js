// CHAT FUNCTIONALITY & STORAGE

let sessionId = localStorage.getItem('chatSessionId') || 'session_' + Date.now();
localStorage.setItem('chatSessionId', sessionId);

function saveMessages() {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;

    const messages = [];
    for (let child of messagesDiv.children) {
        const isUser = child.classList.contains('user-message');
        const textDiv = child.querySelector('div');
        if (textDiv && textDiv.innerText !== '🤔 Thinking...' && !textDiv.innerText.includes('Preparing your smart travel plan')) {
            messages.push({
                role: isUser ? 'user' : 'assistant',
                text: textDiv.innerText
            });
        }
    }
    localStorage.setItem(`chat_history_${sessionId}`, JSON.stringify(messages));
}

function loadMessages() {
    const saved = localStorage.getItem(`chat_history_${sessionId}`);
    if (saved) {
        const messages = JSON.parse(saved);
        const messagesDiv = document.getElementById('messages');
        if (messagesDiv && messages.length > 0) {
            messagesDiv.innerHTML = '';
            for (let msg of messages) {
                addMessageToScreen(msg.text, msg.role);
            }
            return true;
        }
    }
    return false;
}

function addMessageToScreen(text, sender) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    let formattedText = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageDiv.innerHTML = `<div>${formattedText}</div>`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addMessage(text, sender) {
    addMessageToScreen(text, sender);
    saveMessages();
}

function addThinkingIndicator() {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return null;

    const div = document.createElement('div');
    div.className = 'bot-message';
    div.id = 'thinking-indicator';
    div.innerHTML = `<div><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return div;
}

function removeThinkingIndicator(div) {
    if (div) div.remove();
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    const thinkingDiv = addThinkingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });
        const data = await response.json();
        removeThinkingIndicator(thinkingDiv);
        addMessage(data.response || data.error, 'bot');
    } catch(e) {
        removeThinkingIndicator(thinkingDiv);
        addMessage('Error: ' + e.message, 'bot');
    }
}

function sendQuick(message) {
    const input = document.getElementById('userInput');
    if (input) {
        input.value = message;
        sendMessage();
    }
}


// DASHBOARD NAVIGATION & INITIALIZATION

function goToDashboard() {
    const searchInput = document.getElementById('mainSearch');
    if (!searchInput) return;

    const city = searchInput.value.trim();
    if (!city) {
        alert("Please enter a destination!");
        return;
    }

    const currentCity = localStorage.getItem('activeDestination');

    // Wipe chat history ONLY if searching for a new city
    if (currentCity !== city) {
        sessionId = 'session_' + Date.now();
        localStorage.setItem('chatSessionId', sessionId);
        localStorage.removeItem(`chat_history_${sessionId}`);

        const query = `I am planning a trip to ${city}. Please provide a 3-day itinerary, average daily budget, and top 3 must-try local foods. Make it brief.`;
        localStorage.setItem('pendingTravelQuery', query);
    }

    localStorage.setItem('activeDestination', city);
    window.location.href = '/dashboard';
}

function initDashboard() {
    const city = localStorage.getItem('activeDestination');
    if (!city) {
        window.location.href = '/';
        return;
    }

    const destSpan = document.getElementById('dashDestination');
    if (destSpan) destSpan.innerText = city.charAt(0).toUpperCase() + city.slice(1);

    const btnsDiv = document.getElementById('dashQuickBtns');
    if (btnsDiv) {
        btnsDiv.innerHTML = `
            <button class="quick-btn" onclick="sendQuick('What should I pack for ${city}?')">🎒 Pack list</button>
            <button class="quick-btn" onclick="sendQuick('Where are the cheap eats in ${city}?')">🍜 Cheap Eats</button>
            <button class="quick-btn" onclick="sendQuick('How to use public transport in ${city}?')">🚇 Transport</button>
            <button class="quick-btn" onclick="exportAsPDF()">📄 Export PDF</button>
        `;
    }

    fetchDashboardWeather(city);
}

// Transparent Background to prevent Mobile Dark Mode inversion
async function fetchDashboardWeather(city) {
    const resultDiv = document.getElementById('dashWeatherResult');
    if (!resultDiv) return;

    try {
        const response = await fetch(`https://wttr.in/${city}?format=%C:+%t,+%w&m`);
        const data = await response.text();
        let cleanData = data.replace(/\[\d+m/g, '').replace(/\[\d*;*\d*m/g, '').trim();

        // Removed the inline background styling completely
        resultDiv.innerHTML = `
            <div style="padding: 5px;">
                <strong>📍 ${city.toUpperCase()}</strong><br>
                <span style="font-size: 16px;">${cleanData}</span>
            </div>
        `;
    } catch(e) {
        resultDiv.innerHTML = '<div style="padding: 5px; color: #fca5a5;">⚠️ Weather unavailable</div>';
    }
}


// BUDGET CALCULATOR & EXPENSE TRACKER

let currentDestination = '';
let currentDays = 7;
let currentStyle = 'mid';

function calculateBudget() {
    const destination = document.getElementById('destination').value || 'your destination';
    const days = parseInt(document.getElementById('days').value) || 7;
    const style = document.getElementById('style').value;

    currentDestination = destination;
    currentDays = days;
    currentStyle = style;

    let dailyBudget, styleName;
    if (style === 'budget') { dailyBudget = 50; styleName = '🎒 Budget'; }
    else if (style === 'mid') { dailyBudget = 120; styleName = '🏨 Mid-range'; }
    else { dailyBudget = 300; styleName = '✨ Luxury'; }

    const total = dailyBudget * days;
    const flight = style === 'budget' ? 500 : (style === 'mid' ? 800 : 1500);
    const totalWithFlight = total + flight;

    const budgetContent = document.getElementById('budgetContent');
    const resultsDiv = document.getElementById('results');

    if (budgetContent) {
        budgetContent.innerHTML = `
            <p><strong>📍 ${destination}</strong></p>
            <p>📅 ${days} days • ${styleName}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 16px 0;">
            <p>🏨 Daily expenses: $${dailyBudget}/day × ${days} days = <strong>$${total}</strong></p>
            <p>✈️ Estimated flight: <strong>$${flight}</strong></p>
            <p style="font-size: 28px; margin-top: 16px;"><strong>💰 Total: $${totalWithFlight}</strong></p>
        `;
    }
    if (resultsDiv) resultsDiv.style.display = 'block';
}

function askAIBudgetFromCalculator() {
    if (!currentDestination || currentDestination === 'your destination' || currentDestination === '') {
        alert('Please enter a destination first');
        return;
    }
    const styleText = currentStyle === 'budget' ? 'budget' : (currentStyle === 'mid' ? 'mid-range' : 'luxury');
    const query = `Create a detailed ${currentDays}-day budget breakdown for ${currentDestination} on a ${styleText} budget. Include accommodation, food, transport, activities, and 3 money-saving tips.`;

    // Route logic similar to dashboard
    localStorage.setItem('activeDestination', currentDestination);
    sessionId = 'session_' + Date.now();
    localStorage.setItem('chatSessionId', sessionId);
    localStorage.removeItem(`chat_history_${sessionId}`);
    localStorage.setItem('pendingTravelQuery', query);

    window.location.href = '/dashboard';
}

let expenses = JSON.parse(localStorage.getItem('tripExpenses') || '[]');

function renderExpenses() {
    const list = document.getElementById('expenseList');
    const totalDiv = document.getElementById('totalCost');
    if (!list || !totalDiv) return;

    let total = 0;
    list.innerHTML = '';
    expenses.forEach((exp, i) => {
        total += exp.amount;
        list.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span>${escapeHtml(exp.name)}</span>
                <span>$${exp.amount.toFixed(2)}</span>
                <button onclick="removeExpense(${i})" style="background: rgba(239, 68, 68, 0.2); border: none; color: #fca5a5; padding: 4px 10px; border-radius: 8px; cursor: pointer;">❌</button>
            </div>
        `;
    });
    totalDiv.innerHTML = `💰 Total Spent: $${total.toFixed(2)}`;
    localStorage.setItem('tripExpenses', JSON.stringify(expenses));
}

function addExpense() {
    const nameInput = document.getElementById('expenseName');
    const amountInput = document.getElementById('expenseAmount');
    if (!nameInput || !amountInput) return;

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (name && !isNaN(amount) && amount > 0) {
        expenses.push({ name, amount });
        renderExpenses();
        nameInput.value = '';
        amountInput.value = '';
    } else {
        alert('Please enter a valid expense name and amount');
    }
}

function removeExpense(index) {
    expenses.splice(index, 1);
    renderExpenses();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// UTILITIES
function exportAsPDF() {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv || messagesDiv.children.length === 0) {
        alert('No conversation to export');
        return;
    }
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html><head><title>TravelMate Plan</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6} .user-message{text-align:right;margin:15px 0} .user-message div{background:#667eea;color:white;padding:12px;border-radius:18px;display:inline-block;} .bot-message{text-align:left;margin:15px 0} .bot-message div{background:#f1f5f9;padding:12px;border-radius:18px;display:inline-block;}</style></head><body><h1>✈️ TravelMate AI - Trip Plan</h1><hr>${messagesDiv.innerHTML}</body></html>
    `);
    printWindow.print();
}

function checkPendingQuery() {
    const pendingQuery = localStorage.getItem('pendingTravelQuery');
    if (pendingQuery) {
        localStorage.removeItem('pendingTravelQuery');
        setTimeout(() => {
            const input = document.getElementById('userInput');
            if (input) {
                input.value = pendingQuery;
                sendMessage();
            }
        }, 500);
    }
}


// PAGE INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/dashboard') {
        initDashboard();
        const hasHistory = loadMessages();
        if (!hasHistory) checkPendingQuery();
    }

    if (window.location.pathname === '/chat') {
        const hasHistory = loadMessages();
        if (!hasHistory) checkPendingQuery();
    }

    if (window.location.pathname === '/budget' && typeof renderExpenses === 'function') {
        renderExpenses();
    }
});
