class API {
    constructor() {
        this.baseUrl = 'https://corona.lmao.ninja/v2';
    }

    async getHistoricalData(lastDays) {
        const url = this.baseUrl + `/historical?lastdays=${lastDays}`;
        const response = await fetch(url);
        const toJson = await response.json();
        return toJson;
    }

    async getAllCountries() {
        const url = this.baseUrl + '/countries';
        const response = await fetch(url);
        const toJson = await response.json();
        return toJson;
    }
}

export default API;
