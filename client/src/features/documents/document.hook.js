import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import documentApi from './document.api.js';
import toast from 'react-hot-toast';

// ============ FILE HANDLING HOOKS ============

export const useFileUpload = () => {
  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata = {} }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(metadata).forEach((key) => {
        formData.append(key, metadata[key]);
      });
      
      return documentApi.upload(formData);
    },
    onSuccess: () => {
      toast.success('Dosya başarıyla yüklendi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Dosya yüklenemedi');
    },
  });

  const validateFile = (file, options = {}) => {
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
    upload: uploadMutation,
    validateFile,
    getFileIcon,
    formatFileSize,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
};

// ❌ PREVIEW HOOK'U KALDIRILDI
// export const useDocumentPreview = (documentId) => { ... }

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

export const useDocumentCategories = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['document-categories'],
    queryFn: () => documentApi.getCategories(),
    staleTime: 30 * 60 * 1000,
  });

  const categories = data?.data || [];

  const getCategoryColor = (category) => {
    const colors = {
      petition: 'bg-blue-100 text-blue-800',
      expert_report: 'bg-purple-100 text-purple-800',
      court_decision: 'bg-green-100 text-green-800',
      notification: 'bg-yellow-100 text-yellow-800',
      evidence: 'bg-red-100 text-red-800',
      correspondence: 'bg-gray-100 text-gray-800',
      general: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      petition: 'Dilekçe',
      expert_report: 'Bilirkişi Raporu',
      court_decision: 'Mahkeme Kararı',
      notification: 'Tebligat',
      evidence: 'Delil',
      correspondence: 'Yazışma',
      general: 'Genel',
      other: 'Diğer',
    };
    return labels[category] || category;
  };

  return {
    categories,
    isLoading,
    error,
    getCategoryColor,
    getCategoryLabel,
  };
};

export const useBulkUpload = () => {
  const [progress, setProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const uploadMultiple = async (files, metadata = {}) => {
    setIsUploading(true);
    const results = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(metadata).forEach((key) => {
          formData.append(key, metadata[key]);
        });

        const response = await documentApi.upload(formData);
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

export default {
  useFileUpload,
  useDocumentDownload,
  useDocumentCategories,
  useBulkUpload,
};