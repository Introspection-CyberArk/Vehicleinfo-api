// ============================================
// VEHICLE INFO TELEGRAM BOT
// Powered By: @Introspection
// Deploy on Vercel
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ============================================
// CONFIGURATION - EASY TO UPDATE
// ============================================
const CONFIG = {
    API_URL: 'https://vehicle-and-chassis-infoproxy.profilework239.workers.dev/search',
    BOT_TOKEN: process.env.BOT_TOKEN || '8950635773:AAHVIi_robbkXS5s46FFS1rqVnYoh58oXLE',
    CREDIT: 'Powered By @Introspection',
    WEBHOOK_PATH: '/webhook'
};

// ============================================
// TELEGRAM API HELPER
// ============================================
const TELEGRAM_API = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

async function sendMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        };
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        const response = await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
        return response.data;
    } catch (error) {
        console.error('SendMessage Error:', error.response?.data || error.message);
        throw error;
    }
}

async function editMessage(chatId, messageId, text, replyMarkup = null) {
    try {
        const payload = {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        };
        if (replyMarkup) {
            payload.reply_markup = replyMarkup;
        }
        const response = await axios.post(`${TELEGRAM_API}/editMessageText`, payload);
        return response.data;
    } catch (error) {
        console.error('EditMessage Error:', error.response?.data || error.message);
        throw error;
    }
}

async function answerCallback(callbackId, text = 'Processing...') {
    try {
        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
            callback_query_id: callbackId,
            text: text
        });
    } catch (error) {
        console.error('AnswerCallback Error:', error.message);
    }
}

// ============================================
// CREATE INLINE KEYBOARD BUTTONS
// ============================================
function createButtons(data = {}) {
    const buttons = [
        [
            { text: '🔍 Search New Vehicle', callback_data: 'new_search' },
            { text: '📋 Raw JSON', callback_data: 'raw_json' }
        ],
        [
            { text: '📊 Full Details', callback_data: 'full_details' },
            { text: '📱 Share', callback_data: 'share' }
        ],
        [
            { text: 'ℹ️ Help', callback_data: 'help' },
            { text: '👤 Credit', callback_data: 'credit' }
        ]
    ];

    // If we have data, add context-aware buttons
    if (data && data.rc_chasi_no) {
        buttons.unshift([
            { text: '📄 Insurance', callback_data: `info_insurance` },
            { text: '📅 PUCC', callback_data: `info_pucc` },
            { text: '👤 Owner', callback_data: `info_owner` }
        ]);
    }

    return {
        inline_keyboard: buttons
    };
}

// ============================================
// FORMAT VEHICLE INFORMATION
// ============================================
function formatVehicleInfo(data) {
    const d = data;
    let message = `🚗 <b>VEHICLE INFORMATION</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `🔹 <b>Registration:</b> ${d.rc_regn_no || 'N/A'}\n`;
    message += `🔹 <b>Chassis:</b> ${d.rc_chasi_no || 'N/A'}\n`;
    message += `🔹 <b>Engine:</b> ${d.rc_eng_no || 'N/A'}\n`;
    message += `🔹 <b>Model:</b> ${d.rc_maker_model || 'N/A'}\n`;
    message += `🔹 <b>Maker:</b> ${d.rc_maker_desc || 'N/A'}\n`;
    message += `🔹 <b>Color:</b> ${d.rc_color || 'N/A'}\n`;
    message += `🔹 <b>Fuel:</b> ${d.rc_fuel_desc || 'N/A'}\n`;
    message += `🔹 <b>Class:</b> ${d.rc_vh_class_desc || 'N/A'}\n\n`;
    
    message += `👤 <b>Owner:</b> ${d.rc_owner_name || 'N/A'}\n`;
    message += `📍 <b>Address:</b> ${d.rc_permanent_address || 'N/A'}\n`;
    message += `📅 <b>Registered:</b> ${d.rc_regn_dt || 'N/A'}\n`;
    message += `📋 <b>Status:</b> ${d.rc_status || 'N/A'}\n\n`;
    
    message += `🛡️ <b>Insurance:</b> ${d.rc_insurance_comp || 'N/A'}\n`;
    message += `📄 <b>Policy:</b> ${d.rc_insurance_policy_no || 'N/A'}\n`;
    message += `⏳ <b>Valid Upto:</b> ${d.rc_insurance_upto || 'N/A'}\n\n`;
    
    message += `🔧 <b>PUCC Upto:</b> ${d.rc_pucc_upto || 'N/A'}\n`;
    message += `📊 <b>Seat Capacity:</b> ${d.rc_seat_cap || 'N/A'}\n`;
    message += `⚡ <b>Engine CC:</b> ${d.rc_cubic_cap || 'N/A'}\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${CONFIG.CREDIT}`;
    
    return message;
}

function formatFullDetails(data) {
    const d = data;
    let message = `📋 <b>COMPLETE DETAILS</b>\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // All fields in a table-like format
    const fields = [
        ['Registration No', d.rc_regn_no],
        ['Registration Date', d.rc_regn_dt],
        ['Purchase Date', d.rc_purchase_dt],
        ['Chassis No', d.rc_chasi_no],
        ['Engine No', d.rc_eng_no],
        ['Vehicle Class', d.rc_vh_class_desc],
        ['Maker', d.rc_maker_desc],
        ['Model', d.rc_maker_model],
        ['Body Type', d.rc_body_type_desc],
        ['Fuel Type', d.rc_fuel_desc],
        ['Color', d.rc_color],
        ['Owner Name', d.rc_owner_name],
        ['Permanent Address', d.rc_permanent_address],
        ['Present Address', d.rc_present_address],
        ['Fit Upto', d.rc_fit_upto],
        ['Norms', d.rc_norms_desc],
        ['Registered At', d.rc_registered_at],
        ['Status As On', d.rc_status_as_on],
        ['Manufacture Month/Year', d.rc_manu_month_yr],
        ['Unladen Weight', d.rc_unld_wt],
        ['Vehicle Category', d.rc_vch_catg_desc],
        ['Gross Vehicle Weight', d.rc_gvw],
        ['No of Cylinders', d.rc_no_cyl],
        ['Cubic Capacity', d.rc_cubic_cap],
        ['Seat Capacity', d.rc_seat_cap],
        ['Wheelbase', d.rc_wheelbase],
        ['Owner Serial', d.rc_owner_sr],
        ['Mobile No', d.rc_mobile_no || 'N/A'],
        ['PUCC Upto', d.rc_pucc_upto],
        ['PUCC No', d.rc_pucc_no],
        ['Blacklist Status', d.rc_blacklist_status || 'Clean'],
        ['Insurance Company', d.rc_insurance_comp],
        ['Insurance Policy No', d.rc_insurance_policy_no],
        ['Insurance Upto', d.rc_insurance_upto],
        ['Tax Mode', d.rc_tax_mode],
        ['Status', d.rc_status],
        ['Sale Amount', d.rc_sale_amt]
    ];

    fields.forEach(([label, value]) => {
        if (value && value !== 'N/A' && value !== 'null') {
            message += `🔸 <b>${label}:</b> ${value}\n`;
        }
    });

    // Owner History
    if (d.rc_owner_history && d.rc_owner_history.length > 0) {
        message += `\n📜 <b>Owner History:</b>\n`;
        d.rc_owner_history.forEach((owner, index) => {
            message += `   ${index + 1}. ${owner.owner_name} (${owner.state_cd})\n`;
        });
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `${CONFIG.CREDIT}`;
    
    return message;
}

// ============================================
// FETCH VEHICLE DATA FROM API
// ============================================
async function fetchVehicleData(query) {
    try {
        const url = `${CONFIG.API_URL}?q=${encodeURIComponent(query)}`;
        console.log('Fetching:', url);
        
        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TelegramBot/1.0)'
            }
        });
        
        if (response.data && response.data.statusCode === 200 && response.data.data) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                error: 'No data found or invalid response'
            };
        }
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        return {
            success: false,
            error: error.message || 'API request failed'
        };
    }
}

// ============================================
// TELEGRAM WEBHOOK HANDLER
// ============================================
app.post(CONFIG.WEBHOOK_PATH, async (req, res) => {
    try {
        const { message, callback_query } = req.body;
        
        // Handle Callback Queries (Button Clicks)
        if (callback_query) {
            await handleCallback(callback_query);
            return res.sendStatus(200);
        }
        
        // Handle Regular Messages
        if (message && message.text) {
            await handleMessage(message);
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(200);
    }
});

// ============================================
// MESSAGE HANDLER
// ============================================
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text.trim();
    
    // Skip commands - we only handle text input as search queries
    // But we'll also handle /start for welcome
    if (text.startsWith('/start')) {
        const welcome = `🚀 <b>Vehicle Information Bot</b>\n\n` +
                       `Send me a vehicle number or chassis number to get details.\n\n` +
                       `📌 <b>Examples:</b>\n` +
                       `• HR70H9676\n` +
                       `• MBJAA3GS600560639\n\n` +
                       `${CONFIG.CREDIT}`;
        await sendMessage(chatId, welcome, createButtons());
        return;
    }
    
    // Any non-command text is treated as search query
    if (!text.startsWith('/')) {
        await sendMessage(chatId, '🔍 <b>Searching...</b>\nPlease wait...', createButtons());
        
        const result = await fetchVehicleData(text);
        
        if (result.success && result.data) {
            const formatted = formatVehicleInfo(result.data);
            // Store data temporarily for callback queries (in production use Redis or DB)
            // For now, we'll store in a global cache (will reset on each request, not ideal)
            // Better approach: use message_id mapping
            global.lastData = {
                chatId: chatId,
                data: result.data
            };
            await sendMessage(chatId, formatted, createButtons(result.data));
        } else {
            const errorMsg = `❌ <b>Error:</b>\n${result.error || 'Vehicle not found! Please check the number.'}\n\n` +
                            `Please try again with a valid vehicle or chassis number.`;
            await sendMessage(chatId, errorMsg, createButtons());
        }
    }
}

// ============================================
// CALLBACK QUERY HANDLER
// ============================================
async function handleCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;
    
    await answerCallback(callbackId, '⏳ Processing...');
    
    // Get stored data (in production use proper caching)
    const storedData = global.lastData && global.lastData.chatId === chatId ? global.lastData.data : null;
    
    switch(data) {
        case 'new_search':
            await editMessage(chatId, messageId, 
                '🔍 <b>Send me a vehicle number or chassis number</b>\n\n' +
                '📌 <b>Examples:</b>\n• HR70H9676\n• MBJAA3GS600560639\n\n' +
                `${CONFIG.CREDIT}`,
                createButtons()
            );
            break;
            
        case 'raw_json':
            if (storedData) {
                const jsonText = JSON.stringify(storedData, null, 2);
                const truncated = jsonText.length > 4000 ? jsonText.substring(0, 4000) + '\n\n... (truncated)' : jsonText;
                await editMessage(chatId, messageId,
                    `<b>📋 RAW JSON DATA</b>\n\n<code>${truncated}</code>\n\n${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search for a vehicle first.',
                    createButtons()
                );
            }
            break;
            
        case 'full_details':
            if (storedData) {
                const details = formatFullDetails(storedData);
                await editMessage(chatId, messageId, details, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search for a vehicle first.',
                    createButtons()
                );
            }
            break;
            
        case 'share':
            if (storedData && storedData.rc_regn_no) {
                const shareText = `🚗 Vehicle: ${storedData.rc_regn_no}\n` +
                                 `👤 Owner: ${storedData.rc_owner_name}\n` +
                                 `🏭 Model: ${storedData.rc_maker_model}\n` +
                                 `📅 Status: ${storedData.rc_status}\n\n` +
                                 `🔍 Checked via @IntrospectionBot`;
                await editMessage(chatId, messageId,
                    `📤 <b>Share this information</b>\n\n` +
                    `<code>${shareText}</code>\n\n` +
                    `Copy and share this with others!\n\n${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data to share. Please search for a vehicle first.',
                    createButtons()
                );
            }
            break;
            
        case 'help':
            const helpText = `ℹ️ <b>How to use this bot:</b>\n\n` +
                            `1️⃣ Send any vehicle registration number\n` +
                            `2️⃣ Or send chassis number\n` +
                            `3️⃣ Use buttons below for more options\n\n` +
                            `📌 <b>Examples:</b>\n` +
                            `• HR70H9676\n` +
                            `• MBJAA3GS600560639\n\n` +
                            `🔹 <b>Features:</b>\n` +
                            `• View vehicle details\n` +
                            `• Check insurance info\n` +
                            `• Get PUCC details\n` +
                            `• View full JSON data\n` +
                            `• Share vehicle info\n\n` +
                            `${CONFIG.CREDIT}`;
            await editMessage(chatId, messageId, helpText, createButtons(storedData));
            break;
            
        case 'credit':
            const creditText = `👤 <b>Bot Developer</b>\n\n` +
                              `🔹 <b>Created by:</b> @Introspection\n` +
                              `🔹 <b>Powered by:</b> HeaNg[Black-Cyber] AI\n` +
                              `🔹 <b>Version:</b> 1.0\n` +
                              `🔹 <b>Source:</b> GitHub\n\n` +
                              `💡 <b>Support:</b>\n` +
                              `• Report bugs to @Introspection\n` +
                              `• Feature requests welcome\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━\n` +
                              `${CONFIG.CREDIT}`;
            await editMessage(chatId, messageId, creditText, createButtons(storedData));
            break;
            
        case 'info_insurance':
            if (storedData) {
                const insText = `🛡️ <b>INSURANCE DETAILS</b>\n\n` +
                               `🏢 <b>Company:</b> ${storedData.rc_insurance_comp || 'N/A'}\n` +
                               `📄 <b>Policy No:</b> ${storedData.rc_insurance_policy_no || 'N/A'}\n` +
                               `⏳ <b>Valid Upto:</b> ${storedData.rc_insurance_upto || 'N/A'}\n\n` +
                               `🚗 <b>Vehicle:</b> ${storedData.rc_regn_no || 'N/A'}\n` +
                               `👤 <b>Owner:</b> ${storedData.rc_owner_name || 'N/A'}\n\n` +
                               `${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, insText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No vehicle data found. Please search first.',
                    createButtons()
                );
            }
            break;
            
        case 'info_pucc':
            if (storedData) {
                const puccText = `🔧 <b>PUCC DETAILS</b>\n\n` +
                                `📄 <b>PUCC No:</b> ${storedData.rc_pucc_no || 'N/A'}\n` +
                                `⏳ <b>Valid Upto:</b> ${storedData.rc_pucc_upto || 'N/A'}\n\n` +
                                `🚗 <b>Vehicle:</b> ${storedData.rc_regn_no || 'N/A'}\n` +
                                `📋 <b>Status:</b> ${storedData.rc_status || 'N/A'}\n\n` +
                                `${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, puccText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No vehicle data found. Please search first.',
                    createButtons()
                );
            }
            break;
            
        case 'info_owner':
            if (storedData) {
                let ownerText = `👤 <b>OWNER DETAILS</b>\n\n` +
                               `🔹 <b>Name:</b> ${storedData.rc_owner_name || 'N/A'}\n` +
                               `📍 <b>Permanent:</b> ${storedData.rc_permanent_address || 'N/A'}\n` +
                               `📍 <b>Present:</b> ${storedData.rc_present_address || 'N/A'}\n` +
                               `📋 <b>Category:</b> ${storedData.rc_own_catg_desc || 'N/A'}\n` +
                               `🔢 <b>Owner Serial:</b> ${storedData.rc_owner_sr || 'N/A'}\n\n`;
                
                if (storedData.rc_owner_history && storedData.rc_owner_history.length > 0) {
                    ownerText += `📜 <b>Owner History:</b>\n`;
                    storedData.rc_owner_history.forEach((owner, index) => {
                        ownerText += `   ${index + 1}. ${owner.owner_name} (${owner.state_cd})\n`;
                    });
                }
                
                ownerText += `\n🚗 <b>Vehicle:</b> ${storedData.rc_regn_no || 'N/A'}\n\n${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, ownerText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No vehicle data found. Please search first.',
                    createButtons()
                );
            }
            break;
            
        default:
            await answerCallback(callbackId, 'Unknown option');
            break;
    }
}

// ============================================
// SET WEBHOOK ENDPOINT
// ============================================
app.get('/setwebhook', async (req, res) => {
    try {
        const webhookUrl = req.query.url || `${req.protocol}://${req.get('host')}${CONFIG.WEBHOOK_PATH}`;
        const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
            url: webhookUrl
        });
        res.json({
            success: response.dat
