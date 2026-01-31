import React, { 
    createContext, 
    useState, 
    useEffect, 
    useCallback,
} from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_API_URL = `${BASE_API_URL}/auth`; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false); 
            return;
        }

        try {
            const decoded = jwtDecode(token);
            
            if (decoded.exp * 1000 < Date.now()) {
                throw new Error("Token expired");
            }

            const response = await axios.get(`${AUTH_API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const userData = response.data;
            setUser({ ...userData, token });
            setIsAuthenticated(true);
            
            if (userData.role) {
                localStorage.setItem('role', userData.role);
            }

        } catch (error) {
            console.error("Auth check failed:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); 
        }

    }, []); 

    useEffect(() => {
        checkAuth();
    }, [checkAuth]); 

    // --- FUNGSI LOGIN ---
    const login = async (username, password) => {
        try {
            const response = await axios.post(`${AUTH_API_URL}/login`, { username, password }); 
            const { token, ...userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('role', userData.role);
            
            setUser({ ...userData, token });
            setIsAuthenticated(true);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login gagal.');
        }
    };

    // --- FUNGSI LOGOUT ---
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user, 
        isAuthenticated, 
        isLoading, 
        login, 
        logout, 
        checkAuth,
        userRole: user?.role || localStorage.getItem('role')
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;