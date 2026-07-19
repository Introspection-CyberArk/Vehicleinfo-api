// webhook.js
const https = require('https');

module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const body = req.body || {};
    const { message, callback_query } = body;

    // Helper function to send a message to Telegram
    const postToTelegram = async (chatId, text, parse_mode = 'Markdown') => {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN environment variable is not set!');
            return;
        }

        const payload = JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: parse_mode
        });

        return new Promise((resolve) => {
            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${botToken}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', (chunk) => { data += chunk; });
                response.on('end', () => {
                    console.log(`Telegram response status: ${response.statusCode}`);
                    if (response.statusCode !== 200) {
                        console.log(`Telegram error: ${data}`);
                    }
                    resolve();
                });
            });

            request.on('error', (error) => {
                console.error('Error sending to Telegram:', error);
                resolve();
            });

            request.write(payload);
            request.end();
        });
    };

    // Helper to fetch vehicle data
    const fetchVehicleData = (registrationNumber) => {
        return new Promise((resolve) => {
            const API_BASE_URL = 'https://findings-mens-gathering-guaranteed.trycloudflare.com/api/vehicle';
            const url = `${API_BASE_URL}/${registrationNumber.toUpperCase()}`;
            https.get(url, (response) => {
                let body = '';
                response.on('data', (chunk) => (body += chunk));
                response.on('end', () => {
                    try {
                        if (response.statusCode === 200) {
                            resolve(JSON.parse(body));
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                });
            }).on('error', () => resolve(null));
        });
    };

    const escapeHtml = (text) => {
        if (!text) return 'N/A';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    // Handle Callback Queries (button clicks)
    if (callback_query) {
        await answerCallback(callback_query.id);
        const chatId = callback_query.message.chat.id;
        await postToTelegram(chatId, '🔍 Please send a vehicle registration number (e.g., UP80FZ7850)');
        return res.status(200).send('OK');
    }

    // Handle Text Messages
    if (!message || !message.text) {
        return res.status(200).send('OK');
    }

    const chatId = message.chat.id;
    const incomingText = message.text.trim();

    // Handle /start command
    if (incomingText === '/start') {
        const welcomeMessage = `🚗 **Vehicle Information Bot**

Send me an Indian vehicle registration number to get details:

Example: \`UP80FZ7850\`

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram(chatId, welcomeMessage);
        return res.status(200).send('OK');
    }

    // Validate registration number format
    const regRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i;
    if (!regRegex.test(incomingText)) {
        const invalidMessage = `❌ **Invalid Registration Number**

Please send a valid Indian vehicle registration number.

Example: \`UP80FZ7850\`

Format: Two letters, two digits, 1-2 letters, 4 digits

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram(chatId, invalidMessage);
        return res.status(200).send('OK');
    }

    // Fetch vehicle data
    const data = await fetchVehicleData(incomingText);

    if (!data) {
        const notFoundMessage = `❌ **Vehicle Not Found**

No details found for: ${incomingText.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram(chatId, notFoundMessage);
        return res.status(200).send('OK');
    }

    // Format the response
    const successMessage = `🚗 **VEHICLE DETAILS**

**Registration:**
Number: ${escapeHtml(data.registration_number)}
Date: ${escapeHtml(data.registration_date)}
RTO: ${escapeHtml(data.registered_at)}
Status: ${escapeHtml(data.rc_status)}

**Vehicle:**
Make: ${escapeHtml(data.make)}
Model: ${escapeHtml(data.model)}
Variant: ${escapeHtml(data.variant)}
Type: ${escapeHtml(data.vehicle_type)}
Fuel: ${escapeHtml(data.fuel_descritpion)}
CC: ${escapeHtml(data.cubic_capacity)} cc

**Owner:**
Name: ${escapeHtml(data.owner_name || 'Not Available')}
Address: ${escapeHtml(data.permanent_address)}
Owner Count: ${escapeHtml(data.owner_count)}

**Insurance:**
Insurer: ${escapeHtml(data.previous_insurance_carrier)}
Policy: ${escapeHtml(data.previous_policy_number)}
Valid Upto: ${escapeHtml(data.previous_policy_valid_upto)}
RC Valid Upto: ${escapeHtml(data.rc_fit_upto)}

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

    await postToTelegram(chatId, successMessage);
    return res.status(200).send('OK');
};
