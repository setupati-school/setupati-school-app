import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useSchoolStore } from '@/store/schoolStore';
import { DayTimetable, Period } from '../../types/type';

export const StudentTimetable: React.FC = () => {
  const { getMyTimetable } = useSchoolStore();
  const [timetable, setTimetable] = useState<DayTimetable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = getMyTimetable ? getMyTimetable() : [];
      setTimetable(Array.isArray(data) ? (data as DayTimetable[]) : []);
    } catch {
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }, [getMyTimetable]);

  const days = useMemo<DayTimetable[]>(
    () =>
      timetable.length > 0
        ? timetable
        : [
            { day: 'Monday', periods: [] },
            { day: 'Tuesday', periods: [] },
            { day: 'Wednesday', periods: [] },
            { day: 'Thursday', periods: [] },
            { day: 'Friday', periods: [] }
          ],
    [timetable]
  );

  // default 9-17 slots if none provided
  const times = useMemo(() => {
    const set = new Set<string>();
    for (const d of days) {
      for (const p of d.periods) {
        if (p.time) set.add(p.time);
      }
    }
    if (set.size === 0) {
      return [
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00'
      ];
    }
    const arr = Array.from(set);
    arr.sort((a, b) => {
      const startA = a.split('-')[0]?.trim() ?? a;
      const startB = b.split('-')[0]?.trim() ?? b;
      return startA.localeCompare(startB);
    });
    return arr;
  }, [days]);

  const findPeriod = (dayName: string, time: string): Period | undefined => {
    const d = days.find((x) => x.day === dayName);
    return d?.periods.find((p) => (p.time ?? '') === time);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Weekly Timetable</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Loading timetable...
            </p>
          ) : days.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No timetable available.
            </p>
          ) : (
            <>
              {/* Mobile-first: stacked day cards */}
              <div className="space-y-3 md:hidden">
                {days.map((day) => (
                  <div
                    key={day.day}
                    className="border rounded-md p-3 bg-background"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {day.day}
                        </div>
                        {day.date && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(day.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.periods.length} periods
                      </div>
                    </div>

                    <div className="divide-y">
                      {times.map((time) => {
                        const p = findPeriod(day.day, time);
                        return (
                          <div
                            key={`${day.day}-${time}`}
                            className="py-2 flex items-start justify-between"
                          >
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                {time}
                              </div>
                              {p ? (
                                <div className="text-sm font-medium text-foreground">
                                  {p.subject}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  —
                                </div>
                              )}
                              {p && (
                                <div className="text-xs text-muted-foreground">
                                  {p.teacher ?? 'Teacher TBA'}
                                  {p.room ? ` • ${p.room}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop/tablet: grid with days as rows and times as columns */}
              <div className="hidden md:block overflow-auto">
                <div
                  className="min-w-full border rounded-md"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `200px repeat(${times.length}, minmax(140px, 1fr))`
                  }}
                >
                  <div className="border-b border-r px-4 py-3 bg-muted text-sm font-medium text-foreground">
                    Day / Time
                  </div>
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border-b px-4 py-3 bg-muted text-sm font-semibold text-foreground"
                      role="columnheader"
                    >
                      {time}
                    </div>
                  ))}

                  {days.map((day) => (
                    <React.Fragment key={day.day}>
                      <div className="border-b border-r px-4 py-3 text-sm font-medium text-foreground">
                        <div>{day.day}</div>
                        {day.date && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(day.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {times.map((time) => {
                        const p = findPeriod(day.day, time);
                        return (
                          <div
                            key={`${day.day}-${time}`}
                            className="border-b px-4 py-3 align-top"
                            role="cell"
                          >
                            {p ? (
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground">
                                  {p.subject}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {p.teacher ?? 'Teacher TBA'}
                                  {p.room ? ` • ${p.room}` : ''}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                —
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTimetable;
