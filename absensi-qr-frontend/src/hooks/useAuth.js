// src/hooks/useAuth.js
import { useContext } from 'react';
// Pastikan path ini benar untuk mengimpor AuthContext dari folder context
import AuthContext from '../context/AuthContext'; 

export const useAuth = () => useContext(AuthContext);