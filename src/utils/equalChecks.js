import { FILE_TYPES } from "./constants";
import session from "./session";

export const equalsCheck = (a, b) =>
    a.length === b.length &&
    a.every((v, i) => v === b[i]);


export const checkValidFileTypes = (file) => {
    return FILE_TYPES.includes(file.type);
}

export const removeDuplicates = (arr) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export const removeDuplicateThumbnail = (arr) => {
    return [ ...new Set(arr) ]
}

export const checkIsImgValid = (url) => {
    return new Promise((resolve, reject) => {
        const img               = new Image()
        img.onload              = () => {
            const canvas  = document.createElement("canvas");
            const ctx     = canvas.getContext("2d");
            canvas.width  = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/png");
            const payload = {
                base64: dataURL
            }
            fetch(`${process.env.REACT_APP_API_URL}/api/upload-base64-img`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify(payload)
            })
            .then(resp => {
                return resp.json()
            })
            .then(response => {
                resolve(response.message)
            })
            .catch(error => {
                resolve(false)
            });
        }
        img.onerror             = () => {
            resolve(false)
        }
        img.crossOrigin         ="anonymous"
        img.src                 = url
    })
}

export const isValidURL = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}