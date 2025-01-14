import { useEffect, useState } from "react";
import { ThemeContext } from "../../core/theme/ThemeContext"

const getInitialTheme = () => {
    //FOR TESTING
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('color-theme');
        if (typeof storedPrefs === 'string') {
            return storedPrefs;
        }

        //Check system screen mode
        // const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        // if (userMedia.matches) {
        //     return 'dark';
        // }
    }


    return 'light' // light theme as the default;
};

export const ThemeProvider = ({ initialTheme, children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    const rawSetTheme = (rawTheme) => {
        const root = window.document.documentElement;
        const isDark = rawTheme === 'dark';

        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(rawTheme);

        //FOR BROWSER TESTING
        localStorage.setItem('color-theme', rawTheme);
        //SET TO CHROME STORAGE
        // chrome.storage.local.set({'color-theme': rawTheme});
    };

    if (initialTheme) {
        rawSetTheme(initialTheme);
    }

    useEffect(() => {
        rawSetTheme(theme);
    }, [theme]);

    return(
        <ThemeContext.Provider value={{ theme, setTheme }}>
            { children }
        </ThemeContext.Provider>
    )
}