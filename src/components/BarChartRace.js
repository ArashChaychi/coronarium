import ChartRace from 'react-chart-race';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const BarChartRace = ({data}) => {
    const raceBox = useRef();

    const [width, setWidth] = useState(() => 200);


    useEffect(
        () => {
            const updateWidth = () => {
                setWidth(raceBox.current.clientWidth);
            }
            updateWidth();
            window.addEventListener('resize', updateWidth);
            return () => window.removeEventListener('resize', updateWidth);
        },
        []
    );
    return (
        <Box
            ref={raceBox}
            xs={{height: '100%'}}
        >
            <ChartRace
                data={data}
                width={width}
            />
        </Box>
    )
}

export default BarChartRace;
