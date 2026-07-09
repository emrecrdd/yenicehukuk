import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import casePartyApi from '../../features/case-parties/case-party.api.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

const CasePartyDetail = () => {
  const { id, caseId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['case-party', id],
    queryFn: () => casePartyApi.getOne(id),
    enabled: !!id,
  });

  const party = data?.data?.data || data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Taraf bulunamadı</p>
        <Link to={`/cases/${caseId}/parties`} className="text-blue-600 hover:underline">
          ← Taraflara Dön
        </Link>
      </div>
    );
  }

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/cases/${caseId}/parties`} className="text-blue-600 hover:underline">
            ← Taraflar
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {party.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getPartyTypeVariant(party.party_type)}>
              {getPartyTypeLabel(party.party_type)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/cases/${caseId}/parties/${party.id}/edit`}>
            <Button variant="outline" size="sm">✏️ Düzenle</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Taraf Türü</p>
              <p className="text-gray-900 dark:text-white">{getPartyTypeLabel(party.party_type)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ad Soyad / Unvan</p>
              <p className="text-gray-900 dark:text-white">{party.name}</p>
            </div>
            {party.tc_number && (
              <div>
                <p className="text-sm text-gray-500">TC / Vergi No</p>
                <p className="text-gray-900 dark:text-white">{party.tc_number}</p>
              </div>
            )}
            {party.phone && (
              <div>
                <p className="text-sm text-gray-500">📞 Telefon</p>
                <p className="text-gray-900 dark:text-white">{party.phone}</p>
              </div>
            )}
            {party.email && (
              <div>
                <p className="text-sm text-gray-500">📧 E-posta</p>
                <p className="text-gray-900 dark:text-white">{party.email}</p>
              </div>
            )}
            {party.address && (
              <div>
                <p className="text-sm text-gray-500">📍 Adres</p>
                <p className="text-gray-900 dark:text-white">{party.address}</p>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h2 className="font-semibold text-gray-900 dark:text-white">⚖️ Avukat</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            {party.lawyer_name ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Avukat Adı</p>
                  <p className="text-gray-900 dark:text-white">{party.lawyer_name}</p>
                </div>
                {party.lawyer_phone && (
                  <div>
                    <p className="text-sm text-gray-500">📞 Telefon</p>
                    <p className="text-gray-900 dark:text-white">{party.lawyer_phone}</p>
                  </div>
                )}
                {party.lawyer_email && (
                  <div>
                    <p className="text-sm text-gray-500">📧 E-posta</p>
                    <p className="text-gray-900 dark:text-white">{party.lawyer_email}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">Avukat bilgisi girilmemiş</p>
            )}
            {party.notes && (
              <div>
                <p className="text-sm text-gray-500">📝 Notlar</p>
                <p className="text-gray-900 dark:text-white">{party.notes}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default CasePartyDetail;