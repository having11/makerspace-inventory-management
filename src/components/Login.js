import React from 'react'
import {withRouter, Link} from 'react-router-dom'
import {CircularProgress, Button, TextField, FormControl, InputLabel, InputAdornment, 
    Input, IconButton, Typography, Snackbar, Grid} from '@material-ui/core'
import {Alert as MuiAlert} from '@material-ui/lab'
import {Visibility, VisibilityOff} from '@material-ui/icons'
import NavBar from './NavBar'
import queryString from 'query-string'
import config from '../config'
import './Login.css'
const axios = require('axios').default;

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Login extends React.Component {
    componentWillMount() {
        this.state = {enteredUsername: '', enteredPassword: '', showPassword: false, loginSuccessful: true, errorText: ""
        , showing: false, time: 1500, count: 0};
    }
    updatePassword = (event) => {
        this.setState({enteredPassword: event.target.value});
    }
    updateUsername = (event) => {
        this.setState({enteredUsername: event.target.value});
    }
    handleClickShowPassword = () => {
        this.setState({showPassword: !this.state.showPassword });
    };
    handleMouseDownPassword = (event) => {
        event.preventDefault();
    };
    login = (event) => {
        if(this.state.enteredUsername.length > 0)
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/user/login`, {
            username: this.state.enteredUsername,
            password: this.state.enteredPassword
        })
        .then((response) => {
            if(response.data.valid) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', this.state.enteredUsername);
                let params = queryString.parse(this.props.location.search);
                this.setState({showing: true});
                this.timer = setInterval(() => {
                    if(this.state.count >= this.state.time) {
                        clearInterval(this.timer);
                        setTimeout(() => {
                            this.props.history.push(params.returnTo ? params.returnTo : "/");
                        }, 300);
                    } else {
                        this.setState({count: this.state.count + 25});
                    }
                }, 25);
            } else {
                this.setState({loginSuccessful: false});
                this.setState({errorText: "Invalid username or password"});
            }
        })
        .catch((error) => {
            this.setState({loginSuccessful: false});
            this.setState({errorText: "Invalid username or password"});
        })
    }

    render() {
        return (
            <>
            <NavBar page={this.props.location.pathname} />
            <div className="container">
            <form className="center-form">
                <Typography variant="h4" className="welcomeText">Hello, please login</Typography>
                <TextField id="username-field" className="username-field" label="Username" onChange={this.updateUsername} 
                error={!this.state.loginSuccessful} helperText={this.state.errorText} /><br />
                <FormControl>
                    <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                    <Input id="standard-adornment-password" className="password-field" 
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.state.enteredPassword} onChange={this.updatePassword} 
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visiblity"
                                    onClick={this.handleClickShowPassword}
                                    onMouseDown={this.handleMouseDownPassword}>
                                        {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                            </InputAdornment>
                        }
                        error={!this.state.loginSuccessful} 
                        helperText={this.state.errorText}
                    />
                </FormControl><br />
                <Button onClick={this.login} color="primary" className="login-btn" size="large">Login</Button><br />
                <Typography variant="subtitle2">
                    Or, create a <Link to={`/register${this.props.location.search}`}>new account</Link>
                </Typography>
                <Snackbar open={this.state.showing} autoHideDuration={1000} 
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                <Alert severity="success">
                <Grid container direction="row" justify="space-around" alignItems="center">
                    <Grid item xs={8}>
                        <Typography style={{float: "left"}}>Logged in successfully</Typography>
                    </Grid>
                    <Grid item xs>
                        <CircularProgress style={{float: "left"}} variant="determinate" 
                            value={Math.floor(100 * this.state.count / this.state.time)} />
                    </Grid>
                </Grid>
                </Alert>
            </Snackbar>    
            </form>
            </div>
            </>
        )
    }
}

export default withRouter(Login);