import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

export function ButtonAddTransaction() {

    return (
        <Link
            to="/gasto"
            className="text-white fixed bottom-6 right-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/50 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg z-50"
        >
            <FiPlus className="w-5 h-5" />
            Nova Transação
        </Link>
    )
}