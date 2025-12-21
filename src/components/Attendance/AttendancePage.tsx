import React, { useState, useEffect, useCallback } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import api from '@/lib/axiosConfig';
import CreateAttendanceForm from './CreateAttendanceForm';
import AttendanceList from './AttendanceList';
import AttendanceSummary from './AttendanceSummary';
import { useAuthStore } from '@/store/authStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import type { Attendance, Grade, Section, Student } from '@/types';
import { firebaseErrorParser } from '../../lib/firebaseErrorParser';
import { useToast } from '@/hooks/use-toast';


type AttendanceApiRow = {
    id: string;
    attendance?: Attendance;
} & Attendance;

type SectionApiRow = {
    id: string;
    section?: Section;
} & Section;

type GradeApiRow = {
    id: string;
    grade?: Grade;
} & Grade;

type StudentApiRow = {
    id: string;
    student?: Student;
} & Student;

export default function AttendancePage() {
    const [editingGroup, setEditingGroup] = useState<any | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const { toast } = useToast();


    const { setAttendance } = useSchoolStore();

    const fetchAttendance = useCallback(async () => {
        try {
            const response = await api.get('/attendance/all');
            const raw = Array.isArray(response.data)
                ? (response.data as AttendanceApiRow[])
                : ((response.data?.attendance || []) as AttendanceApiRow[]);

            const data: Attendance[] & { attendanceId?: string }[] = raw.map((item) => ({
                id: item.id,
                ...(item.attendance || item)
            })) as any;

            setAttendance(data);
        } catch (error: any) {
            setAttendance([])
            const { message } = firebaseErrorParser(error);
            toast({
                title: 'Error',
                description: message,
            });
        }
    }, [setAttendance]);

    const fetchSections = useCallback(async () => {
        try {
            const response = await api.get('/sections/all');
            const data = (response.data?.sections || response.data || []) as SectionApiRow[];
            const sectionsData = Array.isArray(data)
                ? data.map((item) => ({ id: item.id, ...(item.section || item) } as Section))
                : [];
            useSchoolStore.getState().setSections(sectionsData);
        } catch (error: any) {
            const { message } = firebaseErrorParser(error);
            toast({
                title: 'Error',
                description: message,
            });
        }
    }, []);

    const fetchGrades = useCallback(async () => {
        try {
            const response = await api.get('/grades/all');
            const data = (response.data?.grades || response.data || []) as GradeApiRow[];
            const gradesData = Array.isArray(data)
                ? data.map((item) => ({ id: item.id, ...(item.grade || item) } as Grade))
                : [];
            useSchoolStore.getState().setGrades(gradesData);
        } catch (error: any) {
            const { message } = firebaseErrorParser(error);
            toast({
                title: 'Error',
                description: message,
            });
        }
    }, []);

    const fetchStudents = useCallback(async () => {
        try {
            const response = await api.get('/students/all');
            const data = (response.data?.students || response.data || []) as StudentApiRow[];
            const studentsData = Array.isArray(data)
                ? data.map((item) => ({ id: item.id, ...(item.student || item) } as Student))
                : [];
            useSchoolStore.getState().setStudents(studentsData);
        } catch (error: any) {
            const { message } = firebaseErrorParser(error);
            toast({
                title: 'Error',
                description: message,
            });
        }
    }, []);

    useEffect(() => {
        (async () => {
            await Promise.all([fetchSections(), fetchGrades(), fetchStudents()]);
            fetchAttendance();
        })();
    }, [fetchSections, fetchGrades, fetchStudents, fetchAttendance]);

    const handleEdit = (group: any) => {
        const sectionId = group?.section_id ?? group?.sectionId;
        const date = group?.date as string | undefined;

        // Build records for this section + date from local store
        const state = useSchoolStore.getState();
        const allAttendance = (state.attendance ?? []) as Attendance[] & { attendanceId?: string }[];

        const records =
            sectionId && date
                ? allAttendance.filter((r) => r.section_id === sectionId && r.date === date)
                : (group.records as Attendance[] & { attendanceId?: string }[]) ?? [];

        const loadGroup = {
            attendanceId: group?.attendanceId ?? `${sectionId ?? ''}_${date ?? ''}`,
            section_id: sectionId,
            sectionId,
            date: date ?? (records[0]?.date ?? ''),
            records
        };

        setEditingGroup(loadGroup);
        setEditModalOpen(true);
    };

    const canManageAttendance = useAuthStore
        .getState()
        .hasRole(['admin', 'teacher']);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attendance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    {canManageAttendance ? (
                        <CreateAttendanceForm onSaved={fetchAttendance} />
                    ) : (
                        <div className="p-4 bg-white rounded-md shadow-sm text-sm text-gray-500">
                            You do not have permission to create or edit attendance.
                        </div>
                    )}
                    <AttendanceList
                        onEdit={handleEdit}
                        onDelete={fetchAttendance}
                        onMountFetch={fetchAttendance}
                    />
                </div>
                <div className="space-y-4">
                    <AttendanceSummary />
                </div>
            </div>
            {/* Edit modal */}
            <Dialog
                open={editModalOpen}
                onOpenChange={(open) => {
                    if (!open) setEditingGroup(null);
                    setEditModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <CreateAttendanceForm
                            loadGroup={editingGroup ?? undefined}
                            onSaved={() => {
                                setEditModalOpen(false);
                                setEditingGroup(null);
                                fetchAttendance();
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
