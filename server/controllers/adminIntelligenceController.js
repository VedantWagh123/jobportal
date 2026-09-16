import IntelligenceService from '../services/intelligenceService.js';
import { extractSimulationIntent, generateSimulationPrediction, generateOpenEndedPrediction } from '../services/aiService.js';

export const runWhatIfSimulation = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        // 1. Extract Intent via Gemini
        const intent = await extractSimulationIntent(prompt);
        if (!intent) {
            return res.status(400).json({ success: false, message: "Could not process the simulation request." });
        }
        
        if (!intent.skill) {
            intent.skill = "General";
        }

        // Provide defaults if AI couldn't extract them
        const proposedBatches = intent.proposedBatches || 1;
        const estimatedSeats = intent.estimatedSeats || (proposedBatches * 50);
        const district = intent.district || "Overall";

        // 2. Fetch Real Market Gap Data
        const gapData = await IntelligenceService.getGapIntelligence();
        
        // Handle Open Ended Suggestions
        if (intent.queryType === 'open_ended_suggestion') {
            const topGaps = gapData.slice(0, 5).map(g => ({ skill: g.skillName, gap: g.gap }));
            const predictionResult = await generateOpenEndedPrediction(prompt, topGaps);
            
            return res.json({
                success: true,
                intent: { ...intent, queryType: 'open_ended_suggestion' },
                marketData: null,
                prediction: predictionResult.text,
                isFallback: intent.isFallback || predictionResult.isFallback
            });
        }

        // Find the specific skill in the gap data
        const skillGap = gapData.find(g => g.skillName.toLowerCase() === intent.skill.toLowerCase()) || {
            skillName: intent.skill,
            demand: 0,
            supply: 0,
            gap: 0
        };

        const marketData = {
            activeJobs: skillGap.demand,
            currentSupply: skillGap.supply,
            gap: skillGap.gap
        };

        // 3. Generate Final Prediction
        const enrichedIntent = {
            skill: skillGap.skillName,
            district,
            proposedBatches,
            estimatedSeats,
            isFallback: intent.isFallback
        };
        const predictionResult = await generateSimulationPrediction(enrichedIntent, marketData);

        res.json({
            success: true,
            intent: enrichedIntent,
            marketData,
            prediction: predictionResult.text,
            isFallback: intent.isFallback || predictionResult.isFallback
        });
    } catch (error) {
        console.error("[runWhatIfSimulation] Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getIntelligenceOverview = async (req, res) => {
    try {
        const stats = await IntelligenceService.getOverviewStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDashboardAnalytics = async (req, res) => {
    try {
        const filters = {};
        if (req.query.state && req.query.state !== 'All India') {
            filters.state = req.query.state;
        } else if (req.admin && req.admin.scope === 'state' && req.admin.name) {
            let stateName = req.admin.name.toLowerCase().replace('government of ', '').trim();
            filters.state = stateName;
        }
        
        // District-level filter: if a district name is passed, find its ID first
        if (req.query.district && req.query.district !== 'All Districts') {
            const District = (await import('../models/District.js')).default;
            const distObj = await District.findOne({ name: new RegExp(`^${req.query.district}$`, 'i') }).select('_id').lean();
            if (distObj) {
                filters.districtId = distObj._id;
            }
        }
        
        const analytics = await IntelligenceService.getDashboardAnalytics(filters);
        res.json({ success: true, analytics });
    } catch (error) {
        console.error("Error in getDashboardAnalytics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDemandIntelligence = async (req, res) => {
    try {
        const demand = await IntelligenceService.getDemandStats();
        res.json({ success: true, demand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSupplyIntelligence = async (req, res) => {
    try {
        const supply = await IntelligenceService.getSupplyStats();
        res.json({ success: true, supply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getGapIntelligence = async (req, res) => {
    try {
        const gap = await IntelligenceService.getGapIntelligence();
        res.json({ success: true, gap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDistrictIntelligence = async (req, res) => {
    try {
        const filters = {};
        if (req.query.state && req.query.state !== 'All India') {
            filters.state = req.query.state;
        } else if (req.admin && req.admin.scope === 'state' && req.admin.name) {
            let stateName = req.admin.name.toLowerCase().replace('government of ', '').trim();
            filters.state = stateName;
        }
        const districts = await IntelligenceService.getDistrictIntelligence(filters);
        res.json({ success: true, districts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDistrictDigitalTwin = async (req, res) => {
    try {
        const { districtId } = req.params;
        const digitalTwin = await IntelligenceService.getDistrictDigitalTwin(districtId);
        res.json({ success: true, digitalTwin });
    } catch (error) {
        console.error("Error in getDistrictDigitalTwin:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSkillIntelligence = async (req, res) => {
    try {
        const { districtId, skillName } = req.params;
        const intelligence = await IntelligenceService.getSkillIntelligence(districtId, skillName);
        res.json({ success: true, data: intelligence });
    } catch (error) {
        console.error("Error in getSkillIntelligence:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRegisteredStates = async (req, res) => {
    try {
        const states = await IntelligenceService.getRegisteredStates();
        res.json({ success: true, states });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getForecastIntelligence = async (req, res) => {
    try {
        const filters = {};
        if (req.query.state && req.query.state !== 'All India') {
            filters.state = req.query.state;
        } else if (req.admin && req.admin.scope === 'state' && req.admin.name) {
            let stateName = req.admin.name.toLowerCase().replace('government of ', '').trim();
            filters.state = stateName;
        }
        
        if (req.query.district && req.query.district !== 'All Districts') {
            const District = (await import('../models/District.js')).default;
            const distObj = await District.findOne({ name: new RegExp(`^${req.query.district}$`, 'i') }).select('_id').lean();
            if (distObj) {
                filters.districtId = distObj._id;
            }
        }

        const forecast = await IntelligenceService.getForecastIntelligence(filters);
        res.json({ success: true, forecast });
    } catch (error) {
        console.error("Error in getForecastIntelligence:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const generateForecastInsights = async (req, res) => {
    try {
        const { forecastData } = req.body;
        if (!forecastData) {
            return res.status(400).json({ success: false, message: "Forecast data is required" });
        }
        
        const { generatePolicyInsights } = await import('../services/aiService.js');
        const insights = await generatePolicyInsights(forecastData);
        
        res.json({ success: true, insights });
    } catch (error) {
        console.error("Error in generateForecastInsights:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSectorMatrix = async (req, res) => {
    try {
        const filters = {
            state: req.query.state || 'Maharashtra',
            districtId: req.query.districtId,
            level: req.query.level
        };
        const matrixData = await IntelligenceService.getSectorMatrix(filters);
        res.json({ success: true, ...matrixData });
    } catch (error) {
        console.error("Sector Matrix Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMigrationAnalysis = async (req, res) => {
    try {
        const filters = {
            state: req.query.state || 'Maharashtra'
        };
        const migrationData = await IntelligenceService.getMigrationAnalysis(filters);
        res.json({ success: true, ...migrationData });
    } catch (error) {
        console.error("Migration Analysis Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
