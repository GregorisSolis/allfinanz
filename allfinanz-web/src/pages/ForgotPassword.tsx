import { FormEvent, useState } from "react"
import { MessageComponent } from "../components/MessageComponent"
import { Navbar } from "../components/Navbar"
import { API } from "../services/api"

export function ForgotPassword() {

    document.title = 'Allfinanz - Recuperar cuenta'
    let [isMessage, setIsMessage] = useState(false)
    let [textMessage, setTextMessage] = useState('')
    let [email, setEmail] = useState('')

    function setForgotPassword(event: FormEvent) {
        event.preventDefault()

        if (!email || !email.includes('@') || !email.includes('.com')) {
            setIsMessage(true)
            setTextMessage('Debes ingresar un email valido.')
        } else {
            API.post('/auth/forgot_password', {email})
                .then(() => {
                    setEmail('')
                    setIsMessage(true)
                    setTextMessage('En unos instantes recibiras un email para renovar la contraseña.')
                })
                .catch(() => {
                    setIsMessage(true)
                    setTextMessage('El email no esta cadastrado en nuestra base de dato.')
                })
        }

    }

    return (
        <>
            <Navbar location="" />
            <div className="w-full h-96 text-white flex justify-center items-center my-16">
                {isMessage ? 
                    <MessageComponent 
                        text={textMessage} 
                        action={() => setIsMessage(false)}
                        type={'null'} 
                        link_title={'null'} 
                        link={() => null} 
                    /> : null}
                <div className="m-auto md:w-[90%] lg:w-1/4 rounded bg-brand-200 shadow-lg p-4">
                    <form onSubmit={setForgotPassword} className="flex flex-col text-center">
                        <h1 className="text-4xl mb-8">Recuperar cuenta</h1>
                        <input
                            className="text-center transition w-11/12 m-auto my-8 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none"
                            onChange={(e: any) => setEmail(e.target.value)}
                            placeholder="Email"
                            value={email}
                        />
                        <button type="submit" className="transition bg-sky-600 my-4 w-[70%] p-2 hover:bg-sky-500 rounded m-auto">Enviar email</button>
                    </form>
                </div>
            </div>
        </>
    )
}