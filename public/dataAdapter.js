onmessage = ({data: {historicalData, allCountries, firstDay, today}}) => {
    const monthsSinceStart = getMonthsSinceStart(firstDay, today);

    const historicalManifest = historicalData
        .reduce((acc, {country, timeline}) => {
            acc[country] = timeline;
            return acc;
        }, {});

    const countryDataAdded = monthsSinceStart
        .map((item, index, arr) => {
            const {month, yearShort} = item;
            const stats = {};

            allCountries
                .forEach((entry => {
                    const {country, population} = entry;
                    if (!historicalManifest[country]) return;

                    const {iso2, iso3} = entry.countryInfo;

                    if (!iso3 || !iso2) return;

                    const totalCases = getMonthStat(month, yearShort, historicalManifest[country].cases);
                    const totalDeaths = getMonthStat(month, yearShort, historicalManifest[country].deaths);

                    const newCases = index === 0 ?
                        totalCases :
                        totalCases - getMonthStat(arr[index - 1].month, arr[index - 1].yearShort, historicalManifest[country].cases);

                    const newDeaths = index === 0 ?
                        totalDeaths :
                        totalDeaths - getMonthStat(arr[index - 1].month, arr[index - 1].yearShort, historicalManifest[country].deaths);

                    stats[country] = {
                        iso2,
                        iso3,
                        population,
                        totalCases,
                        totalDeaths,
                        newCases,
                        newDeaths,
                        newCasesPer100k: newCases * 100000 / population,
                        newDeathsPer100k: newDeaths * 100000 / population,
                    };
                }));

            return {
                ...item,
                stats
            };
        });


    const revisedCountryDataAdded = Object
        .fromEntries(
            countryDataAdded
                .map(({monthLabel, stats}) => [monthLabel, stats])
        );


    // const result = allCountries
    //     .reduce((acc, value) => {
    //         const country = value.country;
    //
    //         if (!historicalManifest[country]) return acc;
    //
    //         const {iso2, iso3} = value.countryInfo;
    //         acc[country] = {
    //             iso2,
    //             iso3,
    //             population: value.population,
    //             monthlyStats: getMonthlyStats(monthsSinceStart, historicalManifest[country])
    //         };
    //
    //         return acc;
    //     }, {});



    postMessage({
        monthsSinceStart,
        countryData: revisedCountryDataAdded
    });
};

function getMonthlyStats(monthsSinceStart, timeline) {
    return monthsSinceStart
        .reduce((acc, {monthName, month, monthIndex, year, yearShort}) => {
            const entry = {monthName, month, monthIndex, year, yearShort};

            entry.cases = getMonthStat(month, yearShort, timeline.cases);
            entry.deaths = getMonthStat(month, yearShort, timeline.deaths);

            acc.push(entry);
            return acc;
        }, []);
}

function getMonthStat(month, yearShort, timelineEntries) {
    for (let day = 31; day >= 1; day--) {
        const dateStr = `${month}/${day}/${yearShort}`;
        if (timelineEntries[dateStr]) return timelineEntries[dateStr];
    }
    return 0;
}

function getMonthsSinceStart(firstDay, today) {
    const firstDayDate = new Date(firstDay);
    const todayDate = new Date(today);

    const yearStarted = firstDayDate.getFullYear();
    const monthStarted = firstDayDate.getMonth();


    const yearNow = todayDate.getFullYear();
    const monthNow = todayDate.getMonth();

    const months = [];

    let yearCounter = yearStarted;
    let monthCounter = monthStarted;

    while (yearCounter < yearNow || (yearCounter === yearNow && monthCounter <= monthNow)) {
        months.push(createMonth(monthCounter, yearCounter));
        if (monthCounter < 11) {
            monthCounter++;
        } else {
            monthCounter = 0;
            yearCounter++;
        }
    }

    return months;
}

function createMonth(month, year) {
    const monthName = new Date(year, month).toLocaleString('en-us',{month:'short', year:'numeric'}).substr(0, 3);
    return {
        monthName,
        month: month + 1,
        monthIndex: month,
        year: year,
        yearShort: year % 100,
        monthLabel: `${monthName} ${year}`
    };
}
