import { useState, useEffect, useRef } from 'react';
import { videoAPI, clipAPI } from '../services/api';

export const useVideoStatus = (videoId, autoStart = false) => {
  const [status, setStatus] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchStatus = async () => {
    if (!videoId) return;
    try {
      const response = await videoAPI.getStatus(videoId);
      const { status: newStatus, clipCount } = response.data;
      setStatus(newStatus);

      if (newStatus === 'completed') {
        stopPolling();
        if (clipCount > 0) {
          const clipsResponse = await clipAPI.getByVideo(videoId);
          setClips(clipsResponse.data);
        }
        setLoading(false);
      } else if (newStatus === 'failed') {
        stopPolling();
        setLoading(false);
      }
    } catch (error) {
      console.error('Status poll error:', error);
    }
  };

  const startPolling = () => {
    setLoading(true);
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 3000);
  };

  useEffect(() => {
    if (autoStart && videoId) startPolling();
    return () => stopPolling();
  }, [videoId]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return { status, clips, loading, startPolling, stopPolling };
};