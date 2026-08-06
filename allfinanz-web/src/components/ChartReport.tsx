import { formatToBRL_report } from "../services/amountFormat";


export interface ChartReportProps {
  list: {
    success: boolean;
    period: {
      start: string;
      end: string;
      currentDay: number;
      totalDays: number;
    };
    money: {
      salary: number;
      fixedExpenses: number;
      variableExpenses: number;
      totalExpenses: number;
      available: number;
      dailyLimit: number;
      leisureSpent: number;
      leisureAvailable: number;
      savingsSpent: number;
    };
  };
}


export function ChartReport(props: ChartReportProps) {
  const { list } = props;
  const progress = Math.min(
    100,
    Math.max(0, Math.round((list.period.currentDay / list.period.totalDays) * 100))
  );
  const availableTone = list.money.available < 0 ? "danger" : "good";

  const Metric = ({
    label,
    value,
    tone = "default",
    size = "default",
    helper,
  }: {
    label: string;
    value: number;
    tone?: "default" | "good" | "warn" | "danger";
    size?: "default" | "large";
    helper?: string;
  }) => (
    <div className={[
      "rounded-lg border border-white/10 bg-white/[0.04] p-5 no-select",
      size === "large" ? "flex min-h-[240px] flex-col justify-center bg-[#0d1117] shadow-[0_20px_60px_-32px_rgba(0,0,0,0.8)]" : "",
    ].join(" ")}>
      <p className={[
        "font-medium uppercase text-slate-400",
        size === "large" ? "text-sm" : "text-xs",
      ].join(" ")}>
        {label}
      </p>
      <p className={[
        "mt-3 break-words font-semibold tracking-normal",
        size === "large" ? "text-4xl sm:text-5xl" : "text-2xl",
        tone === "good" ? "text-emerald-300" : "",
        tone === "warn" ? "text-amber-300" : "",
        tone === "danger" ? "text-rose-300" : "",
        tone === "default" ? "text-slate-50" : "",
      ].join(" ")}>
        {formatToBRL_report(value)}
      </p>
      {helper && <p className="mt-3 text-sm text-slate-400">{helper}</p>}
    </div>
  );

  return (
    <section className="w-full text-white">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Metric
            label="Disponível para gastar"
            value={list.money.available}
            size="large"
            tone={availableTone}
            helper={`Limite diário sugerido: ${formatToBRL_report(list.money.dailyLimit)}`}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Entrada mensal" value={list.money.salary} tone="good" />
            <Metric label="Despesas totais" value={list.money.totalExpenses} tone="warn" />
            <Metric label="Limite diário" value={list.money.dailyLimit} />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Avanço do período</p>
              <p className="mt-2 text-3xl font-semibold text-white">{progress}%</p>
            </div>
            <p className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
              {list.period.currentDay}/{list.period.totalDays} dias
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-emerald-300 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Metric label="Gastos fixos" value={list.money.fixedExpenses} tone="warn" />
            <Metric label="Gastos variáveis" value={list.money.variableExpenses} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric
          label="Lazer usado"
          value={list.money.leisureSpent}
          tone="warn"
        />
        <Metric
          label="Lazer disponível"
          value={list.money.leisureAvailable}
          tone={list.money.leisureAvailable < 0 ? "danger" : "good"}
        />
        <Metric
          label="Economias usadas"
          value={list.money.savingsSpent}
        />
      </div>
    </section>
  );
}
