export type Conta = {
    id: number;
    descricao: string;
    tipo: string;
    valor: number;
    dataVencimento: string; // mantenha camelCase para consistência
    responsavel?: string;
    pago: 'pago' | 'pendente' | 'vencido';
};