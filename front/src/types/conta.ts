export type Conta = {
    id: number;
    descricao: string;
    tipo: string;
    valor: number;
    data_vencimento: string; // mantenha camelCase para consistência
    responsavel?: string;
    pago: 'pago' | 'pendente' | 'vencido';
    campo_opcional: number;
    dataVencimento: string;
    userId: number
};