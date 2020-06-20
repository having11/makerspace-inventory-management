import React from 'react'
import {Link, Switch, Route, Redirect, matchPath} from 'react-router-dom'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
    Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
    ClickAwayListener, TextField, Snackbar, Paper} from '@material-ui/core' 
import {Row, Col, Container} from 'react-grid-system'
import {Delete, ArrowForward} from '@material-ui/icons'
import NavBar from './NavBar'
import config from '../config'
const axios = require('axios').default;

export default class Checkin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            partsList: [],
            loaded: false
        }
        this.handleCheckinItem = this.handleCheckinItem.bind(this);
    }

    getCheckinItems() {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/checkout/list`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        })
        .then((response) => {
            this.setState({partsList: response.data});
            this.setState({loaded: true});
        })
        .catch((error) => {
            this.props.history.push('/login?returnTo=/checkin');
        })
    }

    componentWillMount() {
        if(localStorage.getItem('token') === null || localStorage.getItem('username') === null) {
            this.props.history.push('/login?returnTo=/checkin');
        } else {
            this.getCheckinItems();
        }
    }

    handleCheckinItem() {
        this.setState({loaded: false});
        this.getCheckinItems();
    }

    render() {
        if(this.state.loaded) {
            var partItems = null;
            if(this.state.partsList.length === 0) {
                partItems = <div style={{textAlign: 'center', marginTop: '15%'}}>
                                <h1 style={{float: 'none'}}>Nothing to check back in!</h1>
                            </div>
            } else {
                partItems = this.state.partsList.map((item) => (
                    <>
                    <CheckinItem details={item} onRemove={this.handleCheckinItem} />
                    </>
                ));
            }
        return (
            <>
            <NavBar page={this.props.location.pathname} />
            {partItems}
            </>
        )}
        else return <CircularProgress />
    }
}

class CheckinItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemInfo: props.details
        }
        console.log(this.state.itemInfo);
    }

    checkinItem = () => {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/checkout/checkin`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token'),
            id: this.state.itemInfo.id,
            category: this.state.itemInfo.category,
            time: this.state.itemInfo.checkout_time,
            quantity: this.state.itemInfo.amount_out
        })
        .then((response) => {
            this.removeSelf();
        })
    }

    removeSelf = () => {
        this.props.onRemove();
    }

    render() {
        return (
            <>
            <Paper style={{width: '78%', margin: '30px auto', padding: '10px'}}>
                <Container>
                    <Row>
                        <Col xs={3}>
                            <Row>
                                <img src={`http://${config.serverIP}${this.state.itemInfo.img_path}`}
                                style={{width: '100px', height: '100px', position: 'static', 
                                    margin: '15px auto'}} />
                            </Row>
                        </Col>
                        <Col xs={4} style={{marginTop: '5px'}}>
                            <Row>
                                <Typography variant="h5" color="textPrimary">
                                    <Link to={`/explore/part/${this.state.itemInfo.category}/${this.state.itemInfo.id}`}>
                                        {this.state.itemInfo.name}
                                    </Link>
                                </Typography>
                            </Row>
                            <Row>
                                <Typography variant="body1" color="textPrimary">
                                    {this.state.itemInfo.description}
                                </Typography>
                            </Row>
                            <Row>
                                <Typography variant="body1" color="textPrimary">
                                    In stock: {this.state.itemInfo.quantity}
                                </Typography>
                            </Row>
                            <Row>
                                <Typography variant="body2" color="textSecondary">
                                    Checked out on {new Date(this.state.itemInfo.date_added).toLocaleString()}
                                </Typography>
                            </Row>
                        </Col>
                        <Col xs={5}>
                            <Row style={{marginTop: '25px'}}>
                            <Col xs={4}></Col>
                            <Col xs={8}>
                            <Row>
                            <Typography variant="h4" color="textPrimary">
                                {this.state.itemInfo.amount_out} currently out
                            </Typography>
                            </Row>
                            <Row>
                            <Button variant="contained"
                                color="primary"
                                endIcon={<ArrowForward />}
                                onClick={this.checkinItem}
                            >
                                Check back in 
                            </Button>
                            </Row>
                            </Col></Row>
                        </Col>
                    </Row>
                </Container>
            </Paper>
            </>
        )
    }
}