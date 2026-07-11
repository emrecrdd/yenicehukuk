import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { templateApi } from '../../features/templates/template.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const TemplateCreate = () => {
  const navigate = useNavigate();
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

  const mutation = useMutation({
    mutationFn: (data) => templateApi.create(data),
    onSuccess: (response) => {
      toast.success('Şablon başarıyla oluşturuldu');
      navigate('/templates');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Şablon oluşturulamadı');
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
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title) newErrors.title = 'Başlık gereklidir';
    if (!file) newErrors.file = 'Dosya seçilmelidir';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description || '');
    submitData.append('category', formData.category);
    submitData.append('law_area', formData.law_area);
    submitData.append('file', file);

    mutation.mutate(submitData);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/templates" className="text-blue-600 hover:underline">
            ← Şablonlar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            📄 Yeni Şablon
          </h1>
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
              📎 Şablon Dosyası (PDF/Word) *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                errors.file ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
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
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Şablon dosyasını sürükle veya tıkla
                  </p>
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
            <Button type="submit" loading={mutation.isPending}>
              📄 Şablon Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/templates')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TemplateCreate;