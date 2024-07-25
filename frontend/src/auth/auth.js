import React, { createContext, useContext, useState } from 'react';


// Create a context for authentication
const AuthContext = createContext();

// Provider component wraps app and provides auth context
export const AuthProvider = ({ children }) => {
    // Initial state -- fetch from backend ??
    const [authState, setAuthState] = useState({ isAuthenticated: false, role: null });

    return (
        <AuthContext.Provider value={{ authState, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
};

// Accessing auth context
export const useAuth = () => {
    return useContext(AuthContext);
}