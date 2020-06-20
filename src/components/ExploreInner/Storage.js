import React from 'react'
import {Link, Switch, Route, Redirect, matchPath} from 'react-router-dom'
import PartCard from '../Parts/PartCard'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
ClickAwayListener, TextField, Snackbar, Paper} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Row, Col, Container} from 'react-grid-system'
import config from '../../config'
import StorageContainer from '../Bins/StorageContainer'
import ReactDOM from 'react-dom'

import './Bin.css'
const axios = require('axios').default;

export default class Storage extends React.Component {
    constructor(props) {
        super(props);
        this.match = matchPath(props.location.pathname, {
            path: '/explore/storage/:id',
            exact: true,
            strict: false
        });
    }
    render() {
        return (
            <>
            <Switch>
                <Route exact path="/explore/storage">
                    <StoragePage all={true} />
                </Route>
                <Route exact path={`/explore/storage/:id`}>
                    <StoragePage all={false} id={(this.match) ? this.match.params.id : "0"}/> 
                </Route>
            </Switch>
            </>
        )
    }
}

class StoragePage extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        console.log(props);
        this.state = {
            containerInfo: {},
            containers: [],
            all: props.all,
            loaded: false
        }
    }
    componentWillMount() {
        if(this.state.all)
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/all`)
        .then(res => {
            let containerList = [];
            for(var i = 0; i<res.data.length; i++) {
                let item = res.data[i];
                //console.log(item);
                let containerInfo = {name: item.name, id: item.id, rows: item.rows, cols: item.cols, 
                    location: item.location};
                containerList.push(containerInfo);
            }
            this.setState({containers: containerList});
            this.setState({loaded: true});
        });
        else
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/info?id=${this.props.id}`)
        .then(res => {
            var item = res.data;
            let containerInfo = {name: item.name, id: item.id, rows: item.rows, cols: item.cols, 
                location: item.location};
            this.setState({containerInfo: containerInfo});
            this.setState({loaded: true});
        });
    }
    pageRender() {
        return (
        <>
            {(this.state.all) ? 
            <div>
                {this.state.containers.map(container => (
                    <div style={{marginTop: "5%"}}>
                        <StorageContainer containerData={container} />
                    </div>
                ))}
            </div>
            :
            <div style={{marginTop: "5%"}}>
                <StorageContainer containerData={this.state.containerInfo} />
            </div>
            } 
        </>
        )
    }
    render() {
        return (
            <>
            {(this.state.loaded) ? 
            this.pageRender() : <CircularProgress />}
            </>
        )
    }
}