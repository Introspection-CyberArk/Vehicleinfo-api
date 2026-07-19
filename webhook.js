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

    // Helper function to send a message to Telegram (UPDATED)
    const postToTelegram = (chatId, text) => {
        return new Promise((resolve, reject) => {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (!botToken) {
                console.error('TELEGRAM_BOT_TOKEN environment variable is not set!');
                resolve();
                return;
            }

            const payload = JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'  // Simpler, more forgiving formatting
            });

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

    // Handle Callback Queries (button clicks) - if you use inline keyboards
    if (callback_query) {
        // Simple answer to callback
        const callbackResponse = {
            callback_query_id: callback_query.id,
            text: 'Please send a vehicle number directly.'
        };
        const cbPayload = JSON.stringify(callbackResponse);
        const cbOptions = {
            hostname: 'api.telegram.org',
            port: 443,
            path: `/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(cbPayload)
            }
        };
        const cbRequest = https.request(cbOptions, () => {});
        cbRequest.write(cbPayload);
        cbRequest.end();

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
        const welcomeMessage = `🚗 <b>Vehicle Information Bot</b>

Send me an Indian vehicle registration number to get details:

Example: <code>UP80FZ7850</code>

━━━━━━━━━━━━━━━━━━━━━
🤖 <b>Powered By @Introspection007</b>`;

        await postToTelegram(chatId, welcomeMessage);
        return res.status(200).send('OK');
    }

    // Validate registration number format (e.g., UP80FZ7850)
    const regRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i;
    if (!regRegex.test(incomingText)) {
        const invalidMessage = `❌ <b>Invalid Registration Number</b>

Please send a valid Indian vehicle registration number.

Example: <code>UP80FZ7850</code>

Format: Two letters, two digits, 1-2 letters, 4 digits

━━━━━━━━━━━━━━━━━━━━━
🤖 <b>Powered By @Introspection007</b>`;

        await postToTelegram(chatId, invalidMessage);
        return res.status(200).send('OK');
    }

    // Fetch vehicle data
    const data = await fetchVehicleData(incomingText);

    if (!data) {
        const notFoundMessage = `❌ <b>Vehicle Not Found</b>

No details found for: <code>${incomingText.toUpperCase()}</code>

━━━━━━━━━━━━━━━━━━━━━
🤖 <b>Powered By @Introspection007</b>`;

        await postToTelegram(chatId, notFoundMessage);
        return res.status(200).send('OK');
    }

    // Format the response with HTML
    const successMessage = `🚗 <b>VEHICLE DETAILS</b>

<b>Registration:</b>
Number: <code>${escapeHtml(data.registration_number)}</code>
Date: ${escapeHtml(data.registration_date)}
RTO: ${escapeHtml(data.registered_at)}
Status: ${escapeHtml(data.rc_status)}

<b>Vehicle:</b>
Make: ${escapeHtml(data.make)}
Model: ${escapeHtml(data.model)}
Variant: ${escapeHtml(data.variant)}
Type: ${escapeHtml(data.vehicle_type)}
Fuel: ${escapeHtml(data.fuel_descritpion)}
CC: ${escapeHtml(data.cubic_capacity)} cc

<b>Owner:</b>
Name: ${escapeHtml(data.owner_name || 'Not Available')}
Address: ${escapeHtml(data.permanent_address)}
Owner Count: ${escapeHtml(data.owner_count)}

<b>Insurance:</b>
Insurer: ${escapeHtml(data.previous_insurance_carrier)}
Policy: ${escapeHtml(data.previous_policy_number)}
Valid Upto: ${escapeHtml(data.previous_policy_valid_upto)}
RC Valid Upto: ${escapeHtml(data.rc_fit_upto)}

━━━━━━━━━━━━━━━━━━━━━
🤖 <b>Powered By @Introspection007</b>`;

    await postToTelegram(chatId, successMessage);
    return res.status(200).send('OK');
};
