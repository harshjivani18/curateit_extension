function getDateTimeBefore(duration) {
    duration = duration.trim()
    const now = new Date()
    let timeOffset = 0
    if (duration.endsWith('mo')) {
        const months = parseInt(duration.slice(0, -1))
        timeOffset = months * 30 * 24 * 60 * 60 * 1000
    } else if (duration.endsWith('w')) {
        const weeks = parseInt(duration.slice(0, -1))
        timeOffset = weeks * 7 * 24 * 60 * 60 * 1000
    } else if (duration.endsWith('d')) {
        const days = parseInt(duration.slice(0, -1))
        timeOffset = days * 24 * 60 * 60 * 1000
    }

    const before = new Date(now.getTime() - timeOffset)
    const dateString = before.toISOString().slice(0, 10)
    // const timeString = before.toTimeString().slice(0, 8);
    return dateString
}

function getDateTimeBeforeReddit(duration) {
    duration = duration.trim()
    const now = new Date()
    let timeOffset = 0
    const dateTime = parseInt(duration.split(' ')[0])
    if (duration.includes('months') || duration.includes('month')) {
        timeOffset = dateTime * 30 * 24 * 60 * 60 * 1000
    } else if (duration.includes('days') || duration.includes('days')) {
        timeOffset = dateTime * 24 * 60 * 60 * 1000
    } else if (duration.includes('hours') || duration.includes('hour')) {
        timeOffset = dateTime * 60 * 60 * 1000
    }

    const before = new Date(now.getTime() - timeOffset)
    const dateString = before.toISOString().slice(0, 10)
    // const timeString = before.toTimeString().slice(0, 8);
    return dateString
}

function striptags(str, allowed_tags = []) {
    allowed_tags = allowed_tags.map(function (tag) {
        return tag.toLowerCase()
    })
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

    return str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed_tags.indexOf($1.toLowerCase()) > -1 ? $0 : ''
    })
}

function decodeUrl(url) {
    var decoded = decodeURIComponent(url)
    var urlObj = new URL(decoded)
    var protocol = urlObj.protocol
    var host = urlObj.host
    var path = urlObj.pathname
    var search = urlObj.search
    var hash = urlObj.hash
    var params = new URLSearchParams(search)

    var result = {
        protocol: protocol,
        host: host,
        path: path,
        search: search,
        hash: hash,
        queryParams: {},
    }

    params.forEach(function (value, key) {
        result.queryParams[key] = value
    })

    return result
}

function extractUrlWithoutQueryParams(url) {
    // Remove query parameters
    const urlWithoutQueryParams = url.split('?')[0];

    // Check if the URL starts with http:// or https://
    if (urlWithoutQueryParams.startsWith('http://') || urlWithoutQueryParams.startsWith('https://')) {
        return urlWithoutQueryParams;
    } else {
        return null; // Return null if the URL doesn't start with http:// or https://
    }
}

function removeEscapeSequences(str) {
    return str.replace(/\\[\'"\\bfnrtv0xu]/g, '')
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
