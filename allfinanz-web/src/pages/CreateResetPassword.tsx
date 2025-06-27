import { FormEvent, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Navbar } from "../components/Navbar"
import { API } from "../services/api"
import { login } from "../services/auth"

export function CreateResetPassword() {

    document.title = 'Allfinanz - Recuperar cuenta'
    let [isMessage, setIsMessage] = useState(false)
    let [textMessage, setTextMessage] = useState('')
    let [password, setPassword] = useState('')
    let [confirmPassword, setConfirmPassword] = useState('')
    let { token, email } = useParams()
    let navigate = useNavigate()

    function setResetPassword(event: FormEvent) {
        event.preventDefault()

        if (!password) {
            setIsMessage(true)
            setTextMessage('Los campos no pueden ser enviados en blanco.')
        } else if (password !== confirmPassword) {
            setTextMessage('Las contraseñas no coinciden.')
            setIsMessage(true)
        } else if (password.length <= 7) {
            setTextMessage('La contraseña es muy debil. intenta agregar - !@#$%* - y mas de 7 caracteres.')
            setIsMessage(true)
        } else {
            API.post('/user/reset_password', { token, password, email: email + '.com' })
                .then(() => {
                    navigate('/perfil')
                })
                .catch(() => {
                    setTextMessage('No se pudo agregar la nueva contraseña.')
                    setIsMessage(true)
                })
        }

    }

    return (
        <>
            <div className="w-full h-96 text-white flex justify-center items-center my-16">
                <div className="m-auto md:w-[90%] lg:w-1/4 rounded bg-brand-200 shadow-lg p-4">
                    <form onSubmit={setResetPassword} className="flex flex-col text-center">
                        <h1 className="text-2xl mb-8">Crear nueva contraseña</h1>
                        <input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setPassword(e.target.value)} placeholder="nueva contraseña" />
                        <input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setConfirmPassword(e.target.value)} placeholder="confirmar contraseña" />
                        <button type="submit" className="transition bg-sky-600 my-8 w-[70%] p-2 hover:bg-sky-500 rounded m-auto">Crear</button>
                    </form>
                </div>
            </div>
        </>
    )
}