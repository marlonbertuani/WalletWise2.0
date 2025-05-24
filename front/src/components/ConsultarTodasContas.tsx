import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const TodasContas = () => {
    // Função para obter o primeiro dia do mês atual no formato YYYY-MM-DD
    const getPrimeiroDiaMes = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };

    // Função para obter o último dia do mês atual no formato YYYY-MM-DD
    const getUltimoDiaMes = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
        return `${year}-${month}-${lastDay}`;
    };

    const navigate = useNavigate();
    const [contas, setContas] = useState([]);
    const [dataInicio, setDataInicio] = useState(getPrimeiroDiaMes());
    const [dataFim, setDataFim] = useState(getUltimoDiaMes());
    const [carregando, setCarregando] = useState(false);

    const consultarContas = (periodo?: boolean) => {
        setCarregando(true);
        let url = "http://192.168.0.15:3000/api/consult-contas";

        if (periodo && dataInicio && dataFim) {
            url += `?inicio=${dataInicio}&fim=${dataFim}`;
        }
        // Adicione este console.log para ver a URL da requisição
        console.log('URL da requisição:', url);
        console.log('Parâmetros:', { dataInicio, dataFim, periodo });
        fetch(url)
            .then((res) => res.json())
            .then((data) => setContas(data))
            .catch((err) => console.error("Erro ao buscar contas:", err))
            .finally(() => setCarregando(false));
    };

    // Inicializa os estados com as datas do mês atual


    useEffect(() => {
        consultarContas();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-indigo-700 text-white shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">WalletWise</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-white text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
            </nav>

            {/* Conteúdo da página de contas */}
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Consultar Contas por Período</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Início
                            </label>
                            <input
                                id="dataInicio"
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                aria-label="Selecione a data de início"
                                title="Data de início do período"
                            />
                        </div>
                        <div>
                            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Fim
                            </label>
                            <input
                                id="dataFim"
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                aria-label="Selecione a data de fim"
                                title="Data de fim do período"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => consultarContas(true)}
                                disabled={!dataInicio || !dataFim || carregando}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {carregando ? "Consultando..." : "Consultar"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {dataInicio && dataFim
                                ? `Período de ${dataInicio} a ${dataFim}`
                                : "Todas as Contas"}
                        </h3>
                    </div>

                    {carregando ? (
                        <div className="p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Vencimento</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Responsável</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {contas.length > 0 ? (
                                        contas.map((conta: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-3 text-sm text-gray-800">{conta.descricao}</td>
                                                <td className="p-3 text-sm text-gray-800">
                                                    R$ {parseFloat(conta.valor).toFixed(2)}
                                                </td>
                                                <td className="p-3 text-sm text-gray-800">{conta.data_vencimento}</td>
                                                <td className="p-3 text-sm text-gray-800">{conta.responsavel || "-"}</td>
                                                <td className="p-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${conta.estado === "pago"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                        }`}>
                                                        {conta.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                                Nenhuma conta encontrada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodasContas;