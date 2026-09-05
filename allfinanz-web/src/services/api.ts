import axios from 'axios'

const DEFAULT_API_URL = 'http://localhost:8080/'

const normalizeApiUrl = (url: string) => {
	const correctedUrl = url.replace('https://allfinanz.vercel.com', 'https://allfinanz.vercel.app')

	return correctedUrl.endsWith('/') ? correctedUrl : `${correctedUrl}/`
}

export const AUTH_TOKEN_KEY = 'allfinanz-auth-token'

export const setAuthToken = (token?: string) => {
	if (token) {
		localStorage.setItem(AUTH_TOKEN_KEY, token)
	}
}

export const clearAuthToken = () => {
	localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const API = axios.create({
	baseURL: normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
	withCredentials: true,
});

API.interceptors.request.use(config => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY)

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})
