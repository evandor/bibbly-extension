import {FirebaseCall} from "src/services/firebase/FirebaseCall";

export class BackendApi {

  //getNotifications = (): Promise<Notification[]> => FirebaseCall.get("/notifications")

  createPdf(html: string) {
    //return FirebaseCall.post("/pdf", {"html": html}, "blob")
    // return FirebaseCall.post("http://carsten.evandor.de:5000/pdf", {"html": html}, "blob", true)
    return FirebaseCall.post("http://carsten.evandor.de:5000/pdf", {"html": html}, "blob", true)
  }

  createPng(html: string) {
    // return FirebaseCall.post("/screenshot", {"html": html}, "blob")
    return FirebaseCall.post("http://carsten.evandor.de:5000/screenshot", {"html": html}, "blob", true)
    //return Promise.reject("not implemented in bibbly")
  }

  createWarc(html: string) {
    // return FirebaseCall.post("http://carsten.evandor.de:5000/warc", {"html": html}, "blob", true)
    return FirebaseCall.post("http://127.0.0.1:8123/warc", {"html": html}, "blob", true)
  }


}

export default new BackendApi();
