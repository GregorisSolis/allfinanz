import { Link } from 'react-router-dom'
import imgHome from '../assets/home.png'

export function IsNotUser() {
    return (
        <div className="w-full fixed overflow-hidden">
            <div className='text-white absolute w-full h-full flex flex-col justify-center items-center z-20 transition animation-home'>
                <h1 className='lg:text-8xl md:text-6xl text-6xl text-center'>Bienvenido a Allfinanz</h1>
                <p className='m-8 text-2xl text-center'>La manera más fácil de controlar tus finanzas personales.</p>
                <Link to='/registrate' className='m-1 bg-sky-700 py-2 px-4 rounded text-xl sahdow-lg hover:bg-sky-500 transition'>Comenzar</Link>
            </div>
            <div className='h-screen w-full'>
                <div className='w-full h-full absolute bg-brand-800 opacity-80'></div>
                <img className='object-cover w-full h-full' src={imgHome} alt="foto de perfil" />
            </div>
        </div>
    )
}