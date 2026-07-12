import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import casePartyApi from '../../features/case-parties/case-party.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import toast from 'react-hot-toast';

const CasePartyCreate = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    party_type: 'davali',
    name: '',
    tc_number: '',
    phone: '',
    email: '',
    address: '',
    lawyer_name: '',
    lawyer_phone: '',
    lawyer_registry_number: '',
    notes: '',
  });

  // ✅ TARAF TÜRLERİ
  const partyTypes = [
    { value: 'davali', label: 'Davalı' },
    { value: 'davaci', label: 'Davacı' },
    { value: 'supheli', label: 'Şüpheli' },
    { value: 'sanik', label: 'Sanık' },
    { value: 'musteki', label: 'Müşteki' },
    { value: 'katilan', label: 'Katılan' },
    { value: 'alacakli', label: 'Alacaklı' },
    { value: 'borclu', label: 'Borçlu' },
    { value: 'ucuncu_kisi', label: 'Üçüncü Kişi' },
  ];

  const mutation = useMutation({
    mutationFn: (data) => casePartyApi.create(caseId, data),
    onSuccess: (response) => {
      toast.success('Taraf başarıyla eklendi');
      const partyId = response?.data?.data?.id;
      if (partyId) {
        navigate(`/cases/${caseId}/parties/${partyId}`);
      } else {
        navigate(`/cases/${caseId}/parties`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/cases/${caseId}/parties`} className="text-blue-600 hover:underline">
            ← Taraflar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            👤 Yeni Taraf Ekle
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taraf Türü *
            </label>
            <select
              name="party_type"
              value={formData.party_type}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {partyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Ad Soyad / Unvan *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Örn: Ahmet Yılmaz veya ABC Şirketi"
            required
          />

          <Input
            label="TC / Vergi No"
            name="tc_number"
            value={formData.tc_number}
            onChange={handleChange}
            placeholder="12345678901"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="5551234567"
            />
            <Input
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adres
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adres bilgisi..."
            />
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <h3 className="font-semibold text-gray-900 dark:text-white">⚖️ Avukat Bilgileri</h3>

          <Input
            label="Avukat Adı"
            name="lawyer_name"
            value={formData.lawyer_name}
            onChange={handleChange}
            placeholder="Avukat adı"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Avukat Telefon"
              name="lawyer_phone"
              value={formData.lawyer_phone}
              onChange={handleChange}
              placeholder="5551234567"
            />
            <Input
              label="Sicil No"
              name="lawyer_registry_number"
              value={formData.lawyer_registry_number}
              onChange={handleChange}
              placeholder="123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ek notlar..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" loading={mutation.isPending}>
              Taraf Ekle
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/cases/${caseId}/parties`)}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CasePartyCreate;