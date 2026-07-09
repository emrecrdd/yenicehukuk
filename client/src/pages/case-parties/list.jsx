import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import casePartyApi from '../../features/case-parties/case-party.api.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

const CasePartyList = () => {
  const { caseId } = useParams();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // ✅ CaseParty API'den veri çek
  const { data, isLoading, error } = useQuery({
    queryKey: ['case-parties', caseId],
    queryFn: () => casePartyApi.getByCase(caseId),
    enabled: !!caseId,
  });

  // ✅ Veriyi doğru al
  const parties = data?.data?.data || data?.data || [];

  // ✅ Silme işlemi
  const deleteMutation = useMutation({
    mutationFn: (id) => casePartyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-parties', caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      toast.success('Taraf silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`"${name}" adlı tarafı silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  // ✅ Filtreleme
  const filteredParties = filter === 'all' 
    ? parties 
    : parties.filter(p => p.party_type === filter);

  const getPartyTypeLabel = (type) => {
    const types = {
      plaintiff: 'Davacı',
      defendant: 'Davalı',
      intervener: 'Müdahil',
      witness: 'Tanık',
      expert: 'Bilirkişi',
    };
    return types[type] || type;
  };

  const getPartyTypeVariant = (type) => {
    const variants = {
      plaintiff: 'success',
      defendant: 'danger',
      intervener: 'warning',
      witness: 'info',
      expert: 'secondary',
    };
    return variants[type] || 'default';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Taraflar yüklenirken bir hata oluştu</p>
        <Link to={`/cases/${caseId}`} className="text-blue-600 hover:underline">
          ← Dava Detayına Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/cases/${caseId}`} className="text-blue-600 hover:underline">
            ← Dava Detayı
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            👥 Davanın Tarafları
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam {parties.length} taraf
          </p>
        </div>
        <Link to={`/cases/${caseId}/parties/create`}>
          <Button>+ Yeni Taraf Ekle</Button>
        </Link>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Tümü ({parties.length})
        </button>
        <button
          onClick={() => setFilter('plaintiff')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'plaintiff'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Davacılar ({parties.filter(p => p.party_type === 'plaintiff').length})
        </button>
        <button
          onClick={() => setFilter('defendant')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'defendant'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Davalılar ({parties.filter(p => p.party_type === 'defendant').length})
        </button>
        <button
          onClick={() => setFilter('intervener')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'intervener'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Müdahiller ({parties.filter(p => p.party_type === 'intervener').length})
        </button>
        <button
          onClick={() => setFilter('witness')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'witness'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Tanıklar ({parties.filter(p => p.party_type === 'witness').length})
        </button>
      </div>

      {/* Liste */}
      {filteredParties.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12 text-gray-500">
            {filter === 'all' 
              ? 'Henüz taraf eklenmemiş' 
              : 'Bu türde taraf bulunamadı'}
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParties.map((party) => (
            <Card key={party.id}>
              <Card.Body>
                <div className="flex items-start justify-between">
                  <Link 
                    to={`/cases/${caseId}/parties/${party.id}`}
                    className="flex-1 hover:underline"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {party.name}
                    </h3>
                    <Badge variant={getPartyTypeVariant(party.party_type)}>
                      {getPartyTypeLabel(party.party_type)}
                    </Badge>
                  </Link>
                  <div className="flex gap-1">
                    <Link
                      to={`/cases/${caseId}/parties/${party.id}/edit`}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(party.id, party.name)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {party.tc_number && (
                    <p>TC: {party.tc_number}</p>
                  )}
                  {party.phone && (
                    <p>📞 {party.phone}</p>
                  )}
                  {party.email && (
                    <p>📧 {party.email}</p>
                  )}
                  {party.lawyer_name && (
                    <p className="text-xs text-gray-500">
                      Av. {party.lawyer_name}
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CasePartyList;