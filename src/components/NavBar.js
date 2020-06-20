import React, {useEffect, Suspense} from 'react'
import {Link, useHistory} from 'react-router-dom'
import { Button, Typography, Toolbar, AppBar, Menu, MenuItem, Grid, TextField, InputAdornment, 
    ClickAwayListener, makeStyles, IconButton, Avatar, Paper, Popper, Grow, MenuList } from '@material-ui/core'
import {ShoppingCart, Search, ArrowForwardIos} from '@material-ui/icons'
import config from '../config'
import queryString from 'query-string'
const axios = require('axios').default;

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      zIndex: 50,
      position: 'relative',
    },
    paper: {
      padding: theme.spacing(2),
    },
    large: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        marginTop: '10px',
        marginRight: '10px',
        overflow: 'hidden',
    }
  }));

export default function NavBar(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [cartItems, setCartItems] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [userImg, setUserImg] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [userName, setUserName] = React.useState('Avatar');
    const anchorRef = React.useRef(null);
    let history = useHistory();
    useEffect(() => {
        if(localStorage.getItem('token') && (props.page !== "/login" && props.page !== "/register")) {
            getCartItemNumber();
        }
    }, []);
    const classes = useStyles();
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }
    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    }
    const handleClose2 = event => {
        if(anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    }
    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
          event.preventDefault();
          setOpen(false);
        }
    }
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);
    function loadAvatar() {
        var user = {};
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/user/get_data`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        })
        .then((response) => {
            user = response.data;
            setUserName(user.username);
            setUserImg(user.prof_pic_path);
        })
        .catch((error) => {
            console.log(error);
        })
    }
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }
    const handleClose = () => {
        setAnchorEl(null);
    }
    const search = () => {
        history.push(`/search?q=${searchQuery}`);
    }
    const goBack = () => {
        let location = window.location.href;
        let params = queryString.parse(location.slice(location.indexOf('?')));
        if(params.returnTo) history.push(params.returnTo);
        else history.push("/");
    }
    function getCartItemNumber() {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/cart/info`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        })
        .then((response) => {
            setCartItems(response.data.item_count);
            loadAvatar();
        })
        .catch((error) => {
            localStorage.removeItem('token');
            setCartItems(0);
            setUserName(userName);
        })
    }
    if(props.page === "/login" || props.page === "/register") {
        return (
            <div className={classes.root}>
                <AppBar position="static" style={{background: "#44acfc"}}>
                    <Toolbar>
                        <Button variant="contained" color="secondary" onClick={goBack}>
                            Return
                        </Button>
                    </Toolbar>
                </AppBar>
            </div>
        )
    } else if (localStorage.getItem('token'))
    return (
    <div className={classes.root}>
    <AppBar position="static" style={{background: "#44acfc"}}>
        <Toolbar>
        <Grid container direction="row" justify="space-between" alignItems="center">
        <Grid item>
        <Link to="/cart">
        <Button variant="contained" color="default">
            <ShoppingCart color="primary" />Cart - {JSON.stringify(cartItems)}
        </Button></Link>
        </Grid>
        <Grid item>
        <Button aria-controls="simple-menu" variant="contained" color="default"
            aria-haspopup="true" onClick={handleClick}>
            Explore
        </Button>
        <Menu 
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
        >
            <a href="/explore/part"><MenuItem onClick={handleClose}>Parts</MenuItem></a>
            <a href="/explore/bin"><MenuItem onClick={handleClose}>Bins</MenuItem></a>
            <a href="/explore/storage"><MenuItem onClick={handleClose}>Storage Containers</MenuItem></a>
            <a href="/explore/category"><MenuItem onClick={handleClose}>Categories</MenuItem></a>
        </Menu>
        </Grid>
        <Grid item>
        <TextField id="search-input-toolbar" className={classes.root} size="medium" color="primary" onChange={event => setSearchQuery(event.target.value)} 
            label="Search items" InputProps={{
            startAdornment: (
                <InputAdornment position="start" color="primary">
                    <Search />
                </InputAdornment>
            ),}}/>
        <IconButton aria-label="go" onClick={search}>
            <ArrowForwardIos />
        </IconButton>
        </Grid>
        <Grid item>
            <Link to="/checkin">
            <Button variant="contained" color="secondary">
                Check in Items
            </Button></Link>
        </Grid>
        <Suspense fallback={<h6>Loading avatar...</h6>}>
        <Grid item>
            <Button ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}>
                    <Avatar alt={userName} variant="rounded" 
                    src={`http://${config.serverIP}${userImg}`} className={classes.large}/>
            </Button>
            
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({TransitionProps, placement}) => (
                    <Grow
                    {...TransitionProps}
                    style={{transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'}}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose2}>
                                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                    <MenuItem onClick={handleClose2}><Link to="/user">Profile</Link></MenuItem>
                                    <MenuItem onClick={handleClose2}><Link to="/login" onClick={handleLogout}>Logout</Link></MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            
        </Grid>
        </Suspense>
        </Grid>
        </Toolbar>
    </AppBar>
    </div>
)
else 
    return (
        <div className={classes.root}>
        <AppBar position="static" style={{background: "#44acfc"}}>
            <Toolbar>
            <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
                <Button aria-controls="simple-menu" variant="contained" color="default"
                    aria-haspopup="true" onClick={handleClick}>
                    Explore
                </Button>
                <Menu 
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <a href="/explore/part"><MenuItem onClick={handleClose}>Parts</MenuItem></a>
                    <a href="/explore/bin"><MenuItem onClick={handleClose}>Bins</MenuItem></a>
                    <a href="/explore/storage"><MenuItem onClick={handleClose}>Storage Containers</MenuItem></a>
                    <a href="/explore/category"><MenuItem onClick={handleClose}>Categories</MenuItem></a>
                </Menu>
            </Grid>
            <Grid item>
                <TextField id="search-input-toolbar" onChange={event => setSearchQuery(event.target.value)} size="medium" color="primary" label="Search items" InputProps={{
                startAdornment: (
                    <InputAdornment position="start" color="primary">
                        <Search />
                    </InputAdornment>
                ),}}/>
            
                <IconButton aria-label="go" onClick={search}>
                    <ArrowForwardIos />
                </IconButton>
            </Grid>
            <Grid item>
                <Link to={`/login?returnTo=${props.page}`} >
                    <Button variant="contained" color="primary">
                        Login/Register
                    </Button>
                </Link>
            </Grid>
            </Grid>
            </Toolbar>
        </AppBar>
        </div>
    )
} 
