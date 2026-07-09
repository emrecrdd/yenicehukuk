import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import financeApi from '../../features/finance/finance.api.js';
import clientApi from '../../features/clients/client.api.js';
import caseApi from '../../features/cases/case.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const FinanceCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    payment_type: 'received',
    payment_method: 'cash',
    status: 'pending',
    payment_date: new Date().toISOString().slice(0, 16),
    due_date: '',
    client_id: '',
    case_id: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  // ✅ Tüm müvekkiller
  const { data: clientsData } = useQuery({
    queryKey: ['clients', { limit: 100 }],
    queryFn: () => clientApi.getAll({ limit: 100 }),
  });

  // ✅ SADECE SEÇİLEN MÜVEKKİLE AİT DAVALAR
  const { data: casesData } = useQuery({
    queryKey: ['cases', { client_id: formData.client_id || undefined, limit: 100 }],
    queryFn: () => caseApi.getAll({ client_id: formData.client_id || undefined, limit: 100 }),
    enabled: !!formData.client_id, // ← SADECE müvekkil seçiliyse çalışsın!
  });

  const clients = clientsData?.data?.data || [];
  const cases = casesData?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => financeApi.create(data),
    onSuccess: () => {
      toast.success('Ödeme başarıyla eklendi');
      navigate('/finance');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ödeme eklenemedi');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // ✅ Müvekkil değiştiğinde dava seçimini sıfırla
    if (name === 'client_id') {
      setFormData((prev) => ({ ...prev, case_id: '' }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.amount) newErrors.amount = 'Tutar gereklidir';
    if (!formData.client_id) newErrors.client_id = 'Müvekkil seçilmelidir';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      client_id: formData.client_id || null,
      case_id: formData.case_id || null,
      due_date: formData.due_date || null,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/finance" className="text-blue-600 hover:underline">
            ← Finans
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Yeni Ödeme
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tutar *"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
              placeholder="0.00"
            />
            <Input
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
              {errors.client_id && (
                <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İlişkili Dava
              </label>
              <select
                name="case_id"
                value={formData.case_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.client_id} // ← Müvekkil yoksa disabled!
              >
                <option value="">
                  {!formData.client_id ? 'Önce müvekkil seçin' : 'Dava seçin'}
                </option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.title}
                  </option>
                ))}
              </select>
              {formData.client_id && cases.length === 0 && (
                <p className="mt-1 text-sm text-yellow-500">
                  Bu müvekkile ait dava bulunmuyor
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ödeme Tipi
              </label>
              <select
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="received">Tahsilat</option>
                <option value="agreed">Anlaşılan</option>
                <option value="refund">İade</option>
                <option value="expense">Gider</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ödeme Yöntemi
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Nakit</option>
                <option value="bank_transfer">Banka Transferi</option>
                <option value="credit_card">Kredi Kartı</option>
                <option value="check">Çek</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="pending">Bekliyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
                <option value="refunded">İade</option>
              </select>
            </div>

            <Input
              label="Ödeme Tarihi"
              name="payment_date"
              type="datetime-local"
              value={formData.payment_date}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Son Tarih"
            name="due_date"
            type="datetime-local"
            value={formData.due_date}
            onChange={handleChange}
          />

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
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={mutation.isPending}>
              Ödeme Ekle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/finance')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FinanceCreate;