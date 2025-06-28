import { FiBarChart2, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { formatToBRL_report } from "../services/amountFormat";


export interface ChartReportProps {
  list: {
    success: boolean;
    period: {
      first_day_of_period: string;
      last_day_of_period: string;
      days_in_period: number;
      today_day: number;
    };
    salary: {
      base: string;
      balance: number;
      daily_limit: number;
    };
    expenses: {
      fixed: number;
      relative: number;
      total: number;
    };
    carryover: {
      spent: number;
      balance: number;
      user_balance: number;
      total_available: number;
    };
    savings: {
      spent: number;
    };
  };
}


export function ChartReport(props: ChartReportProps) {
  const { list } = props;

  const Card = ({
    title,
    icon,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="my-4 bg-slate-800 text-white p-6 rounded-2xl shadow-lg w-80 space-y-4">
      <div className="flex items-center space-x-2 text-gray-300">
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );

  return (
    <section className="flex flex-wrap gap-4 justify-between items-start mx-2 w-full">
      <Card title="Resumo de Despesas" icon={<FiBarChart2 className="text-gray-400" />}>
        <li className="flex justify-between">
          <p>Despesas Fixas</p>
          <p>{formatToBRL_report(list.expenses.fixed)}</p>
        </li>
        <li className="flex justify-between">
          <p>Despesas Variáveis</p>
          <p>{formatToBRL_report(list.expenses.relative)}</p>
        </li>
        <hr className="border-gray-600" />
        <li className="flex justify-between font-semibold">
          <p>Total de Despesas</p>
          <p>{formatToBRL_report(list.expenses.total)}</p>
        </li>
      </Card>

      <Card title="Controle de Limites" icon={<FiCreditCard className="text-gray-400" />}>
        <li className="flex justify-between">
          <p>Limite Utilizado</p>
          <p>{formatToBRL_report(list.carryover.spent)}</p>
        </li>
        <li className="flex justify-between">
          <p>Limite Disponível</p>
          <p>{formatToBRL_report(list.carryover.total_available)}</p>
        </li>
        <li className="flex justify-between">
          <p>Limite Diário</p>
          <p>{formatToBRL_report(list.salary.daily_limit)}</p>
        </li>
      </Card>

      <Card title="Análise do Salário" icon={<FiDollarSign className="text-gray-400" />}>
        <li className="flex justify-between">
          <p>Salário Base</p>
          <p>{formatToBRL_report(parseFloat(list.salary.base))}</p>
        </li>
        <li className="flex justify-between">
          <p>Total de Despesas</p>
          <p>{formatToBRL_report(list.expenses.total)}</p>
        </li>
        <li className="flex justify-between font-semibold text-emerald-400">
          <p>Disponível para Lazer</p>
          <p>{formatToBRL_report(list.salary.balance)}</p>
        </li>
      </Card>
    </section>
  );
}
