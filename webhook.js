// webhook.js
const https = require('https');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const { message } = req.body || {};
    if (!message || !message.text) {
        return res.status(200).send('OK');
    }

    const chatId = message.chat.id;
    const incomingText = message.text.trim();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // Your Cloudflare Tunnel API URL
    const API_BASE_URL = 'https://findings-mens-gathering-guaranteed.trycloudflare.com/api/vehicle';

    const postToTelegram = (payload) => {
        return new Promise((resolve, reject) => {
            const dataStr = JSON.stringify(payload);
            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${botToken}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': dataStr.length,
                },
            };
            const request = https.request(options, (response) => {
                let body = '';
                response.on('data', (chunk) => (body += chunk));
                response.on('end', () => resolve(body));
            });
            request.on('error', (err) => reject(err));
            request.write(dataStr);
            request.end();
        });
    };

    const fetchVehicleData = (registrationNumber) => {
        return new Promise((resolve) => {
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

    if (incomingText === '/start') {
        const welcomeMessage = `🚗 **Vehicle Information Bot**

Send me an Indian vehicle registration number to get details:

Example: \`UP80FZ7850\`

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram({ chat_id: chatId, text: welcomeMessage, parse_mode: 'Markdown' });
        return res.status(200).send('OK');
    }

    const regRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i;
    if (!regRegex.test(incomingText)) {
        const invalidMessage = `❌ **Invalid Registration Number**

Please send a valid Indian vehicle registration number.

Example: \`UP80FZ7850\`

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram({ chat_id: chatId, text: invalidMessage, parse_mode: 'Markdown' });
        return res.status(200).send('OK');
    }

    const data = await fetchVehicleData(incomingText);

    if (!data) {
        const notFoundMessage = `❌ **Vehicle Not Found**

No details found for: ${incomingText.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━
🤖 **Powered By @Introspection007**`;

        await postToTelegram({ chat_id: chatId, text: notFoundMessage, parse_mode: 'Markdown' });
        return res.status(200).send('OK');
    }

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

    await postToTelegram({
        chat_id: chatId,
        text: successMessage,
        parse_mode: 'Markdown'
    });

    return res.status(200).send('OK');
};
