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

export default class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            partsList: [],
            loaded: false,
        }
        this.handleItemUnmount = this.handleItemUnmount.bind(this);
    }
    getCartItems() {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/cart/items/list`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        })
        .then((response) => {
            this.setState({partsList: response.data});
            this.setState({loaded: true});
        })
        .catch((error) => {
            this.props.history.push('/login?returnTo=/cart');
        })
    }
    componentWillMount() {
        if(localStorage.getItem('token') === null || localStorage.getItem('username') === null) {
            this.props.history.push('/login?returnTo=/cart');
        } else {
            this.getCartItems();
        }
        
    }
    handleItemUnmount() {
        this.setState({loaded: false});
        this.getCartItems();
    }
    render() {
        if(this.state.loaded) {
            var partItems = null;
            if(this.state.partsList.length === 0) {
                partItems = <div style={{textAlign: 'center', marginTop: '15%'}}>
                                <h1 style={{float: 'none'}}>Your cart is empty!</h1>
                            </div>
            } else {
                partItems = this.state.partsList.map((item) => (
                <>
                <CartItem details={item} onRemove={this.handleItemUnmount} />
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

class CartItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedQuantity: props.details.user_quantity,
            itemInfo: props.details
        }
    }

    changeQuantity = (event) => {
        if(event.target.value >= 1 && event.target.value <= this.state.itemInfo.quantity) {
            this.setState({selectedQuantity: event.target.value});
            axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/cart/items/modifyQuantity`, {
                username: localStorage.getItem('username'),
                token: localStorage.getItem('token'),
                quantity: Number(event.target.value),
                id: this.state.itemInfo.id,
                category: this.state.itemInfo.category
            });
        }
        else if(event.target.value < 1) this.setState({selectedQuantity: 1});
        else this.setState({selectedQuantity: this.state.itemInfo.quantity});
    }

    checkoutItem = () => {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/checkout/checkout`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token'),
            quantity: Number(this.state.selectedQuantity),
            id: this.state.itemInfo.id,
            category: this.state.itemInfo.category
        })
        .then((response) => {
            this.props.onRemove();
        })
    }

    removeSelf = () => {
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/cart/items/remove`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token'),
            id: this.state.itemInfo.id,
            category: this.state.itemInfo.category
        })
        .then((reponse) => {
            this.props.onRemove();
        })
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
                                margin: '15px auto'}}/>
                            </Row>
                        </Col>
                        <Col xs={4}>
                            <Row>
                                <Typography variant="h4" color="textPrimary">
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
                                    Added on {new Date(this.state.itemInfo.date_added).toLocaleString()}
                                </Typography>
                            </Row>
                        </Col>
                        <Col xs={5}>
                            <Row>
                            <Col xs={5}>
                                <Button variant="contained"
                                    color="default"
                                    startIcon={<Delete />}
                                    onClick={this.removeSelf}
                                >
                                    Remove
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button variant="contained"
                                    color="primary"
                                    endIcon={<ArrowForward />}
                                    onClick={this.checkoutItem}
                                >
                                    Checkout
                                </Button>
                            </Col>
                            </Row> <br />
                            <Row>
                            <Col xs={4}></Col>
                            <Col xs={8}>
                            <Row>
                                Checkout Quantity:
                            </Row>
                            <Row>
                                
                                <Input 
                                    id="outlined-number"
                                    label="Quantity"
                                    type="number"
                                    variant="outlined"
                                    InputLabelProps={{shrink: true}}
                                    inputProps={{min: 1, max: this.state.itemInfo.quantity}}
                                    value={this.state.selectedQuantity}
                                    onChange={this.changeQuantity} />
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