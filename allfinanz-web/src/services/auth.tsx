import { API } from "./api"

// Checa se o usuário está autenticado
export const isAuthenticated = async () => {
	try {
		const resp = await API.get('/user/auth-check', { withCredentials: true })
		return resp.data.success;
	} catch (err) {
		return false
	}
}


// Logout: chama o endpoint de logout do backend para limpar o cookie
export const logout = async () => {
	await API.post('/user/logout', {}, { withCredentials: true });
}

export const login = async (email: string, password: string) => {
	// TODO: Implement login logic if needed
	console.log("Login function called");
};