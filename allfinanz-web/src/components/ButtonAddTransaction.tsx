import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

export function ButtonAddTransaction() {

    return (
        <Link
            to="/gasto"
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_-12px_rgba(14,165,233,0.65)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-sky-400"
        >
            <FiPlus className="w-5 h-5" />
            Nova Transação
        </Link>
    )
}
