import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, parseISO, isToday as fnsIsToday, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SegmentControl } from '@/components/common/SegmentControl';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailSheet } from '@/components/task/TaskDetailSheet';
import { useTasks } from '@/hooks/useTasks';
import { useZones } from '@/hooks/useZones';

type CalendarView = 'day' | 'week' | 'month' | 'agenda';

export function Calendar() {
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthOffset, setMonthOffset] = useState(0);

  const currentMonth = addMonths(selectedDate, monthOffset);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const startStr = calendarStart.toISOString();
  const endStr = calendarEnd.toISOString();
  const { data: tasks } = useTasks({ dueAfter: startStr, dueBefore: endStr, includeCompleted: true });
  const { data: zones } = useZones();
  const getZoneName = (zoneId: string) => zones?.find(z => z.id === zoneId)?.name;

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth.toISOString()]);

  const getTasksForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return tasks?.filter(t => t.dueDate && format(parseISO(t.dueDate), 'yyyy-MM-dd') === dayStr) || [];
  };

  const selectedDayTasks = getTasksForDay(selectedDate);
  const agendaTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter(t => t.dueDate && parseISO(t.dueDate) >= new Date())
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [tasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <SegmentControl
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'agenda', label: 'Agenda' },
        ]}
        value={view}
        onChange={v => setView(v as CalendarView)}
      />

      {/* Month Navigation */}
      {(view === 'month' || view === 'week') && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost btn-icon-sm" onClick={() => view === 'month' ? setMonthOffset(m => m - 1) : setSelectedDate(d => addDays(d, -7))}>
            <ChevronLeft size={20} />
          </button>
          <span className="heading-lg">
            {view === 'month' ? format(currentMonth, 'MMMM yyyy') : `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d')}`}
          </span>
          <button className="btn btn-ghost btn-icon-sm" onClick={() => view === 'month' ? setMonthOffset(m => m + 1) : setSelectedDate(d => addDays(d, 7))}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-1)' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'var(--weight-medium)' }}>{d}</div>
          ))}
          {monthDays.map(day => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDay = fnsIsToday(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                onClick={() => { setSelectedDate(day); setView('day'); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  minHeight: 44,
                  opacity: isCurrentMonth ? 1 : 0.3,
                  background: isSelected ? 'rgba(91, 141, 239, 0.15)' : isTodayDay ? 'rgba(91, 141, 239, 0.05)' : 'transparent',
                  border: isSelected ? '1px solid var(--accent-primary)' : isTodayDay ? '1px solid var(--border-default)' : '1px solid transparent',
                }}
              >
                <span className="body-xs" style={{ fontWeight: isTodayDay ? 'var(--weight-bold)' : 'var(--weight-medium)', color: isTodayDay ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} style={{ width: 4, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--accent-primary)' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-1)' }}>
          {weekDays.map(day => {
            const dayTasks = getTasksForDay(day);
            const isTodayDay = fnsIsToday(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(91, 141, 239, 0.15)' : isTodayDay ? 'rgba(91, 141, 239, 0.05)' : 'transparent',
                  border: isSelected ? '1px solid var(--accent-primary)' : isTodayDay ? '1px solid var(--border-default)' : '1px solid transparent',
                }}
              >
                <span className="body-xs text-tertiary">{format(day, 'EEE')}</span>
                <span className="body-sm" style={{ fontWeight: isTodayDay ? 'var(--weight-bold)' : 'var(--weight-medium)', color: isTodayDay ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{format(day, 'd')}</span>
                {dayTasks.length > 0 && <div style={{ display: 'flex', gap: 2 }}>{dayTasks.slice(0, 3).map(t => <div key={t.id} style={{ width: 4, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--accent-primary)' }} />)}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div>
          <div className="heading-md" style={{ marginBottom: 'var(--space-3)' }}>{format(selectedDate, 'EEEE, MMMM d')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map(task => <TaskCard key={task.id} task={task} showZone zoneName={getZoneName(task.zoneId)} />)
            ) : (
              <p className="body-sm text-secondary" style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>No tasks for this day</p>
            )}
          </div>
        </div>
      )}

      {/* Agenda View */}
      {view === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {agendaTasks.length > 0 ? (
            agendaTasks.map((task, i) => {
              const showDateHeader = i === 0 || task.dueDate !== agendaTasks[i - 1].dueDate;
              return (
                <div key={task.id}>
                  {showDateHeader && task.dueDate && (
                    <div className="body-xs text-tertiary" style={{ marginBottom: 'var(--space-2)', fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {format(parseISO(task.dueDate), 'EEEE, MMMM d')}
                    </div>
                  )}
                  <TaskCard task={task} showZone zoneName={getZoneName(task.zoneId)} />
                </div>
              );
            })
          ) : (
            <p className="body-sm text-secondary" style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>No upcoming tasks</p>
          )}
        </div>
      )}

      <TaskDetailSheet />
    </div>
  );
}
