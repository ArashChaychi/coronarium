import { Box, Typography } from '@mui/material';


const Legend = ({data}) => {
    return (
        <Box
            sx={{
                position: 'absolute',
                height: 200,
                bottom: 20,
                left: 10,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(255, 255, 255, .5)'
            }}
        >
            {
                data
                    .map(
                        (item, index) => {
                            return (
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        position: 'relative',
                                        height: 24,
                                        minWidth: 100
                                    }}
                                    key={index}
                                >
                                    <Box
                                        sx={{
                                            height: 24,
                                            width: 24,
                                            backgroundColor: item[0],
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0
                                        }}
                                    >
                                    </Box>
                                    <Typography
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 30
                                        }}
                                    >
                                        {
                                            item[1]
                                        }
                                    </Typography>
                                </Box>
                            );
                        }
                    )
            }
        </Box>
    );
};

export default Legend;
