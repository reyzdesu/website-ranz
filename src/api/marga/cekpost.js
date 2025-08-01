const axios = require('axios');

module.exports = function (app) {
    /**
     * TikTok Post Check Endpoint - Mirror tikwm.com API
     * GET /stalk/cekpost?username=USERNAME
     */
    app.get('/marga/cekpost', async (req, res) => {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({ 
                code: 400,
                msg: 'Username parameter is required',
                processed_time: 0,
                data: null
            });
        }

        try {
            const startTime = Date.now();
            
            // Langsung forward request ke tikwm
            const response = await axios.get(`https://tikwm.com/api/user/posts?unique_id=${username}`);
            
            const processedTime = (Date.now() - startTime) / 1000;
            
            // Pertahankan struktur asli tikwm termasuk timestamp UNIX
            return res.json({
                code: 0,
                msg: "success",
                processed_time: processedTime,
                data: response.data.data || null
            });

        } catch (error) {
            console.error('Error:', error.message);
            return res.status(500).json({
                code: 500,
                msg: error.response?.data?.msg || 'Failed to fetch data',
                processed_time: 0,
                error: error.message,
                data: null
            });
        }
    });
};