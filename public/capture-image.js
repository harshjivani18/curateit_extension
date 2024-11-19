let replaceUrlStart = new RegExp('[^]+iSrc=')

window.addEventListener('load', () => {
  const imageUrl = window.location.href.replace(replaceUrlStart, '')
  var image = new Image()

  image.id = 'captured-image'
  image.src = imageUrl
  window.document.write(image.outerHTML);
})