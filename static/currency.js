// CURRENCY CONVERTER - Separate Module

let currencyList = [];

// Fetch all available currencies from live API
async function fetchCurrencies() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json');
        const data = await response.json();

        currencyList = Object.keys(data).map(code => ({
            code: code.toUpperCase(),
            name: data[code]
        })).sort((a, b) => a.code.localeCompare(b.code));

        populateCurrencyDropdowns();

        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.innerHTML = '📅 Exchange rates updated daily | 160+ currencies available';
        }
    } catch(e) {
        console.error('Failed to fetch currencies:', e);
        // Fallback to common Asian currencies
        currencyList = [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
            { code: 'JPY', name: 'Japanese Yen' },
            { code: 'CNY', name: 'Chinese Yuan' },
            { code: 'INR', name: 'Indian Rupee' },
            { code: 'KRW', name: 'South Korean Won' },
            { code: 'SGD', name: 'Singapore Dollar' },
            { code: 'MYR', name: 'Malaysian Ringgit' },
            { code: 'THB', name: 'Thai Baht' },
            { code: 'VND', name: 'Vietnamese Dong' },
            { code: 'IDR', name: 'Indonesian Rupiah' },
            { code: 'PHP', name: 'Philippine Peso' },
            { code: 'LKR', name: 'Sri Lankan Rupee' },
            { code: 'BDT', name: 'Bangladeshi Taka' },
            { code: 'PKR', name: 'Pakistani Rupee' },
            { code: 'NPR', name: 'Nepalese Rupee' },
            { code: 'MMK', name: 'Myanmar Kyat' },
            { code: 'KHR', name: 'Cambodian Riel' },
            { code: 'LAK', name: 'Lao Kip' },
            { code: 'AUD', name: 'Australian Dollar' },
            { code: 'CAD', name: 'Canadian Dollar' },
            { code: 'CHF', name: 'Swiss Franc' },
            { code: 'NZD', name: 'New Zealand Dollar' },
            { code: 'AED', name: 'UAE Dirham' },
            { code: 'SAR', name: 'Saudi Riyal' },
            { code: 'QAR', name: 'Qatari Riyal' },
            { code: 'KWD', name: 'Kuwaiti Dinar' },
            { code: 'BHD', name: 'Bahraini Dinar' },
            { code: 'OMR', name: 'Omani Rial' }
        ];
        populateCurrencyDropdowns();
        const lastUpdated = document.getElementById('lastUpdated');
        if (lastUpdated) {
            lastUpdated.innerHTML = '⚠️ Using offline currency list';
        }
    }
}

// Populate dropdowns with currency options
function populateCurrencyDropdowns() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    if (!fromSelect || !toSelect) return;

    let options = '';
    for (let currency of currencyList) {
        options += `<option value="${currency.code}">${currency.code} - ${currency.name}</option>`;
    }

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;

    // Set default values
    fromSelect.value = 'USD';
    toSelect.value = 'INR';
}

// Convert currency
async function convertCurrency() {
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const resultDiv = document.getElementById('conversionResult');

    if (!amountInput || !fromSelect || !toSelect || !resultDiv) return;

    const amount = amountInput.value;
    const from = fromSelect.value.toLowerCase();
    const to = toSelect.value.toLowerCase();

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = '⚠️ Please enter a valid amount';
        return;
    }

    resultDiv.innerHTML = '🔄 Fetching exchange rate...';

    try {
        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`;
        const response = await fetch(url);
        const data = await response.json();

        const rate = data[from][to];
        if (rate) {
            const converted = (amount * rate).toFixed(2);
            resultDiv.innerHTML = `💰 ${amount} ${fromSelect.value} = ${converted} ${toSelect.value}`;
        } else {
            resultDiv.innerHTML = `⚠️ ${fromSelect.value} → ${toSelect.value} not available. Try another pair.`;
        }
    } catch(e) {
        console.error('Currency error:', e);
        resultDiv.innerHTML = '⚠️ Conversion failed. Please try again.';
    }
}

// Initialize currency converter when page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('fromCurrency')) {
            fetchCurrencies();
        }
    });
}
