// ============================================
// VEHICLE INFO - ALL-IN-ONE
// API + TELEGRAM BOT
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
    API_URL: 'https://vehicle-and-chassis-infoproxy.profilework239.workers.dev/search',
    CREDIT: 'Powered By @Introspection',
    WEBHOOK_PATH: '/webhook'
};

const TELEGRAM_API = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;

// ============================================
// TELEGRAM HELPER FUNCTIONS
// ============================================
async function sendMessage(chatId, text, replyMarkup = null) {
    try {
        const payload = {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        };
        if (replyMarkup) payload.reply_markup = replyMarkup;
        
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
        if (replyMarkup) payload.reply_markup = replyMarkup;
        
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
// API FUNCTIONS
// ============================================
async function fetchVehicleData(query) {
    try {
        const url = `${CONFIG.API_URL}?q=${encodeURIComponent(query)}`;
        console.log(`[API] Fetching: ${url}`);
        
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; API/1.0)',
                'Accept': 'application/json'
            }
        });
        
        if (response.data && response.data.statusCode === 200 && response.data.data) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, error: response.data?.message || 'No data found' };
        }
    } catch (error) {
        console.error('[API] Error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================
// FORMAT FUNCTIONS
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
        ['PUCC Upto', d.rc_pucc_upto],
        ['PUCC No', d.rc_pucc_no],
        ['Insurance Company', d.rc_insurance_comp],
        ['Insurance Policy No', d.rc_insurance_policy_no],
        ['Insurance Upto', d.rc_insurance_upto],
        ['Status', d.rc_status],
        ['Sale Amount', d.rc_sale_amt]
    ];

    fields.forEach(([label, value]) => {
        if (value && value !== 'N/A' && value !== 'null' && value !== null) {
            message += `🔸 <b>${label}:</b> ${value}\n`;
        }
    });

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
// CREATE BUTTONS
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

    return { inline_keyboard: buttons };
}

// ============================================
// TELEGRAM WEBHOOK HANDLER
// ============================================
app.post(CONFIG.WEBHOOK_PATH, async (req, res) => {
    try {
        const { message, callback_query } = req.body;
        
        if (callback_query) {
            await handleCallback(callback_query);
            return res.sendStatus(200);
        }
        
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
    
    if (!text.startsWith('/')) {
        await sendMessage(chatId, '🔍 <b>Searching...</b>\nPlease wait...', createButtons());
        
        const result = await fetchVehicleData(text);
        
        if (result.success && result.data) {
            const formatted = formatVehicleInfo(result.data);
            global.lastData = {
                chatId: chatId,
                data: result.data,
                query: text
            };
            await sendMessage(chatId, formatted, createButtons(result.data));
        } else {
            const errorMsg = `❌ <b>Error:</b>\n${result.error || 'Vehicle not found!'}\n\n` +
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
// CALLBACK HANDLER
// ============================================
async function handleCallback(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;
    
    await answerCallback(callbackId, '⏳ Processing...');
    
    const storedData = global.lastData && global.lastData.chatId === chatId ? global.lastData.data : null;
    
    switch(data) {
        case 'new_search':
            await editMessage(chatId, messageId, 
                '🔍 <b>Send me a vehicle number or chassis number</b>\n\n' +
                '📌 <b>Examples:</b>\n' +
                '• HR70H9676\n' +
                '• MBJAA3GS600560639\n\n' +
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
                    `<b>📋 RAW JSON DATA</b>\n\n<code>${truncated}</code>\n\n${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search first.\n\n' + CONFIG.CREDIT,
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
                    '❌ No data found. Please search first.\n\n' + CONFIG.CREDIT,
                    createButtons()
                );
            }
            break;
            
        case 'share':
            if (storedData && storedData.rc_regn_no) {
                const shareText = `🚗 <b>Vehicle Details</b>\n\n` +
                                 `🔹 Registration: ${storedData.rc_regn_no}\n` +
                                 `🔹 Owner: ${storedData.rc_owner_name}\n` +
                                 `🔹 Model: ${storedData.rc_maker_model}\n` +
                                 `🔹 Maker: ${storedData.rc_maker_desc}\n` +
                                 `🔹 Color: ${storedData.rc_color}\n` +
                                 `🔹 Fuel: ${storedData.rc_fuel_desc}\n` +
                                 `🔹 Status: ${storedData.rc_status}\n` +
                                 `🔹 Insurance Upto: ${storedData.rc_insurance_upto}\n\n` +
                                 `🔍 Checked via Vehicle Info Bot\n${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId,
                    `📤 <b>Share this information</b>\n\n${shareText}\n\n${CONFIG.CREDIT}`,
                    createButtons(storedData)
                );
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data to share. Please search first.\n\n' + CONFIG.CREDIT,
                    createButtons()
                );
            }
            break;
            
        case 'info_insurance':
            if (storedData) {
                const insText = `🛡️ <b>INSURANCE DETAILS</b>\n\n` +
                               `🏢 Company: ${storedData.rc_insurance_comp || 'N/A'}\n` +
                               `📄 Policy: ${storedData.rc_insurance_policy_no || 'N/A'}\n` +
                               `⏳ Valid Upto: ${storedData.rc_insurance_upto || 'N/A'}\n\n` +
                               `🚗 Vehicle: ${storedData.rc_regn_no || 'N/A'}\n` +
                               `👤 Owner: ${storedData.rc_owner_name || 'N/A'}\n\n` +
                               `💡 Reminder: Renew before expiry!\n\n${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, insText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search first.\n\n' + CONFIG.CREDIT,
                    createButtons()
                );
            }
            break;
            
        case 'info_pucc':
            if (storedData) {
                const puccText = `🔧 <b>PUCC DETAILS</b>\n\n` +
                                `📄 PUCC No: ${storedData.rc_pucc_no || 'N/A'}\n` +
                                `⏳ Valid Upto: ${storedData.rc_pucc_upto || 'N/A'}\n\n` +
                                `🚗 Vehicle: ${storedData.rc_regn_no || 'N/A'}\n` +
                                `📋 Status: ${storedData.rc_status || 'N/A'}\n\n` +
                                `💡 Reminder: Get pollution check before expiry!\n\n${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, puccText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search first.\n\n' + CONFIG.CREDIT,
                    createButtons()
                );
            }
            break;
            
        case 'info_owner':
            if (storedData) {
                let ownerText = `👤 <b>OWNER DETAILS</b>\n\n` +
                               `🔹 Name: ${storedData.rc_owner_name || 'N/A'}\n` +
                               `📍 Permanent: ${storedData.rc_permanent_address || 'N/A'}\n` +
                               `📍 Present: ${storedData.rc_present_address || 'N/A'}\n` +
                               `📋 Category: ${storedData.rc_own_catg_desc || 'N/A'}\n` +
                               `🔢 Owner Serial: ${storedData.rc_owner_sr || 'N/A'}\n\n`;
                
                if (storedData.rc_owner_history && storedData.rc_owner_history.length > 0) {
                    ownerText += `📜 Owner History:\n`;
                    storedData.rc_owner_history.forEach((owner, index) => {
                        ownerText += `   ${index + 1}. ${owner.owner_name} (${owner.state_cd})\n`;
                    });
                }
                
                ownerText += `\n🚗 Vehicle: ${storedData.rc_regn_no || 'N/A'}\n\n${CONFIG.CREDIT}`;
                await editMessage(chatId, messageId, ownerText, createButtons(storedData));
            } else {
                await editMessage(chatId, messageId,
                    '❌ No data found. Please search first.\n\n' + CONFIG.CREDIT,
                    createButtons()
                );
            }
            break;
            
        case 'help':
            const helpText = `ℹ️ <b>How to use this bot:</b>\n\n` +
                            `1️⃣ Send any vehicle registration number\n` +
                            `2️⃣ Or send chassis number\n` +
                            `3️⃣ Use buttons below for more options\n\n` +
                            `📌 Examples: HR70H9676 or MBJAA3GS600560639\n\n` +
                            `🔹 Available Buttons:\n` +
                            `• New Search - Start fresh\n` +
                            `• Raw JSON - View raw data\n` +
                            `• Full Details - All fields\n` +
                            `• Share - Share info\n` +
                            `• Insurance - Insurance details\n` +
                            `• PUCC - Pollution certificate\n` +
                            `• Owner - Owner information\n` +
                            `• Help - This message\n` +
                            `• Credit - Bot developer\n\n${CONF
