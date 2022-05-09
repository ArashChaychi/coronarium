import API from './api/API';
import { useEffect, useState } from 'react';

const App = () => {
    const api = new API();

    const [dataLoaded, setDataLoaded] = useState(() => false);
    const [countryData, setCountryData] = useState(() => null);
    const [months, setMonths] = useState(() => []);

    console.log(dataLoaded);
    console.log(countryData);
    console.log(months);

    useEffect(() => {
        const firstDay = new Date(2020, 0, 22);
        const today = new Date();

        const difference = today.getTime() - firstDay.getTime();
        const daysSinceStart = difference / (1000 * 3600 * 24);

        Promise.all(
            [
                api.getHistoricalData(daysSinceStart),
                api.getAllCountries()
            ]
        ).then(([historicalData, allCountries]) => {
            const worker = new Worker('./dataAdapter.js');
            worker.postMessage(JSON.parse(JSON.stringify({historicalData, allCountries, firstDay, today})));
            worker.onmessage = ({data: {monthsSinceStart, countryData}}) => {
                setCountryData(countryData);
                setMonths(monthsSinceStart);
                setDataLoaded(true);
            };
        });

    }, []);


    return (
        <div className="App">
            ready?
        </div>
    );
}

export default App;
