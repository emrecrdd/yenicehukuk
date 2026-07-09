import { useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import documentApi from '../../features/documents/document.api.js';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    case_id: searchParams.get('case') || '',
    client_id: '',
    is_public: false,
  });
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const { data: casesData } = useQuery({
    queryKey: ['cases', { limit: 100 }],
    queryFn: () => caseApi.getAll({ limit: 100 }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  const mutation = useMutation({
    mutationFn: (data) => documentApi.upload(data),
    onSuccess: (response) => {
      toast.success('Belge başarıyla yüklendi');
      navigate('/documents');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Belge yüklenemedi');
    },
  });

  const cases = casesData?.data?.data || [];
  const clients = clientsData?.data?.data || [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} dosyası 10MB'dan büyük!`);
        continue;
      }
      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length === 1 && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: validFiles[0].name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = [];
    
    for (const file of droppedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} dosyası 10MB'dan büyük!`);
        continue;
      }
      validFiles.push(file);
    }

    setFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length === 1 && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: validFiles[0].name.replace(/\.[^/.]+$/, ''),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Lütfen en az bir dosya seçin');
      return;
    }

    const newErrors = {};
    if (!formData.name && files.length === 1) newErrors.name = 'Belge adı gereklidir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Her dosya için ayrı ayrı yükleme yap
    const uploadPromises = files.map((file) => {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('name', formData.name || file.name.replace(/\.[^/.]+$/, ''));
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.split(',').map(t => t.trim()).filter(Boolean));
      formDataToSend.append('case_id', formData.case_id || '');
      formDataToSend.append('client_id', formData.client_id || '');
      formDataToSend.append('is_public', formData.is_public);
      
      return documentApi.upload(formDataToSend);
    });

    Promise.all(uploadPromises)
      .then((responses) => {
        toast.success(`${responses.length} belge başarıyla yüklendi`);
        navigate('/documents');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Belgeler yüklenemedi');
      });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    return '📎';
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      petition: 'bg-blue-100 text-blue-800',
      expert_report: 'bg-purple-100 text-purple-800',
      court_decision: 'bg-green-100 text-green-800',
      notification: 'bg-yellow-100 text-yellow-800',
      evidence: 'bg-red-100 text-red-800',
      correspondence: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/documents" className="text-blue-600 hover:underline">
            ← Belgeler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Belge Yükle
          </h1>
          <p className="text-sm text-gray-500">Birden fazla dosyayı aynı anda yükleyebilirsiniz</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dosyalar *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {files.length === 0 ? (
                <div>
                  <div className="text-5xl mb-3">📤</div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Dosya sürükle veya tıkla
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, Word, Excel, Görsel (max 10MB)
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Birden fazla dosya seçebilirsiniz (Ctrl/Shift ile)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-3">📎</div>
                  <p className="text-gray-900 dark:text-white font-medium text-lg">
                    {files.length} dosya seçildi
                  </p>
                  <p className="text-sm text-blue-600 mt-2">Değiştirmek için tıkla</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-2xl flex-shrink-0">{getFileIcon(file)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <Badge variant="default" className="text-xs">
                            {file.type.split('/')[1]?.toUpperCase() || 'DOSYA'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Belge Adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Çoklu dosya için boş bırakın, dosya adları otomatik kullanılır"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">📁 Genel</option>
              <option value="petition">📝 Dilekçe</option>
              <option value="expert_report">📊 Bilirkişi Raporu</option>
              <option value="court_decision">⚖️ Mahkeme Kararı</option>
              <option value="notification">📨 Tebligat</option>
              <option value="evidence">🔍 Delil</option>
              <option value="correspondence">✉️ Yazışma</option>
              <option value="other">📌 Diğer</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlişkili Dava
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Dava seçin</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlişkili Müvekkil
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Müvekkil seçin</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Etiketler (virgülle ayır)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="acil, icra, ceza, önemli"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Belge hakkında notlar..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              🌐 Herkese açık (tüm kullanıcılar görebilir)
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending} disabled={files.length === 0}>
              {files.length === 0 ? 'Dosya Seçin' : `${files.length} Dosya Yükle`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/documents')}>
              İptal
            </Button>
            {files.length > 0 && (
              <Button 
                type="button" 
                variant="danger" 
                onClick={() => setFiles([])}
              >
                Tümünü Temizle
              </Button>
            )}
          </div>

          {files.length > 0 && (
            <div className="text-sm text-gray-500">
              📊 Toplam {files.length} dosya, {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default DocumentUpload;