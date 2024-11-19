window.setTheme = async () => {
    try {
        const theme = window.localStorage.getItem("CT_THEME")
        if (theme === "CT_DARK_THEME") {
            window.DarkReader.setFetchMethod(window.fetch)
            window.DarkReader.enable({
                brightness: 100,
                contrast: 90,
                sepia: 10,
            })

            await window.DarkReader.exportGeneratedCSS();
            $("#omni-extension").addClass('dark');

            // 
        }
        else if (window.DarkReader.isEnabled() && theme === "CT_LIGHT_THEME") {
            window.DarkReader.disable()
            $("#omni-extension").removeClass('dark');

            // 
        }

        // if (window.CT_THEME_MODE_FRAME && document.body && theme !== null) {
        //     document.body.removeChild(window.CT_THEME_MODE_FRAME)
        //     window.CT_THEME_MODE_FRAME = null
        //     
        // }
    }
    catch (e) { 
        console.log("Error in setTheme", e)
    }
}

window.setTheme()






