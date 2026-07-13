// 📁 client/src/features/tasks/pages/TaskDetail.jsx
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTask, useAcceptTask, useRejectTask, useCompleteTask, useUpdateProgress, useReassignTask } from "../../features/tasks/task.query.js";
import { useAuth } from "../../hooks/useAuth.js";
import Badge from "../../components/ui/Badge.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Input from "../../components/ui/Input.jsx";
import { Edit2, CheckCircle, XCircle, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');

  const { data, isLoading, refetch } = useTask(id);
  const task = data?.data?.data;

  const acceptTask = useAcceptTask();
  const rejectTask = useRejectTask();
  const completeTask = useCompleteTask();
  const updateProgress = useUpdateProgress();
  const reassignTask = useReassignTask();

  const isAdmin = user?.role === 'admin';
  const isAssignee = task?.assigned_to === user?.id;
  const isAssigner = task?.assigned_by === user?.id;
  const isCreator = task?.created_by === user?.id;

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: '📄 Taslak', variant: 'default' },
      pending: { label: '⏳ Bekliyor', variant: 'warning' },
      accepted: { label: '✅ Kabul Edildi', variant: 'success' },
      rejected: { label: '❌ Reddedildi', variant: 'danger' },
      in_progress: { label: '⚡ Devam Ediyor', variant: 'info' },
      review: { label: '🔍 İncelemede', variant: 'info' },
      completed: { label: '🎉 Tamamlandı', variant: 'success' },
      cancelled: { label: '⛔ İptal', variant: 'danger' },
      archived: { label: '📦 Arşivlendi', variant: 'default' },
    };
    return map[status] || { label: status, variant: 'default' };
  };

  const statusBadge = getStatusBadge(task?.status);

  // Kabul
  const handleAccept = () => {
    if (window.confirm('Bu görevi kabul ediyor musunuz?')) {
      acceptTask.mutate(id);
    }
  };

  // Red
  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Lütfen reddetme sebebinizi belirtin');
      return;
    }
    rejectTask.mutate(
      { id, reason: rejectReason },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setRejectReason('');
        },
      }
    );
  };

  // Tamamla
  const handleComplete = () => {
    if (window.confirm('Görevi tamamladığınıza emin misiniz?')) {
      completeTask.mutate(id);
    }
  };

  // Yeniden Ata
  const handleReassign = () => {
    if (!newAssignee) {
      toast.error('Lütfen atanacak kişiyi seçin');
      return;
    }
    reassignTask.mutate(
      { id, assignedTo: newAssignee },
      {
        onSuccess: () => {
          setShowReassignModal(false);
          setNewAssignee('');
        },
      }
    );
  };

  // Progress
  const handleProgressChange = (e) => {
    const progress = parseInt(e.target.value);
    updateProgress.mutate({ id, progress });
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Görev bulunamadı</p>
        <Link to="/tasks" className="text-blue-600 hover:underline">
          ← Görevlere Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/tasks" className="text-blue-600 hover:underline">
            ← Görevler
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {task.title}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <Badge
              variant={
                task.priority === 'critical'
                  ? 'danger'
                  : task.priority === 'high'
                    ? 'warning'
                    : 'default'
              }
            >
              {task.priority === 'critical' ? '🔴' : task.priority === 'high' ? '🟡' : '🟢'}{' '}
              {task.priority}
            </Badge>
            {task.due_date &&
              new Date(task.due_date) < new Date() &&
              task.status !== 'completed' &&
              task.status !== 'cancelled' && (
                <Badge variant="danger">⚠️ Gecikti</Badge>
              )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Kabul / Red */}
          {isAssignee && task.status === 'pending' && (
            <>
              <Button onClick={handleAccept} variant="success" className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> Kabul Et
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="danger"
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" /> Reddet
              </Button>
            </>
          )}

          {/* Tamamla */}
          {(isAssignee || isAdmin) &&
            ['accepted', 'in_progress'].includes(task.status) && (
              <Button onClick={handleComplete} variant="success" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Tamamla
              </Button>
            )}

          {/* Yeniden Ata (Admin) */}
          {isAdmin && task.status === 'rejected' && (
            <Button
              onClick={() => setShowReassignModal(true)}
              variant="warning"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Yeniden Ata
            </Button>
          )}

          {/* Düzenle */}
          {(isAdmin || isCreator) && (
            <Link to={`/tasks/${task.id}/edit`}>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit2 className="w-4 h-4" /> Düzenle
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ============ İÇERİK ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Kart */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">📋 Bilgiler</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {task.description && (
              <div>
                <p className="text-sm text-gray-500">Açıklama</p>
                <p>{task.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Atanan Kişi</p>
              <p>{task.assignee?.first_name} {task.assignee?.last_name || 'Atanmadı'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Atayan Kişi</p>
              <p>{task.assigner?.first_name} {task.assigner?.last_name || 'Bilinmiyor'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Son Tarih</p>
              <p
                className={
                  task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.status !== 'completed'
                    ? 'text-red-600'
                    : ''
                }
              >
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString('tr-TR')
                  : 'Belirtilmemiş'}
                {task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.status !== 'completed' &&
                  ' ⚠️ Gecikti'}
              </p>
            </div>

            {/* Progress */}
            {(isAssignee || isAdmin) &&
              ['accepted', 'in_progress'].includes(task.status) && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">İlerleme</p>
                    <span className="text-sm font-medium">{task.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all"
                      style={{ width: `${task.progress || 0}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress || 0}
                    onChange={handleProgressChange}
                    className="w-full mt-2 accent-blue-600"
                    disabled={updateProgress.isPending}
                  />
                </div>
              )}

            {task.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200">
                <p className="text-sm text-red-600 font-medium">❌ Reddetme Sebebi</p>
                <p className="text-sm text-red-600">{task.rejection_reason}</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Sağ Kart */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">🔗 İlişkili</h2>
          </Card.Header>
          <Card.Body className="space-y-4">
            {task.case && (
              <div>
                <p className="text-sm text-gray-500">Dava</p>
                <Link to={`/cases/${task.case.id}`} className="text-blue-600 hover:underline">
                  {task.case.title}
                </Link>
              </div>
            )}

            {task.client && (
              <div>
                <p className="text-sm text-gray-500">Müvekkil</p>
                <Link to={`/clients/${task.client.id}`} className="text-blue-600 hover:underline">
                  {task.client.name}
                </Link>
              </div>
            )}

            {task.tags?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Etiketler</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* ============ MODALLAR ============ */}

      {/* Red Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <Modal.Header>
          <h2 className="text-xl font-bold text-red-600">❌ Görevi Reddet</h2>
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-600 mb-4">Bu görevi neden reddettiğinizi belirtin:</p>
          <textarea
            className="w-full border rounded-md px-3 py-2"
            rows="4"
            placeholder="Reddetme sebebi..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleReject}>
            Reddet
          </Button>
          <Button variant="outline" onClick={() => setShowRejectModal(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Yeniden Ata Modal */}
      <Modal isOpen={showReassignModal} onClose={() => setShowReassignModal(false)}>
        <Modal.Header>
          <h2 className="text-xl font-bold text-yellow-600">🔄 Görevi Yeniden Ata</h2>
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-600 mb-4">Görevi atamak istediğiniz kişinin ID'sini girin:</p>
          <Input
            placeholder="Kullanıcı ID"
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="warning" onClick={handleReassign}>
            Yeniden Ata
          </Button>
          <Button variant="outline" onClick={() => setShowReassignModal(false)}>
            İptal
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskDetail;