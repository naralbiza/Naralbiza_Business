import React, { useState } from 'react';
import { CalendarEvent, Employee } from '../types';
import { Modal } from './common/Modal';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from './common/Icon';

const eventColors: { [key in CalendarEvent['type']]: string } = {
    meeting: 'bg-blue-500 text-white',
    deadline: 'bg-red-500 text-white',
    task: 'bg-yellow-400 text-black',
};

const EventModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => Promise<void>;
    defaultDate: string;
    employees: Employee[];
    eventToEdit?: CalendarEvent | null;
    onDelete?: (id: string) => void;
}> = ({ isOpen, onClose, onSave, defaultDate, employees, eventToEdit, onDelete }) => {
    // Helper to format Date to input value (YYYY-MM-DDTHH:mm)
    const formatForInput = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Correctly handle timezone offset to show local time in input
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        return localIso;
    };

    const initialEventState = {
        title: '',
        description: '',
        startDate: formatForInput(new Date(defaultDate).toISOString()),
        endDate: formatForInput(new Date(new Date(defaultDate).getTime() + 60 * 60 * 1000).toISOString()),
        location: '',
        responsibleId: '' as any,
        status: 'agendado' as CalendarEvent['status'],
        type: 'task' as CalendarEvent['type'],
        attendeeIds: [] as number[]
    };

    const [formState, setFormState] = useState(initialEventState);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    React.useEffect(() => {
        if (eventToEdit) {
            setFormState({
                title: eventToEdit.title,
                description: eventToEdit.description || '',
                startDate: formatForInput(eventToEdit.startDate),
                endDate: formatForInput(eventToEdit.endDate),
                location: eventToEdit.location || '',
                responsibleId: eventToEdit.responsibleId || '',
                status: eventToEdit.status,
                type: eventToEdit.type,
                attendeeIds: eventToEdit.attendeeIds || []
            });
        } else {
            // Reset to defaults with current defaultDate
            const start = new Date(defaultDate);
            start.setHours(9, 0, 0, 0); // Default 9 AM
            const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later
            setFormState({
                ...initialEventState,
                startDate: formatForInput(start.toISOString()),
                endDate: formatForInput(end.toISOString())
            });
        }
        setErrorMsg('');
    }, [eventToEdit, defaultDate, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSaving(true);

        const start = new Date(formState.startDate);
        const end = new Date(formState.endDate);

        if (start > end) {
            setErrorMsg('A data de fim deve ser posterior à data de início.');
            setIsSaving(false);
            return;
        }

        const eventData: any = {
            ...formState,
            responsibleId: formState.responsibleId ? Number(formState.responsibleId) : undefined,
            // Convert to ISO strings for API
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };

        if (eventToEdit) {
            eventData.id = eventToEdit.id;
        }

        try {
            await onSave(eventData);
            onClose();
        } catch (err) {
            console.error("Failed to save event", err);
            // Error is handled by DataContext notification mostly, but we show local error too
            setErrorMsg('Erro ao salvar evento. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleAttendeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value));
        setFormState(prev => ({ ...prev, attendeeIds: selectedIds }));
    };

    const addToGoogleCalendar = () => {
        const title = encodeURIComponent(formState.title);
        const details = encodeURIComponent(formState.description || '');
        const location = encodeURIComponent(formState.location || '');

        const startDate = new Date(formState.startDate);
        const endDate = new Date(formState.endDate);

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;

        window.open(googleCalendarUrl, '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={eventToEdit ? "Editar Evento" : "Novo Evento na Agenda"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{errorMsg}</div>}

                <div>
                    <label className="block text-xs mb-1 dark:text-gray-400">Título</label>
                    <input name="title" value={formState.title} onChange={handleChange} placeholder="Reunião com..." className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-400">Início</label>
                        <input name="startDate" type="datetime-local" value={formState.startDate} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" required />
                    </div>
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-400">Fim</label>
                        <input name="endDate" type="datetime-local" value={formState.endDate} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs mb-1 dark:text-gray-400">Local</label>
                    <input name="location" value={formState.location} onChange={handleChange} placeholder="Sala de Reuniões / Online" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-400">Tipo</label>
                        <select name="type" value={formState.type} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                            <option value="task">Tarefa</option>
                            <option value="meeting">Reunião</option>
                            <option value="deadline">Prazo Final</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs mb-1 dark:text-gray-400">Status</label>
                        <select name="status" value={formState.status} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                            <option value="agendado">Agendado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs mb-1 dark:text-gray-400">Responsável</label>
                    <select name="responsibleId" value={formState.responsibleId} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <option value="">Selecione o Responsável</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participantes</label>
                    <select multiple name="attendeeIds" value={formState.attendeeIds.map(String)} onChange={handleAttendeeChange} className="p-2 border rounded w-full h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs mb-1 dark:text-gray-400">Descrição</label>
                    <textarea name="description" value={formState.description} onChange={handleChange} placeholder="Detalhes do evento..." rows={3} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"></textarea>
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2">
                        {eventToEdit && onDelete ? (
                            <button type="button" onClick={() => { onDelete(eventToEdit.id); onClose(); }} className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700">Apagar</button>
                        ) : null}
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={addToGoogleCalendar} className="px-4 py-2 rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                            </svg>
                            Google Agenda
                        </button>
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black disabled:bg-gray-400">
                            {isSaving ? 'Salvando...' : 'Salvar Evento'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};


interface AgendaProps {
    events: CalendarEvent[];
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    onUpdateEvent: (event: CalendarEvent) => Promise<void>;
    onDeleteEvent: (eventId: string) => void;
    employees: Employee[];
}

/**
 * Agenda page component.
 * Displays a monthly calendar view with events.
 */
export const Agenda: React.FC<AgendaProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, employees }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarDays = [...blanks, ...days];

    const getDateString = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getEventsForDay = (day: number): CalendarEvent[] => {
        const dateStr = getDateString(day);
        // Correct filtering using startDate ISO string
        return events.filter(event => {
            const eventStart = new Date(event.startDate);
            // Compare YYYY-MM-DD
            const eventDateStr = eventStart.toISOString().split('T')[0];
            return eventDateStr === dateStr;
        });
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(getDateString(day));
        setEventToEdit(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setEventToEdit(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
        if ('id' in event) {
            await onUpdateEvent(event);
        } else {
            await onAddEvent(event);
        }
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <>
            <div className="p-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200/80 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-dark dark:text-gray-100">{monthNames[month]} {year}</h2>
                                <div className="flex gap-1 mt-2">
                                    {(['month', 'week', 'day'] as const).map(v => (
                                        <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-sm rounded-md ${view === v ? 'bg-brand-gold text-brand-dark' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {v.charAt(0).toUpperCase() + v.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <button onClick={() => { setEventToEdit(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-500 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            Novo Evento
                        </button>
                    </div>

                    <div className="grid grid-cols-7">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="text-center font-semibold text-brand-secondary dark:text-gray-400 py-4 border-b border-r dark:border-gray-700">
                                {day}
                            </div>
                        ))}
                        {calendarDays.map((day, index) => (
                            <div key={index} className={`h-40 border-b border-r dark:border-gray-700 p-2 ${day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                                onClick={() => day && handleDayClick(day)}
                            >
                                {day && (
                                    <>
                                        <div className="font-bold text-right dark:text-gray-200">{day}</div>
                                        <div className="space-y-1 mt-1 overflow-y-auto max-h-28">
                                            {getEventsForDay(day).map(event => (
                                                <div key={event.id}
                                                    onClick={(e) => handleEventClick(e, event)}
                                                    className={`text-xs p-1 rounded ${eventColors[event.type]} cursor-pointer hover:opacity-80 transition-opacity`}>
                                                    <div className="flex justify-between items-start">
                                                        <p className="truncate font-semibold">{event.title}</p>
                                                        <span className="text-[10px] opacity-75">
                                                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex mt-1">
                                                        {event.attendeeIds?.map(id => {
                                                            const attendee = employees.find(e => e.id === id);
                                                            return attendee ? <img key={id} src={attendee.avatarUrl} className="w-4 h-4 rounded-full -ml-1 border border-white" title={attendee.name} /> : null
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} defaultDate={selectedDate} employees={employees} eventToEdit={eventToEdit} onDelete={onDeleteEvent} />
        </>
    );
};