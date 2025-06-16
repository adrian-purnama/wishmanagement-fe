import { createContext, useState } from "react";

const UserContext = createContext();

const UserContextProvider = (props) => {
    const [username, setUsername] = useState(null)
    const [isLoggedin, setIsLoggedin] = useState(false)

    return (
        <UserContext.Provider value={{username, setUsername, isLoggedin, setIsLoggedin}}>
            {props.children}
        </UserContext.Provider>
    );
};

export { UserContext, UserContextProvider };
