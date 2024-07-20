import {useThumbnailsService} from "src/thumbnails/services/ThumbnailsService";

/**
 * meant for inter-submodule communication.
 *
 * We cannot use runtime messages for this, neither bex events. Submodule A can create an Event and let
 * this class dispatch it. Depending on the event name, different functions of other submodules can be
 * called.
 *
 * This class has to be implemented once-per-application if this kind of dispatch is needed.
 */
class AppEventDispatcher {

  dispatchEvent(name: string, params: object) {
    //console.debug(" >>> dispatching event", name, params)
    try {

      switch (name) {
        case 'add-to-search':
          break
        case 'upsert-in-search':
          break
        case 'capture-screenshot':
          useThumbnailsService().handleCaptureCallback(params['tabId' as keyof object], params['data' as keyof object])
          break
        case 'remove-captured-screenshot':
          useThumbnailsService().removeThumbnailsFor(params['tabId' as keyof object])
          break
        default:
          console.log(`unknown event ${name}`)
      }
    } catch (err) {
      console.warn("problem dispatching event: ", err)
    }
  }

}

export default new AppEventDispatcher();
