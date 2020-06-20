import React from 'react'
import NavBar from './NavBar';
import {withRouter} from 'react-router-dom'
import PartCard from './Parts/PartCard'

class Root extends React.Component {
    log() {
        this.props.history.push('/login')
    }
    render() {
        return (
            <div>
            <NavBar page={this.props.location.pathname} />
            <h1>Home Page</h1>
            </div>
        )
    }
}

export default withRouter(Root);