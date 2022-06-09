import { Link } from "react-router-dom";

export function PageNotFound(){
    return(
        <div className="h-screen w-full flex flex-col justify-center items-center text-white">
            <div className="text-6xl m-4 flex">
                <h1 className="m-2">ERROR</h1><h1 className="m-2 font-bold animation-text">404</h1>
            </div>
            <h2 className="text-3xl m-4">La pagina que estas buscando no existe.</h2>
            <Link className="m-4" to="/">
                <button className="px-6 py-2 bg-sky-600 hover:bg-sky-500 rounded">Ir a Home</button>
            </Link>
        </div>
    )
}