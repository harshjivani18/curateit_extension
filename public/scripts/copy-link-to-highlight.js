window.copyLinkToHighlight = (e) => {
    const selectedString = window.getSelection().toString();
    if (!selectedString) return false;

    let url = window.location.href;
    // If URL already has a fragment identifier, remove it
    if (url.indexOf("#") > -1) {
        url = url.substring(0, url.indexOf("#"));
    }

    const splitArr = selectedString.split(' ');
    //If highlighted words are more than 50 split it to smaller words
    if (splitArr.length > 50) {
        const firstWords = splitArr.slice(0, 3).join(' ');
        const LastWords = splitArr.slice(-3).join(' ');
        url += `#:~:text=${encodeURIComponent(firstWords)},${encodeURIComponent(LastWords)}`;
    } else {
        url += `#:~:text=${encodeURIComponent(selectedString)}`;
    }

    navigator.clipboard.writeText(url)
        .then(() => {
            window.showMessage('Link copied', 'success');
            window.getSelection().empty();
        })
        .catch(err => {
            window.showMessage('Opps, something went wrong.', 'success');
            window.getSelection().empty();
        });
}

window.copyLinkToHighlight();