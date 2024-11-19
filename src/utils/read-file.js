export const readFileAsBlob = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("GET", url)
        xhr.responseType = "blob"
        xhr.onload = () => {
            resolve(xhr.response)
        }
        xhr.onerror = () => {
            reject(new Error("Network error"))
        }
        xhr.send()
    })
}