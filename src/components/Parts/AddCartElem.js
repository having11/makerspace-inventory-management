import React from 'react'
import {Input, Button, Snackbar, Typography} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {Alert as MuiAlert} from '@material-ui/lab'
import {AddShoppingCart} from '@material-ui/icons'
import config from '../../config'
const axios = require('axios').default;

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default class AddCartElem extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        console.log(props);
        this.state = {
            isLoggedIn: false,
            itemAmount: 0,
            partId: this.props.id,
            partCategory: this.props.category,
            max: this.props.maxAmt,
            showing: false,
            showing2: false
        }
    }
    validateLogin() {
        return this.props.isLoggedIn;
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.maxAmt !== this.props.maxAmt) {
            this.setState({max: nextProps.maxAmt});
        }
    }
    componentWillMount() {
        let loggedIn = this.validateLogin();
        this.setState({isLoggedIn: loggedIn});
    }
    addToCart = () => {
        console.log(this.state);
        if(this.state.itemAmount > 0)
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/cart/items/add`, {
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token'),
            id: this.state.partId,
            category: this.state.partCategory,
            quantity: this.state.itemAmount
        })
        .then((response) => {
            this.setState({showing: true});
        })
        .catch((error) => {
            this.setState({showing2: true});
        })
    }
    close = () => {
        this.setState({showing: false});
    }
    close2 = () => {
        this.setState({showing2: false});
    }
    changeCounter = (event) => {
        this.setState({itemAmount: event.target.value});
    }
    render() {
        if(this.state.isLoggedIn){
        return (
            <>
            <Input 
                id="outlined-number"
                label="Quantity"
                type="number"
                variant="outlined"
                InputLabelProps={{shrink: true}} 
                inputProps={{min: 0, max: this.state.max}}
                value={this.state.itemAmount}
                onChange={this.changeCounter} />
            <Button variant="contained" color="primary" onClick={this.addToCart}
            style={{marginTop: '10px', display: 'block'}}><AddShoppingCart />Add to cart</Button>
            <Snackbar open={this.state.showing} onClose={this.close} autoHideDuration={3000} 
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                <Alert severity="success">
                    <Typography style={{float: "left"}}>Added {this.state.itemAmount} to cart</Typography>
                </Alert>
            </Snackbar>
            <Snackbar open={this.state.showing2} autoHideDuration={8000} 
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                <Alert severity="error">
                    <Typography style={{float: "left"}}>{"Couldn't add. Maybe try "}
                    <Link to={`/login?returnTo=${window.location.pathname}`}>
                        {"signing in?"}
                    </Link>
                    </Typography>
                </Alert>
            </Snackbar>
            </>
        )}
        else return (
            <>
            </>
        )
    }
}
