import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import financeApi from '../../features/finance/finance.api.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Input from '../../components/ui/Input.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

const Finance = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // ============ QUERIES ============
  const { data: summary } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.getSummary(),
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => financeApi.getMonthlyRevenue(),
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', { page, search: debouncedSearch, status: statusFilter }],
    queryFn: () => financeApi.getAll({ page, search: debouncedSearch, status: statusFilter }),
  });

  // ============ DATA EXTRACTION ============
  const summaryData = summary?.data?.data || {};
  
  const revenueData = Array.isArray(monthlyRevenue?.data) 
    ? monthlyRevenue.data 
    : Array.isArray(monthlyRevenue?.data?.data) 
      ? monthlyRevenue.data.data 
      : [];
  
  const payments = paymentsData?.data?.data || [];
  const pagination = paymentsData?.data?.pagination;

  // ============ SUMMARY VALUES ============
  const totalReceived = summaryData.totalReceived || 0;
  const totalPending = summaryData.totalPending || 0;
  const totalRefunded = summaryData.totalRefunded || 0;
  const totalExpense = summaryData.totalExpense || 0;
  const totalAgreed = summaryData.totalAgreed || 0;
  const netRevenue = summaryData.netRevenue || 0;
  const averagePayment = summaryData.averagePayment || 0;

  // ============ HELPERS ============
  const statuses = [
    { value: '', label: 'Tümü' },
    { value: 'pending', label: 'Bekliyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
    { value: 'refund', label: 'İade' },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'refund': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00 TL';
    return `${Number(amount).toLocaleString('tr-TR')} TL`;
  };

  // ============ CHART COLORS ============
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a5f', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

  // ============ CUSTOM TOOLTIP ============
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 font-bold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // ============ RENDER ============
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          💰 Finans Yönetimi
        </h1>
        <Button onClick={() => navigate('/finance/create')}>
          + Ödeme Ekle
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Toplam Tahsilat</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceived)}
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Bekleyen Tahsilat</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Net Gelir</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(netRevenue)}
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Ortalama Ödeme</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(averagePayment)}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* İkinci Satır Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Toplam İade</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalRefunded)}
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Toplam Gider</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalExpense)}
            </p>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <p className="text-sm text-gray-500">Anlaşılan Ücret</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(totalAgreed)}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Monthly Revenue Chart - PROFESSIONAL */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              📊 Aylık Gelir Grafiği
            </h2>
            <span className="text-sm text-gray-500">
              Toplam: {formatCurrency(revenueData.reduce((acc, item) => acc + item.total, 0))}
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          {!revenueData || revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Henüz veri yok
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    name="Gelir"
                    radius={[4, 4, 0, 0]}
                  >
                    {revenueData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.total > 0 ? COLORS[index % COLORS.length] : '#e5e7eb'}
                      />
                    ))}
                    <LabelList 
                      dataKey="total" 
                      position="top"
                      formatter={(value) => value > 0 ? formatCurrency(value) : ''}
                      style={{ fontSize: '11px', fill: '#6b7280' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payments Table */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Ödeme ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon="🔍"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.HeadCell>Müvekkil</Table.HeadCell>
                  <Table.HeadCell>Dava</Table.HeadCell>
                  <Table.HeadCell>Tip</Table.HeadCell>
                  <Table.HeadCell>Tutar</Table.HeadCell>
                  <Table.HeadCell>Yöntem</Table.HeadCell>
                  <Table.HeadCell>Durum</Table.HeadCell>
                  <Table.HeadCell>Tarih</Table.HeadCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {isLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan="7" className="text-center py-8">
                      Yükleniyor...
                    </Table.Cell>
                  </Table.Row>
                ) : payments.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan="7" className="text-center py-8 text-gray-500">
                      Henüz ödeme bulunmuyor
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  payments.map((payment) => (
                    <Table.Row key={payment.id}>
                      <Table.Cell>
                        {payment.client?.first_name} {payment.client?.last_name}
                      </Table.Cell>
                      <Table.Cell>
                        {payment.case?.title || '-'}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          variant={
                            payment.payment_type === 'received' ? 'success' :
                            payment.payment_type === 'expense' ? 'danger' :
                            payment.payment_type === 'refund' ? 'warning' :
                            payment.payment_type === 'agreed' ? 'info' : 'default'
                          }
                        >
                          {payment.payment_type === 'received' ? '💰 Tahsilat' :
                           payment.payment_type === 'expense' ? '📤 Gider' :
                           payment.payment_type === 'refund' ? '↩️ İade' :
                           payment.payment_type === 'agreed' ? '📝 Anlaşılan' : 'Diğer'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </Table.Cell>
                      <Table.Cell>
                        {payment.payment_method === 'cash' ? 'Nakit' :
                         payment.payment_method === 'bank_transfer' ? 'Banka Transferi' :
                         payment.payment_method === 'credit_card' ? 'Kredi Kartı' :
                         payment.payment_method === 'check' ? 'Çek' : 'Diğer'}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getStatusVariant(payment.status)}>
                          {statuses.find(s => s.value === payment.status)?.label || payment.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam {pagination.total} ödeme
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Önceki
                </Button>
                <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Finance;