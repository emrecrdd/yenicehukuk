import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../../features/templates/template.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const TemplateEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'dilekce',
    law_area: 'ozel_hukuk',
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [isFileChanged, setIsFileChanged] = useState(false);

  // ✅ Şablonu getir
  const { data, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getOne(id),
    enabled: !!id,
  });

  const template = data?.data?.data;

  // ✅ Formu doldur
  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title || '',
        description: template.description || '',
        category: template.category || 'dilekce',
        law_area: template.law_area || 'ozel_hukuk',
      });
    }
  }, [template]);

  // ✅ Güncelleme Mutation
  const updateMutation = useMutation({
    mutationFn: (data) => templateApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      queryClient.invalidateQueries(['template', id]);
      toast.success('Şablon başarıyla güncellendi');
      navigate('/templates');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Şablon güncellenemedi');
    },
  });

  // ✅ Silme Mutation
  const deleteMutation = useMutation({
    mutationFn: () => templateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      toast.success('Şablon silindi');
      navigate('/templates');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Şablon silinemedi');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('Dosya boyutu 10MB\'dan büyük olamaz!');
      setFile(null);
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Sadece PDF veya Word dosyası yükleyebilirsiniz!');
      setFile(null);
      return;
    }

    setFileError('');
    setFile(selectedFile);
    setIsFileChanged(true);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    setIsFileChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title) newErrors.title = 'Başlık gereklidir';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description || '');
    submitData.append('category', formData.category);
    submitData.append('law_area', formData.law_area);

    // ✅ Yeni dosya seçildiyse ekle
    if (file && isFileChanged) {
      submitData.append('file', file);
    }

    updateMutation.mutate(submitData);
  };

  const handleDelete = () => {
    if (window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  const categoryLabels = {
    dilekce: '📝 Dilekçe',
    ihtar: '⚡ İhtar',
    sozlesme: '📄 Sözleşme',
  };

  const lawAreaLabels = {
    ozel_hukuk: '🏛️ Özel Hukuk',
    ceza_hukuku: '⚖️ Ceza Hukuku',
    idare_hukuku: '🏢 İdare Hukuku',
    ofis_ici: '📋 Ofis İçi',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Şablon bulunamadı</p>
        <Link to="/templates" className="text-blue-600 hover:underline">
          ← Şablonlara Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/templates" className="text-blue-600 hover:underline">
            ← Şablonlar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            ✏️ Şablon Düzenle
          </h1>
          <p className="text-sm text-gray-500">{template.title}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* BAŞLIK */}
          <Input
            label="Şablon Başlığı *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Örn: İcra Takibi Dilekçesi"
          />

          {/* AÇIKLAMA */}
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
              placeholder="Şablon hakkında kısa açıklama..."
            />
          </div>

          {/* KATEGORİ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* HUKUK ALANI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hukuk Alanı *
            </label>
            <select
              name="law_area"
              value={formData.law_area}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(lawAreaLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* DOSYA YÜKLEME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📎 Şablon Dosyası {!file && !isFileChanged && '(Mevcut dosya korunur)'}
              {isFileChanged && file && ' (Yeni dosya seçildi)'}
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                fileError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                'border-gray-300 dark:border-gray-600 hover:border-blue-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div>
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Dosyayı Kaldır
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">
                    {isFileChanged ? '📤' : '📄'}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {isFileChanged 
                      ? 'Yeni dosya seçin (opsiyonel)' 
                      : template.file_name 
                        ? `Mevcut: ${template.file_name}`
                        : 'Dosya seçilmedi'}
                  </p>
                  {template.file_name && !isFileChanged && (
                    <p className="text-sm text-green-600 mt-1">
                      ✅ Mevcut dosya korunacak
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    PDF veya Word (max 10MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
            {(fileError || errors.file) && (
              <p className="mt-1 text-sm text-red-600">{fileError || errors.file}</p>
            )}
          </div>

          {/* BUTONLAR */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={updateMutation.isPending}>
              💾 Güncelle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/templates/${id}`)}>
              İptal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
              🗑️ Sil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TemplateEdit;