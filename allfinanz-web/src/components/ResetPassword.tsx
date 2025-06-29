import { FormEvent, useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'


interface ResetPasswordProps {
	reload: () => void,
	closeComponent: () => void,
}

export function ResetPassword(props: ResetPasswordProps) {

	let [password, setPassword] = useState('')


	async function setUpdatePassword(event: FormEvent) {
		event.preventDefault()

		if (!password) {
			toast.error('Por favor, digite uma nova senha.')
		} else if (password.length < 7) {
			toast.warning('A senha deve ter pelo menos 7 caracteres.')
		} else {
			await API.put('/user/edit_password', { password }, { withCredentials: true })
				.then(() => {
					toast.success('Senha atualizada com sucesso!')
					props.reload()
					props.closeComponent()
				})
		}
	}

	return (
		<>
			<div className="bg-black/50 backdrop-blur-sm fixed inset-0 animate-fadeIn z-40" />
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-700 rounded-xl p-6 w-[90vw] max-w-sm shadow-lg z-50">
				<form className="flex flex-col text-center" onSubmit={setUpdatePassword}>
					<h1 className="text-lg font-semibold mb-4 text-white">Criar nova senha</h1>
					<input
						type="password"
						className="mb-6 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500 text-white placeholder-white"
						placeholder="Nova senha"
						onChange={e => setPassword(e.target.value)}
					/>
					<div className="flex justify-end gap-4 mt-2">
						<button className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-gray-800 bg-white" type="button" onClick={() => props.closeComponent()}>Cancelar</button>
						<button className="px-4 py-2 rounded text-white bg-sky-600 hover:bg-sky-700" type="submit">Confirmar</button>
					</div>
				</form>
			</div>
		</>
	)
}