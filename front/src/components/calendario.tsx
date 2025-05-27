import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import type { Conta } from '../types/conta';

dayjs.locale('pt-br');

interface CalendarDay {
    date: dayjs.Dayjs;
    contas: Conta[];
}

const Calendar: React.FC<{
    contas: Conta[];
    userId: number;
    onAtualizarDados: () => Promise<void>; // ou só () => void se a função não for assíncrona
}> = ({ contas, onAtualizarDados }) => {

    const [dias, setDias] = useState<CalendarDay[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [contasSelecionadas, setContasSelecionadas] = useState<Conta[]>([]);
    const [dataSelecionada, setDataSelecionada] = useState<dayjs.Dayjs | null>(null);

    useEffect(() => {
        const hoje = dayjs().startOf('day');
        const inicioMes = hoje.startOf('month');
        const fimMes = hoje.endOf('month');

        const diasDoMes: CalendarDay[] = [];
        for (let i = 0; i <= fimMes.diff(inicioMes, 'day'); i++) {
            const data = inicioMes.add(i, 'day');
            const contasNoDia = contas.filter(c =>
                dayjs(c.dataVencimento).isSame(data, 'day')
            );
            diasDoMes.push({ date: data, contas: contasNoDia });
        }

        setDias(diasDoMes);
    }, [contas]); // adiciona refreshTrigger

    const getColor = (day: CalendarDay) => {
        const hoje = dayjs().startOf('day');

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

    const assumirConta = async (conta: Conta) => {
        try {
            const response = await fetch("/api/contas/mudar-estado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: conta.id,
                    user_id: 1, // ID do usuário fixo
                    responsavel: "Marlon Bertuani", // Nome do responsável fixo
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert("Erro ao assumir conta: " + data.message);
                return;
            }

            alert("Conta assumida com sucesso!");
            onAtualizarDados();

            setContasSelecionadas((prev) =>
                prev.map((c) =>
                    c.id === conta.id ? { ...c, responsavel: "Marlon Bertuani" } : c
                )
            );
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao assumir a conta.");
        }
    };

    const marcarComoPaga = async (conta: Conta) => {
        if (!conta.responsavel) {
            alert("Esta conta ainda não tem um responsável definido.");
            return;
        }
        console.log(conta.responsavel);
        try {
            const response = await fetch("/api/contas/mudar-estado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: conta.id,
                    estado: "pago",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert("Erro ao atualizar: " + data.message);
                return;
            }

            alert("Conta marcada como paga!");
            onAtualizarDados();

            setContasSelecionadas((prev) =>
                prev.map((c) =>
                    c.id === conta.id ? { ...c, pago: "pago" } : c
                )
            );
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao marcar conta como paga.");
        }
    };

    const primeiroDiaSemana = dias[0]?.date.day() || 0;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Calendário de Contas</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                    <div key={i} className="font-semibold text-gray-600">{d}</div>
                ))}

                {Array(primeiroDiaSemana).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20"></div>
                ))}

                {dias.map((day, i) => (
                    <div
                        key={i}
                        className={`h-20 rounded-xl shadow ${getColor(day)} p-1 cursor-pointer flex flex-col items-center justify-start hover:shadow-md`}
                        onClick={() => {
                            if (day.contas.length > 0) {
                                setContasSelecionadas(day.contas);
                                setDataSelecionada(day.date);
                                setModalAberto(true);
                            }
                        }}
                    >
                        <span className="font-bold text-sm">{day.date.date()}</span>
                        {day.contas.length > 0 && (
                            <span className="text-xs mt-1 text-gray-700">{day.contas.length}</span>
                        )}
                    </div>
                ))}
            </div>

            {modalAberto && dataSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-lg font-bold mb-4">
                            Contas para {dataSelecionada.format('DD/MM/YYYY')}
                        </h2>

                        {contasSelecionadas.map((conta, idx) => (
                            <div key={idx} className="border-b py-2">
                                <p><strong>ID:</strong> {conta.id}</p>
                                <p><strong>Descrição:</strong> {conta.descricao}</p>
                                <p><strong>Responsável:</strong> {conta.responsavel ?? '---'}</p>
                                <p><strong>Valor:</strong> R$ {conta.valor.toFixed(2)}</p>
                                <p><strong>Status:</strong> {conta.pago}</p>
                                <p><strong>Código:</strong> {conta.campo_opcional ?? '---'}</p>

                                <div className="flex gap-2 mt-2">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                                        Copiar Código
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                                        onClick={() => assumirConta(conta)}
                                    >
                                        Assumir Conta
                                    </button>
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                        onClick={() => marcarComoPaga(conta)}
                                    >
                                        Conta Paga
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="mt-4 text-right">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={() => {
                                    setModalAberto(false);
                                }}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;