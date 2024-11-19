$(document).ready(() => {
    $.get(chrome.runtime.getURL("/scripts/tutorial-popup/tutorial-popup.html"), (data) => {
        $(data).appendTo("body");
        $("#tutorial-close-btn").click(() => {
            $("#tutorial-video").hide()
        })
    })
    $(document).click((e) => {
        if (e.target.id !== "tutorial-video") {
            $("#tutorial-video").hide()
        }
    })
})
window.showTutorialModal = (uConfig) => {
    $("#tutorial-video").show()
    const child = $("#tutorial").children();
    if (child.length === 0) {
        if (uConfig.video_url) {
            const video = document.createElement("video");
            video.src = uConfig.video_url;
            $(video).appendTo("#tutorial")
        }
        else {
            $(uConfig.embed_code).appendTo("#tutorial")
        }
    }
}