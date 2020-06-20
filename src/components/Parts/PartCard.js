import React from 'react'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popper,
ClickAwayListener, Grid, TextField, Snackbar} from '@material-ui/core' 
import AddCartElem from './AddCartElem'
import {Link} from 'react-router-dom'
import config from '../../config'
const axios = require('axios').default;

export default class PartCard extends React.Component {
    constructor(props) {
        super(props);
        console.log("Part card: ");
        console.log(props);
    }
    componentWillMount() {
        this.state = {
            partId: this.props.id,
            partCategory: this.props.category,
            quantityWanted: 0,
            partInfo: {},
            anchorEl: null,
            open: false,
            isLoggedIn: this.props.isLoggedIn
        }
    }
    componentDidMount() {
        this.getPartInfo();
    }
    componentWillUnmount() {
    }
    static componentWillReceiveProps(props, state) {
        this.props = props;
        console.log("got new props");
        return {isLoggedIn: props.isLoggedIn}
    }
    handleClick = (event) => {
        this.setState({anchorEl: event.currentTarget});
        this.setState({open: true});
        //console.log("now open");
    }
    handlePopoverClose = () => {
        this.setState({open: false});
        this.setState({anchorEl: null});
        //console.log("now closed");
    }

    getPartInfo() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/info?id=${this.state.partId}\
        &category=${this.state.partCategory}`)
        .then(res => {
            const part = res.data;
            if(part.is_smd) {
                part.name = `SMD ${part.category} ${part.package} ${part.value} ${part.power_rating}`
            }
            this.setState({partInfo: part});
        })
    }
    redirectToPart = () => {
        window.location.pathname = `/explore/part/${this.state.partCategory}/${this.state.partId}`;
    }
    render() {
        return (
            <Card style={{width: '320px', margin: '15px', display: 'inline-block'}}>
            <CardActionArea onClick={this.redirectToPart}>
                <CardMedia style={{height: '0', paddingTop: '56.25%'}} 
                image={`http://${config.serverIP}${this.state.partInfo.img_path}`} />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {this.state.partInfo.part_name}
                    </Typography>
                    <Typography variant="body2" color="textPrimary" component="p">
                        {this.state.partInfo.description}
                    </Typography>
                </CardContent>
                </CardActionArea>
                
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={6} spacing={3}>
                    <Typography variant="body2" component="p" color="textSecondary" style={{display: 'inline'}}>
                        Price: ${this.state.partInfo.price} <br />Quantity in stock: {this.state.partInfo.quantity}
                        <br />Belongs to:
                    </Typography>
                    <Typography variant="body2" component="p" color="primary" aria-owns={this.state.open ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true" style={{width: 'max-content', display: 'inline'}}
                    >{" "}<Link to={`/explore/bin/${this.state.partInfo.bin_id}`}>
                        {this.state.partInfo.bin_name}
                        </Link>
                    </Typography>
                    </Grid>
                    <Grid item xs={6} >
                        <AddCartElem isLoggedIn={this.props.isLoggedIn} id={this.state.partId}
                        maxAmt={this.state.partInfo.quantity} category={this.state.partCategory}/>
                    </Grid>
                </Grid>
            </CardContent>
            </Card>
            
        )
    }
}