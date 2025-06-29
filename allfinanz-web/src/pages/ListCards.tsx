import { useEffect, useState } from "react";
import { SideBar } from "../components/SideBar";
import { API } from "../services/api";
import { toast } from "react-toastify";
import { ButtonAdd } from "../components/ButtonAdd";
import { CardItem } from "../components/CardItem";
import { NewCard } from "../components/NewCard";
import Loading from "../components/Loading";

export function ListCards() {

    const [cards, setCards] = useState([]);
    const [date] = useState<{ year: number; month: number; day: number }>({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() });

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
        <section className='flex w-5/6 mx-auto mt-0'>
            <section className='w-1/4 mr-6'>
                <SideBar />
            </section>
            <section className='w-full pb-28 h-screen overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100'>
                {isLoading ? (
                    <Loading />
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    <ButtonAdd action={() => setShowNewCard(true)} text="Adicionar cartão" width="300px" />
                    {
                        cards.length > 0 ?
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
                                )
                        ) : (
                            <p className="mt-8 text-center w-full text-white">Nenhum cartão encontrado.</p>
                        )
                    }
                </div>
                )}

                {showNewCard && (
                    <NewCard reload={loadCards} closeComponent={() => setShowNewCard(false)} />
                )}
            </section>
        </section >
    )
}