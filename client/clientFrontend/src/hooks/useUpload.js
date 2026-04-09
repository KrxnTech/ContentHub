import { useState } from 'react';
import { videoAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const uploadVideo = async (file, title) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title || file.name);

    try {
      const response = await videoAPI.upload(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      setUploadedVideo(response.data);
      toast.success('Video uploaded successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadVideo, uploading, uploadProgress, uploadedVideo };
};