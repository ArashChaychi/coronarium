import API from './api/API';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopBar from './components/TopBar';
import { Autocomplete, Box, CircularProgress, TextField, Toolbar, Typography } from '@mui/material';
import MonthSelect from './components/MonthSelect';
import Map from './components/Map';
import BarChartRace from './components/BarChartRace';
import ModeSelect from './components/ModeSelect';
import Legend from './components/Legend';
import Chart from './components/Chart';

const App = () => {
    const api = new API();

    const [dataLoaded, setDataLoaded] = useState(() => false);
    const [countryData, setCountryData] = useState(() => null);
    const [months, setMonths] = useState(() => []);
    const [selectedMonth, setSelectedMonth] = useState(() => 0);
    const [height, setHeight] = useState(() => 400);
    const [mode, setMode] = useState(() => modes.NEW_CASES);
    const [selectedCountry, setSelectedCountry] = useState(() => 'Finland');
    const countryChart = useRef();

    const scrollChartIntoView = () => {
        if (!countryChart.current) return;
        countryChart.current.scrollIntoView({
            behavior: "smooth",
        });
    };

    const countries = useMemo(
        () => {
            if (!dataLoaded) return [];
            return Object.fromEntries(
                Object.entries(Object.entries(countryData)[0][1])
                    .map(([country, props]) => [country, props.iso2])
            );
        },
        [dataLoaded]
    );


    const mapData = useMemo(
        () => {
            return dataLoaded ? mapDataAdapter(countryData[months[selectedMonth].monthLabel], mode) : [];
        },
        [selectedMonth, dataLoaded, mode]
    );

    const getColor = useCallback(
        (() => {
            switch (mode) {
                case modes.NEW_CASES:
                default:
                    return getColorForNewCases;
                case modes.NEW_DEATHS:
                    return getColorForNewDeaths;
                case modes.TOTAL_DEATHS:
                    return getColorForTotalDeaths;
                case modes.TOTAL_CASES:
                    return getColorForTotalCases;
            }
        })(),
        [mode]
    );

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
            // const worker = new Worker('./coronarium/dataAdapter.js'); // for dev
            worker.postMessage(JSON.parse(JSON.stringify({historicalData, allCountries, firstDay, today})));
            worker.onmessage = ({data: {monthsSinceStart, countryData}}) => {
                setCountryData(countryData);
                setMonths(monthsSinceStart);
                setDataLoaded(true);
            };
        });
    }, []);

    const onChange = (_, value, __) => {
        if (value) setSelectedCountry(value);
        scrollChartIntoView();
    };


    const onSetCountry = countryCode => {
        const country = Object.entries(countries)
            .find(([name, code]) => code === countryCode);

        if (country) setSelectedCountry(country[0]);
        scrollChartIntoView();
    };

    const countryChartData = useMemo(
        () => {
            if (!dataLoaded) return [];
            return [
                {
                    id: mode,
                    data: months
                        .map(month => {
                            const { monthLabel } = month;
                            const monthDataForCountry = countryData[monthLabel][selectedCountry];
                            let y = 0;
                            switch (mode) {
                                case modes.TOTAL_CASES:
                                    y = monthDataForCountry.totalCasesPer100k;
                                    break;
                                case modes.TOTAL_DEATHS:
                                    y = monthDataForCountry.totalDeathsPer100k;
                                    break;
                                case modes.NEW_CASES:
                                    y = monthDataForCountry.newCasesPer100k;
                                    break;
                                case modes.NEW_DEATHS:
                                    y = monthDataForCountry.newDeathsPer100k;
                                    break;
                            }
                            return {
                                x: monthLabel,
                                y
                            };
                        })
                }
            ];
        },
        [selectedCountry, dataLoaded, mode]
    );


    return (
        <div className="App">
            <TopBar />
            {
                dataLoaded &&
                <Box
                    className="container"
                    sx={{padding: 4, paddingTop: 2}}
                >
                    <Box
                        sx={{
                            marginBottom: 2
                        }}
                    >
                        <Typography
                            gutterBottom
                        >
                            {
                                introText
                            }
                        </Typography>
                    </Box>
                    <ModeSelect
                        modes={modes}
                        mode={mode}
                        setMode={setMode}
                    />
                    <Box
                        sx={{
                            marginTop: 3
                        }}
                    >
                        <Typography
                            variant='h4'
                        >
                            {
                                months[selectedMonth].monthLabel
                            }
                        </Typography>
                    </Box>
                    <MonthSelect
                        min={0}
                        max={months.length - 1}
                        value={selectedMonth}
                        step={1}
                        setSelectedMonth={setSelectedMonth}
                        marks={
                            months
                                .map((x, i) => ({
                                    value: i,
                                    label: i % 3 === 0 ? x.monthLabel : ''
                                }))
                        }
                    />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'calc(70% - 24px) 30%',
                            gap: 3
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative'
                            }}
                        >
                            <Map
                                data={mapData.data}
                                setHeight={setHeight}
                                getColor={getColor}
                                onSelectCountry={onSetCountry}
                            />
                            <Legend
                                data={mapData.legend}
                            />
                        </Box>
                        <Box
                            sx={{
                                height: height,
                                overflow: 'hidden'
                            }}
                        >
                            <BarChartRace
                                data={mapData.data.map(item => ({...item, title: item.countryName})).filter(item => item.population >= 5000000)}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            marginTop: 2
                        }}
                    >
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={(Object.entries(countries).map(([key, value]) => key))}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="Country" />}
                            value={selectedCountry}
                            autoHighlight
                            onChange={onChange}
                        />
                    </Box>
                    <Box
                        ref={countryChart}
                        sx={{
                            marginTop: 2,
                            height: 400
                        }}
                    >
                        <Chart
                            data={countryChartData}
                        />
                    </Box>
                </Box>
            }
            {
                !dataLoaded &&
                <Box
                    sx={{
                        height: 'calc(100% - 64px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <CircularProgress
                        size={80}
                    />
                </Box>
            }
        </div>
    );
}

export default App;

const modes = {
    NEW_CASES: 'New Cases per 100K',
    NEW_DEATHS: 'New Deaths per 100K',
    TOTAL_CASES: 'Total Cases per 100K',
    TOTAL_DEATHS: 'Total Deaths per 100K'
};

const colors = {
    darkRed: '#a50026',
    red: '#d73027',
    orange: '#fdae61',
    yellow: '#d9ef8b',
    lightGreen: '#66bd63',
    darkGreen: '#006837',
};

const mapDataAdapter = (data, mode) => {
    const {red, darkRed, orange, darkGreen, lightGreen, yellow} = colors;
    switch (mode) {
        case modes.NEW_DEATHS:
            return {
                data: Object.entries(data)
                    .map(([country, value], index) => {
                        const countryValue = Math.round((value.newDeathsPer100k + Number.EPSILON) * 100) / 100;
                        return {
                            country: value.iso2.toLowerCase(),
                            value: countryValue,
                            countryName: country,
                            population: value.population,
                            id: index,
                            color: getColorForNewDeaths(countryValue)
                        };
                    }),
                legend: [
                    [darkGreen, '<1'],
                    [lightGreen, '>1'],
                    [yellow, '>3'],
                    [orange, '>5'],
                    [red, '>10'],
                    [darkRed, '>20'],
                ]
            }
        case modes.TOTAL_DEATHS:
            return {
                data: Object.entries(data)
                    .map(([country, value], index) => {
                        const countryValue = Math.round((value.totalDeathsPer100k + Number.EPSILON) * 100) / 100;
                        return {
                            country: value.iso2.toLowerCase(),
                            value: countryValue,
                            countryName: country,
                            population: value.population,
                            id: index,
                            color: getColorForTotalDeaths(countryValue)
                        };
                    }),
                legend: [
                    [darkGreen, '<10'],
                    [lightGreen, '>10'],
                    [yellow, '>20'],
                    [orange, '>50'],
                    [red, '>100'],
                    [darkRed, '>200'],
                ]
            }
        case modes.TOTAL_CASES:
            return {
                data: Object.entries(data)
                    .map(([country, value], index) => {
                        const countryValue = Math.round((value.totalCasesPer100k + Number.EPSILON) * 100) / 100;
                        return {
                            country: value.iso2.toLowerCase(),
                            value: countryValue,
                            countryName: country,
                            population: value.population,
                            id: index,
                            color: getColorForTotalCases(countryValue)
                        };
                    }),
                legend: [
                    [darkGreen, '<500'],
                    [lightGreen, '>100'],
                    [yellow, '>500'],
                    [orange, '>5000'],
                    [red, '>10000'],
                    [darkRed, '>20000'],
                ]
            }
        case modes.NEW_CASES:
        default:
            return {
                data: Object.entries(data)
                    .map(([country, value], index) => {
                        const countryValue = Math.round((value.newCasesPer100k + Number.EPSILON) * 100) / 100;
                        return {
                            country: value.iso2.toLowerCase(),
                            value: countryValue,
                            countryName: country,
                            population: value.population,
                            id: index,
                            color: getColorForNewCases(countryValue)
                        };
                    }),
                legend: [
                    [darkGreen, '<100'],
                    [lightGreen, '>100'],
                    [yellow, '>300'],
                    [orange, '>500'],
                    [red, '>1000'],
                    [darkRed, '>1500'],
                ]
            }
    }
};

const getColorForNewCases = value => {
    const {red, darkRed, orange, darkGreen, lightGreen, yellow} = colors;
    return value >= 1500 ? darkRed :
        value >= 1000 ? red :
            value >= 500 ? orange :
                value >= 300 ? yellow :
                    value >= 100 ? lightGreen :
                        darkGreen;
}

const getColorForNewDeaths = value => {
    const {red, darkRed, orange, darkGreen, lightGreen, yellow} = colors;
    return value >= 20 ? darkRed :
        value >= 10 ? red :
            value >= 5 ? orange :
                value >= 3 ? yellow :
                    value >= 1 ? lightGreen :
                        darkGreen;
}

const getColorForTotalDeaths = value => {
    const {red, darkRed, orange, darkGreen, lightGreen, yellow} = colors;
    return value >= 200 ? darkRed :
        value >= 100 ? red :
            value >= 50 ? orange :
                value >= 20 ? yellow :
                    value >= 10 ? lightGreen :
                        darkGreen;
}

const getColorForTotalCases = value => {
    const {red, darkRed, orange, darkGreen, lightGreen, yellow} = colors;
    return value >= 20000 ? darkRed :
        value >= 10000 ? red :
            value >= 5000 ? orange :
                value >= 500 ? yellow :
                    value >= 100 ? lightGreen :
                        darkGreen;
}

const introText = `
This dashboard is designed to show the propagation flow of the COVID-19 virus 
in the world. You can select the desired statistic using the buttons below ( 
new or total cases/deaths, normalized to amount per 100,000 population.) The slider 
can be used to control the time since the pandemic started, and the buttons to the right 
of the slider can be used to see it as an animation. You can double click on the map to 
change the zoom level, or click on any country to view country specific data.
`;
