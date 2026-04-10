const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonService = {
  async processVideo({ videoId, videoUrl, title }) {
    try {
      console.log(`🐍 Calling Python service for video: ${videoId}`);

      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/process`,
        { video_id: videoId, video_url: videoUrl, title },
        { timeout: 600000 } // 10 minutes timeout for long videos
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Python service returned an error');
      }

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Python processing service is not running. Please start it.');
      }
      throw new Error(`Python service error: ${error.message}`);
    }
  },

  async healthCheck() {
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, { timeout: 5000 });
      return response.data;
    } catch {
      return { status: 'unreachable' };
    }
  },
};

module.exports = pythonService;