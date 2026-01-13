import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { FollowUp } from '../types';

interface FollowUpChartProps {
    followUps: FollowUp[];
}

export const FollowUpChart: React.FC<FollowUpChartProps> = ({ followUps }) => {
    // Process data for chart
    // We want to see Outcome distribution or Duration/Rating over time?
    // Let's show Outcome distribution (Pie/Bar) and Average Rating trend?
    // User asked for "a chart". simpler is better.
    // Let's show "Duration by Date" or "Rating by Date".
    // Or "Outcomes Count".

    // Let's do Outcome Counts (Bar Chart)
    const outcomeCounts = followUps.reduce((acc, curr) => {
        const outcome = curr.outcome || 'Sem Resultado';
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(outcomeCounts).map(([name, value]) => ({ name, value }));

    // Colors for outcomes
    const getColor = (outcome: string) => {
        switch (outcome) {
            case 'Positivo': return '#10B981'; // Green
            case 'Negativo': return '#EF4444'; // Red
            case 'Neutro': return '#6B7280'; // Gray
            case 'Reagendado': return '#F59E0B'; // Yellow
            default: return '#3B82F6'; // Blue
        }
    };

    if (data.length === 0) return null;

    return (
        <div className="h-64 w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm mb-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Distribuição de Resultados</h4>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
