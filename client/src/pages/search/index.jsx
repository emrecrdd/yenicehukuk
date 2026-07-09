import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import searchApi from '../../features/search/search.api.js';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

const Search = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const debouncedQuery = useDebounce(query, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', { q: debouncedQuery, type }],
    queryFn: () => searchApi.searchAll(debouncedQuery, type),
    enabled: debouncedQuery.length >= 2,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions', debouncedQuery],
    queryFn: () => searchApi.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && debouncedQuery.length < 3,
  });

  const results = data?.data?.data || data?.data || data;
console.log('🔍 Final results:', results);  // ← BURASI! data.data.data
console.log('🔍 Tüm data:', data); // ← BUNU EKLE!
console.log('🔍 results:', results); // ← BUNU EKLE!
console.log('🔍 results.clients:', results?.clients); // ← BUNU EKLE!
  const suggestionData = suggestions?.data;

  // DEBUG: Konsola yazdır
  console.log('🔍 Arama sonuçları:', results);

 const hasResults = results && (
  (results.clients?.length || 0) > 0 ||
  (results.cases?.length || 0) > 0 ||
  (results.documents?.length || 0) > 0 ||
  (results.tasks?.length || 0) > 0
);

console.log('📊 hasResults:', hasResults); // ← KONSOLA YAZDIR!
console.log('📊 clients length:', results?.clients?.length); // ← KONSOLA YAZDIR!

  const getTypeBadge = (type) => {
    const badges = {
      client: { label: 'Müvekkil', variant: 'success' },
      case: { label: 'Dava', variant: 'info' },
      document: { label: 'Belge', variant: 'primary' },
      task: { label: 'Görev', variant: 'warning' },
      note: { label: 'Not', variant: 'default' },
    };
    return badges[type] || badges.note;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        🔍 Global Arama
      </h1>

      <Card>
        <div className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Müvekkil, dava, belge, görev ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon="🔍"
              />
            </div>
            <div className="w-40">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="clients">Müvekkiller</option>
                <option value="cases">Davalar</option>
                <option value="documents">Belgeler</option>
                <option value="tasks">Görevler</option>
                <option value="notes">Notlar</option>
              </select>
            </div>
          </div>

          {suggestionData && suggestionData.length > 0 && query.length < 3 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Öneriler:</p>
              <div className="flex flex-wrap gap-2">
                {suggestionData.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.url}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Badge variant={getTypeBadge(item.type).variant}>
                      {getTypeBadge(item.type).label}
                    </Badge>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {query.length >= 2 && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Arama sırasında hata oluştu: {error.message}
            </div>
          ) : results && !hasResults ? (
            <div className="text-center py-12 text-gray-500">
              Sonuç bulunamadı
            </div>
          ) : (
            results && (
              <div className="space-y-4">
                {/* Müvekkiller */}
                {results.clients && results.clients.length > 0 && (
                  <Card>
                    <Card.Header>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        👤 Müvekkiller ({results.clients.length})
                      </h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2">
                        {results.clients.map((client) => (
                          <Link
                            key={client.id}
                            to={`/clients/${client.id}`}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {client.first_name} {client.last_name}
                              </p>
                              {client.company_name && (
                                <p className="text-sm text-gray-500">{client.company_name}</p>
                              )}
                            </div>
                            <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                              {client.status === 'active' ? 'Aktif' : 'Pasif'}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Davalar */}
                {results.cases && results.cases.length > 0 && (
                  <Card>
                    <Card.Header>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        📁 Davalar ({results.cases.length})
                      </h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2">
                        {results.cases.map((caseItem) => (
                          <Link
                            key={caseItem.id}
                            to={`/cases/${caseItem.id}`}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {caseItem.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {caseItem.case_number || 'Esas no yok'} - {caseItem.court_name || 'Mahkeme yok'}
                              </p>
                            </div>
                            <Badge variant="info">
                              {caseItem.status}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Belgeler */}
                {results.documents && results.documents.length > 0 && (
                  <Card>
                    <Card.Header>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        📄 Belgeler ({results.documents.length})
                      </h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2">
                        {results.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {doc.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {doc.original_name} - {(doc.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_API_URL}/documents/${doc.id}/preview`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Görüntüle
                            </a>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Görevler */}
                {results.tasks && results.tasks.length > 0 && (
                  <Card>
                    <Card.Header>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        ✅ Görevler ({results.tasks.length})
                      </h2>
                    </Card.Header>
                    <Card.Body>
                      <div className="space-y-2">
                        {results.tasks.map((task) => (
                          <Link
                            key={task.id}
                            to={`/tasks/${task.id}`}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'}
                              </p>
                            </div>
                            <Badge
                              variant={
                                task.status === 'completed'
                                  ? 'success'
                                  : task.status === 'in_progress'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {task.status === 'pending'
                                ? 'Bekliyor'
                                : task.status === 'in_progress'
                                ? 'Devam Ediyor'
                                : task.status === 'completed'
                                ? 'Tamamlandı'
                                : 'İptal'}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Search;