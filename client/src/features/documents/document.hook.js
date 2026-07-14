import { useState } from 'react';
import documentApi from './document.api.js';
import toast from 'react-hot-toast';

// ======================================================
// FILE HANDLING HOOKS (UI Helper'lar)
// ======================================================

export const useFileUpload = () => {
  const validateFile = (file, options = {}) => {
    // ✅ file kontrolü
    if (!file) return false;

    const { maxSize = 10, allowedTypes = null } = options;
    const maxSizeBytes = maxSize * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      return false;
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      toast.error(`Dosya türü desteklenmiyor. İzin verilenler: ${allowedTypes.join(', ')}`);
      return false;
    }

    return true;
  };

  const getFileIcon = (mimeType) => {
    // ✅ null/undefined kontrolü
    if (!mimeType) return '📎';

    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return {
    validateFile,
    getFileIcon,
    formatFileSize,
  };
};

export const useDocumentDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (documentId, filename) => {
    setIsDownloading(true);
    try {
      const response = await documentApi.download(documentId);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Dosya indirildi');
    } catch (error) {
      toast.error('Dosya indirilemedi');
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};

export const useBulkUpload = () => {
  const [progress, setProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadMultiple = async (files, uploadFn) => {
    setIsUploading(true);
    const results = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const response = await uploadFn(file);
        results.push({ success: true, file: file.name, data: response.data });
        setProgress((prev) => ({
          ...prev,
          [file.name]: { completed: true, progress: 100 },
        }));
      } catch (error) {
        results.push({ success: false, file: file.name, error: error.message });
        setProgress((prev) => ({
          ...prev,
          [file.name]: { completed: false, error: error.message },
        }));
      }

      const completed = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      setProgress((prev) => ({
        ...prev,
        _total: { completed, failed, total: totalFiles },
      }));
    }

    setIsUploading(false);
    return results;
  };

  const resetProgress = () => {
    setProgress({});
  };

  return {
    uploadMultiple,
    progress,
    isUploading,
    resetProgress,
  };
};