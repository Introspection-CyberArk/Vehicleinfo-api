// ============================================
// VEHICLE INFO API + TELEGRAM BOT
// Powered By: @Introspection
// Deploy on Vercel
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    BOT_TOKEN: process.env.BOT_TOKEN || '8950635773:AAHVIi_robbkXS5s46FFS1rqVnYoh58oXLE',
    PRIMARY_API: 'https://vehicle-and-chassis-infoproxy.profilework239.workers.dev/search',
    CREDIT: 'Powered By @Introspection',
    WEBHOOK_PATH: '/webhook'
};

const TELEGRAM_API = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

// ============================================
// MOCK DATA (Fallback)
// ============================================
function getMockData(query) {
    const isChassis = query.length > 10;
    return {
        statusCode: 200,
        message: "Success (Demo Data)",
        data: {
            rc_regn_no: isChassis ? "HR70H9676" : query.toUpperCase(),
            rc_chasi_no: isChassis ? query : "MBJAA3GS600560639",
            rc_eng_no: "1GDA5123456",
            rc_maker_model: "FORTUNER LEGENDER (AT)",
            rc_maker_desc: "TOYOTA KIRLOSKAR MOTOR PVT LTD",
            rc_color: "WHITE PEARL & BLACK",
            rc_fuel_desc: "DIESEL",
            rc_vh_class_desc: "Motor Car",
            rc_owner_name: "DEMO USER",
            rc_permanent_address: "New Delhi, 110001",
            rc_regn_dt: "10-Jun-2022",
            rc_status: "ACTIVE",
            rc_insurance_comp: "CHOLAMANDALAM GENERAL INSURANCE CO. LTD.",
            rc_insurance_policy_no: "33620419084500000",
            rc_insurance_upto: "01-Dec-2026",
            rc_pucc_upto: "03-Jul-2027",
            rc_pucc_no: "RJ01000040007323",
            rc_seat_cap: "7",
            rc_cubic_cap: "2755.00",
            rc_owner_history: [{ owner_name: "DEMO USER", state_cd: "HR" }],
            rc_own_catg_desc: "GENERAL",
            rc_vch_catg_desc: "LIGHT MOTOR VEHICLE",
            rc_sale_amt: "3861000",
            rc_status_as_on: new Date().toLocaleDateString('en-IN')
        }
    };
}

// ============================================
// FETCH VEHICLE DATA
// ============================================
async function fetchVehicleData(query) {
    try {
        const url = `${CONFIG.PRIMARY_API}?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return { success: true, data: response.data.data };
        }
        return { success: false, error: 'No data' };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ============================================
// TELEGRAM HELPERS
// ============================================
async function sendTelegram(method, payload) {
    try {
        const res = await axios.post(`${TELEGRAM_API}/${method}`, payload);
        return res.data;
    } catch (e) {
        console.error(`Telegram ${method} error:`, e.message);
        return null;
    }
}

// ============================================
// FORMAT FUNCTIONS
// ============================================
function formatVehicleInfo(d) {
    return `🚗 <b>VEHICLE INFO</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
           `🔹 Registration: ${d.rc_regn_no || 'N/A'}\n` +
           `🔹 Chassis: ${d.rc_chasi_no || 'N/A'}\n` +
           `🔹 Model: ${d.rc_maker_model || 'N/A'}\n` +
           `🔹 Maker: ${d.rc_maker_desc || 'N/A'}\n` +
           `🔹 Color: ${d.rc_color || 'N/A'}\n` +
           `🔹 Fuel: ${d.rc_fuel_desc || 'N/A'}\n` +
           `🔹 Class: ${d.rc_vh_class_desc || 'N/A'}\n\n` +
           `👤 Owner: ${d.rc_owner_name || 'N/A'}\n` +
           `📍 Address: ${d.rc_permanent_address || 'N/A'}\n` +
           `📅 Registered: ${d.rc_regn_dt || 'N/A'}\n` +
           `📋 Status: ${d.rc_status || 'N/A'}\n\n` +
           `🛡️ Insurance: ${d.rc_insurance_comp || 'N/A'}\n` +
           `⏳ Valid Upto: ${d.rc_insurance_upto || 'N/A'}\n\n` +
           `🔧 PUCC Upto: ${d.rc_pucc_upto || 'N/A'}\n\n` +
           `━━━━━━━━━━━━━━━━━━━━\n${CONFIG.CREDIT}`;
}

function formatFullDetails(d) {
    let msg = `📋 <b>COMPLETE DETAILS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    const fields = [
        ['Registration', d.rc_regn_no],
        ['Chassis', d.rc_chasi_no],
        ['Engine', d.rc_eng_no],
        ['Model', d.rc_maker_model],
        ['Maker', d.rc_maker_desc],
        ['Color', d.rc_color],
        ['Fuel', d.rc_fuel_desc],
        ['Class', d.rc_vh_class_desc],
        ['Owner', d.rc_owner_name],
        ['Address', d.rc_permanent_address],
        ['Registered', d.rc_regn_dt],
        ['Status', d.rc_status],
        ['Insurance', d.rc_insurance_comp],
        ['Policy', d.rc_insurance_policy_no],
        ['Insurance Upto', d.rc_insurance_upto],
        ['PUCC Upto', d.rc_pucc_upto],
        ['PUCC No', d.rc_pucc_no],
        ['Seat Capacity', d.rc_seat_cap],
        ['Engine CC', d.rc_cubic_cap],
        ['Sale Amount', d.rc_sale_amt]
    ];
    fields.forEach(([label, val]) => {
        if (val && val !== 'N/A' && val !== 'null') {
            msg += `🔸 <b>${label}:</b> ${val}\n`;
        }
    });
    if (d.rc_owner_history?.length) {
        msg += `\n📜 Owner History:\n`;
        d.rc_owner_history.forEach((o, i) => {
            msg += `   ${i+1}. ${o.owner_name}\n`;
        });
    }
    msg += `\n━━━━━━━━━━━━━━━━━━━━\n${CONFIG.CREDIT}`;
    return msg;
}

function getButtons() {
    return {
        inline_keyboard: [
            [{ text: '📊 Full Details', callback_data: 'full' }, { text: '🛡️ Insurance', callback_data: 'ins' }],
            [{ text: '🔧 PUCC', callback_data: 'pucc' }, { text: '👤 Owner', callback_data: 'owner' }],
            [{ text: '📋 Raw JSON', callback_data: 'json' }, { text: '🔍 New Search', callback_data: 'new' }]
        ]
    };
}

// ============================================
// WEBHOOK HANDLER
// ============================================
app.post(CONFIG.WEBHOOK_PATH, async (req, res) => {
    try {
        const { message, callback_query } = req.body;
        if (callback_query) {
            await handleCallback(callback_query);
        } else if (message?.text) {
            await handleMessage(message);
        }
        res.sendStatus(200);
    } catch (err) {
        console.error('Webhook error:', err);
        res.sendStatus(200);
    }
});

// ============================================
// MESSAGE HANDLER
// ============================================
async function handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text.startsWith('/start')) {
        await sendTelegram('sendMessage', {
            chat_id: chatId,
            text: `🚀 Vehicle Info Bot\nSend a vehicle number or chassis.\n\n${CONFIG.CREDIT}`,
            parse_mode: 'HTML',
            reply_markup: getButtons()
        });
        return;
    }

    if (text.startsWith('/')) return;

    // Searching
    await sendTelegram('sendChatAction', { chat_id: chatId, action: 'typing' });

    const result = await fetchVehicleData(text);
    let reply;
    let data;
    if (result.success) {
        data = result.data;
        reply = formatVehicleInfo(data);
    } else {
        // Use mock data
        const mock = getMockData(text);
        data = mock.data;
        reply = formatVehicleInfo(data) + '\n\n⚠️ <i>Using demo data (API unavailable)</i>';
    }

    // Store data for callbacks (per chat)
    global.userData = global.userData || {};
    global.userData[chatId] = { data, query: text };

    await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: reply,
        parse_mode: 'HTML',
        reply_markup: getButtons()
    });
}

// ============================================
// CALLBACK HANDLER
// ============================================
async function handleCallback(cb) {
    const chatId = cb.message.chat.id;
    const msgId = cb.message.message_id;
    const action = cb.data;

    await sendTelegram('answerCallbackQuery', { callback_query_id: cb.id });

    const stored = (global.userData || {})[chatId];
    const data = stored?.data;
    if (!data) {
        await sendTelegram('editMessageText', {
            chat_id: chatId,
            message_id: msgId,
            text: '❌ No data. Search first.',
            parse_mode: 'HTML',
            reply_markup: getButtons()
        });
        return;
    }

    let reply = '';
    switch (action) {
        case 'full':
            reply = formatFullDetails(data);
            break;
        case 'ins':
            reply = `🛡️ INSURANCE\n\nCompany: ${data.rc_insurance_comp || 'N/A'}\nPolicy: ${data.rc_insurance_policy_no || 'N/A'}\nUpto: ${data.rc_insurance_upto || 'N/A'}\n\n${CONFIG.CREDIT}`;
            break;
        case 'pucc':
            reply = `🔧 PUCC\n\nNo: ${data.rc_pucc_no || 'N/A'}\nUpto: ${data.rc_pucc_upto || 'N/A'}\n\n${CONFIG.CREDIT}`;
            break;
        case 'owner':
            let ownerText = `👤 OWNER\n\nName: ${data.rc_owner_name || 'N/A'}\nAddress: ${data.rc_permanent_address || 'N/A'}\nCategory: ${data.rc_own_catg_desc || 'N/A'}\n`;
            if (data.rc_owner_history?.length) {
                ownerText += `\nHistory:\n`;
                data.rc_owner_history.forEach((o, i) => {
                    ownerText += `   ${i+1}. ${o.owner_name}\n`;
                });
            }
            reply = ownerText + `\n\n${CONFIG.CREDIT}`;
            break;
        case 'json':
            reply = `<b>RAW JSON</b>\n\n<code>${JSON.stringify(data, null, 2).substring(0, 3500)}</code>\n\n${CONFIG.CREDIT}`;
            break;
        case 'new':
            reply = `🔍 Send a new vehicle number or chassis.\n\n${CONFIG.CREDIT}`;
            break;
        default:
            reply = 'Unknown option';
    }

    await sendTelegram('editMessageText', {
        chat_id: chatId,
        message_id: msgId,
        text: reply,
        parse_mode: 'HTML',
        reply_markup: getButtons()
    });
}

// ============================================
// API ENDPOINTS
// ============================================
app.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        if (q.length < 3) {
            return res.status(400).json({ error: 'q parameter required (min 3 chars)' });
        }
        const result = await fetchVehicleData(q);
        if (result.success) {
            res.json({ statusCode: 200, message: 'Success', data: result.data });
        } else {
            // fallback mock
            const mock = getMockData(q);
            res.json({ statusCode: 200, message: 'Success (Mock)', data: mock.data });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        name: 'Vehicle Info API + Bot',
        version: '3.0',
        author: '@Introspection',
        endpoints: {
            api: '/search?q=HR70H9676',
            webhook: '/webhook',
            setwebhook: '/setwebhook'
        }
    });
});

app.get('/setwebhook', async (req, res) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.get('host');
        const webhookUrl = `${protocol}://${host}${CONFIG.WEBHOOK_PATH}`;
        const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
            url: webhookUrl,
            drop_pending_updates: true
        });
        res.json({
            success: response.data.ok,
            webhook_url: webhookUrl,
            description: response.data.description
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Running on port ${PORT}`);
    console.log(`👤 ${CONFIG.CREDIT}`);
});

module.exports = app;
