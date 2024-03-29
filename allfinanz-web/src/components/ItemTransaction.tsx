import { useState, useEffect } from "react";
import { Trash, Pen } from "phosphor-react";
import { API } from "../services/api";
import { ModifyTransaction } from "./ModifyTransaction";

interface ItemTransactionProps {
  reload: () => void;
  _id: string;
  card: string;
  type: string;
  category: string;
  value: string;
  description: string;
}

export function ItemTransaction(props: ItemTransactionProps) {
  let [isModifyTransaction, setIsModifyTransaction] = useState(false);
  let [typeFormated, setTypeFormated] = useState('');

  useEffect(() => {
		formatedValue();
	})

  function removeTransaction() {
    API.delete(`/operation/romeve-transaction/${props._id}`).then(() => {
      props.reload();
    });
  }

  function formatedValue(){
    let valueType = props.type;
    valueType = valueType.trim();
    if(valueType.length > 11){
      valueType = props.type.substr(0, 12) + "."
    }
    if(valueType.includes('dinero')){
      valueType = valueType.replace(/\//g,"")
    }

    setTypeFormated(valueType);
  }

  return (
    <div className="lg:w-[90%] md:w-[100%] flex justify-between bg-brand-200 p-4 lg:mx-4 md:mx-1 my-4 rounded shadow-lg">
      <div className="lg:w-24 md:w-16">
        <div className="text-center">
          <span className="text-sky-200 lg:text-md md:text-sm">Tipo</span>
          <p className="mt-2 lg:text-md md:text-sm">
            {typeFormated}
          </p>
        </div>
      </div>

      <div className="lg:w-24 md:w-16">
        <div className="text-center hidden-item">
          <span className="text-sky-200 lg:text-md md:text-sm">Categoria</span>
          <p className="mt-2 lg:text-md md:text-sm">{props.category}</p>
        </div>
      </div>

      <div className="lg:w-24 md:w-16">
        <div className="text-center">
          <span className="text-sky-200 lg:text-md md:text-sm">Valor</span>
          <p className="mt-2 lg:text-md md:text-sm">{(parseFloat(props.value)).toFixed(2)}</p>
        </div>
      </div>

      <div className="lg:w-24 md:w-16">
        <div className="text-center">
          <span className="text-sky-200 lg:text-md md:text-sm">
            Descripción
          </span>
          <p className="mt-2 lg:text-md md:text-sm">
            {props.description.length > 11
              ? props.description.substr(0, 7) + "..."
              : props.description}
          </p>
        </div>
      </div>

      <div className="lg:w-24 md:w-16">
        <div className="text-center">
          <span className="text-sky-200 lg:text-md md:text-sm">Config</span>
          <div className="flex justify-center items-center lg:text-md md:text-sm">
            <Trash
              className="hover:text-red-500 mt-2"
              onClick={() => removeTransaction()}
              size={20}
            />
            <Pen
              className="hover:text-sky-500 mt-2"
              onClick={() => setIsModifyTransaction(true)}
              size={20}
            />
          </div>
        </div>

        {isModifyTransaction ? (
          <ModifyTransaction
            _id={props._id}
            category={props.category}
            value={props.value}
            description={props.description}
            card={props.card}
            closeComponent={() => setIsModifyTransaction(false)}
            reload={() => props.reload()}
          />
        ) : null}
      </div>
    </div>
  );
}
