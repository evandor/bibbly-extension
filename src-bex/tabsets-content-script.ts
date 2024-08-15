/**
 * This script is meant to be added automatically to every page as defined in manifest.json.
 * There is no need to dynamically add it in BrowserListeners or similar pages.
 */

import {bexContent} from 'quasar/wrappers'

export default bexContent((bridge: any) => {

  // @ts-ignore
  if (window.contentScriptAnalysisAlredyCalled) {
    // https://stackoverflow.com/questions/23208134/avoid-dynamically-injecting-the-same-script-multiple-times-when-using-chrome-tab
    //console.debug("stopping execution of tabsets-content-script as it is already setup")
    return
  }

  console.log("tabsets: initializing bibbly default content script")
  // @ts-ignore
  window.contentScriptAnalysisAlredyCalled  = true


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request === 'getExcerpt') {
      console.log("tabsets: got request 'getExcerpt'")
      const responseMessage = {
        doctype: document.doctype  ? new XMLSerializer().serializeToString(document.doctype) : '',
        html: document.documentElement.outerHTML,
        metas: getMetas(document)
      }
      console.log("tabsets: received message for content, html size:", responseMessage.html.length, responseMessage.metas)
      sendResponse(responseMessage);
    } else {
      sendResponse({content: "unknown request in tabsets-content-scripts: " + request});
    }
    return true
  })

  function getMetas(document: Document) {
    const result: { [k: string]: string } = {}
    //const res: string[] = []
    const metaNodes: NodeList = document.querySelectorAll('meta')
    metaNodes.forEach((node: Node) => {
      const element = <Element>node
      //console.log("node", <Element>node)
      const nameAttr = element.attributes.getNamedItem('name')
      const propAttr = element.attributes.getNamedItem('property')
      const contAttr = element.attributes.getNamedItem('content')
      const key: string = nameAttr ? (nameAttr.value.trim().toLowerCase() || 'undefName') : (propAttr?.value || 'undefProp')
      //console.log("tabsets: key", key, contAttr?.value || 'x')
      if (key) {
        result[key] = contAttr?.value || ''
      }
      // res.push((element.attributes.getNamedItem('name')?.textContent) || 'undef')
    })
    return result
  }

  // function getAnchors(document: Document) {
  //   const result: { [k: string]: number } = {}
  //   const linkNodes: NodeList = document.querySelectorAll('a')
  //   linkNodes.forEach((node: Node) => {
  //     const element = <Element>node
  //     const hrefAttr = element.attributes.getNamedItem('href')
  //     if (hrefAttr && hrefAttr.value.trim() !== "") {
  //       const key: string = hrefAttr.value
  //       if (result[key]) {
  //         result[key] = result[key] + 1
  //       } else {
  //         result[key] = 1
  //       }
  //     }
  //   })
  //   return result
  // }
  //
  // function getLinks(document: Document) {
  //   const result: object[] = []
  //   const linkNodes: NodeList = document.querySelectorAll('link')
  //   linkNodes.forEach((node: Node) => {
  //     const element = <Element>node
  //     const titleAttr = element.attributes.getNamedItem('title')
  //     const hrefAttr = element.attributes.getNamedItem('href')
  //     const typeAttr = element.attributes.getNamedItem('type')
  //     const relAttr = element.attributes.getNamedItem('rel')
  //     if (hrefAttr && hrefAttr.value.trim() !== "") {
  //       result.push({
  //         title: titleAttr?.value || '',
  //         href: hrefAttr?.value || '',
  //         type: typeAttr?.value || '',
  //         rel: relAttr?.value || ''
  //       })
  //     }
  //   })
  //   return result
  // }

})
