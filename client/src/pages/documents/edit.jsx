import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentApi from '../../features/documents/document.api.js';
import caseApi from '../../features/cases/case.api.js';
import clientApi from '../../features/clients/client.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    case_id: '',
    client_id: '',
    is_public: false,
  });
  const [errors, setErrors] = useState({});

  const { data: documentData, isLoading: documentLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentApi.getOne(id),
    enabled: !!id,
  });

  const { data: casesData } = useQuery({
    queryKey: ['cases', { limit: 100 }],
    queryFn: () => caseApi.getAll({ limit: 100 }),
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  const document = documentData?.data;
  const cases = casesData?.data?.data || [];
  const clients = clientsData?.data?.data || [];

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name || '',
        description: document.description || '',
        category: document.category || 'general',
        tags: Array.isArray(document.tags) ? document.tags.join(', ') : '',
        case_id: document.case_id || '',
        client_id: document.client_id || '',
        is_public: document.is_public || false,
      });
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: (data) => documentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast.success('Belge başarıyla güncellendi');
      navigate('/documents');
    },
    onError: (error) => {
      console.error('Güncelleme hatası:', error);
      toast.error(error.response?.data?.message || 'Belge güncellenemedi');
    },
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ name: 'Belge adı gereklidir' });
      toast.error('Lütfen belge adını girin');
      return;
    }

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const updateData = {
      name: formData.name.trim(),
      description: formData.description,
      category: formData.category,
      tags: tags,
      case_id: formData.case_id || null,
      client_id: formData.client_id || null,
      is_public: formData.is_public,
    };

    updateMutation.mutate(updateData);
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

  if (documentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Belge Bulunamadı</h2>
        <Link to="/documents" className="text-blue-600 hover:underline mt-4 inline-block">← Belgeler Listesine Dön</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/documents" className="text-blue-600 hover:underline">← Belgeler</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">✏️ Belge Düzenle</h1>
          <p className="text-sm text-gray-500">{document.original_name} dosyasının bilgilerini güncelle</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {document.file_type === 'pdf' ? '📄' :
                 document.file_type === 'word' ? '📝' :
                 document.file_type === 'excel' ? '📊' :
                 document.file_type === 'image' ? '🖼️' : '📎'}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{document.original_name}</p>
                <p className="text-sm text-gray-500">
                  {document.file_size ? (document.file_size / 1024).toFixed(1) : 0} KB • {document.mime_type || 'Bilinmiyor'}
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Belge Adı *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Belge adını girin"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
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
            {formData.category && (
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${getCategoryColor(formData.category)}`}>
                {formData.category}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İlişkili Dava</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İlişkili Müvekkil</label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
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
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">🌐 Herkese açık (tüm kullanıcılar görebilir)</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={updateMutation.isPending}>💾 Güncelle</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/documents')}>İptal</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DocumentEdit;