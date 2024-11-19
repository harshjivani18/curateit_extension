window.setupDefaultBookmarks = () => {
    window.chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        console.log('bookmarkTreeNodes', bookmarkTreeNodes);
    });
}
