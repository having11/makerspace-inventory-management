import React from 'react'
import {Link, Switch, Route, Redirect, matchPath} from 'react-router-dom'
import PartCard from '../Parts/PartCard'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
ClickAwayListener, TextField, Snackbar, Paper} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Row, Col, Container} from 'react-grid-system'
import config from '../../config'
import AddCartElem from '../Parts/AddCartElem'
import StorageContainer from '../Bins/StorageContainer'
import FeaturedPartPage from '../Parts/FeaturedPartPage'
import ReactDOM from 'react-dom'
import {Carousel} from 'react-bootstrap'

import './Part.css'
const axios = require('axios').default;

export default class Part extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        //console.log(props);
        // match = {path, url, isExact, params: {}}
        this.match = matchPath(props.location.pathname, {
            path: '/explore/part/:category/:id',
            exact: true,
            strict: false
        });
        this.matchCategory = matchPath(props.location.pathname, {
            path: '/explore/part/:category',
            exact: true,
            strict: false
        });
    }
    render() {
        return (
            <>
            <Switch>
                <Route exact path="/explore/part">
                    <h3 style={{margin: '40px auto', textAlign: 'center'}}>Check out some featured items</h3>
                    <FeaturedPartPage />
                </Route>
                <Route exact path={`${this.props.match.path}/:category`}>
                    <Redirect to={this.matchCategory ? `/explore/category/${this.matchCategory.params.category}` : '/explore/part/'} />
                </Route>
                <Route exact path={`${this.props.match.path}/:category/:id`}>
                    {(this.match) ? <PartPage id={this.match.params.id} category={this.match.params.category} 
                    loggedIn={Boolean(localStorage.getItem('token'))} /> : null}
                </Route>
            </Switch>
            </>
        )
    }
}

class PartPage extends React.Component {
    constructor(props) {
        super(props);
        //console.log(props);
        this.state = {
            images: [],
            partInfo: {},
            partId: props.id,
            partCategory: props.category,
            loggedIn: props.loggedIn,
            index: 0,
            partDates: {},
            containerData: {},
            prettyTags: "",
            loaded: false
        }
    }
    handleSelect = (selectedIndex, e) => {
        this.setState({index: selectedIndex});
    }
    getPartInfo() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/info?id=${this.state.partId}&category=${this.state.partCategory}`)
        .then(res => {
            const part = res.data;
            /*if(part.is_smd) {
                part.name = `SMD ${part.category} ${part.package} ${part.value} ${part.power_rating}`
            }*/
            this.setState({partInfo: part});
            console.log(this.state.partInfo);
            let dateData = part.date_updated;
            let date = new Date(dateData);
            dateData = part.date_added;
            let date2 = new Date(dateData);
            let dates = {updated: date.toLocaleString(), added: date2.toLocaleString()};
            this.setState({partDates: dates});
            let container = {name: part.name, id: part.storage_id, rows: part.rows, cols: part.cols, location: part.location}
            this.setState({containerData: container});
            let tagsArray = JSON.parse(part.tags);
            //console.log(tagsArray);
            let tags = '';
            if(tagsArray)
            for(var i=0; i<tagsArray.length; i++) {
                if(i === tagsArray.length - 1) {
                    tags += tagsArray[i];
                } else {
                    tags += tagsArray[i] + ', '
                }
            }
            this.setState({prettyTags: tags});
            this.setState({loaded: true});
        });
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/images?id=${this.state.partId}&category=${this.state.partCategory}`)
        .then(res => {
            const imgs = res.data;
            this.setState({images: imgs});
        })
    }
    componentDidMount() {
        this.getPartInfo();
    }
    render() {
        if(this.state.loaded)
        return (
            <Container style={{marginTop: "5%", width: "90%"}} fluid>
            <Row justify="center" xs={12}>
                <Col xs={6} justify="center" style={{width: "600px"}}>
                    <Row xs={12}>
                    <Carousel activeIndex={this.state.index} onSelect={this.handleSelect}>
                        {this.state.images.map(item => (
                            <Carousel.Item>
                                <img src={`http://${config.serverIP}${item.img_path}`} 
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    </Row>
                    <Row xs={12} justify="center" style={{width: "600px"}}>
                        <Col xs={6}>
                        <Row>
                        <Typography variant="h4" color="textPrimary" component="h4">
                            {this.state.partInfo.part_name}
                        </Typography>
                        </Row>
                        <Row>
                            <Typography variant="body" color="textSecondary" component="p">
                            {this.state.partInfo.description}
                            </Typography>
                        </Row>
                        <Row>
                            <Typography variant="body" color="textPrimary" component="p">
                            {this.state.partInfo.quantity} in stock
                            </Typography>
                        </Row>
                        </Col>
                        <Col xs={6}>
                            <AddCartElem id={this.state.partInfo.id} category={this.state.partInfo.category}
                                maxAmt={this.state.partInfo.quantity} 
                                isLoggedIn={Boolean(localStorage.getItem('token'))} />
                        </Col>
                    </Row>
                    <br />
                    <Row xs={12}>
                        ${this.state.partInfo.price} each
                    </Row>
                    <Row xs={12}>
                        Last updated at: {this.state.partDates.updated}
                    </Row>
                </Col>
                <Col xs={5} offset={{xs: 1}}>
                    <Row xs={12}>
                        {(this.state.loaded) ? <StorageContainer containerData={this.state.containerData} 
                        highlighted={[this.state.partInfo.row, this.state.partInfo.column]} /> : <CircularProgress /> }
                    </Row>
                    <Row xs={12} justify="between" style={{marginTop: "5%", width: "100%"}}>
                        <Col style={{width: "100%"}}>
                            <Typography variant="p" component="p" color="textSecondary">
                                Datasheet URL: <a href={this.state.partInfo.datasheet_url} 
                                target="_blank" rel="noreferrer">
                                    {this.state.partInfo.datasheet_url}</a><br />
                                Category: <Link to={`/explore/category/${this.state.partInfo.category}`}>
                                    {this.state.partInfo.category}</Link><br />
                                Tags: {this.state.prettyTags}<br />
                                Discrete? {(this.state.partInfo.is_discrete) ? "YES" : "NO"}
                            </Typography>
                            {(this.state.partInfo.is_discrete) ? 
                                <Typography variant="p" component="p" color="textSecondary">
                                    SMD? {(this.state.partInfo.is_smd) ? "YES" : "NO"}<br />
                                    Package: {this.state.partInfo.package}<br />
                                    Value: {this.state.partInfo.value}<br />
                                    Power rating: {this.state.partInfo.power_rating}
                                </Typography>
                            : null}
                        </Col>
                        <Col xs="content">
                            <Row>
                            <div style={{textAlign: "center"}}>
                            <Typography variant="h5" component="h5">
                                QR Code:
                            </Typography>
                            </div>
                            </Row>
                            <Row>
                            <img src={`http://${config.serverIP}${this.state.partInfo.part_qr}`} 
                            className="qr-img" />
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
            </Container>
        );
        else return <CircularProgress />
    }
}
