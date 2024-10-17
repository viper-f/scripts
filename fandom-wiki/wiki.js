class Wiki {
    constructor() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.main = urlParams.get('fpid')
        this.parser = new DOMParser();
        this.mainDoc = null;
        this.mybb_api = new MybbAPI();
    }

    async loadMain() {
        if(!this.mainDoc) {
            const mainData = await this.loadData(this.main)
            const mainDoc = this.parser.parseFromString(mainData, 'text/html');
            this.mainDoc = mainDoc;

            for (const id of ['navigation', 'header']) {
                document.getElementById(id).innerHTML = mainDoc.getElementById(id).innerHTML
            }
        }
    }

    async loadPage() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const page = urlParams.get('ppid')
        if (!page) {
            document.getElementById('content').innerHTML = this.mainDoc.getElementById('content').innerHTML
        } else {
            const data = await this.loadData(page)
         //   const doc = this.parser.parseFromString(data, 'text/html');
            document.getElementById('content').innerHTML = data;
        }
    }

    // async loadData(address) {
    //     return await fetch('/scripts/fandom-wiki/' + address)
    //         .then((response) => {return response.text()})
    //         .then((data) => {return data})
    // }

    async loadData(ppid) {
        const post = await this.mybb_api.getPostById(ppid, ['message'])
        return post['message']
    }
}