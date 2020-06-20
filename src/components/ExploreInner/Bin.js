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

export default class Bin extends React.Component {
    constructor(props) {
        super(props);
        this.match = matchPath(props.location.pathname, {
            path: '/explore/bin/:id',
            exact: true,
            strict: false
        });
        this.state = {
            location: this.match.params.id,
        }
    }
    componentWillReceiveProps(propsNew) {
        //console.log(propsNew);
        let match = matchPath(propsNew.location.pathname, {
            path: '/explore/bin/:id',
            exact: true,
            strict: false
        });
        this.setState({location: match.params.id});
        //console.log(this.state.location);
        this.forceUpdate();
    }
    render() {
        return (
            <>
            <Switch>
                <Route exact path="/explore/bin">
                    <div style={{textAlign: "center", marginTop: "20%"}}>
                    <Typography component="h2" variant="h2">
                        Select a bin from a <Link to="/explore/storage">
                            storage container first
                        </Link>
                    </Typography>
                    </div>
                </Route>
                <Route exact path={`${this.props.match.path}/:id`}>
                    {(this.match) ? <BinPage id={this.state.location} 
                    loggedIn={Boolean(localStorage.getItem('token'))} /> : null}
                </Route>
            </Switch>
            </>
        )
    }
}

class BinPage extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            binInfo: {},
            parts: [],
            containerData: {},
            loaded: false
        }
    }

    componentWillReceiveProps(props) {
        //console.log(props);
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/info?id=${props.id}`)
        .then(res => {
            let containerInfo = {name: res.data.name, id: res.data.parent_container, rows: res.data.rows, 
                cols: res.data.cols, 
                location: res.data.location};
            //console.log(containerInfo);
            this.setState({containerData: containerInfo});
            this.setState({binInfo: res.data});
            axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/parts?id=${this.props.id}`)
            .then(res2 => {
                this.setState({parts: res2.data});
                this.setState({loaded: true});
            });
        });
    }

    componentWillMount() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/info?id=${this.props.id}`)
        .then(res => {
            let containerInfo = {name: res.data.name, id: res.data.parent_container, rows: res.data.rows, 
                cols: res.data.cols, 
                location: res.data.location};
            //console.log(containerInfo);
            this.setState({containerData: containerInfo});
            this.setState({binInfo: res.data});
            axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/parts?id=${this.props.id}`)
            .then(res2 => {
                this.setState({parts: res2.data});
                this.setState({loaded: true});
            });
        });
    }
    render() {
        return (
            <>
            {(this.state.loaded) ? 
            <>
            <Container style={{margin: "0 auto", paddingTop: "5%"}} fluid>
                <Row justify="center" xs={12}>
                    <Col xs={3}></Col>
                    <Col xs={5}>
                        <Typography variant="h3" style={{paddingTop: "60px"}}>
                            Bin name: {this.state.binInfo.bin_name}</Typography>
                    </Col>
                    <Col xs={4}>
                        <Typography variant="h5">
                            {<img src={`http://${config.serverIP}${this.state.binInfo.bin_qr}`} 
                            className="qr-img" />}
                        </Typography>
                    </Col>
                </Row>
            </Container>
            <div style={{margin: "0 auto", paddingTop: "1%"}}>
                <StorageContainer containerData={this.state.containerData}
                highlighted={[this.state.binInfo.row, this.state.binInfo.column]} />
            </div>
            <div style={{margin: "0 auto", paddingTop: "5%"}}>
            {this.state.parts.map(item => (
                <PartCard id={item.id} category={item.category} isLoggedIn={this.props.loggedIn} />
            ))}
            </div>
            </>
            : <CircularProgress />}
            </>
        )
    }
}