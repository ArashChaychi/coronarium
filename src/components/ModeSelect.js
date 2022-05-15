import { Box } from '@mui/material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';


const ModeSelect = ({modes, mode, setMode}) => {
    return (
        <Box>
            <Stack
                direction='row'
                spacing={1}
            >
                {
                    Object.entries(modes)
                        .map(([key, item], index) => {
                            return (
                                <Chip
                                    key={index}
                                    label={item}
                                    variant={item === mode ? 'filled' : 'outlined'}
                                    color='primary'
                                    onClick={() => setMode(modes[key])}
                                />
                            );
                        })
                }
            </Stack>
        </Box>
    );
};

export default ModeSelect;
