const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get User Gamification Stats
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Calculate Trust Score (Slow & Steady)
        // Base: 50
        // +1 per completed sale/purchase
        // Max: 100
        const salesRes = await pool.query("SELECT COUNT(*) as count FROM orders o JOIN listings l ON o.listing_id = l.id WHERE l.seller_id = $1 AND o.status = 'completed'", [userId]);
        const purchasesRes = await pool.query("SELECT COUNT(*) as count FROM orders WHERE buyer_id = $1 AND status = 'completed'", [userId]);

        const salesCount = parseInt(salesRes.rows[0].count);
        const purchasesCount = parseInt(purchasesRes.rows[0].count);
        const totalTrades = salesCount + purchasesCount;

        let trustScore = 50 + totalTrades;
        if (trustScore > 100) trustScore = 100;

        // 2. Determine Badges (Milestones)
        const badges = [];

        // Milestone Badges
        if (trustScore >= 60) badges.push({ id: 'rising_star', label: 'Rising Star', icon: 'Star' });
        if (trustScore >= 70) badges.push({ id: 'trusted_dealer', label: 'Trusted Dealer', icon: 'CheckCircle' });
        if (trustScore >= 80) badges.push({ id: 'market_leader', label: 'Market Leader', icon: 'Zap' });
        if (trustScore >= 90) badges.push({ id: 'konnect_royal', label: 'Konnect Royalty', icon: 'Crown' });
        if (trustScore >= 100) badges.push({ id: 'legend', label: 'Legend', icon: 'Award' });

        // Activity Badges
        if (salesCount >= 1) badges.push({ id: 'verified_seller', label: 'Verified Seller', icon: 'CheckCircle' });
        if (purchasesCount >= 5) badges.push({ id: 'frequent_buyer', label: 'Frequent Buyer', icon: 'ShoppingBag' });

        // 3. Calculate Points (1 point per 1000 NGN spent/sold)
        // 3. Calculate Points (1 point per 1000 NGN spent/sold)
        // Logic: Simplified points calculation based on trade volume counts
        const points = (salesCount * 50) + (purchasesCount * 20);

        res.json({
            trustScore,
            badges,
            points,
            stats: {
                sales: salesCount,
                purchases: purchasesCount
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
