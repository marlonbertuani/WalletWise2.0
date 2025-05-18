import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import type { Conta } from '../types/conta';

dayjs.locale('pt-br');

interface CalendarDay {
    date: dayjs.Dayjs;
    contas: Conta[];
}

const Calendar: React.FC<{ contas: Conta[] }> = ({ contas }) => {
    const [dias, setDias] = useState<CalendarDay[]>([]);

    useEffect(() => {
        const hoje = dayjs().startOf('day'); // <- atualizado aqui
        const inicioMes = hoje.startOf('month');
        const fimMes = hoje.endOf('month');

        const diasDoMes: CalendarDay[] = [];
        for (let i = 0; i <= fimMes.diff(inicioMes, 'day'); i++) {
            const data = inicioMes.add(i, 'day');
            const contasNoDia = contas.filter(c =>
                dayjs(c.dataVencimento).isSame(data, 'day') // <- atualizado aqui
            );
            diasDoMes.push({ date: data, contas: contasNoDia });
        }

        setDias(diasDoMes);
    }, [contas]);

    const getColor = (day: CalendarDay) => {
        const hoje = dayjs().startOf('day'); // <- atualizado aqui

        if (day.contas.length === 0) return 'bg-white';

        const vencidas = day.contas.filter(c =>
            c.pago === 'pendente' && dayjs(c.dataVencimento).isBefore(hoje, 'day')
        );

        const proximas = day.contas.filter(c => {
            const diff = dayjs(c.dataVencimento).diff(hoje, 'day');
            return c.pago === 'pendente' && diff >= 0;
        });

        if (vencidas.length > 0) return 'bg-red-200';
        if (proximas.length > 0) return 'bg-yellow-200';

        return 'bg-white';
    };

    const primeiroDiaSemana = dias[0]?.date.day() || 0;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Calendário de Contas</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                    <div key={i} className="font-semibold text-gray-600">{d}</div>
                ))}

                {/* Dias vazios antes do primeiro dia do mês */}
                {Array(primeiroDiaSemana).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20"></div>
                ))}

                {dias.map((day, i) => (
                    <div
                        key={i}
                        className={`h-20 rounded-xl shadow ${getColor(day)} p-1 cursor-pointer flex flex-col items-center justify-start hover:shadow-md`}
                        onClick={() => {
                            if (day.contas.length > 0) {
                                const msg = day.contas.map(c =>
                                    `• ${c.descricao} - R$${c.valor.toFixed(2)} - ${c.pago}`
                                ).join('\n');
                                alert(`Contas para ${day.date.format('DD/MM/YYYY')}:\n\n${msg}`);
                            }
                        }}
                    >
                        <span className="font-bold text-sm">{day.date.date()}</span>
                        {day.contas.length > 0 && (
                            <span className="text-xs mt-1 text-gray-700">{day.contas.length} conta(s)</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
