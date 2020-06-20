import React from 'react'
import {FormGroup, TextField, Button, Input} from '@material-ui/core'
import {DropzoneArea} from 'material-ui-dropzone'
import {Add, Clear} from '@material-ui/icons'
import config from '../../../../config'

const axios = require('axios').default;

export default class ContainerAdd extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.whenSubmitted = props.whenSubmitted;
        this.state = {
            formControls: {
                name: {
                    value: ''
                },
                location: {
                    value: ''
                },
                rows: {
                    value: ''
                },
                cols: {
                    value: ''
                },
                number_of_bins: {
                    value: ''
                }
            },
        }
    }

    resetForm = () => {
        this.setState({formControls: {
            name: {
                value: ''
            },
            location: {
                value: ''
            },
            rows: {
                value: ''
            },
            cols: {
                value: ''
            },
        }});
    }

    changeHandler = event => {
        const name = event.target.name,
            value = event.target.value;
        
        this.setState({
            formControls: {
                ...this.state.formControls,
                [name]: {
                    ...this.state.formControls[name],
                    value
                }
            }
        });
    }

    submitForm = () => {
        const currentForm = this.state.formControls;
        let payload = {
            location: currentForm.location.value,
            name: currentForm.name.value,
            rows: currentForm.rows.value,
            cols: currentForm.cols.value,
            number_of_bins: Number(currentForm.rows.value) * Number(currentForm.cols.value),
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        };
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/create`,
            payload, {headers: {"Content-Type": "application/json"}}
        )
        .then(res => {
            this.whenSubmitted();
        })
        .catch((error) => {
            this.setState({uploadError: true});
            console.log(error);
        })
    }

    render() {
        return (
            <>
            <h5>Add a new container</h5>
            <form>
            <div style={{width: '100%', margin: '0 auto', paddingLeft: '25%'}}>
            <TextField id="container-name" label="Name" type="search"
                name="name" value={this.state.formControls.name.value} 
                onChange={this.changeHandler} required 
                error={this.state.uploadError}
                style={{margin: '10px'}} />
            <TextField id="container-location" label="Location" type="search"
                name="location" value={this.state.formControls.location.value}
                onChange={this.changeHandler} required 
                style={{margin: '10px'}} />
            <br />
            <TextField id="container-rows" label="Rows" type="search"
                name="rows" value={this.state.formControls.rows.value}
                type="number" onChange={this.changeHandler} required 
                style={{width: '100px', margin: '10px'}} />
            <TextField id="container-cols" label="Columns" type="search"
                name="cols" value={this.state.formControls.cols.value}
                type="number" onChange={this.changeHandler} required 
                style={{width: '100px', margin: '10px'}} />
            </div>
            <Button
                variant="contained"
                color="secondary"
                endIcon={<Clear />}
                onClick={this.resetForm}
                style={{float: 'left', marginTop: '30px'}} 
            >
                Reset
            </Button>
            <Button 
                variant="contained"
                color="primary"
                endIcon={<Add />}
                onClick={this.submitForm}
                style={{float: 'right', marginTop: '30px'}}
            >
                Create
            </Button>
            </form>
            
            </>
        );
    }


}