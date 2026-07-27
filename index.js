// ============================================
// VEHICLE INFO TELEGRAM BOT
// Powered By: @Introspection
// Deploy on Vercel
// API: https://vehicleinfo-api.vercel.app
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ============================================
// CONFIGURATION - EASY TO UPDATE
// ============================================
const CONFIG = {
    API_URL: process.env.API_URL || 'https://vehicleinfo-api.vercel.app/search',
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
            { text: '🔍 New Search', callback_data: 'new_search' },
            { text: '📋 Raw JSON', callback_data: 'raw_json' }
        ],
        [
            { text: '📊 Full Details', callback_data: 'full_details' },
            { text: '📱 Share', callback_data: 'share' }
        ],
        [
            { text: '🛡️ Insurance', callback_data: 'info_insurance' },
            { text: '🔧 PUCC', callback_data: 'info_pucc' },
            { text: '👤 Owner', callback_data: 'info_owner' }
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
        if (value && value !== 'N/A' && value !== 'null' && value !== null) {
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
// FETCH VEHICLE DATA FROM YOUR API
// ============================================
async function fetchVehicleData(query) {
    try {
        // Your API expects query parameter: ?q=vehicle_number_or_chassis
        const url = `${CONFIG.API_URL}?q=${encodeURIComponent(query)}`;
        console.log('🌐 Fetching from:', url);
        
        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; TelegramBot/1.0)',
                'Accept': 'application/json'
            }
        });
        
        console.log('📥 API Response Status:', response.status);
        console.log('📦 Response data keys:', Object.keys(response.data || {}));
        
        // Handle your API response structure
        // Your API returns: { statusCode: 200, message: "Success", data: {...} }
        if (response.data && response.data.statusCode === 200 && response.data.data) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                error: response.data?.message || 'No data found or invalid response'
            };
        }
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'API request failed'
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
    const username = message.from?.username || 'User';
    
    // Handle /start command
    if (text.startsWith('/start')) {
        const welcome = `🚀 <b>Vehicle Information Bot</b>\n\n` +
                       `Hello @${username}! 👋\n\n` +
                       `Send me a vehicle registration number or chassis number to get instant details.\n\n` +
                       `📌 <b>Examples:</b>\n` +
                       `• HR70H9676\n` +
                       `• MBJAA3GS600560639\n\n` +
                       `🔹 <b>Features:</b>\n` +
                       `• View vehicle details\n` +
                       `• Check insurance & PUCC\n` +
                       `• Owner history\n` +
                       `• Export JSON data\n` +
                       `• Share vehicle info\n\n` +
                       `━━━━━━━━━━━━━━━━━━━━\n` +
                       `${CONFIG.CREDIT}`;
        await sendMessage(chatId, welcome, createButtons());
        return;
    }
    
    // Handle /help command
    if (text.startsWith('/help')) {
        const helpText = `ℹ️ <b>How to use this bot:</b>\n\n` +
                        `1️⃣ Send any vehicle registration number\n` +
                        `2️⃣ Or send chassis number\n` +
                        `3️⃣ Use buttons below for more options\n\n` +
                        `📌 <b>Examples:</b>\n` +
                        `• HR70H9676\n` +
                        `• MBJAA3GS600560639\n\n` +
                        `🔹 <b>Available Buttons:</b>\n` +
                        `• <b>New Search</b> - Start fresh search\n` +
                        `• <b>Raw JSON</b> - View raw API data\n` +
                        `• <b>Full Details</b> - All fields\n` +
                        `• <b>Share</b> - Share vehicle info\n` +
                        `• <b>Insurance</b> - Insurance details\n` +
                        `• <b>PUCC</b> - Pollution certificate\n` +
                        `• <b>Owner</b> - Owner information\n` +
                        `• <b>Help</b> - This message\n` +
                        `• <b>Credit</b> - Bot developer\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `${CONFIG.CREDIT}`;
        await sendMessage(chatId, helpText, createButtons());
        return;
    }
    
    // Any non-command text is treated as search query
    if (!text.startsWith('/')) {
        await sendMessage(chatId, '🔍 <b>Searching...</b>\nPlease wait...', createButtons());
        
        const result = await fetchVehicleData(text);
        
        if (result.success && result.data) {
            const formatted = formatVehicleInfo(result.data);
            // Store data globally for callback queries
            // Note: In production, use Redis or a proper cache
            global.lastData = {
                chatId: chatId,
                data: result.data,
                query: text
            };
            await sendMessage(chatId, formatted, createButtons(result.data));
        } else {
            const errorMsg = `❌ <b>Error:</b>\n${result.error || 'Vehicle not found! Please check the number.'}\n\n` +
                            `💡 <b>Tips:</b>\n` +
                            `• Make sure the number is correct\n` +
                            `• Try with 10-digit chassis number\n` +
                            `• Example: HR70H9676 or MBJAA3GS600560639\n\n` +
                            `━━━━━━━━━━━━━━━━━━━━\n` +
                            `${CONFIG.CREDIT}`;
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
    
    // Get stored data (in production use Redis or proper caching)
    const storedData = global.lastData && global.lastData.chatId === chatId ? global.lastData.data : null;
    const query = global.lastData && global.lastData.chatId === chatId ? global.lastData.query : '';
    
    switch(data) {
        case 'new_search':
            await editMessage(chatId, messageId, 
                '🔍 <b>Send me a vehicle number or chassis number</b>\n\n' +
                '📌 <b>Examples:</b>\n' +
                '• HR70H9676\n' +
                '• MBJAA3GS600560639\n\n' +
                '💡 You can also use /help for more info\n\n' +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `${CONFIG.CREDIT}`,
                createButtons()
            );
            break;
            
        case 'raw_json':
            if (storedData) {
                const jsonText = JSON.stringify(storedData, null, 2);
                const truncated = jsonText.length > 4000 ? jsonText.substring(0, 4000) + '\n\n... (truncated)' : jsonText;
                await editMessage(chatId, messageId,
                    `<b>📋 RAW JSON DATA</b>\n\n` +
                    `<code>${truncated}</code>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search for a vehicle first.\n\n' +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${CONFIG.CREDIT}`,
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
                    '❌ No data found. Please search for a vehicle first.\n\n' +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${CONFIG.CREDIT}`,
                    createButtons()
                );
            }
            break;
            
        case 'share':
            if (storedData && storedData.rc_regn_no) {
                const shareText = `🚗 <b>Vehicle Details</b>\n\n` +
                                 `🔹 <b>Registration:</b> ${storedData.rc_regn_no}\n` +
                                 `🔹 <b>Owner:</b> ${storedData.rc_owner_name}\n` +
                                 `🔹 <b>Model:</b> ${storedData.rc_maker_model}\n` +
                                 `🔹 <b>Maker:</b> ${storedData.rc_maker_desc}\n` +
                                 `🔹 <b>Color:</b> ${storedData.rc_color}\n` +
                                 `🔹 <b>Fuel:</b> ${storedData.rc_fuel_desc}\n` +
                                 `🔹 <b>Status:</b> ${storedData.rc_status}\n` +
                                 `🔹 <b>Insurance Upto:</b> ${storedData.rc_insurance_upto}\n\n` +
                                 `🔍 <i>Checked via Vehicle Info Bot</i>\n` +
                                 `${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId,
                    `📤 <b>Share this information</b>\n\n` +
                    `${shareText}\n\n` +
                    `📋 <b>Copy and share with others!</b>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data to share. Please search for a vehicle first.\n\n' +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `${CONFIG.CREDIT}`,
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
                            `🔹 <b>Available Buttons:</b>\n` +
                            `• <b>New Search</b> - Start fresh search\n` +
                            `• <b>Raw JSON</b> - View raw API data\n` +
                            `• <b>Full Details</b> - All fields\n` +
                            `• <b>Share</b> - Share vehicle info\n` +
                            `• <b>Insurance</b> - Insurance details\n` +
                            `• <b>PUCC</b> - Pollution certificate\n` +
                            `• <b>Owner</b> - Owner information\n` +
                            `• <b>Help</b> - This message\n` +
                            `• <b>Credit</b> - Bot developer\n\n` +
                            `━━━━━━━━━━━━━━━━━━━━\n` +
                            `${CONFIG.CREDIT}`;
            await editMessage(chatId, messageId, helpText, createButtons(storedData));
            break;
            
        case 'credit':
            const creditText = `👤 <b>Bot Developer</b>\n\n` +
                              `🔹 <b>Created by:</b> @Introspection\n` +
                              `🔹 <b>Powered by:</b> HeaNg[Black-Cyber] AI\n` +
                              `🔹 <b>Version:</b> 2.0\n` +
                              `🔹 <b>API:</b> 
