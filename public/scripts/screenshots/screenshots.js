var jcrop, selection

const imageInitialSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6zwAAAgcBApocMXEAAAAASUVORK5CYII='
const jCropBoxLineBackground = 'data:image/gif;base64,R0lGODlhCAAIAJEAAKqqqv///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAACAAIAAACDZQFCadrzVRMB9FZ5SwAIfkECQoAAAAsAAAAAAgACAAAAg+ELqCYaudeW9ChyOyltQAAIfkECQoAAAAsAAAAAAgACAAAAg8EhGKXm+rQYtC0WGl9oAAAIfkECQoAAAAsAAAAAAgACAAAAg+EhWKQernaYmjCWLF7qAAAIfkECQoAAAAsAAAAAAgACAAAAg2EISmna81UTAfRWeUsACH5BAkKAAAALAAAAAAIAAgAAAIPFA6imGrnXlvQocjspbUAACH5BAkKAAAALAAAAAAIAAgAAAIPlIBgl5vq0GLQtFhpfaIAACH5BAUKAAAALAAAAAAIAAgAAAIPlIFgknq52mJowlixe6gAADs='
const overlayImageId = 'selection-overlay-image-id' /* ID used in screen-shot.css for styling */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request?.CAPTURED_SCREEN_SHOT) {
    screenShotUtils.storeImageAndOpenEditor(request)
  }
  if (request?.SELECTED_SECTION_RES) {
    screenShotUtils.setSelectionCaptureOverlay(false)
    selection = null
    screenShotUtils.cropSelectionElement(...request.args, (image) => {
      screenShotUtils.storeImageAndOpenEditor(image)
    })
  }
})

window.addEventListener('resize', ((resizeTimeout) => () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    jcrop?.destroy()
    screenShotUtils.initSelectionCapture(() => {
      screenShotUtils.setSelectionCaptureOverlay(null)
    })
  }, 100)
})())

//TODO::HERE STARTS
window.captureVisibleTab = async (tabId) => {
    chrome.runtime.sendMessage({ CAPTURE_VISIBLE_TAB: true, tab: tabId });
}

window.captureSelection = async (tabId) => {
  if (!jcrop) {
    screenShotUtils.setImage(() => {
      screenShotUtils.initSelectionCapture(() => {
        screenShotUtils.setSelectionCaptureOverlay(true)
        screenShotUtils.selectionCapture()
      })
    })
  } else {
    screenShotUtils.setSelectionCaptureOverlay(true)
    screenShotUtils.selectionCapture(true)
  }
}

window.captureFullPage = async (tabId) => {
  const viewportHeight = window.innerHeight
  let editedElements = [], editedElementsOnce = []
  let offset = 0
  let stopScrolling = false

  function stopCapturingScreenShot() {
    stopScrolling = true
  }

  window.addEventListener('click', stopCapturingScreenShot)

  const trackEditedElements = (element, styleCSSText = '') => {
    editedElements.push({ element, styleCSSText })
  }

  const editDOMStyle = () => {
    const editStylePromise = new Promise((resolve) => {
      const x = document.querySelectorAll('*')
      for (var i = 0; i < x.length; i++) {
        let elementStyle = getComputedStyle(x[i])
        if (x[i].nodeName === 'HTML') {
          trackEditedElements(x[i], x[i].style.cssText)
          x[i].style.cssText = 'scroll-behavior: auto !important;'
        } else if (x[i].nodeName === 'BODY') {
          trackEditedElements(x[i], x[i].style.cssText)
          x[i].style.cssText =
            'overflow: hidden; position: relative !important; min-width: 100vw !important; min-height: 100vh !important;'
        } else if (elementStyle.position == 'fixed') {
          trackEditedElements(x[i], x[i].style.cssText)
          x[i].style.cssText = 'visibility: hidden !important; overflow: hidden !important; opacity: 0 !important;'
        } else if (elementStyle.position == 'sticky') {
          trackEditedElements(x[i], x[i].style.cssText)
          x[i].style.cssText = 'position: relative !important; inset: auto !important;'
        }
      }
      resolve()
    })
    return editStylePromise
  }

  const resetEditedElements = (once) => {
    const resetStylePromise = new Promise((resolve) => {
      if (once && !!editedElementsOnce.length) {
        for (const obj of editedElementsOnce) {
          obj.element.style.cssText = obj.styleCSSText
        }
        editedElementsOnce = []
      }
      if (!!editedElements.length) {
        for (const obj of editedElements) {
          obj.element.style.cssText = obj.styleCSSText
        }
      }
      editedElements = []
      resolve()
    })
    return resetStylePromise
  }

  const editElementOnce = () => {
    const htmlEle = document.querySelectorAll('html')[0]
    const bodyEle = document.body

    editedElementsOnce.push({ element: htmlEle, styleCSSText: htmlEle.style.cssText })
    editedElementsOnce.push({ element: bodyEle, styleCSSText: bodyEle.style.cssText })

    htmlEle.style.cssText = 'scroll-behavior: auto !important;'
    bodyEle.style.cssText = 'overflow: hidden; position: relative !important; min-width: 100vw !important; min-height: 100vh !important;'
  }

  editElementOnce()
  while (!stopScrolling) {
    await screenShotUtils.scrollWithTime(offset)

    await editDOMStyle()
    await screenShotUtils.timeBuffer()
    chrome.runtime.sendMessage({ CAPTURE_PAGE_VISIBLE_PARTS: true, tabId, offset })
    await screenShotUtils.timeBuffer()
    await resetEditedElements()

    offset += viewportHeight
    if ((Math.round(window.scrollY + window.innerHeight + 0.9)) >= document.body.scrollHeight) {
      stopScrolling = true
    }
  }
  await resetEditedElements(true)
  await screenShotUtils.timeBuffer()
  chrome.runtime.sendMessage(
    { CAPTURED_FULL_PAGE: true },
    (pageImages) => screenShotUtils.handleImageMerge([...pageImages])
  )
  window.removeEventListener('click', stopCapturingScreenShot)
}

const b64ToFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

let screenShotUtils = {
  openImageInNewTab: async (imageData) => {
    chrome.runtime.sendMessage({
      OPEN_IMAGE_IN_NEW_TAB: true,
      imageData
    })
  },
  storeImageAndOpenEditor: async (imageData) => {
    const body = $('body');
    let is_injected_overlay_exists = $('#injected-overlay').length;
    if (!is_injected_overlay_exists) {
        body.append(
            `<div id="injected-overlay" style="font-size:50px;display:none;font-weight:800;position: fixed;width: 100%;height: 100%;top: 0;left: 0;right:0;bottom: 0;background: linear-gradient(90deg, rgba(16,95,211, 0.8), rgba(16,95,211, 0.8));z-index: 99; font-family: Roboto, Helvetica, Arial, sans-serif;"><div style="position: absolute;top: 50%;left: 50%;font-size: 50px;color: white;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);text-align: center;"><span id="status-bar">Sit tight, we’re uploading your screenshot <br/> to unfiltered collection...<br/></span></div><div style="position: absolute;top: 90%;left: 90%;"></div></div>`
        );
    }
    const { imgSrc, isFullPage } = imageData
    const screenFile = b64ToFile(imgSrc, `${Date.now()}.png`)
    const formData   = new FormData();
    formData.append('files', screenFile);
    const userData   = await chrome?.storage?.sync.get(["userData"]);
    if (userData && userData?.userData && userData?.userData?.token && userData?.userData?.apiUrl) {
      const overlayElem = $("#injected-overlay");
      if (overlayElem) {
        overlayElem.css("display", "block");
      }
        const imgRes = await axios({
            method: 'post',
            url: `${userData?.userData?.apiUrl}/api/gems/upload-screenshot`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${userData?.userData?.token}`
            }
        })
        if (imgRes.error === undefined && imgRes.payload?.error === undefined) {
            const { data } = imgRes
            if (data && data.length !== 0) {
                const src     = data[0]
                const images1 = Array.from(document?.images)?.map((img) => { return img.src }) || [];
                const icon    = document.querySelector('link[rel="icon"]')?.href || ""
                const payload = {
                    title: document.title,
                    description: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
                    expander: null,
                    type: "Screenshot",
                    author: userData?.userData.userId,
                    url: window.location.href,
                    tags: [],
                    collections: userData?.userData.unfilteredCollectionId,
                    is_favourite: false,
                    notes: "",
                    image: src,
                    metaData: {
                      covers: [],
                      docImages: [ src, ...images1 ],
                      defaultThumbnail: src,
                      defaultIcon: icon !== "" ? icon : null,
                      icon: icon !== "" ? { type: "image", icon } : null,
                    },
                    _id: "",
                    showThumbnail: false
                }
                const screenshot = await axios({
                    method: 'post',
                    data: payload,
                    url: `${userData?.userData?.apiUrl}/api/ocre?image=${encodeURIComponent(src)}&imageColor=true`,
                    headers: {
                        'Authorization': `Bearer ${userData?.userData?.token}`
                    }
                })
                if (screenshot.error === undefined && screenshot.payload?.error === undefined) {
                  if (overlayElem) {
                    overlayElem.css("display", "none");
                  }
                    window.open(`${userData?.userData?.webappURL}/u/${userData?.userData?.username}/image-editor/${screenshot?.data?.id}/${userData?.userData?.token}?url=${src}`, '_blank')
                }
            }   
        }
    }
    else {
        if (isFullPage) {
            const image = new Image();
            image.src = imgSrc;
            image.onload = () => {
                const w = window.open(imgSrc);
                w.document.write(image.outerHTML);
            }
        }
        else {
            chrome.runtime.sendMessage({
                OPEN_IMAGE_IN_NEW_TAB: true,
                imageData
            })
        }
    }
  },
  setImage: (done) => {
    var overlayImage = new Image()
    overlayImage.id = overlayImageId
    overlayImage.src = imageInitialSrc
    overlayImage.onload = () => {
      $('body')?.append(overlayImage)
      done()
    }
  },
  initSelectionCapture: (done) => {
    $(`#${overlayImageId}`)?.Jcrop({
      bgColor: 'none',
      onSelect: (e) => {
        selection = e
        screenShotUtils.selectionCapture()
      },
      onChange: (e) => {
        selection = e
      },
      onRelease: (e) => {
        setTimeout(() => {
          selection = null
        }, 100)
      }
    }, function ready() {
      jcrop = this

      $('.jcrop-hline, .jcrop-vline').css({
        // backgroundImage: 'url("data:image/gif;base64,R0lGODlhCAAIAJEAAKqqqv///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAACAAIAAACDZQFCadrzVRMB9FZ5SwAIfkECQoAAAAsAAAAAAgACAAAAg+ELqCYaudeW9ChyOyltQAAIfkECQoAAAAsAAAAAAgACAAAAg8EhGKXm+rQYtC0WGl9oAAAIfkECQoAAAAsAAAAAAgACAAAAg+EhWKQernaYmjCWLF7qAAAIfkECQoAAAAsAAAAAAgACAAAAg2EISmna81UTAfRWeUsACH5BAkKAAAALAAAAAAIAAgAAAIPFA6imGrnXlvQocjspbUAACH5BAkKAAAALAAAAAAIAAgAAAIPlIBgl5vq0GLQtFhpfaIAACH5BAUKAAAALAAAAAAIAAgAAAIPlIFgknq52mJowlixe6gAADs=")'
        backgroundImage: `url(${jCropBoxLineBackground})`
      })

      if (selection) {
        jcrop.setSelect([
          selection.x, selection.y,
          selection.x2, selection.y2
        ])
      }

      done && done()
    })
  },
  selectionCapture: async () => {
    if (selection) {
      jcrop.release()
      setTimeout(() => {
        chrome.runtime.sendMessage({
          GET_SELECTED_SECTION: true,
          area: selection,
          dpr: devicePixelRatio
        }, () => {
          screenShotUtils.setSelectionCaptureOverlay(false)
        })
      }, 50)
    }
  },
  setSelectionCaptureOverlay: (active = false) => {
    const jCropHolder = document.getElementsByClassName('jcrop-holder')[0]
    if (jCropHolder) {
      if (active) {
        jCropHolder.style.setProperty('display', 'block')
      } else {
        jCropHolder.style.setProperty('display', 'none')
      }
    }
  },
  cropSelectionElement: (image, area, dpr, preserve, format, done) => {
    var top = area.y * dpr
    var left = area.x * dpr
    var width = area.w * dpr
    var height = area.h * dpr
    var w = (dpr !== 1 && preserve) ? width : area.w
    var h = (dpr !== 1 && preserve) ? height : area.h

    var canvas = null
    var template = null
    if (!canvas) {
      template = document.createElement('template')
      canvas = document.createElement('canvas')
      document.body.appendChild(template)
      template.appendChild(canvas)
    }
    canvas.width = w
    canvas.height = h

    var img = new Image()
    img.onload = () => {
      var context = canvas.getContext('2d')
      context.drawImage(img,
        left, top,
        width, height,
        0, 0,
        w, h
      )

      var cropped = canvas.toDataURL(`image/${format}`)
      done({ imgSrc: cropped })
    }
    img.src = image
  },
  scrollWithTime: (offset) => {
    const promise = new Promise((resolve, reject) => {
      window.scrollTo(0, offset)
      setTimeout(() => {
        resolve()
      }, 500)
    })
    return promise
  },
  timeBuffer: (time = 300) => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
    return promise
  },
  handleImageMerge: (allPageImages) => {
    const mergeImagesVertically = async (images) => {
      if (images?.length) {
        const canvas = document.createElement("canvas");
        if (images[0]?.width) {
          canvas.width = images[0].width;
        }
        canvas.height = images.reduce((totalHeight, img) => totalHeight + img.height, 0);
        const ctx = canvas.getContext("2d");

        let y = 0;
        images.forEach(img => {
          ctx.drawImage(img, 0, y); // image, start width, start height
          y += img.height;
        });

        const imgSrc = canvas.toDataURL()
        screenShotUtils.storeImageAndOpenEditor({ imgSrc, isFullPage: true })
        // var image = new Image();
        // image.src = imgSrc;
        // image.onload = () => {
        //     screenShotUtils.storeImageAndOpenEditor({ imgSrc, isFullPage: true })
        // //   var w = window.open(imgSrc);
        // //   w.document.write(image.outerHTML);
        // }
      }
    }

    Promise.all(allPageImages.map((src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null)
    }))).then(imgs => {
      mergeImagesVertically(imgs.filter(img => img !== null));
    }).catch(err => {
      console.error(err);
    });
  }
};
