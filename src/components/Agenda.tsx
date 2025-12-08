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
    onSave: (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => void;
    defaultDate: string;
    employees: Employee[];
    eventToEdit?: CalendarEvent | null;
    onDelete?: (id: number) => void;
}> = ({ isOpen, onClose, onSave, defaultDate, employees, eventToEdit, onDelete }) => {
    const initialEventState = {
        title: '',
        date: defaultDate,
        time: '',
        location: '',
        responsibleId: '' as any,
        notes: '',
        type: 'task' as CalendarEvent['type'],
        description: '',
        attendeeIds: [] as number[]
    };

    const [event, setEvent] = useState(initialEventState);

    React.useEffect(() => {
        if (eventToEdit) {
            setEvent({
                ...eventToEdit,
                responsibleId: eventToEdit.responsibleId || '',
                time: eventToEdit.time || '',
                location: eventToEdit.location || '',
                notes: eventToEdit.notes || ''
            });
        } else {
            setEvent({ ...initialEventState, date: defaultDate });
        }
    }, [eventToEdit, defaultDate, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const eventData = {
            ...event,
            responsibleId: event.responsibleId ? Number(event.responsibleId) : undefined
        };
        onSave(eventData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleAttendeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => Number(option.value));
        setEvent(prev => ({ ...prev, attendeeIds: selectedIds }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={eventToEdit ? "Editar Evento" : "Novo Evento na Agenda"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={event.title} onChange={handleChange} placeholder="Título do Evento" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" required />
                <div className="grid grid-cols-2 gap-4">
                    <input name="date" type="date" value={event.date} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" required />
                    <input name="time" type="time" value={event.time} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <input name="location" value={event.location} onChange={handleChange} placeholder="Local" className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />

                <div className="grid grid-cols-2 gap-4">
                    <select name="type" value={event.type} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <option value="task">Tarefa</option>
                        <option value="meeting">Reunião</option>
                        <option value="deadline">Prazo Final</option>
                    </select>
                    <select name="responsibleId" value={event.responsibleId} onChange={handleChange} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        <option value="">Selecione o Responsável</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participantes</label>
                    <select multiple name="attendeeIds" value={event.attendeeIds.map(String)} onChange={handleAttendeeChange} className="p-2 border rounded w-full h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>

                <textarea name="description" value={event.description} onChange={handleChange} placeholder="Descrição" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"></textarea>
                <textarea name="notes" value={event.notes} onChange={handleChange} placeholder="Notas adicionais" rows={2} className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"></textarea>

                <div className="flex justify-between mt-6">
                    {eventToEdit && onDelete ? (
                        <button type="button" onClick={() => { onDelete(eventToEdit.id); onClose(); }} className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700">Apagar</button>
                    ) : <div></div>}
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded text-white bg-brand-dark hover:bg-black">Salvar Evento</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};


interface AgendaProps {
    events: CalendarEvent[];
    onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    onUpdateEvent: (event: CalendarEvent) => void;
    onDeleteEvent: (eventId: number) => void;
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
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, etc.

    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarDays = [...blanks, ...days];

    const getDateString = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const getEventsForDay = (day: number): CalendarEvent[] => {
        const dateStr = getDateString(day);
        return events.filter(event => event.date && event.date.split('T')[0] === dateStr);
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

    const handleSaveEvent = (event: Omit<CalendarEvent, 'id'> | CalendarEvent) => {
        if ('id' in event) {
            onUpdateEvent(event);
        } else {
            onAddEvent(event);
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
                                                        {event.time && <span className="text-[10px] opacity-75">{event.time}</span>}
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