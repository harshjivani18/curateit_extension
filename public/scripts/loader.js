window.showCTLoader = () => {
    const loaderOverlay = document.createElement("div");
    loaderOverlay.style.position = "fixed";
    loaderOverlay.style.top = "0";
    loaderOverlay.style.left = "0";
    loaderOverlay.style.width = "100%";
    loaderOverlay.style.height = "100%";
    loaderOverlay.style.backgroundColor = "rgba(0, 123, 255, 0.5)"; // Translucent blue
    loaderOverlay.style.display = "flex";
    loaderOverlay.style.justifyContent = "center";
    loaderOverlay.style.alignItems = "center";
    loaderOverlay.style.zIndex = "9999";
    loaderOverlay.id = "loaderOverlay";

    const loadingText = document.createElement("div");
    loadingText.innerText = "Capturing screenshot...";
    loadingText.style.color = "white";
    loadingText.style.fontSize = "2em";

    loaderOverlay.appendChild(loadingText);
    document.body.appendChild(loaderOverlay);
}

window.hideCTLoader = () => {
    const loaderOverlay = document.getElementById("loaderOverlay");
    if (loaderOverlay) {
        loaderOverlay.remove();
    }
}