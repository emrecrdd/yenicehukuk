import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userApi from '../../features/users/user.api.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const UserList = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Kullanıcıları getir
  const { data, isLoading } = useQuery({
    queryKey: ['users', { ...filters, page }],
    queryFn: () => userApi.getAll({ ...filters, page, limit: 20 }),
  });

  const users = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // ✅ Kullanıcı güncelle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Kullanıcı güncellendi');
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    },
  });

  // ✅ Kullanıcı sil
  const deleteMutation = useMutation({
    mutationFn: (id) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Kullanıcı silindi');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Silme başarısız');
    },
  });

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Yönetici',
      lawyer: 'Avukat',
      intern: 'Stajyer',
      secretary: 'Sekreter',
    };
    return roles[role] || role;
  };

  const getRoleVariant = (role) => {
    const variants = {
      admin: 'danger',
      lawyer: 'success',
      intern: 'warning',
      secretary: 'info',
    };
    return variants[role] || 'default';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR') + ' ' + new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`"${name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'true',
    };
    updateMutation.mutate({ id: editingUser.id, data });
  };

  if (isLoading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👥 Kullanıcılar
          </h1>
          <p className="text-sm text-gray-500">
            Sistemdeki tüm kullanıcıların listesi
          </p>
        </div>
      </div>

      {/* Filtreler */}
      <Card>
        <div className="p-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Ara..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700 flex-1 min-w-[200px]"
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-2 border rounded-md dark:bg-gray-700"
          >
            <option value="">Tüm Roller</option>
            <option value="admin">Yönetici</option>
            <option value="lawyer">Avukat</option>
            <option value="intern">Stajyer</option>
            <option value="secretary">Sekreter</option>
          </select>
          <Button size="sm">Filtrele</Button>
        </div>
      </Card>

      {/* Liste */}
      <Card>
        <Card.Body>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Kullanıcı bulunamadı</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Ad Soyad</th>
                    <th className="px-4 py-2 text-left">E-posta</th>
                    <th className="px-4 py-2 text-left">Rol</th>
                    <th className="px-4 py-2 text-left">Durum</th>
                    <th className="px-4 py-2 text-left">Son Giriş</th>
                    <th className="px-4 py-2 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 font-medium">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <Badge variant={getRoleVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Önceki
              </Button>
              <span className="px-3 py-1 text-sm">
                {page} / {pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal: Kullanıcı Düzenle */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">✏️ Kullanıcı Düzenle</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ad"
                name="first_name"
                defaultValue={editingUser?.first_name}
                required
              />
              <Input
                label="Soyad"
                name="last_name"
                defaultValue={editingUser?.last_name}
                required
              />
            </div>
            <Input
              label="E-posta"
              name="email"
              type="email"
              defaultValue={editingUser?.email}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                name="role"
                defaultValue={editingUser?.role}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="admin">Yönetici</option>
                <option value="lawyer">Avukat</option>
                <option value="intern">Stajyer</option>
                <option value="secretary">Sekreter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Durum</label>
              <select
                name="is_active"
                defaultValue={editingUser?.is_active ? 'true' : 'false'}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={updateMutation.isPending}>
                💾 Güncelle
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;