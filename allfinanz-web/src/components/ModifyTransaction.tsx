import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { SelectComponent } from "../components/SelectComponent";
import { categoryOptions } from "../services/categoryOptions";
import { API } from "../services/api";
import { MessageComponent } from "./MessageComponent";

interface ModifyTransactionProps {
  value: string;
  category: string;
  description: string;
  _id: string;
  card: string;
  reload: () => void;
  closeComponent: () => void;
}

export function ModifyTransaction(props: ModifyTransactionProps) {
  useEffect(() => {
    loadCards();
  }, []);

	const navigate = useNavigate();
  const ID_USER = localStorage.getItem("iden");
  let [value, setValue] = useState(props.value);
  let [category, setCategory] = useState(props.category);
  let [cards, setCards] = useState([]);
  let [card, setCard] = useState(props.card);
  let [description, setDescription] = useState(props.description);
  let [isMessage, setIsMessage] = useState(false);
  let [textMessage, setTextMessage] = useState("");
  let [typeMessage, setTypeMessage] = useState('')
  let [linkMessage, setLinkMessage] = useState('0')

  if (value.includes(",")) {
    setValue(value.replace(",", "."));
  }
  function setModifyTrasnsaction(event: FormEvent) {
    event.preventDefault();

    if (!value || !description) {
			setTextMessage('Los campos no pueden ser enviados vacios.')
			setTypeMessage('error');
      setIsMessage(true);
    } else if (value < "0" || isNaN(parseInt(value))) {
      setTextMessage("El valor es invalido.");
      setIsMessage(true);
    } else {
      API.patch(`/operation/edit-transaction/${props._id}`, {
        value,
        description,
        category,
        card,
      }).then(() => {
        props.reload();
        props.closeComponent();
      });
    }
  }

  //cargas las tarjetas
  async function loadCards() {
    await API.get(`/card/all-card/user/${ID_USER}`).then((resp) => {
      setCards(resp.data.card);
    });
  }

  function clearAlertMessage(){
		setLinkMessage('0');
		setIsMessage(false);
	}

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-moon-300 z-50">
					{isMessage ? 
						<MessageComponent 
							text={textMessage} 
							type={typeMessage} 
							link_title={linkMessage} 
							link={() => navigate('/dashboard')} 
							action={() => clearAlertMessage()} 
						/> 
					: null}
      <form
        onSubmit={setModifyTrasnsaction}
        className="lg:w-1/4 md:w-[90%] bg-moon-500 rounded py-4 px-8 flex flex-col shadow"
      >
        <h1 className="text-2xl mb-8 text-center text-white-600">
          Modificar Transacción
        </h1>
        <input
          className="transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor"
          value={value}
        />
        <input
          className="transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          value={description}
        />
        <SelectComponent
          list={categoryOptions}
          change={(e: any) => setCategory(e.target.value)}
          default={props.category}
        />

        <SelectComponent
          list={cards}
          change={(e: any) => setCard(e.target.value)}
          default={card}
        />

        <div className="flex justify-between">
          <button
            type="submit"
            className="transition my-6 bg-sky-600 w-28 py-2 hover:bg-sky-500 rounded m-auto"
          >
            Editar
          </button>
          <button
            className="transition my-6 bg-red-600 w-28 py-2 hover:bg-red-500 rounded m-auto"
            onClick={() => props.closeComponent()}
          >
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
}
