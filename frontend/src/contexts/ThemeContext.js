import { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    return (
        <ThemeContext.Provider value={{}}>
            {children}
        </ThemeContext.Provider>
    );
};
