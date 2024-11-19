import {
    enable as enableDarkMode,
    disable as disableDarkMode,
    exportGeneratedCSS as collectCSS,
    isEnabled as isDarkReaderEnabled,
    setFetchMethod
  } from 'darkreader';

export const toggleDarkMode = async (isDark) => {
    if (!isDark && isDarkReaderEnabled()) {
        disableDarkMode()
    }
    else {
        setFetchMethod(window.fetch)
        enableDarkMode({
            brightness: 100,
            contrast: 90,
            sepia: 10,
        })
        await collectCSS()
    }
}