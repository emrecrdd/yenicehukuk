import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { templateApi } from '../../features/templates/template.api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import toast from 'react-hot-toast';

const TemplatesList = () => {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lawAreaFilter, setLawAreaFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', { page, search: searchQuery, category: categoryFilter, law_area: lawAreaFilter }],
    queryFn: () => templateApi.getAll({ page, search: searchQuery, category: categoryFilter, law_area: lawAreaFilter }),
    staleTime: 1000,
    keepPreviousData: true,
  });

  const templates = data?.data?.data || [];
  const pagination = data?.data?.pagination;

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

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
        <p className="text-red-600">Şablonlar yüklenirken hata oluştu</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Yeniden Dene</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Şablonlar</h1>
        <Link to="/templates/create">
          <Button>+ Yeni Şablon</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Şablon ara... (Enter ile ara)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                icon="🔍"
              />
              <Button variant="primary" onClick={handleSearch}>Ara</Button>
            </div>
            <div className="sm:w-40">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="dilekce">📝 Dilekçe</option>
                <option value="ihtar">⚡ İhtar</option>
                <option value="sozlesme">📄 Sözleşme</option>
              </select>
            </div>
            <div className="sm:w-40">
              <select
                value={lawAreaFilter}
                onChange={(e) => { setLawAreaFilter(e.target.value); setPage(1); }}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
              >
                <option value="">Tüm Alanlar</option>
                <option value="ozel_hukuk">🏛️ Özel Hukuk</option>
                <option value="ceza_hukuku">⚖️ Ceza Hukuku</option>
                <option value="idare_hukuku">🏢 İdare Hukuku</option>
                <option value="ofis_ici">📋 Ofis İçi</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Başlık</Table.HeadCell>
                <Table.HeadCell>Kategori</Table.HeadCell>
                <Table.HeadCell>Hukuk Alanı</Table.HeadCell>
                <Table.HeadCell>Versiyon</Table.HeadCell>
                <Table.HeadCell>İndirme</Table.HeadCell>
                <Table.HeadCell>İşlem</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {templates.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan="6" className="text-center py-8 text-gray-500">
                    {searchQuery ? 'Aramanıza uygun şablon bulunamadı' : 'Henüz şablon bulunmuyor'}
                  </Table.Cell>
                </Table.Row>
              ) : (
                templates.map((template) => (
                  <Table.Row key={template.id}>
                    <Table.Cell>
                      <div className="font-medium">{template.title}</div>
                      {template.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{template.description}</div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="default">{categoryLabels[template.category] || template.category}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="default">{lawAreaLabels[template.law_area] || template.law_area}</Badge>
                    </Table.Cell>
                    <Table.Cell>v{template.version}</Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{template.download_count || 0}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Link to={`/templates/${template.id}`} className="text-blue-600 hover:underline">Görüntüle</Link>
                        <button
                          onClick={async () => {
                            try {
                              const res = await templateApi.download(template.id);
                              window.open(res.data.data.downloadUrl, '_blank');
                              toast.success('İndirme başlatıldı');
                            } catch (err) {
                              toast.error('İndirilemedi');
                            }
                          }}
                          className="text-green-600 hover:underline"
                        >
                          ⬇️ İndir
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600">Toplam {pagination.total} şablon</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</Button>
              <span className="px-3 py-1 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>Sonraki</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesList;