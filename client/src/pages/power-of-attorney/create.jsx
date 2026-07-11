import { useState, useEffect, useRef } from 'react';  // ✅ useRef EKLENDI
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { powerOfAttorneyApi } from '../../features/power-of-attorney/powerOfAttorney.api.js';
import clientApi from '../../features/clients/client.api.js';
import caseApi from '../../features/cases/case.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const PowerOfAttorneyCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get('client_id');
  const fileInputRef = useRef(null);  // ✅ Dosya input referansı

  const [formData, setFormData] = useState({
    client_id: clientIdFromUrl || '',
    case_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
    authorities: [],
    notes: '',
  });

  // ✅ Dosya state'i
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [authorityInput, setAuthorityInput] = useState('');
  const [errors, setErrors] = useState({});

  // Müvekkilleri getir
  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  // Davaları getir (müvekkil seçiliyse ona göre filtrele)
  const { data: casesData } = useQuery({
    queryKey: ['cases', { client_id: formData.client_id || undefined, limit: 100 }],
    queryFn: () => caseApi.getAll({ client_id: formData.client_id || undefined, limit: 100 }),
    enabled: !!formData.client_id,
  });

  const clients = clientsData?.data?.data || [];
  const cases = casesData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => powerOfAttorneyApi.create(data),
    onSuccess: () => {
      toast.success('Vekaletname başarıyla oluşturuldu');
      navigate('/power-of-attorney');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Vekaletname oluşturulamadı');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Dosya seçme
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Dosya boyutu kontrolü (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError('Dosya boyutu 10MB\'dan büyük olamaz!');
      setFile(null);
      return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Sadece PDF veya Word dosyası yükleyebilirsiniz!');
      setFile(null);
      return;
    }

    setFileError('');
    setFile(selectedFile);
  };

  // ✅ Dosyayı kaldır
  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddAuthority = () => {
    if (authorityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        authorities: [...prev.authorities, authorityInput.trim()],
      }));
      setAuthorityInput('');
    }
  };

  const handleRemoveAuthority = (index) => {
    setFormData((prev) => ({
      ...prev,
      authorities: prev.authorities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.client_id) newErrors.client_id = 'Müvekkil seçimi zorunludur';
    if (!formData.title) newErrors.title = 'Başlık zorunludur';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ FormData oluştur (dosya için)
    const submitData = new FormData();
    submitData.append('client_id', formData.client_id);
    submitData.append('case_id', formData.case_id || '');
    submitData.append('title', formData.title);
    submitData.append('description', formData.description || '');
    submitData.append('start_date', formData.start_date || '');
    submitData.append('end_date', formData.end_date || '');
    submitData.append('status', formData.status);
    submitData.append('authorities', JSON.stringify(formData.authorities));
    submitData.append('notes', formData.notes || '');

    // ✅ Dosya varsa ekle
    if (file) {
      submitData.append('file', file);
    }

    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/power-of-attorney" className="text-blue-600 hover:underline">
            ← Vekaletnameler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            📜 Yeni Vekaletname
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Müvekkil Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Müvekkil *
            </label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className={`w-full rounded-md border ${
                errors.client_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Müvekkil seçin</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
            )}
          </div>

          {/* Dava Seçimi (Opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              İlişkili Dava (Opsiyonel)
            </label>
            <select
              name="case_id"
              value={formData.case_id}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.client_id}
            >
              <option value="">
                {!formData.client_id ? 'Önce müvekkil seçin' : 'Dava seçin (isteğe bağlı)'}
              </option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          {/* Başlık */}
          <Input
            label="Vekaletname Başlığı *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Örn: Arsa Davası Vekaleti"
          />

          {/* Açıklama */}
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
              placeholder="Vekaletname ile ilgili açıklama..."
            />
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Başlangıç Tarihi"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
            />
            <Input
              label="Bitiş Tarihi"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durum
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="expired">Süresi Doldu</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>

          {/* Yetkiler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yetkiler
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={authorityInput}
                onChange={(e) => setAuthorityInput(e.target.value)}
                placeholder="Yetki ekle (örn: tahsilat)"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAuthority();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddAuthority}>
                Ekle
              </Button>
            </div>
            {formData.authorities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.authorities.map((auth, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {auth}
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthority(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ✅ BELGE YÜKLEME ALANI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              📎 Vekaletname Belgesi (PDF/Word - Opsiyonel)
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
                  <div className="text-4xl mb-2">📤</div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Vekaletname dosyasını sürükle veya tıkla
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
            {fileError && (
              <p className="mt-1 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ek notlar..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              📜 Vekaletname Oluştur
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/power-of-attorney')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PowerOfAttorneyCreate;