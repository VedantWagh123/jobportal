import AiUsageLog from '../../models/AiUsageLog.js';
import UserNotification from '../../models/UserNotification.js';
import User from '../../models/User.js';

export const getAiCommandCenterData = async (req, res) => {
    try {
        const { timeFilter = '24H' } = req.query;
        
        let startDate = new Date();
        if (timeFilter === '1H') startDate.setHours(startDate.getHours() - 1);
        else if (timeFilter === '6H') startDate.setHours(startDate.getHours() - 6);
        else if (timeFilter === '24H') startDate.setHours(startDate.getHours() - 24);
        else if (timeFilter === '7D') startDate.setDate(startDate.getDate() - 7);
        else if (timeFilter === '30D') startDate.setDate(startDate.getDate() - 30);
        else startDate.setHours(startDate.getHours() - 24); // Default 24H

        const matchStage = { timestamp: { $gte: startDate } };

        // 1. Quota & Total Requests
        const totalRequests = await AiUsageLog.countDocuments(matchStage);
        const successfulRequests = await AiUsageLog.countDocuments({ ...matchStage, status: 'success' });
        const failedRequests = await AiUsageLog.countDocuments({ ...matchStage, status: 'error' });
        const fallbackRequests = await AiUsageLog.countDocuments({ ...matchStage, fallbackUsed: true });

        // Calculate token usage
        const tokenAgg = await AiUsageLog.aggregate([
            { $match: matchStage },
            { $group: { _id: null, input: { $sum: "$inputTokens" }, output: { $sum: "$outputTokens" }, total: { $sum: "$totalTokens" } } }
        ]);
        const tokens = tokenAgg.length > 0 ? tokenAgg[0] : { input: 0, output: 0, total: 0 };

        // 2. Providers and Channels
        const channelsAgg = await AiUsageLog.aggregate([
            { $match: matchStage },
            { $group: {
                _id: { provider: "$provider", keyChannel: "$keyChannel", modelUsed: "$modelUsed" },
                requests: { $sum: 1 },
                errors: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
                avgLatency: { $avg: "$durationMs" },
                lastUsed: { $max: "$timestamp" }
            }},
            { $sort: { requests: -1 } }
        ]);
        
        const channels = channelsAgg.map(c => ({
            provider: c._id.provider || 'Google Gemini',
            channel: c._id.keyChannel || 'Unknown Channel',
            model: c._id.modelUsed || 'gemini-3.6-flash',
            requests: c.requests,
            errors: c.errors,
            avgLatency: c.avgLatency ? (c.avgLatency / 1000).toFixed(2) : 0,
            lastUsed: c.lastUsed
        }));

        // 3. Feature Utilization
        const featureAgg = await AiUsageLog.aggregate([
            { $match: matchStage },
            { $group: {
                _id: "$feature",
                requests: { $sum: 1 },
                success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                avgLatency: { $avg: "$durationMs" },
                lastUsed: { $max: "$timestamp" },
                errors: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } }
            }},
            { $sort: { requests: -1 } }
        ]);
        
        const featureUtilization = featureAgg.map(f => ({
            feature: f._id,
            requests: f.requests,
            successRate: f.requests > 0 ? ((f.success / f.requests) * 100).toFixed(1) : 0,
            avgLatency: f.avgLatency ? (f.avgLatency / 1000).toFixed(2) : 0,
            lastUsed: f.lastUsed,
            errors: f.errors
        }));

        // 4. Traffic Chart Data
        let groupFormat = "%Y-%m-%d %H:00"; // default hourly
        if (timeFilter === '1H') groupFormat = "%H:%M"; // minute
        else if (timeFilter === '7D' || timeFilter === '30D') groupFormat = "%Y-%m-%d"; // daily
        else groupFormat = "%H:00"; // display time only for 6H/24H

        const trafficAgg = await AiUsageLog.aggregate([
            { $match: matchStage },
            { $group: {
                _id: { $dateToString: { format: groupFormat, date: "$timestamp", timezone: "+05:30" } },
                calls: { $sum: 1 },
                errors: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        const chartData = trafficAgg.map(t => ({
            time: t._id,
            calls: t.calls,
            errors: t.errors
        }));

        // 5. Error Analytics
        const errorAgg = await AiUsageLog.aggregate([
            { $match: { ...matchStage, status: 'error' } },
            { $group: {
                _id: "$errorMessage",
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const topErrors = errorAgg.map(e => ({
            message: e._id || 'Unknown Error',
            count: e.count
        }));

        // 6. Latency Analytics
        const slowestRequests = await AiUsageLog.find(matchStage)
            .sort({ durationMs: -1 })
            .limit(5)
            .select('feature durationMs timestamp');
        
        const avgLatencyOverall = totalRequests > 0 ? 
            channels.reduce((sum, c) => sum + (parseFloat(c.avgLatency) * c.requests), 0) / totalRequests : 0;

        // 7. Recent Execution Logs
        const recentLogs = await AiUsageLog.find().sort({ timestamp: -1 }).limit(100);

        res.json({
            success: true,
            timeFilter,
            quota: {
                totalRequests,
                successfulRequests,
                failedRequests,
                fallbackRequests,
                tokens,
                applicationUsageMode: true
            },
            channels,
            featureUtilization,
            chartData,
            topErrors,
            performance: {
                avgLatency: avgLatencyOverall.toFixed(2),
                slowestRequests
            },
            recentLogs
        });
    } catch (error) {
        console.error("Error fetching AI Command Center data:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const sendGlobalAiWarning = async (req, res) => {
    try {
        const { message } = req.body;
        const users = await User.find({}, '_id clerkId');
        
        const notifications = users.map(u => ({
            userId: u.clerkId || u._id.toString(),
            type: 'System',
            title: '⚠️ AI Usage Warning',
            message: message || 'AI systems are currently under heavy load. Please reduce your usage otherwise AI features may be temporarily disabled.',
            isRead: false
        }));

        if (notifications.length > 0) {
            await UserNotification.insertMany(notifications);
        }

        res.json({ success: true, message: `Alert sent to ${notifications.length} users successfully.` });
    } catch (error) {
        console.error("Error sending global AI warning:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
