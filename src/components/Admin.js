import React from 'react'
import {Link, Switch, Route, matchPath} from 'react-router-dom'
import {Drawer, CssBaseline, AppBar, List, Typography, ListItem, 
ListItemIcon, ListItemText, withStyles, Toolbar, Divider} from '@material-ui/core'
import config from '../config.js'
import NavBar from './NavBar'
import {FormatAlignJustify, GridOn, Person, Storage, Extension} from '@material-ui/icons'
import Categories from './AdminPages/Categories'
import Bins from './AdminPages/Bins'
import Containers from './AdminPages/Containers'
import Parts from './AdminPages/Parts'
import Users from './AdminPages/Users'

const axios = require('axios').default;

const drawerWidth = 240;

const styles = theme => ({
    root: {
        display: 'flex',
        zIndex: 1,
        position: 'relative',
        top: '260px',
    },
    appBar: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerContainer: {
        overflow: 'auto',
        marginTop: '15px',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
        zIndex: 1,
        top: '-260px',
        position: 'relative',
    },
    active: {
        backgroundColor: 'gray',
    },
    notSelected: {
        backgroundColor: theme.palette.common.white,
    }
});

class Admin extends React.Component {
    
    constructor(props) {
        super(props);
        this.props = props;
        this.classes = this.props.classes;
        this.state = {
            currentIndex: 0,
            authorized: false,
        }
    }
    componentWillMount() {
        this.checkIfAuthorized();
    }
    checkIfAuthorized() {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/user/verifyAdmin`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        })
        .then((response) => {
            this.setState({authorized: true});
        })
        .catch((error) => {
            this.setState({authorized: false});
        })
    }
    setCurrentIndex = (index) => {
        this.setState({currentIndex: index});
    }

    render() {
        const pages = [<Categories />, <Parts />, <Bins />, <Containers />, <Users />];
        let currentPage = pages[this.state.currentIndex];
        return (
            <>
            {(this.state.authorized) ?
            <>
            <NavBar page={this.props.location.pathname} className={this.classes.appBar} />
            <div className={this.classes.root}>
                <CssBaseline />
                <Drawer
                    className={this.classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: this.classes.drawerPaper,
                    }}
                >
                <Toolbar />
                <div className={this.classes.drawerContainer}>
                    <List>
                    <Divider />
                    {[{text: 'Categories', icon: <FormatAlignJustify />}, {text: 'Parts', icon: <Extension />}, 
                    {text: 'Bins', icon: <Storage />}, {text: 'Containers', icon: <GridOn />}, 
                    {text: 'Users', icon: <Person />}]
                    .map((el, index) => (
                        <React.Fragment key={el.text} >
                        <ListItem button  
                        onClick={() => this.setCurrentIndex(index)}
                        className={(index == this.state.currentIndex) ? this.classes.active : 
                        this.classes.notSelected}>
                        <ListItemIcon>{el.icon}</ListItemIcon>
                        <ListItemText primary={el.text} />
                        </ListItem>
                        <Divider />
                        </React.Fragment>
                    ))}    
                    </List>
                    </div>
                </Drawer>
                <div className={this.classes.content}>
                    {currentPage}
                </div>
            </div>
            
            </>
            :
            <>
            <NavBar page={this.props.location.pathname} />
            <Typography variant="h1">Unauthorized user</Typography>
            </>
            }
            </>
        )
    }
}

export default withStyles(styles)(Admin);