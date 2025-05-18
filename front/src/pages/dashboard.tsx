import React, { useState, useEffect } from 'react';
import CalendarioMensal from "../components/calendario";
import type { Conta } from '../types/conta';
import dayjs from 'dayjs';

// Data de hoje no início do dia
const hoje = dayjs().startOf('day');
const inicioMes = hoje.startOf('month');
const fimMes = hoje.endOf('month');

export default function Dashboard() {
    const [contas, setContas] = useState<Conta[]>([]);
    const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
    const [modalListaOpen, setModalListaOpen] = useState(false);

    // Simular carregamento dados (substituir por fetch real depois)
    useEffect(() => {
        fetch('http://192.168.0.15:3000/api/contas') // Substitua pela URL real
            .then(res => res.json())
            .then((data) => {
                const contasFormatadas: Conta[] = data.map((item: any) => ({
                    id: item.account_id,
                    descricao: item.descricao,
                    tipo: item.tipo,
                    valor: parseFloat(item.valor),
                    dataVencimento: item.data_vencimento.split('T')[0], // ou new Date(item.data_vencimento)
                    responsavel: item.responsavel,
                    pago: item.estado,
                }));

                setContas(contasFormatadas);
            })
            .catch((err) => {
                console.error('Erro ao buscar contas:', err);
            });
    }, []);

    // Calcular totais
    const valorTotal = contas
        .filter(c => {
            const data = dayjs(c.dataVencimento);
            return c.pago === 'pendente' && data.isAfter(inicioMes) && data.isBefore(fimMes);
        })
        .reduce((acc, c) => acc + c.valor, 0);

    const valorTotalPagoMes = contas
        .filter(c => {
            const data = dayjs(c.dataVencimento);
            return c.pago === 'pago' && data.isAfter(inicioMes) && data.isBefore(fimMes);
        })
        .reduce((acc, c) => acc + c.valor, 0);

    const valorTotalSemResponsavel = contas
        .filter(c => !c.responsavel && !c.pago)
        .reduce((acc, c) => acc + c.valor, 0);

    // Filtra apenas contas com vencimento neste mês
    const contasDoMes = contas.filter(c => {
        const data = dayjs(c.dataVencimento);
        return data.isAfter(inicioMes.subtract(1, 'day')) && data.isBefore(fimMes.add(1, 'day'));
    });

    // Valores agrupados por responsável
    const valoresPorResponsavel = contasDoMes.reduce<Record<string, number>>((acc, c) => {
        if (c.responsavel) {
            acc[c.responsavel] = (acc[c.responsavel] || 0);
        }
        return acc;
    }, {});

    // Formato moeda
    const formatMoney = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar */}
            <nav className="bg-gray-800 text-white shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">WalletWise</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => setModalCadastroOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-semibold"
                        >
                            Cadastrar Conta
                        </button>
                        <button
                            onClick={() => setModalListaOpen(true)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-semibold"
                        >
                            Contas Cadastradas
                        </button>
                    </div>
                </div>
            </nav>
            <CalendarioMensal contas={contas} />
            {/* Dashboard */}
            <main className="container mx-auto p-6 flex-grow">
                <section className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Resumo de Contas</h2>

                    <p className="text-lg mb-3">
                        <strong>Valor total de contas a vencer:</strong>{' '}
                        <span className="text-red-600 font-bold">{formatMoney(valorTotal)}</span>
                    </p>

                    <p className="text-lg mb-3">
                        <strong>Valor total de contas sem responsável:</strong>{' '}
                        <span className="text-red-600 font-bold">{formatMoney(valorTotalSemResponsavel)}</span>
                    </p>

                    <hr className="my-6" />

                    <h3 className="text-xl font-semibold mb-4 text-center">Valores por responsável</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {Object.entries(valoresPorResponsavel).length === 0 && (
                            <p className="col-span-full text-center text-gray-500">Nenhum responsável definido</p>
                        )}
                        {Object.entries(valoresPorResponsavel).map(([responsavel, valor]) => (
                            <div
                                key={responsavel}
                                className="bg-gray-100 rounded p-4 text-center shadow"
                            >
                                <p className="font-semibold">{responsavel}</p>
                                <p className="text-red-600 font-bold">{formatMoney(valor)}</p>
                            </div>
                        ))}
                    </div>

                    <hr className="my-6" />

                    <p className="text-lg">
                        <strong>Total pago este mês:</strong>{' '}
                        <span className="text-green-600 font-bold">{formatMoney(valorTotalPagoMes)}</span>
                    </p>
                </section>
            </main>

            {/* Modal Cadastro */}
            {modalCadastroOpen && (
                <Modal title="Cadastrar Conta" onClose={() => setModalCadastroOpen(false)}>
                    <CadastroForm
                        onClose={() => setModalCadastroOpen(false)}
                        onAddConta={(novaConta) => {
                            setContas((old) => [...old, novaConta]);
                            setModalCadastroOpen(false);
                        }}
                    />
                </Modal>
            )}

            {/* Modal Listagem */}
            {modalListaOpen && (
                <Modal title="Contas Cadastradas" onClose={() => setModalListaOpen(false)}>
                    <ul className="divide-y divide-gray-300 max-h-80 overflow-y-auto">
                        {contas.length === 0 && (
                            <li className="p-4 text-gray-500">Nenhuma conta cadastrada.</li>
                        )}
                        {contas.map((conta) => (
                            <li key={conta.id} className="p-3 flex justify-between">
                                <span className="font-semibold">{conta.descricao}</span>
                                <span className="text-gray-600">{new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</span>
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </div>
    );
}

// Componente Modal genérico
type ModalProps = {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
};
function Modal({ title, children, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                <header className="flex justify-between items-center border-b p-4">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900 font-bold text-2xl leading-none"
                        aria-label="Fechar modal"
                    >
                        &times;
                    </button>
                </header>
                <section className="p-6">{children}</section>
            </div>
        </div>
    );
}

// Componente formulário cadastro (simplificado)
type CadastroFormProps = {
    onAddConta: (conta: Conta) => void;
    onClose: () => void;
};

function CadastroForm({ onAddConta, onClose }: CadastroFormProps) {
    const [descricao, setDescricao] = useState('');
    const [tipo, setTipo] = useState('agua');
    const [valor, setValor] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [responsavel, setResponsavel] = useState('');
    const [pago, setEstado] = useState<'pago' | 'pendente' | 'vencido'>('pendente');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const valorNum = parseFloat(valor.replace(',', '.'));
        if (isNaN(valorNum)) {
            alert('Informe um valor válido');
            return;
        }

        if (!descricao || !dataVencimento) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        const novaConta: Conta = {
            id: Date.now(),
            descricao,
            tipo,
            valor: valorNum,
            dataVencimento,
            responsavel: responsavel || undefined,
            pago,
        };

        onAddConta(novaConta);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block font-medium mb-1" htmlFor="tipo">
                    Tipo da Conta
                </label>
                <select
                    id="tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="agua">Água</option>
                    <option value="luz">Luz</option>
                    <option value="telefone">Telefone</option>
                    <option value="celular">Celular</option>
                    <option value="tv">Televisão</option>
                    <option value="cartao">Cartão de Crédito</option>
                    <option value="faculdade">Faculdade</option>
                    <option value="curso">Curso</option>
                    <option value="saude">Saúde</option>
                    <option value="pet">Pet</option>
                    <option value="carro">Carro</option>
                    <option value="internet">Internet</option>
                    <option value="outros">Outros</option>
                </select>
            </div>

            <div>
                <label className="block font-medium mb-1" htmlFor="descricao">
                    Descrição/Empresa
                </label>
                <input
                    type="text"
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block font-medium mb-1" htmlFor="valor">
                    Valor
                </label>
                <input
                    type="text"
                    id="valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 60, 65.5"
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block font-medium mb-1" htmlFor="dataVencimento">
                    Data de Vencimento
                </label>
                <input
                    type="date"
                    id="dataVencimento"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block font-medium mb-1" htmlFor="responsavel">
                    Responsável (opcional)
                </label>
                <input
                    type="text"
                    id="responsavel"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block font-medium mb-1" htmlFor="estado">
                    Estado da Conta
                </label>
                <select
                    id="estado"
                    value={pago}
                    onChange={(e) => setEstado(e.target.value as 'pago' | 'pendente' | 'vencido')}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded text-white"
                >
                    Fechar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                >
                    Salvar
                </button>
            </div>
        </form>
    );
}