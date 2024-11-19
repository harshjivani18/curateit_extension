window.getFavIconURL = function (url) {
    return new Promise((resolve) => {
        const img               = new Image()
        img.onload              = () => {
            const canvas  = document.createElement("canvas");
            const ctx     = canvas.getContext("2d");
            canvas.width  = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL)
        }
        img.onerror             = (err) => {
            console.log(err)
            resolve({ error: true })
        }
        img.crossOrigin         ="anonymous"
        img.src                 = url
    })
}