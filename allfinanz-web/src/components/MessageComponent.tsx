interface MessageComponentProps{
    text: string,
    type: string,
    link_title: string,
    link: () => void,
    action: () => void
}

export function MessageComponent(props: MessageComponentProps){
    
    let color_btn = 'white';
    let color_btn_hover = 'white';
    let color_border = 'white';

    if(props.type === 'success'){
        color_border = 'shadow-emerald-500/30';
        color_btn = ' bg-emerald-600 ';
        color_btn_hover = 'bg-emerald-500';
    }else if(props.type === 'warning'){
        color_border = 'shadow-orange-500/30';
        color_btn = ' bg-orange-600 ';
        color_btn_hover = 'bg-orange-500';
    }else if(props.type === 'error'){
        color_border = 'shadow-red-500/30';
        color_btn = ' bg-red-600 ';
        color_btn_hover = 'bg-red-500';
    }else if(props.type === 'info'){
        color_border = 'shadow-cyan-500/30';
        color_btn = ' bg-cyan-600 ';
        color_btn_hover = 'bg-cyan-500';
    }


    return(
        <div className="fixed inset-0 bg-brand-200 flex justify-center items-center sahdow-4xl text-white z-25">
            <div className={"md:w-[90%] w-11/12 m-2 lg:w-1/4 h-40 p-2 bg-brand-800 shadow-xl rounded-lg flex flex-col " + color_border }>
                <p className="h-4/6 flex justify-center items-center text-center">{props.text}</p>
                <div className="flex">
                <button onClick={() => props.action()} className={"hover:" + color_btn_hover + color_btn + " p-2 rounded flex m-auto shadow-lg"} >continuar</button>
                {props.link_title === '0' ?
                    null : 
                    <button 
                        onClick={() => props.link()} 
                        className="hover:bg-gray-500 p-2 bg-gray-600 p-2 rounded flex m-auto shadow-lg">
                            {props.link_title}
                    </button>}
                </div>
            </div>
        </div>
    )
}