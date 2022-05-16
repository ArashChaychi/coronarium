import { Box, IconButton, Slider } from '@mui/material';
import { PauseCircle, PlayCircle, ReplayCircleFilled } from '@mui/icons-material'
import { useState } from 'react';

const MonthSelect = ({min, max, value, step, setSelectedMonth, marks, delay = 1500}) => {
    const [playing, setPlaying] = useState(() => false);
    const [timeoutRef, setTimeoutRef] = useState(() => null);

    const playNext = (value, nextTickDelay) => {
        const ref = window.setTimeout(() => {
            const nextValue = value + 1;
            setSelectedMonth(nextValue);
            if (nextValue < max) playNext(nextValue, delay);
            else setPlaying(false);
        }, nextTickDelay)
        setTimeoutRef(ref);
    };

    const onPlay = () => {
        setPlaying(true);
        playNext(value, 0);
    };

    const onPause = () => {
        setPlaying(false);
        if (timeoutRef) {
            window.clearTimeout(timeoutRef);
            setTimeoutRef(null);
        }
    };

    const onRefresh = () => {
        setSelectedMonth(min);
    };

    return (
        <Box
            sx={{
                padding: 2,
                paddingTop: 0,
                display: 'flex',
                gap: 5
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    paddingTop: 2
                }}
            >
                <Slider
                    step={step}
                    marks={marks}
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => {
                        setSelectedMonth(e.target.value);
                    }}
                    size='small'
                    disabled={playing}
                />
            </Box>
            <Box
                sx={{

                }}
            >
                {
                    playing ?
                        <IconButton
                            color="primary"
                            onClick={onPause}
                            size='large'
                        >
                            <PauseCircle
                                fontSize='large'
                            />
                        </IconButton> :
                        <IconButton
                            color="primary"
                            onClick={onPlay}
                            size='large'
                            disabled={value === max}
                        >
                            <PlayCircle
                                fontSize='large'
                            />
                        </IconButton>
                }
                <IconButton
                    color="primary"
                    onClick={onRefresh}
                    size='large'
                    disabled={value === min || playing}
                >
                    <ReplayCircleFilled
                        fontSize='large'
                    />
                </IconButton>
            </Box>
        </Box>
    );
};

export default MonthSelect;
