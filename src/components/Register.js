import React from 'react'
import {withRouter, Link} from 'react-router-dom'
import {CircularProgress, Button, TextField, FormControl, InputLabel, InputAdornment, 
    Input, IconButton, Typography, Snackbar} from '@material-ui/core'
import {Alert} from '@material-ui/lab'
import {Visibility, VisibilityOff} from '@material-ui/icons'
import NavBar from './NavBar'
import config from '../config'
import {DropzoneArea} from 'material-ui-dropzone'
import './Login.css'
import './Register.css'
const axios = require('axios').default;

class Register extends React.Component {
    constructor(props) {
        super(props);
        
    }
    componentWillMount() {
        this.setState({
            username: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            emailAddress: '',
            profileImg: [],
            errorText: '',
            formValid: {username: false, email: false, password: false, name: false},
            showPassword: false,
            showPasswordConfirm: false,
            showing: false
        });
    }
    updateShowPassword = () => {
        this.setState({showPassword: !this.state.showPassword})
    }
    validate() {
        let validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.emailAddress)
        let usernameValid = /^[a-z0-9]+$/i.test(this.state.username);
        if(this.state.password.length <= 7) {
            this.setState({errorText: "Password must be at least 8 characters long"});
            return false;
        } else if (this.state.password !== this.state.confirmPassword) {
            this.setState({errorText: "Passwords must match"});
            return false;
        } else if (!validEmail) {
            this.setState({errorText: "Email is not valid"});
            return false;
        } else if (this.state.profileImg.length !== 1) {
            this.setState({errorText: "Profile image required"});
            return false;
        } else if (!this.state.username) {
            this.setState({errorText: "Username is required"});
            return false;
        } else if (!this.state.firstName || !this.state.lastName) {
            this.setState({errorText: "Full name is required"});
            return false;
        } else if (this.state.username.indexOf(' ') >= 0) {
            this.setState({errorText: "Username cannot have spaces"});
            return false;
        } else if (!this.state.profileImg) {
            this.setState({errorText: "Invalid picture"});
            return false;
        } else if (!usernameValid) {
            this.setState({errorText: "Only alphanumeric characters allowed in usernames"});
            return false;
        }
        return true;
    }
    handleCreate = () => {
        //global.FormData = global.originalFormData;
        if(this.validate()) {
            let formData = new FormData();
            let payload = {
                username: this.state.username,
                password: this.state.password,
                f_name: this.state.firstName,
                l_name: this.state.lastName,
                email_addr: this.state.emailAddress
            }
            const file = new Blob([this.state.profileImg[0]], {type: this.state.profileImg[0].type});
            console.log(file);
            formData.append('image', file, this.state.profileImg[0].name);
            for(let name in payload) {
                formData.append(name, payload[name]);
            }
            axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/user/create`, 
                formData,
                {headers: {"Content-Type": "multipart/form-data"}}
            )
            .then(res => {
                this.setState({showing: true});
                setTimeout(() => {
                    this.props.history.push(`/login${this.props.location.search}`);
                }, 1500);
            })
            .catch((error) => {
                console.log(error);
                this.setState({errorText: "Username is already taken"});
            })
        }
    }
    updateShowConfirmPassword = () => {
        this.setState({showPasswordConfirm: !this.state.showPasswordConfirm})
    }
    updateUsername = (event) => {
        this.setState({username: event.target.value})
    }
    updatePassword = (event) => {
        this.setState({password: event.target.value});
    }
    updateConfirmPassword = (event) => {
        this.setState({confirmPassword: event.target.value})
    }
    updateEmail = (event) => {
        this.setState({emailAddress: event.target.value})
    }
    updateFirstName = (event) => {
        this.setState({firstName: event.target.value})
    }
    updateLastName = (event) => {
        this.setState({lastName: event.target.value})
    }
    handleOnMouseDown = (event) => {
        event.preventDefault()
    }
    updateFiles = (files) => {
        this.setState({profileImg: files});
        console.log(files[0])
        console.log(typeof files[0]);
    }
        
    render() {
        let errorNotification;
        if(this.state.errorText) {
            errorNotification = <Alert severity="error">{this.state.errorText}</Alert>
        } else {
            errorNotification = null;
        }
        return (
            <>
            <NavBar page={this.props.location.pathname} />
            <div className="container">
                <form className="center-form">
                <Typography variant="h4" className="new-user-text">Create A New Account</Typography>
                {errorNotification}
                <TextField id="username-field" className="username-field" label="Username" required 
                onChange={this.updateUsername} /><br />
            <FormControl>
                <InputLabel htmlFor="standard-adornment-password">Password</InputLabel>
                <Input id="standard-adornment-password" className="password-field" required  
                    type={this.state.showPassword ? "text" : "password"}
                    value={this.state.password} onChange={this.updatePassword} 
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton aria-label="toggle password visiblity"
                                onClick={this.updateShowPassword}
                                onMouseDown={this.handleOnMouseDown}>
                                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                        </InputAdornment>
                    }
            />
            </FormControl><br />
            <FormControl>
                <InputLabel htmlFor="standard-adornment-password">Confirm Password</InputLabel>
                <Input id="standard-adornment-password" className="password-field" required 
                    type={this.state.showPasswordConfirm ? "text" : "password"}
                    value={this.state.confirmPassword} onChange={this.updateConfirmPassword} 
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton aria-label="toggle password visiblity"
                                onClick={this.updateShowConfirmPassword}
                                onMouseDown={this.handleOnMouseDown}>
                                    {this.state.showPasswordConfirm ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                        </InputAdornment>
                    }
            />
            </FormControl><br />
            <TextField label="Email Address" className="email-input" helperText="person@example.com" 
            onChange={this.updateEmail} required />
            <br />
            <div>
                <TextField label="First Name" required onChange={this.updateFirstName}/>
                <TextField label="Last Name" required onChange={this.updateLastName} />
            </div><br />
            <Typography variant="h6">Profile Picture</Typography>
            <DropzoneArea onChange={this.updateFiles} acceptedFiles={['image/png', 'image/jpg', 'image/gif', 'image/jpeg']}
                filesLimit={1} showFileNames="true" /><br />
            <Button onClick={this.handleCreate} color="primary" variant="contained" >Create new account</Button>
            <Snackbar open={this.state.showing} autoHideDuration={1500} 
                    anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
                <Alert severity="success">
                    <Typography style={{float: "left"}}>New user created successfully</Typography>
                </Alert>
            </Snackbar>
            </form>
            </div>
            </>
        )
    }
}

export default Register;