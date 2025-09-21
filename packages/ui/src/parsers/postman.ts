import JSZip from 'jszip'
import { nanoid } from 'nanoid'
import {
    CollectionItem,
    RequestBody,
    RequestAuthentication,
    RequestParam,
    Plugin,
} from '@/global'
import { convertPostmanAuthToRestSparkAuth, scriptConversion } from '@/helpers'
import constants from '@/constants'

export async function convertPostmanExportToRestSparkCollection(json: any, isZip: boolean, workspaceId: string) {
    if(isZip) {
        const zip = new JSZip()
        const extractedZip = await zip.loadAsync(json)
        const filePaths = Object.keys(extractedZip.files)
        const filePathMap: Record<string, string> = {}
        const basePath = filePaths[filePaths.length - 1].replace('archive.json', '')
        filePaths.forEach(filePath => {
            filePathMap[filePath.replace(basePath, '')] = filePath
        })

        const archive = await extractedZip.files[filePathMap['archive.json']].async('text')
        const archiveCollection = JSON.parse(archive).collection

        const collections: any[] = []

        for(const collectionId of Object.keys(archiveCollection)) {
            collections.push(JSON.parse(await extractedZip.files[filePathMap[`collection/${collectionId}.json`]].async('text')))
        }

        return importPostmanV2(collections, workspaceId)
    } else {
        if('info' in json) {
            if('schema' in json.info) {
                if(json.info.schema === constants.POSTMAN_SCHEMA['v2.0'] || json.info.schema === constants.POSTMAN_SCHEMA['v2.1']) {
                    return importPostmanV2([json], workspaceId)
                }
            }
        }
        return importPostmanV1(json.collections, workspaceId)
    }
}

function importPostmanV1(collections: any[], workspaceId: string) {
    const collection: CollectionItem[]  = []

    collections.forEach(item => {
        const requests: CollectionItem[] = []

        item.requests.forEach((request: any) => {
            let body: RequestBody = {
                mimeType: 'No Body'
            }

            if(request.dataMode === 'urlencoded') {
                const params: RequestParam[] = []
                const requestData = request.data !== null ? request.data : []
                requestData.forEach((requestDataItem: any) => {
                    params.push({
                        name: requestDataItem.key,
                        value: requestDataItem.value,
                        description: requestDataItem.description,
                        disabled: !requestDataItem.enabled
                    })
                })
                body = {
                    mimeType: 'application/x-www-form-urlencoded',
                    params
                }
            }

            if(request.dataMode === 'raw') {
                body = {
                    mimeType: 'text/plain',
                    text: request.rawModeData
                }
            }

            const headers: RequestParam[] = []
            request.headerData.forEach((header: any) => {
                headers.push({
                    name: header.key,
                    value: header.value,
                    description: header.description,
                    disabled: !header.enabled
                })
            })

            const parameters: RequestParam[] = []
            const queryParams = request.queryParams !== null ? request.queryParams : []
            queryParams.forEach((queryParam: any) => {
                parameters.push({
                    name: queryParam.key,
                    value: queryParam.value,
                    description: queryParam.description,
                    disabled: !queryParam.enabled
                })
            })

            requests.push({
                _id: request.id,
                _type: 'request',
                method: request.method,
                url: request.url,
                name: request.name,
                body,
                headers,
                parameters,
                parentId: item.id,
                workspaceId
            })
        })

        collection.push({
            _id: item.id,
            _type: 'request_group',
            name: item.name,
            children: requests,
            parentId: null,
            workspaceId
        })
    })

    return collection
}

function handlePostmanV2CollectionItem(postmanCollectionItem: any, parentId: string | null = null, workspaceId: string) {
    const requests: CollectionItem[] = []
    const plugins: Plugin[] = []

    postmanCollectionItem.item.forEach((request: any) => {
        if(!request) {
            return
        }
        const requestId = request.id ?? nanoid()
        if('item' in request) {
            const { convertedRequests, plugins: newPlugins } = handlePostmanV2CollectionItem(request, requestId, workspaceId)
            plugins.push(...newPlugins)

            requests.push({
                _id: requestId,
                _type: 'request_group',
                name: request.name,
                children: convertedRequests,
                parentId,
                workspaceId
            })
            return
        }

        let body: RequestBody = {
            mimeType: 'No Body'
        }

        if('body' in request.request && 'mode' in request.request.body) {
            if(request.request.body.mode === 'urlencoded') {
                const params: RequestParam[] = []
                const requestData = request.request.body.urlencoded
                requestData.forEach((requestDataItem: any) => {
                    params.push({
                        name: requestDataItem.key,
                        value: requestDataItem.value,
                        description: requestDataItem.description,
                        disabled: requestDataItem.disabled
                    })
                })
                body = {
                    mimeType: 'application/x-www-form-urlencoded',
                    params
                }
            }

            if(request.request.body.mode === 'raw') {
                let mimeType = 'text/plain'

                if('options' in request.request.body && 'raw' in request.request.body.options && request.request.body.options.raw.language === 'json') {
                    mimeType = 'application/json'
                }

                if(mimeType === 'text/plain') {
                    try {
                        JSON.parse(request.request.body.raw)
                        mimeType = 'application/json'
                    } catch {}
                }

                body = {
                    mimeType: mimeType,
                    text: request.request.body.raw
                }
            }
        }

        const headers: RequestParam[] = []
        request.request.header.forEach((header: any) => {
            headers.push({
                name: header.key,
                value: header.value,
                description: header.description,
                disabled: header.disabled
            })
        })

        const parameters: RequestParam[] = []
        const queryParams = 'url' in request.request && typeof request.request.url !== 'string' && 'query' in request.request.url ? request.request.url.query : []
        queryParams.forEach((queryParam: any) => {
            parameters.push({
                name: queryParam.key,
                value: queryParam.value,
                description: queryParam.description,
                disabled: queryParam.disabled
            })
        })

        const pathParameters: RequestParam[] = []

        const pathParams = 'url' in request.request && typeof request.request.url !== 'string' && 'variable' in request.request.url ? request.request.url.variable : []
        pathParams.forEach((pathParam: any) => {
            pathParameters.push({
                name: pathParam.key,
                value: pathParam.value,
                description: pathParam.description,
                disabled: pathParam.disabled
            })
        })

        let url = ''

        if('url' in request.request) {
            url = typeof request.request.url === 'string' ? request.request.url : request.request.url.raw

            if (request.request.url && url === undefined) {
                if(request.request.url && request.request.url.host) {
                    url = request.request.url.host

                    if(request.request.url.path && request.request.url.path.length > 0) {
                        url += '/' + request.request.url.path.join('/')
                    }

                    if(request.request.url.query && request.request.url.query.length > 0) {
                        url += '?' + request.request.url.query.filter((item: any) => !item.disabled).map((query: any) => `${query.key}=${query.value}`).join('&')
                    }
                }
            }
        }

        const authentication: RequestAuthentication = convertPostmanAuthToRestSparkAuth(request.request)

        if(request.event) {
            const scriptId = nanoid()
            let preScript = ''
            let postScript = ''
            request.event.forEach((script: any) => {
                if(script.listen === 'prerequest') {
                    preScript += script.script.exec.join('\n')
                }

                if(script.listen === 'test') {
                    postScript += script.script.exec.join('\n')
                }
            })

            plugins.push({
                '_id': scriptId,
                'type': 'script',
                'name': null,
                'code': {
                    'pre_request': scriptConversion(preScript, 'postmanToRestSpark'),
                    'post_request': scriptConversion(postScript, 'postmanToRestSpark')
                },
                'collectionId': requestId,
                'workspaceId': null,
                'enabled': true,
                'createdAt': Date.now(),
                'updatedAt': Date.now()
            })
        }

        let description = undefined

        if('description' in request.request) {
            if(typeof request.request.description !== 'string' && 'content' in request.request.description) {
                description = request.request.description.content
            } else {
                description = request.request.description
            }
        }

        requests.push({
            _id: requestId,
            _type: 'request',
            method: request.request.method,
            url,
            name: request.name,
            body,
            headers,
            parameters,
            pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
            authentication,
            description,
            parentId,
            workspaceId
        })
    })

    return { convertedRequests: requests, plugins }
}

function importPostmanV2(collections: any[], workspaceId: string) {
    const collection: CollectionItem[] = []
    const plugins: Plugin[] = []

    collections.forEach(postmanCollectionItem => {
        const { convertedRequests, plugins: newPlugins } = handlePostmanV2CollectionItem(postmanCollectionItem, postmanCollectionItem.info._postman_id, workspaceId)
        plugins.push(...newPlugins)

        collection.push({
            _id: postmanCollectionItem.info._postman_id,
            _type: 'request_group',
            name: postmanCollectionItem.info.name,
            environment: 'variable' in postmanCollectionItem ? postmanCollectionItem.variable.reduce((prev: any, acc: any) => {
                prev[acc.key] = acc.value
                return prev
            }, {}) : undefined,
            children: convertedRequests,
            parentId: null,
            authentication: convertPostmanAuthToRestSparkAuth(postmanCollectionItem),
            workspaceId
        })
    })

    return { collection, plugins }
}
