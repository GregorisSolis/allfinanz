import { FormEvent, useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import { FiCheck, FiLock, FiX } from 'react-icons/fi'


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
			<div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.9)]">
				<form className="flex flex-col" onSubmit={setUpdatePassword}>
					<div className="mb-5 flex items-center justify-between gap-4">
						<div>
							<h1 className="text-sm font-semibold text-white">Criar nova senha</h1>
							<p className="mt-1 text-sm text-slate-400">Use pelo menos 7 caracteres.</p>
						</div>
						<button
							type="button"
							onClick={() => props.closeComponent()}
							className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
							aria-label="Fechar"
						>
							<FiX />
						</button>
					</div>
					<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="newPassword">Nova senha</label>
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
							<FiLock size={16} />
						</div>
					<input
							id="newPassword"
						type="password"
							className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 pl-10 text-sm text-slate-200 transition placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
						placeholder="Nova senha"
						onChange={e => setPassword(e.target.value)}
					/>
					</div>
					<div className="mt-5 flex justify-end gap-3">
						<button className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" type="button" onClick={() => props.closeComponent()}>
							<FiX />
							Cancelar
						</button>
						<button className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]" type="submit">
							<FiCheck />
							Confirmar
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
