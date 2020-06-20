import React from 'react'
import PartCard from './PartCard'
import {CircularProgress} from '@material-ui/core'
import config from '../../config'

const axios = require('axios').default;

export default class FeaturedPartPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            partsList: null,
            loaded: false
        }
    }

    getParts() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/featured`)
        .then((response) => {
            this.setState({partsList: response.data});
            this.setState({loaded: true});
        })
    }

    componentWillMount() {
        this.getParts();
    }

    render() {
        var partCards = null;
        if(this.state.loaded) {
            if(this.state.partsList.length > 0) {
                partCards = this.state.partsList.map(item => (
                    <PartCard id={item.id} category={item.category}
                        isLoggedIn={Boolean(localStorage.getItem('token'))} 
                        key={item.category+item.id} className="part-card" />
                ));
            } else {
                partCards = <h2>No featured parts found</h2>
            }
        } else {
            partCards = <CircularProgress />
        }
        return (
            <> 
                {partCards}
            </>
        )
    }
} 