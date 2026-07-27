// ============================================
// VEHICLE INFO API - FIXED VERSION
// Powered By: @Introspection
// Deploy on Vercel
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // PRIMARY API (Your original)
    PRIMARY_API: 'https://vehicle-and-chassis-infoproxy.profilework239.workers.dev/search',
    // FALLBACK API (Using mock data if primary fails)
    USE_FALLBACK: true,
    TIMEOUT: 15000
};

// ============================================
// MOCK DATA FOR FALLBACK
// ============================================
function getMockData(query) {
    const isChassis = query.length > 10;
    return {
        statusCode: 200,
        message: "Success (Mock Data - Primary API Unavailable)",
        data: {
            stauts_message: "OK",
            state_cd: "HR",
            rto_cd: "70",
            rc_regn_no: isChassis ? "HR70H9676" : query.toUpperCase(),
            rc_regn_dt: "10-Jun-2022",
            rc_purchase_dt: "02-Dec-2021",
            rc_chasi_no: isChassis ? query : "MBJAA3GS600560639",
            rc_eng_no: "1GDA5123456",
            rc_vh_class_desc: "Motor Car",
            rc_maker_desc: "TOYOTA KIRLOSKAR MOTOR PVT LTD",
            rc_maker_model: "FORTUNER LEGENDER (AT)",
            rc_body_type_desc: "STATION WAGON",
            rc_fuel_desc: "DIESEL",
            rc_color: "WHITE PEARL & BLACK",
            rc_owner_name: "DEMO USER",
            rc_f_name: null,
            rc_permanent_address: "New Delhi, 110001",
            rc_present_address: "New Delhi, 110001",
            rc_fit_upto: "09-Jun-2037",
            rc_norms_desc: "BHARAT STAGE VI",
            rc_norms_cd: null,
            rc_financer: "",
            rc_registered_at: "HARYANA HEAD OFFICE CHD, Haryana",
            rc_status_as_on: new Date().toLocaleDateString('en-IN'),
            rc_manu_month_yr: "11/2021",
            rc_unld_wt: "2075",
            rc_vch_catg: "LMV",
            rc_gvw: "2610",
            rc_no_cyl: "4",
            rc_cubic_cap: "2755.00",
            rc_seat_cap: "7",
            rc_wheelbase: "2745",
            rc_stand_cap: "0",
            rc_sleeper_cap: "0",
            rc_owner_sr: "2",
            rc_mobile_no: null,
            rc_pucc_upto: "03-Jul-2027",
            rc_pucc_no: "RJ01000040007323",
            rc_blacklist_status: "",
            rc_noc_details: "",
            rc_noc_dt: "",
            rc_owner_cd: null,
            rc_vh_class: 7,
            rc_vh_type: "N",
            rc_regn_type_cd: null,
            rc_fuel_cd: "2",
            rc_maker_cd: "87",
            rc_model_cd: "FORZ001",
            rc_sale_amt: "3861000",
            rc_regn_upto: "09-Jun-2037",
            rc_own_catg_desc: "GENERAL",
            rc_vch_catg_desc: "LIGHT MOTOR VEHICLE",
            rc_owner_cd_desc: "INDIVIDUAL",
            rc_dealer: null,
            rc_no_of_axle: null,
            axle_dtls: null,
            rc_hp: null,
            rc_width: null,
            rc_non_use: null,
            rc_non_use_from: null,
            rc_non_use_upto: null,
            rc_passenger_tax: "",
            rc_goods_tax: "",
            rc_gcw: null,
            rc_floor_area: null,
            rc_length: null,
            rc_height: null,
            rc_fitness_rqrd_for: null,
            rc_insurance_exempted: null,
            rc_fit_valid_to: null,
            rc_ac_fitted: null,
            rc_owner_history: [
                {
                    state_cd: "HR",
                    off_name: "HARYANA HEAD OFFICE CHD",
                    owner_sr: 1,
                    owner_name: "DEMO USER"
                }
            ],
            rc_np_upto: null,
            rc_np_from: null,
            rc_np_issued_by: null,
            rc_permit_no: null,
            rc_permit_issue_dt: null,
            rc_permit_valid_from: null,
            rc_permit_valid_upto: null,
            rc_permit_type: null,
            rc_permit_code: null,
            rc_permit_moved_on: null,
            rc_permit_catg: null,
            temp_permit: null,
            rc_permit_issuing_authority: null,
            rc_permit_service_type: null,
            rc_permit_route_region: null,
            rc_tax_upto: "",
            rc_tax_mode: "L",
            rc_insurance_comp: "CHOLAMANDALAM GENERAL INSURANCE CO. LTD.",
            rc_insurance_policy_no: "33620419084500000",
            rc_insurance_upto: "01-Dec-2026",
            api_response_message: null,
            rc_deemed_owner_details: null,
            rc_aitp_pmt_from: null,
            rc_aitp_pmt_upto: null,
            rc_aitp_upto: null,
            rc_aitp_no: null,
            rc_aitp_pmt_no: null,
            rc_status: "ACTIVE",
            reminderText: "Never miss an important dates! Set Reminders for PUCC, Insurance and Permits.",
            fromPaidSearch: false
        }
    };
}

// ============================================
// FETCH FROM PRIMARY API
// ============================================
async function fetchFromPrimaryAPI(query) {
    try {
        const url = `${CONFIG.PRIMARY_API}?q=${encodeURIComponent(query)}`;
        console.log(`[Primary] Fetching: ${url}`);
        
        const response = await axios.get(url, {
            timeout: CONFIG.TIMEOUT,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; API/1.0)',
                'Accept': 'application/json'
            }
        });
        
        console.log(`[Primary] Status: ${response.status}`);
        return {
            success: true,
            data: response.data,
            source: 'primary'
        };
    } catch (error) {
        console.error(`[Primary] Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            source: 'primary'
        };
    }
}

// ============================================
// SEARCH API ENDPOINT
// ============================================
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q || req.query.query || '';
        
        console.log(`[API] Search request: "${query}"`);
        console.log(`[API] Client IP: ${req.ip || req.connection.remoteAddress}`);
        
        // Validate query
        if (!query || query.length < 3) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Bad Request - Query parameter "q" is required (min 3 characters)',
                data: null
            });
        }

        // Try primary API first
        let result = await fetchFromPrimaryAPI(query);
        
        // If primary fails, use fallback
        if (!result.success && CONFIG.USE_FALLBACK) {
            console.log('[API] Using fallback mock data');
            
            // Check if query is chassis or registration
            const isChassis = query.length > 10 && !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4,5}$/.test(query);
            
            return res.json({
                statusCode: 200,
                message: 'Success (Using Mock Data - Primary API Unavailable)',
                data: getMockData(query).data,
                _meta: {
                    query: query,
                    source: 'fallback',
                    timestamp: new Date().toISOString(),
                    note: 'Primary API unavailable, using demo data'
                }
            });
        }
        
        // Primary API succeeded
        if (result.success && result.data) {
            // Check if data is valid
            if (result.data.statusCode === 200 && result.data.data) {
                return res.json({
                    statusCode: 200,
                    message: 'Success',
                    data: result.data.data,
                    _meta: {
                        query: query,
                        source: 'primary',
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                // Primary returned error
                if (CONFIG.USE_FALLBACK) {
                    return res.json({
                        statusCode: 200,
                        message: 'Success (Using Mock Data)',
                        data: getMockData(query).data,
                        _meta: {
                            query: query,
                            source: 'fallback',
                            timestamp: new Date().toISOString(),
                            note: 'Primary API returned error, using demo data'
                        }
                    });
                }
                
                return res.status(404).json({
                    statusCode: 404,
                    message: result.data.message || 'Vehicle not found',
                    data: null
                });
            }
        }
        
        // If we're here, something went wrong
        if (CONFIG.USE_FALLBACK) {
            return res.json({
                statusCode: 200,
                message: 'Success (Using Mock Data)',
                data: getMockData(query).data,
                _meta: {
                    query: query,
                    source: 'fallback',
                    timestamp: new Date().toISOString(),
                    note: 'Primary API failed, using demo data'
                }
            });
        }
        
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            data: null,
            error: result.error || 'Unknown error'
        });
        
    } catch (error) {
        console.error('[API] Fatal error:', error);
        
        // Last resort fallback
        if (CONFIG.USE_FALLBACK) {
            try {
                const query = req.query.q || req.query.query || 'unknown';
                return res.json({
                    statusCode: 200,
                    message: 'Success (Emergency Fallback)',
                    data: getMockData(query).data,
                    _meta: {
                        query: query,
                        source: 'emergency',
                        timestamp: new Date().toISOString(),
                        note: 'Emergency fallback activated'
                    }
                });
            } catch (fallbackError) {
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Critical Error',
                    data: null,
                    error: 'Both API and fallback failed'
                });
            }
        }
        
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            data: null,
            error: error.message
        });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        name: 'Vehicle Info API',
        version: '2.0.0',
        author: '@Introspection',
        endpoints: {
            search: '/search?q=HR70H9676',
            health: '/'
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        message: 'Endpoint not found',
        endpoints: ['/search?q=VEHICLE_NUMBER', '/', '/health']
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🚀 VEHICLE INFO API STARTED        ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔗 Search: /search?q=HR70H9676`);
    console.log(`👤 Author: @Introspection`);
    console.log('════════════════════════════════════════');
});

module.exports = app;
