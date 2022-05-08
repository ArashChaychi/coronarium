onmessage = ({data: {historicalData, allCountries, firstDay, today}}) => {
    const monthsSinceStart = getMonthsSinceStart(firstDay, today);

    const historicalManifest = historicalData
        .reduce((acc, {country, timeline}) => {
            acc[country] = timeline;
            return acc;
        }, {});

    const result = allCountries
        .reduce((acc, value) => {
            const country = value.country;

            if (!historicalManifest[country]) return acc;

            const {iso2, iso3} = value.countryInfo;
            acc[country] = {
                iso2,
                iso3,
                population: value.population,
                monthlyStats: getMonthlyStats(monthsSinceStart, historicalManifest[country])
            };

            return acc;
        }, {});



    postMessage(result);
};

function getMonthlyStats(monthsSinceStart, timeline) {
    const result = monthsSinceStart
        .reduce((acc, {monthName, month, monthIndex, year, yearShort}) => {
            const entry = {monthName, month, monthIndex, year, yearShort};

            entry.cases = getMonthStat(month, yearShort, timeline.cases);
            entry.deaths = getMonthStat(month, yearShort, timeline.deaths);

            acc.push(entry);
            return acc;
        }, []);

    return result;
}

function getMonthStat(month, yearShort, timelineEntries) {
    for (let day = 1; day <= 31; day++) {
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
    return {
        monthName: new Date(year, month).toLocaleString('en-us',{month:'short', year:'numeric'}).substr(0, 3),
        month: month + 1,
        monthIndex: month,
        year: year,
        yearShort: year % 100
    };
}
