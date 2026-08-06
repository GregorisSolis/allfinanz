import { useEffect, useState } from "react";
import { API } from "../services/api";
import { toast } from "react-toastify";
import { CardItem } from "../components/CardItem";
import { NewCard } from "../components/NewCard";
import Loading from "../components/Loading";
import { Plus } from "phosphor-react";

export function ListCards() {

    const [cards, setCards] = useState([]);
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

    return (
        <section className='w-full pb-28 text-slate-100'>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">Cartões</p>
                    <h1 className="mt-1 text-2xl font-semibold text-white">Área de cartões</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Cadastre cartões, acompanhe fechamento e veja o uso do mês.
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
                    onClick={() => setShowNewCard(true)}
                >
                    <Plus size={18} />
                    Adicionar cartão
                </button>
            </div>

            {isLoading ? (
                <Loading />
            ) : (
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.length > 0 ? (
                        cards.map((card: any, idx: number) => (
                            <CardItem
                                key={card._id || idx}
                                IDCard={card._id}
                                nameCard={card.name}
                                backgroundValue={card.color}
                                colorFont={card.colorFont}
                                cardCloseDay={card.cardCloseDay}
                                totalCost={card.totalCost}
                                reload={loadCards}
                                date={{ year: 0, month: 0, day: 0 }}
                            />
                        ))
                    ) : (
                        <div className="rounded-lg border border-white/10 bg-[#0d1117] p-8 text-center text-slate-400 md:col-span-2 xl:col-span-3">
                            Nenhum cartão encontrado.
                        </div>
                    )}
                </div>
            )}

            {showNewCard && (
                <NewCard reload={loadCards} closeComponent={() => setShowNewCard(false)} />
            )}
        </section >
    )
}
