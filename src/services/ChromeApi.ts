import NavigationService from "src/services/NavigationService";
import IndexedDbPersistenceService from "src/services/IndexedDbPersistenceService";
import {usePermissionsStore} from "src/stores/permissionsStore";
import {uid} from "quasar";
import {Router} from "vue-router";
import {useTabsetsStore} from "src/tabsets/stores/tabsetsStore";
import {Tabset} from "src/tabsets/models/Tabset";
import _ from "lodash"

const persistenceService = IndexedDbPersistenceService


class ChromeApi {

    init(router: Router) {

        if (process.env.MODE !== 'bex') {
            return
        }

        console.debug(" ...initializing ChromeApi")

        chrome.runtime.onUpdateAvailable.addListener(
            (details: any) => {
                NavigationService.updateAvailable(details)
            }
        )

    }

  buildContextMenu(caller: string) {
    if (process.env.MODE !== 'bex') {
      return
    }

    if (chrome && chrome.contextMenus) {
      chrome.contextMenus.removeAll(
        () => {
          console.debug("creating contextmenu for tabset_extension")
          chrome.contextMenus.create({
              id: 'tabset_extension',
              title: 'Tabsets Extension',
              documentUrlPatterns: ['https://*/*', 'https://*/'],
              contexts: ['all']
            },
            () => {
              // chrome.contextMenus.create({
              //   id: 'open_tabsets_page',
              //   parentId: 'tabset_extension',
              //   title: 'Open Tabsets Extension',
              // documentUrlPatterns: ['https://*/*', 'https://*/'],
              //   contexts: ['all']
              // })
              // if (useFeaturesStore().hasFeature(FeatureIdent.WEBSITE_CLIP)) {
              //   console.debug(" > context menu: website_clip")
              //   chrome.contextMenus.create({
              //     id: 'website_clip',
              //     parentId: 'tabset_extension',
              //     title: 'Create Website Clip',
              //     documentUrlPatterns: ['https://*/*', 'https://*/'],
              //     contexts: ['all']
              //   })
              // }
              // chrome.contextMenus.create({
              //   id: 'website_quote',
              //   parentId: 'tabset_extension',
              //   title: 'Create Website Quote',
              // documentUrlPatterns: ['https://*/*', 'https://*/'],
              //   contexts: ['all']
              // })
              //}
              console.debug(" > context menu: save_to_currentTS")
              chrome.contextMenus.create({
                id: 'save_to_currentTS',
                parentId: 'tabset_extension',
                title: 'Save to current Tabset (' + useTabsetsStore().currentTabsetName + ')',
                documentUrlPatterns: ['https://*/*', 'https://*/'],
                contexts: ['all']
              })


              console.debug(` > context menu: save_as_tabset for ${useTabsetsStore().tabsets.size} tabset(s)`)
              const allTabsets = [...useTabsetsStore().tabsets.values()] as Tabset[]

              if (allTabsets.length > 0) {
                chrome.contextMenus.create({
                  id: 'separator',
                  parentId: 'tabset_extension',
                  type: 'separator',
                  documentUrlPatterns: ['https://*/*', 'https://*/'],
                  contexts: ['all']
                })
              }

              if (allTabsets.length > 15) {
                const result = _(allTabsets)
                  .groupBy(o => (o.name && o.name.length > 0) ? o.name[0].toUpperCase() : ' ')
                  .map((tabsets, firstLetter) => ({firstLetter, tabsets}))
                  .sortBy(r => r.firstLetter)
                  .value();

                _.forEach(result, (r) => {
                  chrome.contextMenus.create({
                    id: 'save_as_tab_folder|' + r.firstLetter,
                    parentId: 'tabset_extension',
                    title: 'Save to Tabset ' + r.firstLetter + '...',
                    documentUrlPatterns: ['https://*/*', 'https://*/'],
                    contexts: ['all']
                  })

                  _.forEach(_.sortBy(r.tabsets, ['name']), (ts: Tabset) => {
                    this.createSubmenu(ts, 'save_as_tab_folder|' + r.firstLetter, ts.name)
                  })

                })
              } else {
                _.forEach(_.sortBy(allTabsets, ['name']), (ts: Tabset) => {
                  this.createSubmenu(ts, 'tabset_extension', 'Save to Tabset ' + ts.name)
                })
              }
              //chrome.contextMenus.create({id: 'capture_text', parentId: 'tabset_extension', title: 'Save selection as/to Tabset', contexts: ['all']})

            })
        }
      )
      chrome.contextMenus.onClicked.addListener(
        (e: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
          //console.log("listening to", e, tab)
          if (e.menuItemId === "open_tabsets_page") {
            chrome.tabs.query({title: `Tabsets Extension`}, (result: chrome.tabs.Tab[]) => {
              if (result && result[0]) {
                chrome.tabs.highlight({tabs: result[0].index});
              } else {
                // const selfId = localStorage.getItem("selfId")
                // if (selfId) {
                chrome.tabs.create({
                  active: true,
                  pinned: false,
                  //url: "chrome-extension://" + selfId + "/www/index.html#/start"
                  url: chrome.runtime.getURL("www/index.html#/start")
                })
                // }
              }
            })
          } else if (e.menuItemId === "website_clip") {
            console.log("creating Clip", tab)
            if (tab && tab.id) {
             // this.executeClippingJS(tab.id)
            }
          } else if (e.menuItemId === 'save_to_currentTS') {
            const tabId = tab?.id || 0
            const currentTsId = useTabsetsStore().currentTabsetId
            if (currentTsId) {
             // this.executeAddToTS(tabId, currentTsId)
            }
          } else if (e.menuItemId === 'annotate_website') {
            console.log("creating annotation JS", tab)
            if (tab && tab.id) {
             // this.executeAnnotationJS(tab.id)
            }
          } else if (e.menuItemId.toString().startsWith("save_as_tab|")) {
            //console.log("got", e, e.menuItemId.split("|"))
            const tabId = tab?.id || 0
            const tabsetId = e.menuItemId.toString().split("|")[1]
            console.log("got tabsetId", tabsetId, e.menuItemId)
            //this.executeAddToTS(tabId, tabsetId)
          } else if (e.menuItemId.toString().startsWith("move_to|")) {
            console.log("got", e, e.menuItemId.toString().split("|"))
            const tabId = tab?.id || 0
            const windowId = e.menuItemId.toString().split("|")[1]
            console.log("got windowId", tabId, windowId)
            //this.executeMoveToWindow(tabId, Number(windowId))
          }
        })
    }

  }

  private createSubmenu(ts: Tabset, parentId: string, title: string) {
    chrome.contextMenus.create({
      id: 'save_as_tab|' + ts.id,
      parentId,
      title,
      documentUrlPatterns: ['https://*/*', 'https://*/'],
      contexts: ['all']
    })
  }


  createChromeBookmarkObject(title: string, url: string, favIconUrl: string) {
        return {
            id: uid(),
            active: false,
            discarded: true,
            // @ts-ignore
            groupId: -1,
            autoDiscardable: true,
            favIconUrl: favIconUrl,
            index: 0,
            highlighted: false,
            title: title,
            pinned: false,
            url: url,
            windowId: 0,
            incognito: false,
            selected: false
        }
    }

    createFolderNode(title: string, children: chrome.bookmarks.BookmarkTreeNode[] | undefined = undefined): chrome.bookmarks.BookmarkTreeNode {
        // index?: number | undefined;
        // dateAdded?: number | undefined;
        // dateGroupModified?: number | undefined;
        // parentId?: string | undefined;
        return {
            id: uid(),
            title,
            url: undefined,
            children
        }
    }

    createBmNode(title: string, url: string, children: chrome.bookmarks.BookmarkTreeNode[] | undefined = undefined): chrome.bookmarks.BookmarkTreeNode {
        return {
            id: uid(),
            title,
            url: url,
            children
        }
    }


  createChromeTabObject(title: string, s: string, s2: string):chrome.tabs.Tab {
   throw new Error("not implemented")
  }
}

export default new ChromeApi();

