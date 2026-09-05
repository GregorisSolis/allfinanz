import axios from 'axios'

const DEFAULT_API_URL = 'http://localhost:8080/'

const normalizeApiUrl = (url: string) => {
	const correctedUrl = url.replace('https://allfinanz.vercel.com', 'https://allfinanz.vercel.app')

	return correctedUrl.endsWith('/') ? correctedUrl : `${correctedUrl}/`
}

export const API = axios.create({
	baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
	withCredentials: true,
});
