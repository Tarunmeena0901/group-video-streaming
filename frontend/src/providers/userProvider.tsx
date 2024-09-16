import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextProps {
  userName: string | null;
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  setUserName: (userName: string) => void;
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
    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <UserContext.Provider value={{userName,roomId,setRoomId,setUserName}}>
            {children}
        </UserContext.Provider>
    )
}
