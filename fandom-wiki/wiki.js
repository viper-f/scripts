export default class Wiki {
    constructor() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.main = urlParams.get('fpid')
        this.page = urlParams.get('ppid')
    }

    async loadMain() {
        const mainData = await this.loadData(this.main)
        const parser = new DOMParser();
        const mainDoc = parser.parseFromString(mainData, 'text/html');

        for (const id of ['navigation', 'header']) {
            document.getElementById(id).innerHTML = mainDoc.getElementById(id).innerHTML
        }
    }

    async loadData(address) {
        return await fetch('/scripts/fandom-wiki/' + address)
            .then((response) => {return response.text()})
            .then((data) => {return data})
    }
}