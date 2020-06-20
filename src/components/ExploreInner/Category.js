import React from 'react'
import {Link, Switch, Route, Redirect, matchPath} from 'react-router-dom'
import PartCard from '../Parts/PartCard'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
FormControl, Select, NativeSelect} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Row, Col, Container} from 'react-grid-system'
import config from '../../config'
import StorageContainer from '../Bins/StorageContainer'
import ReactDOM from 'react-dom'
import { ArrowForwardIos } from '@material-ui/icons'

const axios = require('axios').default;

export default class Category extends React.Component {
    constructor(props) {
        super(props);
        this.match = matchPath(props.location.pathname, {
            path: '/explore/category/:id',
            exact: true,
            strict: false
        });
        this.state = {
            selectedCategoryId: null,
            categoryList: [],
            partList: [],
            categoryInfo: null,
        }
    }
    componentWillMount() {
    }

    handleSelect = (event) => {
        this.setState({selectedCategoryId: event.target.value});
    }
    handleGo = () => {
        if(this.state.selectedCategoryId) {
            window.location.pathname = `/explore/category/${this.state.selectedCategoryId}`;
        }
    }
    loadCategories() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/category/all`)
        .then(res => {
            this.setState({categoryList: res.data});
        });
    }
    componentDidMount() {
        if(this.match == null)
        this.loadCategories();
        else {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/category/info?id=${this.
        match.params.id}`)
        .then(res => {
            if(res.status >= 400) {
                this.props.history.push('/explore/category');
                this.loadCategories();
            } else {
            this.setState({categoryInfo: res.data});
        }});

        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/category/parts?id=${this.
        match.params.id}`)
        .then(res => {
            console.log(res.data);
            this.setState({partList: res.data});
            console.log(this.state.partList);
        });
    }}

    render() {
        return (
            <>
            <Switch>
                <Route exact path="/explore/category">
                    <div style={{margin: "10% auto", textAlign: "center"}}>
                    <Typography variant="h3">Select a category</Typography><br />
                    <FormControl style={{display: "inline-block"}}>
                        <InputLabel htmlFor="category-list">Category</InputLabel>
                        <Select native value={this.state.selectedCategoryId}
                            style={{width: "150px"}}
                            onChange={this.handleSelect} inputProps={{id: 'category-list'}}>
                            <option aria-label="None" value="" />
                            {this.state.categoryList.map(category => (
                                <option value={category.id} key={category.id}>{category.name}</option>
                            ))}
                        </Select>
                        <IconButton aria-label="go" onClick={this.handleGo}>
                            <ArrowForwardIos />
                        </IconButton>
                    </FormControl>
                    </div>
                </Route>
                <Route exact path='/explore/category/:id'>
                    {(this.state.categoryInfo && this.match) ?
                    <>
                    <CategoryPage info={this.state.categoryInfo} /> 
                    <div style={{height: "50%", overflow: "visible"}}>
                    {this.state.partList.map(item => (
                        <PartCard id={item.id} category={item.category} 
                            isLoggedIn={Boolean(localStorage.getItem('token'))} />
                    ))}</div>
                    </> : null}
                </Route>
            </Switch>
            </>
        )
    }
}

class CategoryPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryInfo: props.info,
            tags: "",
            prettifiedDate: "",
        }
    }

    componentWillMount() {
        let tags = JSON.parse(this.state.categoryInfo.tags);
        let newTags = '';
        for(var i=0; i<tags.length-1; i++) {
            newTags += tags[i] + ', ';
        }
        newTags += tags[tags.length - 1];
        let date = new Date(this.state.categoryInfo.date_created);
        this.setState({prettifiedDate: date.toLocaleString()});
        this.setState({tags: newTags});
    }

    render() {
        return (
            <>
            <div style={{marginTop: "5%", marginBottom: "5%", textAlign: "center"}}>
                <Container>
                    <Col>
                        <img src={`http://${config.serverIP}${this.state.categoryInfo.img_path}`} 
                        alt="category" style={{width: "350px", height: "350px"}} />
                    </Col>
                    <Col>
                        <div style={{justifyContent: "center", marginTop: "7%"}}>
                        <Typography variant="h2">
                            {this.state.categoryInfo.name}
                        </Typography>
                        <Typography variant="body1" component="p" color="textSecondary">
                            {this.state.categoryInfo.description} <br /><br />
                            Tags: {this.state.tags} <br />
                            Date created:<br />{this.state.prettifiedDate}
                        </Typography>
                        </div>
                    </Col>
                </Container>
            </div>
            </>
        )
    }
}