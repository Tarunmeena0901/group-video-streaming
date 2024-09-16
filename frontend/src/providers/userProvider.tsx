import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextProps {
  userName: string | null;
  setUserName: (username: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

export const UserContextProvider = ({children}: {
    children: ReactNode
})=> {
    const [userName, setUserName] = useState<string | null>(null);

    return (
        <UserContext.Provider value={{userName,setUserName}}>
            {children}
        </UserContext.Provider>
    )
}
