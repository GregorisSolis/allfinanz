import { FormEvent, useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import { FiCheck, FiImage, FiX } from 'react-icons/fi'

interface UpdatePhotoProps {
	idForRemove: string,
	reload: () => void,
	closeComponent: () => void
}

export function UpdatePhoto(props: UpdatePhotoProps) {
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	function setPhotoProfile(event: FormEvent) {
		event.preventDefault()
		if (!imageFile) {
			toast.error('Por favor, selecione uma imagem.')
			return
		}
		setIsLoading(true)
		const data = new FormData()
		data.append('file', imageFile, imageFile.name)
		API.post('/user/post', data, { withCredentials: true })
			.then(res => {
				let imageUrl = res.data.post.url
				let imageID = res.data.post.key
				removePhotoFromAws()
				setUrlUserPhoto(imageUrl, imageID)
			})
			.catch(() => {
				toast.error('Não foi possível carregar o arquivo.')
			})
			.finally(() => setIsLoading(false))
	}

	//elimina a foto antiga
	function removePhotoFromAws() {
		API.delete(`/user/remove-post/${props.idForRemove}`, { withCredentials: true })
	}

	//adiciona imageID e imageURL ao usuário
	function setUrlUserPhoto(imageUrl: string, imageID: string) {
		API.put('/user/edit', { imageUrl, imageID }, { withCredentials: true })
			.then(() => {
				toast.success('Foto atualizada com sucesso!')
				props.closeComponent()
				props.reload()
			})
	}

	return (
		<>
			<div className="bg-black/50 backdrop-blur-sm fixed inset-0 animate-fadeIn z-40" />
			<div className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.9)]">
				<form className="flex flex-col" onSubmit={setPhotoProfile}>
					<div className="mb-5 flex items-center justify-between gap-4">
						<div>
							<h1 className="text-sm font-semibold text-white">Adicionar nova foto</h1>
							<p className="mt-1 text-sm text-slate-400">Selecione uma imagem para o perfil.</p>
						</div>
						<button
							type="button"
							onClick={() => props.closeComponent()}
							disabled={isLoading}
							className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
							aria-label="Fechar"
						>
							<FiX />
						</button>
					</div>
					<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="profilePhoto">Imagem</label>
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
							<FiImage size={16} />
						</div>
					<input
							id="profilePhoto"
							className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 pl-10 text-sm text-slate-200 transition file:mr-3 file:rounded-md file:border-0 file:bg-white/[0.08] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-200 hover:file:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-slate-500"
						type="file"
						accept="image/*"
						onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
					/>
					</div>
					<div className="mt-5 flex justify-end gap-3">
						<button
							className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							onClick={() => props.closeComponent()}
							disabled={isLoading}
						>
							<FiX />
							Cancelar
						</button>
						<button
							className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
							type="submit"
							disabled={isLoading}
						>
							<FiCheck />
							{isLoading ? 'Enviando...' : 'Confirmar'}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
