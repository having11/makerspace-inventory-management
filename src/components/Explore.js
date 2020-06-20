import React from 'react'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
ClickAwayListener} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Link, Route, Switch, Redirect, matchPath} from 'react-router-dom'
import config from '../config'
import NavBar from './NavBar'
import Part from './ExploreInner/Part'
import Bin from './ExploreInner/Bin'
import Storage from './ExploreInner/Storage'
import Category from './ExploreInner/Category'

const axios = require('axios').default;

class Explore extends React.Component {
    constructor(props) {
        super(props);
        // match = {path, url, isExact, params: {}}
        this.match = props.match;
        //console.log(props);
    }
    render() {
        return (
            <>
            <NavBar page={this.props.location.pathname} />
            <Switch>
                <Route path={`${this.match.path}/part`} component={Part} />
                <Route path={`${this.match.path}/bin`} component={Bin} />
                <Route path={`${this.match.path}/storage`} component={Storage} />
                <Route path={`${this.match.path}/category`} component={Category} />
            </Switch>
            </>
        )
    }
}

export default Explore;