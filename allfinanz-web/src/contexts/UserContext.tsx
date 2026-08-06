import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API } from '../services/api';

interface User {
  name: string;
  email?: string;
  avatar?: string;
  salary_day?: number;
}

import { isAuthenticated as checkAuthentication } from '../services/auth';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserName: (name: string) => void;
  updateSalaryDay: (salary_day: number) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
  isLoadingUser: boolean;
  reloadUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  const reloadUser = async () => {
    const response = await API.get('/user/info-user', { withCredentials: true });
    if (response.data.user) {
      setUser({
        name: response.data.user.name,
        email: response.data.user.email,
        avatar: response.data.user.imageUrl,
        salary_day: response.data.user.salary_day
      });
    }
  };

  useEffect(() => {
    const loadUserDataAndAuth = async () => {
      setIsLoadingUser(true);
      try {
        const authStatus = await checkAuthentication();
        setIsAuthenticated(authStatus);

        if (authStatus) {
          await reloadUser();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Erro ao carregar dados do usuário ou verificar autenticação:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserDataAndAuth();
  }, []);

  const updateUserName = (name: string) => {
    setUser(prevUser => prevUser ? { ...prevUser, name } : { name });
  };

  const updateSalaryDay = (salary_day: number) => {
    setUser(prevUser => prevUser ? { ...prevUser, salary_day } : { name: '', salary_day });
  };

  const clearUser = () => {
    setUser(null);
  };

  const value: UserContextType = {
    user,
    setUser,
    updateUserName,
    updateSalaryDay,
    clearUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoadingUser,
    reloadUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
} 
