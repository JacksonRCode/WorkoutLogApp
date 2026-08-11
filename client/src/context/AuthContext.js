import { createContext, useContext } from "react";

// Not used here because it gets activated once the user signs in
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
