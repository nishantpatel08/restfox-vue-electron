async function getKey(key) {
    return new Promise((resolve, reject) => {
        try {
            browser.storage.local.get([key], (result) => {
                resolve(result[key])
            })
        } catch (ex) {
            reject(ex)
        }
    })
}

async function setKey(key, value) {
    return new Promise((resolve, reject) => {
        try {
            browser.storage.local.set({ [key]: value }, () => {
                resolve()
            })
        } catch (ex) {
            reject(ex)
        }
    })
}

const domains = [
    'https://restfox.dev'
]

async function isRestSparkTab() {
    const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true })

    if(!tab) {
        return false
    }

    if('url' in tab === false) {
        return false
    }

    if(tab.url.startsWith(domains[0]) === false) {
        return false
    }

    return tab
}

async function tabChanged() {
    const tab = await isRestSparkTab()

    if(tab === false) {
        return
    }

    await browser.pageAction.setIcon({
        path: 'icons/favicon-disabled-128.png',
        tabId: tab.id
    })

    const extensionDisabled = await getKey('extensionDisabled')
    if(!extensionDisabled) {
        await browser.pageAction.setIcon({
            path: 'icons/favicon-128.png',
            tabId: tab.id
        })

        browser.tabs.sendMessage(tab.id, {
            event: '__EXTENSION_HOOK__',
            eventData: 'RestSpark CORS Helper Enabled'
        })
    }
}

browser.tabs.onActivated.addListener(tabChanged)
browser.tabs.onUpdated.addListener(tabChanged)

async function handleAction() {
    const tab = await isRestSparkTab()

    if(tab === false) {
        return
    }

    let extensionDisabled = await getKey('extensionDisabled')
    extensionDisabled = !extensionDisabled
    await setKey('extensionDisabled', extensionDisabled)

    if(extensionDisabled) {
        browser.pageAction.setIcon({
            path: 'icons/favicon-disabled-128.png',
            tabId: tab.id
        })

        browser.tabs.sendMessage(tab.id, {
            event: '__EXTENSION_UN_HOOK__',
            eventData: 'RestSpark CORS Helper Disabled'
        })
    } else {
        browser.pageAction.setIcon({
            path: 'icons/favicon-128.png',
            tabId: tab.id
        })

        browser.tabs.sendMessage(tab.id, {
            event: '__EXTENSION_HOOK__',
            eventData: 'RestSpark CORS Helper Enabled'
        })
    }
}

browser.pageAction.onClicked.addListener(handleAction)

let abortController = new Map()

async function handleSendRequest(message, sendResponse) {
    const { eventId } = message

    try {
        const { url, method, headers, bodyHint } = message.eventData
        let { body } = message.eventData

        abortController.set(eventId, new AbortController())

        if(bodyHint === 'FormData') {
            const formData = new FormData()
            for(const item of body) {
                const value = typeof item[1] !== 'object' ? item[1] : new File([new Uint8Array(item[1].buffer)], item[1].name, { type: item[1].type })
                formData.append(item[0], value)
            }
            body = formData
        }

        if(bodyHint === 'File') {
            body = new File([new Uint8Array(body.buffer)], body.name, { type: body.type })
        }

        const startTime = new Date()

        const response = await fetch(url, {
            method,
            headers,
            body: method !== 'GET' ? body : undefined,
            signal: abortController.get(eventId).signal
        })

        const headEndTime = new Date()

        const status = response.status
        const statusText = response.statusText
        const responseHeaders = [...response.headers.entries()]

        const responseBlob = await response.blob()

        const endTime = new Date()

        const mimeType = responseBlob.type
        const buffer = await responseBlob.arrayBuffer()

        const timeTaken = endTime - startTime
        const headTimeTaken = headEndTime - startTime
        const bodyTimeTaken = endTime - headEndTime

        const responseToSend = {
            status,
            statusText,
            headers: responseHeaders,
            mimeType,
            buffer: Array.from(new Uint8Array(buffer)),
            timeTaken,
            headTimeTaken,
            bodyTimeTaken,
        }

        sendResponse({
            event: 'response',
            eventId,
            eventData: responseToSend
        })
    } catch(e) {
        sendResponse({
            event: 'responseError',
            eventId,
            eventData: e.message
        })
    }
}

function messageHandler(message, _sender, sendResponse) {
    if(message.event === 'sendRequest') {
        handleSendRequest(message, sendResponse)
    }

    if(message.event === 'cancelRequest') {
        abortController.get(message.eventId).abort()
    }

    return true
}

browser.runtime.onMessage.addListener(messageHandler)
