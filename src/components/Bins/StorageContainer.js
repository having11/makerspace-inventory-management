import React from 'react'
import {Link, Switch, Route, Redirect, matchPath} from 'react-router-dom'
import PartCard from '../Parts/PartCard'
import {Typography, CircularProgress,
Button, SnackBar, Input, InputLabel, InputAdornment,
ClickAwayListener, TextField, Snackbar, Paper} from '@material-ui/core' 
import {Alert as MuiAlert} from '@material-ui/lab'
import {Row, Col, Container} from 'react-grid-system'
import config from '../../config'
import AddCartElem from '../Parts/AddCartElem'
import './StorageContainer.css'

const axios = require('axios').default;

export default class StorageContainer extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        //console.log(props);
        this.state = {
            containerInfo: props.containerData,
            binList: null,
            rawData: null,
            highlightedBin: (props.highlighted ? props.highlighted : [-1, -1]),
            loaded: false,
        }
        
    }
    componentWillReceiveProps(newProps) {
        this.setState({highlightedBin: newProps.highlighted ? newProps.highlighted : [-1, -1]});
    }
    getBinInfo() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/bin?id=${this.state.containerInfo.id}`)
        .then(res => {
            let data = res.data;
            //console.log(data);
            this.setState({rawData: data});
            let info = this.state.containerInfo;
            let emptyList = [];
            for(let i=0; i<info.rows; i++) {
                let row = [];
                for(let j=0; j<info.cols; j++) {
                    row.push({name: '', id: ''});
                }
                emptyList.push(row);
            }
            //console.log(emptyList);
            
            for(let i=0; i<data.length; i++) {
                let bin = data[i];
                //console.log(bin);
                emptyList[bin.row][bin.column].name = bin.name;
                emptyList[bin.row][bin.column].id = bin.id;
            }
            this.setState({binList: emptyList});
            this.setState({loaded: true});
        });
    }
    componentWillMount() {
        this.getBinInfo();
    }
    render() {
        let rows = [];
        if(this.state.loaded){
        
        for(var i=0; i<this.state.binList.length; i++) {
            let cell = [];
            for(var j=0; j<this.state.binList[0].length; j++) {
                let td;
                if(i === this.state.highlightedBin[0] && j === this.state.highlightedBin[1]) {
                    td = <td className="td-highlight td-storage"><Link to={`/explore/bin/${this.state.binList[i][j].id}`}>
                    <Typography variant="body1" component="p">
                        {this.state.binList[i][j].name}
                    </Typography></Link></td>
                } else {
                    td = <td className="td-storage">
                    <Link to={`/explore/bin/${this.state.binList[i][j].id}`}><Typography variant="body1" component="p">
                        {this.state.binList[i][j].name}
                    </Typography></Link></td>
                }
                cell.push(td);
            }
            rows.push(<tr>{cell}</tr>);
        }}
        return (
            <>
            <div className="storage-container">
            <Typography variant="h4" component="h4" color="textPrimary">
                <a href={`/explore/storage/${this.state.containerInfo.id}`}>
                    {this.state.containerInfo.name} in {this.state.containerInfo.location}
                </a>
            </Typography>
            <br />
            {this.state.loaded ? <table className="storage">
                <tbody>
                    {rows}
                </tbody>
            </table>
            : <CircularProgress />}
            </div>
            </>
        )
    }
}