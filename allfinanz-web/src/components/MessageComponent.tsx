interface MessageComponentProps{
    text: string,
    action: () => void
}

export function MessageComponent(props: MessageComponentProps){
    return(
        <div className="fixed inset-0 bg-brand-200 flex justify-center items-center sahdow-4xl text-white z-25">
            <div className="md:w-[90%] w-2/3 m-2 lg:w-1/4 h-1/4 p-2 bg-[#495057] shadow-xl rounded-lg flex flex-col">
                <p className="h-4/6 flex justify-center items-center text-center">{props.text}</p>
                <button onClick={() => props.action()} className="hover:bg-sky-500 p-2 bg-sky-600 p-2 rounded flex m-auto shadow-lg" >continuar</button>
            </div>
        </div>
    )
}