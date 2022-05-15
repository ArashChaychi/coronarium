import { cloneElement, Fragment } from 'react';
import { AppBar, CssBaseline, Toolbar, Typography } from '@mui/material';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { grey, deepPurple } from '@mui/material/colors';

function ElevationScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
        target: window ? window() : undefined,
    });

    return cloneElement(children, {
        elevation: trigger ? 4 : 0,
    });
}


const TopBar = (props) => {
    return (
        <Fragment>
            <CssBaseline />
            <ElevationScroll {...props}>
                <AppBar sx={{backgroundColor: grey[300], color: deepPurple[600]}}>
                    <Toolbar>
                        <Typography variant="h4" component="div" fontWeight='bold'>
                            Coronarium
                        </Typography>
                    </Toolbar>
                </AppBar>
            </ElevationScroll>
            <Toolbar />
        </Fragment>
    );
};

export default TopBar;
