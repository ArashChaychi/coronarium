import WorldMap from 'react-svg-worldmap';
import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

const Map = ({data, setHeight, getColor, setSelectedCountry}) => {
    const boundingBox = useRef();

    const [size, setSize] = useState(() => 800);

    useEffect(
        () => {
            const updateSize = () => {
                setSize(boundingBox.current.clientWidth);
                setTimeout(() => {
                    setHeight(boundingBox.current.clientHeight);
                }, 100);
            }
            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        },
        []
    );

    return (
        <Box ref={boundingBox}>
            <WorldMap
                color="red"
                tooltipBgColor="#D3D3D3"
                valueSuffix="points"
                data={data}
                size={size}
                frame
                richInteraction
                styleFunction={
                    (input) => {
                        const {countryValue} = input;
                        return {
                            fill: getColor(countryValue),
                            stroke: 'black',
                            strokeWidth: 1,
                            strokeOpacity: 1
                        }
                    }
                }
                onClickFunction={e => setSelectedCountry(e.countryName)}
            />
        </Box>
    );
};

export default Map;
