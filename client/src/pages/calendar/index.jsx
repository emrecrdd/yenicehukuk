import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import eventApi from '../../features/events/event.api.js';
import meetingApi from '../../features/meetings/meeting.api.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// ======================================================
// UTC format fonksiyonu (zaman dilimi çevirme YOK)
// ======================================================

const formatDateUTC = (date) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return `${String(d.getUTCDate()).padStart(2, '0')}.${String(
      d.getUTCMonth() + 1
    ).padStart(2, '0')}.${d.getUTCFullYear()}`;
  } catch {
    return '-';
  }
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState('month');

  const year = currentDate.year();
  const month = currentDate.month() + 1;

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events', year, month],
    queryFn: () => eventApi.getCalendarEvents({ year, month }),
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ['calendar-meetings', year, month],
    queryFn: () => meetingApi.getAll({ page: 1, limit: 100 }),
  });

  const isLoading = eventsLoading || meetingsLoading;

  const events = eventsData?.data?.data || [];
  const meetings = meetingsData?.data?.data || [];

  const allEvents = [
    ...events,
    ...meetings.map(m => ({
      id: `meeting-${m.id}`,
      title: m.title,
      start: m.start_date,
      end: m.end_date || m.start_date,
      type: 'meeting',
      status: m.status,
      location: m.location,
      case_id: m.case_id,
      case_title: m.case?.title,
      client_id: m.client_id,
      client_name: m.client ? m.client.name : null,
      color: '#10b981',
    }))
  ];

  const getEventsForDay = (date) => {
    return allEvents.filter(event => dayjs(event.start).isSame(date, 'day'));
  };

  const getDaysInMonth = () => {
    const days = [];
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDay = startOfMonth.day();
    const daysInMonth = endOfMonth.date();

    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, events: [] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentDate.date(i);
      const dayEvents = getEventsForDay(date);
      days.push({ date, events: dayEvents });
    }

    return days;
  };

  const getEventBadgeVariant = (event) => {
    if (event.type === 'event') {
      return event.status === 'completed' ? 'success' : 
             event.status === 'cancelled' ? 'danger' : 'info';
    }
    if (event.type === 'meeting') {
      return event.status === 'completed' ? 'success' : 'warning';
    }
    return event.status === 'completed' ? 'success' : 'warning';
  };

  const getEventTypeLabel = (event) => {
    if (event.type === 'event') {
      const labels = {
        hearing: 'Duruşma',
        meeting: 'Toplantı',
        deadline: 'Son Tarih',
        reminder: 'Hatırlatıcı',
        other: 'Diğer',
      };
      return labels[event.event_type] || 'Etkinlik';
    }
    if (event.type === 'meeting') {
      return 'Toplantı';
    }
    return 'Görev';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(currentDate.add(direction, 'month'));
  };

  const isToday = (date) => {
    return date && date.isSame(dayjs(), 'day');
  };

  const days = getDaysInMonth();
  const todayEvents = allEvents.filter(event => dayjs(event.start).isSame(dayjs(), 'day'));

  const allDays = days.filter(d => d.date !== null);
  const emptyDays = allDays.filter(d => d.events.length === 0);
  const emptyCount = emptyDays.length;
  const totalDays = allDays.length;
  const busyCount = totalDays - emptyCount;
  const emptyRatio = totalDays > 0 ? Math.round((emptyCount / totalDays) * 100) : 0;

  const hearingCount = events.filter(e => e.event_type === 'hearing').length;
  const meetingCount = meetings.length;
  const taskCount = events.filter(e => e.type === 'task').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📅 Takvim
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>◀</Button>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.format('MMMM YYYY')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>▶</Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(dayjs())}>
            Bugün
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {['month', 'week', 'day'].map((viewOption) => (
          <Button
            key={viewOption}
            variant={view === viewOption ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView(viewOption)}
          >
            {viewOption === 'month' ? 'Ay' : viewOption === 'week' ? 'Hafta' : 'Gün'}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">⚖️ Duruşma</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{hearingCount}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">👤 Toplantı</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{meetingCount}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">📄 Görev</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{taskCount}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400">🟢 Boş Gün</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{emptyCount}</p>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="grid grid-cols-7 gap-1">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const isEmpty = day.date && day.events.length === 0;
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-1 border border-gray-200 dark:border-gray-700 rounded
                    ${!day.date ? 'bg-gray-50 dark:bg-gray-800' : ''}
                    ${isToday(day.date) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' : ''}
                    ${isEmpty ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10' : ''}
                  `}
                >
                  {day.date && (
                    <>
                      <div className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                        {day.date.format('D')}
                        {isEmpty && <span className="ml-1 text-green-500 text-xs">🟢</span>}
                      </div>
                      <div className="mt-1 space-y-1">
                        {day.events.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded truncate text-white"
                            style={{ backgroundColor: event.color || '#3b82f6' }}
                          >
                            <Badge variant={getEventBadgeVariant(event)}>
                              {getEventTypeLabel(event)}
                            </Badge>
                            {event.title}
                          </div>
                        ))}
                        {day.events.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{day.events.length - 3} daha
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            📋 Bugünün Etkinlikleri ({formatDateUTC(new Date())})
          </h2>
        </Card.Header>
        <Card.Body>
          {todayEvents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Bugün için planlanmış etkinlik yok </p>
              <p className="text-sm text-green-500 mt-1">Bugün boş günün! Değerlendir! </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getEventTypeLabel(event)} - {dayjs(event.start).format('HH:mm')}
                      {event.case_title && ` • ${event.case_title}`}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                  <Badge variant={getEventBadgeVariant(event)}>
                    {event.status || 'Planlandı'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Calendar;