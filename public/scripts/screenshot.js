const showScreenshotLoader = () => {
    const mainDiv           = document.createElement('div');
    mainDiv.classList.add('ct-loader-overlay');

    const mainLoader        = document.createElement('div');
    mainLoader.classList.add('ct-loader');

    const mainLoaderText    = document.createElement('div');
    mainLoaderText.classList.add('ct-loader-text');
    mainLoaderText.innerText = "Please hold curateit taking screenshot...";
    mainDiv.appendChild(mainLoader);
    mainDiv.appendChild(mainLoaderText);

    document.body.appendChild(mainDiv);
}

const hideScreenshotLoader = () => {
    const loader = document.querySelector('.ct-loader-overlay');
    if (loader) {
        document.body.removeChild(loader);
    }
}

window.takePartialPageScreenshot = (cx, cy, cw, ch) => {
    showScreenshotLoader()
    
    chrome?.storage?.sync.get(['userData'], (text) => {
        const { href }                      = window.location;
        const { scrollHeight, scrollWidth } = document.documentElement;
        if (!text || !text.userData || !text.userData.apiUrl || !text.userData.token) {
            window.showMessage("Please logged in into curateit to access this feature!", "error")
            return
        }
        const { apiUrl, token }             = text.userData;
        fetch(`${apiUrl}/api/take-screenshot?url=${href}&cx=${cx}&cy=${cy}&cw=${cw}&ch=${ch}&width=${scrollWidth}&height=${scrollHeight}&scrollX=${window.scrollX}&scrollY=${window.scrollY}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
        })
        .then(resp => {
            return resp.text()
        })
        .then((textRespo) => {
            hideScreenshotLoader()
            chrome.storage.sync.remove("imageData")
            chrome.storage.sync.set({'imageData': {
                imageSrc: textRespo
            }})
            window.panelToggle("?screenshot", true)
        })
    })
}

window.showScreenshotArea = () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = 9999;
    overlay.classList.add('ct-screenshot-overlay');
    document.body.appendChild(overlay);

    const rectangle = document.createElement('div');
    rectangle.style.position = 'absolute';
    rectangle.style.border = '2px solid grey';
    rectangle.style.zIndex = 10000;
    rectangle.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    overlay.appendChild(rectangle);

    let startX, startY, endX, endY;

    // Add a mousedown event listener to the overlay
    overlay.addEventListener('mousedown', function(event) {
        startX = event.clientX;
        startY = event.clientY;

        overlay.style.cursor = 'crosshair';

        // Add a mousemove event listener to the overlay
        overlay.addEventListener('mousemove', moveHandler);

        // Add a mouseup event listener to the overlay
        overlay.addEventListener('mouseup', onMouseUp);
    });

    const onMouseUp = (event) => {
        endX = event.clientX;
        endY = event.clientY;

        // Remove the mousemove and mouseup event listeners from the overlay
        overlay.removeEventListener('mousemove', moveHandler);
        overlay.removeEventListener('mouseup', onMouseUp);

        // Set the position and size of the rectangle element
        rectangle.style.left = Math.min(startX, endX) + 'px';
        rectangle.style.top = Math.min(startY, endY) + 'px';
        rectangle.style.width = Math.abs(endX - startX) + 'px';
        rectangle.style.height = Math.abs(endY - startY) + 'px';

        overlay.style.cursor = 'default';

        // Clip the overlay to the rectangle area
        overlay.style.clip = `rect(${rectangle.offsetTop}px, ${rectangle.offsetLeft + rectangle.offsetWidth}px, ${rectangle.offsetTop + rectangle.offsetHeight}px, ${rectangle.offsetLeft}px)`;

        const { top,
                left,
                width,
                height }       = rectangle.getBoundingClientRect();
        const l                = left;
        const t                = top;
        const w                = width;
        const h                = height;
        // Remove the overlay element from the document
        document.body.removeChild(overlay);
        
        window.takePartialPageScreenshot(l, t, w, h)
    }

    const moveHandler = (event) => {
        endX = event.clientX;
        endY = event.clientY;

        // Set the position and size of the rectangle element
        rectangle.style.left = Math.min(startX, endX) + 'px';
        rectangle.style.top = Math.min(startY, endY) + 'px';
        rectangle.style.width = Math.abs(endX - startX) + 'px';
        rectangle.style.height = Math.abs(endY - startY) + 'px';
    }
}

window.hideScreenshotArea = () => {
    const overlay = document.querySelector('.ct-screenshot-overlay');
    if (overlay) {
        overlay.remove();
    }
}

window.takeFullPageScreenshotv2 = () => {
    showScreenshotLoader()
    
    chrome?.storage?.sync.get(['userData'], (text) => {
        const { href }                      = window.location;
        const { scrollHeight, scrollWidth } = document.documentElement;
        if (!text || !text.userData || !text.userData.apiUrl || !text.userData.token) {
            window.showMessage("Please logged in into curateit to access this feature!", "error")
            return
        }
        const { apiUrl, token }             = text.userData;
        fetch(`${apiUrl}/api/take-screenshot?url=${href}&width=${scrollWidth}&height=${scrollHeight}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
        })
        .then(resp => {
            return resp.text()
        })
        .then((textRespo) => {
            hideScreenshotLoader()
            chrome.storage.sync.remove("imageData")
            chrome.storage.sync.set({'imageData': {
                imageSrc: textRespo
            }})
            window.panelToggle("?screenshot", true)
        })
    })
}
