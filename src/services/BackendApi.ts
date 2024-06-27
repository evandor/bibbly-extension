export class BackendApi {

  //getNotifications = (): Promise<Notification[]> => FirebaseCall.get("/notifications")

  createPdf(html: string) {
    //return FirebaseCall.post("/pdf", {"html": html}, "blob")
    // return FirebaseCall.post("http://carsten.evandor.de:5000/pdf", {"html": html}, "blob", true)
  }

  createPng(html: string) {
    // return FirebaseCall.post("/screenshot", {"html": html}, "blob")
    //return FirebaseCall.post("http://carsten.evandor.de:5000/screenshot", {"html": html}, "blob", true)
    return Promise.reject("not implemented in bibbly")
  }
}

export default new BackendApi();
