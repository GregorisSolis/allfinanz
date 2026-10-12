import { useEffect, useState } from "react";
import { API } from "../services/api";
import { toast } from "react-toastify";
import { CardItem } from "../components/CardItem";
import { NewCard } from "../components/NewCard";
import Loading from "../components/Loading";
import { Plus } from "phosphor-react";
import { formatToBRL } from "../services/amountFormat";

interface CardSummary {
    _id: string;
    name: string;
    color: string;
    colorFont: string;
    cardCloseDay: number;
    totalCost: number;
}

export function ListCards() {

    const [cards, setCards] = useState<CardSummary[]>([]);
    const [showNewCard, setShowNewCard] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadCards = async () =>{
        setIsLoading(true);
        await API.get('/card/all-card/user/with-total',  { withCredentials: true })
        .then(resp => {
            if (resp.data && resp.data.cards) {
                setCards(resp.data.cards);
            } else {
                setCards([]);
            }
        })
        .catch(err => toast.error("Erro ao carregar cartões..."))
        .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        loadCards();
    }, []);

    const totalCycleSpend = cards.reduce((total, card) => total + (Number(card.totalCost) || 0), 0);

    return (
        <section className='w-full pb-28 text-slate-100'>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-sky-300">Cartões</p>
                    <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Seus cartões</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Acompanhe os gastos do ciclo e o dia de fechamento de cada cartão.
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#06251e] shadow-[0_12px_30px_-18px_rgba(52,211,153,0.8)] transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070d18]"
                    onClick={() => setShowNewCard(true)}
                >
                    <Plus size={18} />
                    Adicionar cartão
                </button>
            </div>

            {isLoading ? (
                <Loading />
            ) : (
                <>
                    {cards.length > 0 && (
                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/[0.08] bg-[#0b1320]/80 p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Cartões cadastrados</p>
                                <p className="mt-2 text-2xl font-semibold text-white">{cards.length}</p>
                            </div>
                            <div className="rounded-2xl border border-sky-300/15 bg-gradient-to-br from-sky-400/[0.08] to-[#0b1320] p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Gastos no ciclo atual</p>
                                <p className="mt-2 text-2xl font-semibold text-sky-200">{formatToBRL(totalCycleSpend)}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.length > 0 ? (
                        cards.map((card) => (
                            <CardItem
                                key={card._id}
                                IDCard={card._id}
                                nameCard={card.name}
                                backgroundValue={card.color}
                                colorFont={card.colorFont}
                                cardCloseDay={card.cardCloseDay}
                                totalCost={card.totalCost}
                                reload={loadCards}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-[#0b1320]/70 p-8 text-center md:col-span-2 xl:col-span-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-300/[0.08] text-sky-300">
                                <Plus size={22} />
                            </div>
                            <p className="mt-4 text-base font-semibold text-white">Nenhum cartão cadastrado</p>
                            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">Adicione um cartão para acompanhar os gastos e a data de fechamento do ciclo.</p>
                            <button
                                type="button"
                                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.08] px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                onClick={() => setShowNewCard(true)}
                            >
                                <Plus size={18} />
                                Adicionar primeiro cartão
                            </button>
                        </div>
                    )}
                    </div>
                </>
            )}

            {showNewCard && (
                <NewCard reload={loadCards} closeComponent={() => setShowNewCard(false)} />
            )}
        </section >
    )
}
