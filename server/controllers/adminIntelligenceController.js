import IntelligenceService from '../services/intelligenceService.js';
import { extractSimulationIntent, generateSimulationPrediction } from '../services/aiService.js';

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
            estimatedSeats
        };
        const prediction = await generateSimulationPrediction(enrichedIntent, marketData);

        res.json({
            success: true,
            intent: enrichedIntent,
            marketData,
            prediction
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
        const analytics = await IntelligenceService.getDashboardAnalytics();
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
        const districts = await IntelligenceService.getDistrictIntelligence();
        res.json({ success: true, districts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
