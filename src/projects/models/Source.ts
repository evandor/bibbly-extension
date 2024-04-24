
export class Source {
  id: string

  name: string
  private created: number;
  private updated: number;
  private url: string;

  constructor(id: string, name: string, url: string) {

    // assignments
    this.id = id
    this.name = name
    this.url = url
    this.created = new Date().getTime()
    this.updated = new Date().getTime()
  }


}
