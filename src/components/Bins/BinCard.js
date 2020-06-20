import React from 'react'
import {makeStyles, Card, CardHeader, CardMedia, CardContent, CardActions, Collapse, IconButton, Typography,
Button, SnackBar, Input, InputLabel, InputAdornment, CircularProgress, CardActionArea, Popover,
ClickAwayListener} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Link} from 'react-router-dom'
import {Details} from '@material-ui/icons'
import config from '../../config'
const axios = require('axios').default;

const useStyles = makeStyles(theme => ({
    root: {
        maxWidth: 360
    },
    media: {
        height: 0,
        paddingTop: '56.25%'
    },
}));

export default class BinCard extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.state = {
            binId: this.props.id,
            parentId: "",
            binInfo: {}
        }
    }
    componentDidMount() {
        this.getBinInfo();
    }
    getBinInfo() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/info?id=${this.state.binId}`)
        .then(res => {
            //console.log(res);
            const bin = res.data;
            this.setState({binInfo: bin});
        })
    }
    goToBin = (event) => {
        console.log("going to bin")
        event.preventDefault();
    }
    goToBin2 = (event) => {
        console.log("going to bin")
        window.location.pathname = `/explore/bin/${this.state.binInfo.id}`;
    }
    goToParent = () => {

    }
    render() {
        return (
            <Card style={{maxWidth: '300px', maxHeight: '150px'}}>
                <CardHeader subheader={this.state.binInfo.name} />
                <CardContent>
                    <Link to={`/explore/bin/${this.state.binId}`}>
                    <Button variant="contained"
                        onMouseDown={this.goToBin}
                        onClick={this.goToBin2}
                        color="primary" >
                        More <Details />
                    </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }
}