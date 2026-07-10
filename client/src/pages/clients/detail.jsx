import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clientApi from '../../features/clients/client.api.js';
import { powerOfAttorneyApi } from '../../features/power-of-attorney/powerOfAttorney.api.js';  // ✅ EKLENDI
import Badge from '../../components/ui/Badge.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Phone, Mail, MessageCircle, Edit2, Briefcase, DollarSign, Calendar, MapPin, User, ArrowLeft, Building2, Scale, UserCog, FileText } from 'lucide-react';  // ✅ FileText eklendi

const getCaseStatusLabel = (status) => {
  const labels = {
    active: 'Devam Ediyor',
    preparation: 'Hazırlık',
    hearing: 'Duruşmada',
    appeal: 'İstinaf',
    cassation: 'Temyiz',
    concluded: 'Sonuçlandı',
    archived: 'Arşivlendi',
  };
  return labels[status] || status;
};

const getCaseStatusVariant = (status) => {
  const variants = {
    active: 'success',
    preparation: 'warning',
    hearing: 'info',
    appeal: 'warning',
    cassation: 'default',
    concluded: 'default',
    archived: 'danger',
  };
  return variants[status] || 'default';
};

// ✅ Vekaletname durum etiketleri
const getPOAStatusLabel = (status) => {
  const labels = {
    active: 'Aktif',
    expired: 'Süresi Doldu',
    cancelled: 'İptal',
  };
  return labels[status] || status;
};

const getPOAStatusVariant = (status) => {
  const variants = {
    active: 'success',
    expired: 'warning',
    cancelled: 'danger',
  };
  return variants[status] || 'default';
};

const ClientDetail = () => {
  const { id } = useParams();

  // ✅ Müvekkil bilgileri
  const { data, isLoading, error } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.getOne(id),
    enabled: !!id,
  });

  // ✅ Vekaletnameleri getir
  const { data: poaData, isLoading: poaLoading } = useQuery({
    queryKey: ['powerOfAttorneys', { client_id: id }],
    queryFn: () => powerOfAttorneyApi.getByClient(id),
    enabled: !!id,
  });

  const client = data?.data?.data;
  const powerOfAttorneys = poaData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-xl text-red-600 font-semibold">Müvekkil bulunamadı</p>
        <Link to="/clients" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Müvekkillere Dön
        </Link>
      </div>
    );
  }

  const phone = client.phone || '';
  const email = client.email || '';

  const message = encodeURIComponent(`Merhaba, ${client.name} ile iletişime geçmek istiyorum.`);
  const whatsappUrl = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}` : '#';
  const telUrl = phone ? `tel:${phone}` : '#';
  const gmailUrl = email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Konu&body=Merhaba%2C` : '#';
  
  const totalPaid = client.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalAgreed = client.cases?.reduce((sum, c) => sum + parseFloat(c.estimated_value || 0), 0) || 0;
  const remaining = totalAgreed - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <Link to="/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Müvekkillere Dön
            </Link>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name}
              </h1>
              <Badge variant={client.status === 'active' ? 'success' : client.status === 'passive' ? 'warning' : 'default'}>
                {client.status === 'active' ? 'Aktif' : client.status === 'passive' ? 'Pasif' : 'Arşiv'}
              </Badge>
              {client.client_type && (
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {client.client_type === 'corporate' ? '🏢 Kurumsal' : '👤 Bireysel'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link to={`/clients/${client.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {phone && (
            <>
              <a href={telUrl} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
                <Phone className="w-4 h-4" />
                Ara
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </>
          )}
          {email && (
            <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors">
              <Mail className="w-4 h-4" />
              Mail Gönder
            </a>
          )}
          {!phone && !email && (
            <span className="text-sm text-gray-400">İletişim bilgisi yok</span>
          )}
        </div>
      </div>

      {/* Kartlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bilgi Kartı */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <Card.Header className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Müvekkil Bilgileri</h2>
            </div>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Ad Soyad / Unvan</p>
                <p className="font-medium text-gray-900 dark:text-white">{client.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">TCKNO / VKN</p>
                <p className="font-medium text-gray-900 dark:text-white">{client.identification_number || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Telefon</p>
              <p className="font-medium text-gray-900 dark:text-white">{client.phone || '-'}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">E-posta</p>
              <p className="font-medium text-gray-900 dark:text-white">{client.email || '-'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Şehir</p>
                <p className="font-medium text-gray-900 dark:text-white">{client.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">İlçe</p>
                <p className="font-medium text-gray-900 dark:text-white">{client.district || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Adres</p>
              <div className="flex items-start gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="font-medium text-gray-900 dark:text-white">{client.address || '-'}</p>
              </div>
            </div>

            {client.notes && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Notlar</p>
                <p className="font-medium text-gray-900 dark:text-white">{client.notes}</p>
              </div>
            )}

            {client.tags?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Etiketler</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Finans Kartı */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <Card.Header className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Finansal Durum</h2>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Anlaşılan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAgreed.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-gray-400">TL</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Tahsil Edilen</p>
                <p className="text-lg font-bold text-green-600">{totalPaid.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-gray-400">TL</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Kalan</p>
                <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remaining.toLocaleString('tr-TR')}
                </p>
                <p className="text-xs text-gray-400">TL</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* ✅ VEKALETNAMELER BÖLÜMÜ - Davalar'ın ÜSTÜNDE! */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        <Card.Header className="border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">📜 Vekaletnameler</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-gray-100 dark:bg-gray-700">
                {powerOfAttorneys.length || 0} Vekaletname
              </Badge>
              <Link to={`/power-of-attorney/create?client_id=${client.id}`}>
                <Button size="sm">+ Yeni Vekaletname</Button>
              </Link>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {poaLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-400">Yükleniyor...</p>
            </div>
          ) : powerOfAttorneys.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">Henüz vekaletname bulunmuyor</p>
              <Link to={`/power-of-attorney/create?client_id=${client.id}`}>
                <Button size="sm" variant="outline" className="mt-2">
                  + İlk Vekaletnameyi Ekle
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {powerOfAttorneys.map((poa) => (
                <Link
                  key={poa.id}
                  to={`/power-of-attorney/${poa.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {poa.title}
                        </p>
                        {poa.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {poa.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {poa.case && (
                        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          {poa.case.title}
                        </span>
                      )}
                      <Badge variant={getPOAStatusVariant(poa.status)}>
                        {getPOAStatusLabel(poa.status)}
                      </Badge>
                    </div>
                  </div>
                  {poa.start_date && (
                    <div className="mt-2 text-xs text-gray-400">
                      Başlangıç: {new Date(poa.start_date).toLocaleDateString('tr-TR')}
                      {poa.end_date && ` - Bitiş: ${new Date(poa.end_date).toLocaleDateString('tr-TR')}`}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Davalar - Detaylı (Vekaletname'den SONRA!) */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        <Card.Header className="border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white">📁 Davalar</h2>
            </div>
            <Badge variant="default" className="bg-gray-100 dark:bg-gray-700">
              {client.cases?.length || 0} Dava
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {client.cases?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Henüz dava bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {client.cases?.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/cases/${caseItem.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {caseItem.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {caseItem.case_number || 'Esas no yok'}
                      </span>
                    </div>
                    <Badge variant={getCaseStatusVariant(caseItem.status)}>
                      {getCaseStatusLabel(caseItem.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Mahkeme
                      </p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {caseItem.court_name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        Dava Türü
                      </p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {caseItem.case_type || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Açılış Tarihi
                      </p>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {caseItem.opening_date ? new Date(caseItem.opening_date).toLocaleDateString('tr-TR') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <UserCog className="w-3 h-3" />
                        Atanan Avukat
                      </p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {caseItem.assignee?.first_name} {caseItem.assignee?.last_name || 'Atanmadı'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ClientDetail;