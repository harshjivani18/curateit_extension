const prepareForIframe = (dom) => {
    const srces                     = dom?.querySelectorAll("[src]")
    const hrefs                     = dom?.querySelectorAll("[href]")
    const links                     = dom?.querySelectorAll("[link]")
    const sources                   = dom?.querySelectorAll("[source]")
    const srcSets                   = dom?.querySelectorAll("[srcset]")
    const aElems                    = dom?.querySelectorAll("a")
    const NEXT_PUBLIC_BASE_URL      = `/`
    if (aElems?.length !== 0) {
      Array.from(aElems).forEach((el) => {
        el.target = "_blank"
      })
    }
    if (srcSets?.length !== 0) {
      Array.from(srcSets).forEach((el) => {
        el.setAttribute("srcset", el.srcset)
        if (el.srcset.startsWith(NEXT_PUBLIC_BASE_URL)) {
          el.srcset = `${el.srcset.replace(NEXT_PUBLIC_BASE_URL, `${window.location.href}/`)}`
        }
      })
    }
    if (srces?.length !== 0) {
      Array.from(srces).forEach((el) => {
        el.setAttribute("src", el.src)
        if (el.src.startsWith(NEXT_PUBLIC_BASE_URL)) {
          el.src = `${el.src.replace(NEXT_PUBLIC_BASE_URL, `${window.location.href}/`)}`
        }
      })
    }
    if (hrefs?.length !== 0) {
      Array.from(hrefs).forEach((el) => {
        el.setAttribute("href", el.href)
        if (el.href.startsWith(NEXT_PUBLIC_BASE_URL)) {
          el.href = `${el.href.replace(NEXT_PUBLIC_BASE_URL, `${window.location.href}/`)}`
        }
      })
    }
    if (links?.length !== 0) {
      Array.from(links).forEach((el) => {
        el.setAttribute("link", el.link)
        if (el.link.startsWith(NEXT_PUBLIC_BASE_URL)) {
          el.link = `${el.link.replace(NEXT_PUBLIC_BASE_URL, `${window.location.href}/`)}`
        }
      })
    }
    if (sources?.length !== 0) {
      Array.from(sources).forEach((el) => {
        el.setAttribute("source", el.source)
        if (el.source.startsWith(NEXT_PUBLIC_BASE_URL)) {
          el.source = `${el.source.replace(NEXT_PUBLIC_BASE_URL, `${window.location.href}/`)}`
        }
      })
    }
    return dom
}

window.getCurrentTab = () => {
    // Get current tab title, description, url and favicon
    const title         = document.title;
    const description   = document.querySelector('meta[name="description"]')?.content || '';
    const favicon       = document.querySelector('link[rel="icon"]')?.href || document.querySelector("link[rel='shortcut icon']")?.href;
    const url           = window.location.href;
    const thumbnail     = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('meta[name="twitter:image"]')?.content || document.querySelector('meta[itemprop="image"]')?.content || document.querySelector('link[rel="image_src"]')?.href || document.querySelector('link[rel="apple-touch-icon"]')?.href || document.querySelector('link[rel="apple-touch-icon-precomposed"]')?.href || document.querySelector('link[rel="apple-touch-startup"]')?.href
    return {
        title,
        description,
        favicon,
        thumbnail,
        allImages: Array.from(document.images).map((img) => img.src),
        url
    }
}

window.downloadCurrentHtml = async () => {
    
    const html          = document.documentElement.outerHTML;
    const dom           = new DOMParser().parseFromString(html, "text/html")
    const newDom        = prepareForIframe(dom)
    const newHTML       = newDom?.documentElement?.outerHTML
    const newHDom       = new DOMParser().parseFromString(newHTML, "text/html")
    const extIframe     = newHDom.querySelector("#curateit-iframe")
    const extBtn        = newHDom.querySelector("#logoBookmarkButtonWrapper")
    if (extBtn) {
      extBtn.remove()
    }
    if (extIframe) {
      extIframe.remove()
    }   
    const finalHTML     = newHDom.documentElement.outerHTML

    const element       = document.createElement('a');
    const downloadFile  = new Blob([finalHTML], {type: 'text/html'});
    element.href        = URL.createObjectURL(downloadFile);
    element.download    = `${document.title}-${new Date().getTime()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
      
}