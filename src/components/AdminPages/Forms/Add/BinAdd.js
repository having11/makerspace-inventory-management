import React from 'react'
import {FormGroup, TextField, Button, Input, FormControl, InputLabel, Select,
MenuItem, CircularProgress} from '@material-ui/core'
import {DropzoneArea} from 'material-ui-dropzone'
import {Add, Clear} from '@material-ui/icons'
import config from '../../../../config'

const axios = require('axios').default;

export default class BinAdd extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.whenSubmitted = props.whenSubmitted;
        this.state = {
            formControls: {
                container_id: {
                    value: ''
                },
                row: {
                    value: ''
                },
                col: {
                    value: ''
                },
                name: {
                    value: ''
                },
                width: {
                    value: ''
                },
                height: {
                    value: ''
                },
                rfid_string: {
                    value: ''
                },
                selectedContainer: {
                    value: ''
                },
                selectedLocation: {
                    value: ''
                },
                selectedContainerIndex: {
                    value: ''
                },
            },
            binList: [],
            containerList: [],
            loaded: false,
            validLocations: [],
        }
    }

    resetForm = () => {
        this.setState({
            formControls: {
            container_id: {
                value: ''
            },
            row: {
                value: ''
            },
            col: {
                value: ''
            },
            name: {
                value: ''
            },
            width: {
                value: ''
            },
            height: {
                value: ''
            },
            rfid_string: {
                value: ''
            },
            selectedContainer: {
                value: ''
            },
            selectedLocation: {
                value: ''
            },
            selectedContainerIndex: {
                value: ''
            },
        }});
    }

    componentWillMount() {
        this.loadContainers();
    }

    loadContainers = () => {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/all`)
        .then((response) => {
            this.setState({containerList: response.data});
            this.setState({loaded: true});
        })
    }

    containerChangeHandler = (event) => {
        this.changeHandler({target: {
            name: "selectedContainerIndex",
            value: event.target.value
        }});
        this.getBins(Number(event.target.value));
    }

    getBins = (containerIndex) => {
        //console.log(containerIndex);
        const currentContainer = this.state.containerList[containerIndex];
        //console.log(currentContainer);
        let validLocations = new Array();
        axios.get(
            `http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/bin?id=${
                currentContainer.id}`)
            .then((response) => {
                this.setState({binList: response.data});
                for(let i = 0; i < currentContainer.rows; i++)
                    for(let j = 0; j < currentContainer.cols; j++)
                        validLocations.push([i, j]);
                for (const bin of response.data) {
                    let invalidIndex = bin.row * currentContainer.cols + bin.column;
                    validLocations[invalidIndex] = 
                        [-1, -1];
                }
                //console.log(validLocations);
                this.setState({validLocations: validLocations});
            })
    }

    changeHandler = event => {
        const name = event.target.name,
            value = event.target.value;
        //console.log(name, ": ", value);
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
        const location = JSON.parse(currentForm.selectedLocation.value);
        let payload = {
            container_id: this.state.containerList[currentForm.selectedContainerIndex.value].id,
            name: currentForm.name.value,
            row: location[0],
            col: location[1],
            width: currentForm.width.value,
            height: currentForm.height.value,
            rfid_string: currentForm.rfid_string.value,
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        };
        console.log(payload);
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/bin/create`,
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
        if(this.state.loaded)
        return (
            <>
            <h5>Add a new bin</h5>
            <form>
            <div style={{width: '100%', margin: '0 auto', paddingLeft: '25%'}}>
            <FormControl>
                <InputLabel shrink id="bin-add-container">
                    Container
                </InputLabel>
                <Select labelId="bin-add-container"
                value={this.state.formControls.selectedContainerIndex.value}
                onChange={this.containerChangeHandler}
                displayEmpty required name="selectedContainer">
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {this.state.containerList.map((container, index) => {
                    //console.log(container, index);
                    return (
                        <MenuItem value={index}>
                            {container.name}
                        </MenuItem>
                    )
                })}
                </Select>
            </FormControl>
            <TextField id="bin-name" label="Name" type="search"
                name="name" value={this.state.formControls.name.value} 
                onChange={this.changeHandler} required 
                error={this.state.uploadError}
                style={{margin: '10px'}} />
            <FormControl>
                <InputLabel shrink id="bin-add-location">
                    Row, Column
                </InputLabel>
                <Select labelId="bin-add-location"
                value={this.state.formControls.selectedLocation.value}
                onChange={this.changeHandler} required
                displayEmpty name="selectedLocation">
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {this.state.validLocations.map((locations) => {
                    if(locations[0] !== -1 && locations[1] !== -1)
                    return (
                        <MenuItem value={JSON.stringify(locations)}>
                            {locations[0]+1}, {locations[1]+1}
                        </MenuItem>
                    );
                    else return null;
                })}
                </Select>
            </FormControl>
            <TextField id="bin-width" label="Width (cm)" type="number"
                name="width" value={this.state.formControls.width.value}
                type="number" onChange={this.changeHandler} required 
                style={{width: '100px', margin: '10px'}} />
            <TextField id="bin-height" label="Height (cm)" type="number"
                name="height" value={this.state.formControls.height.value}
                type="number" onChange={this.changeHandler} required 
                style={{width: '100px', margin: '10px'}} />
            <TextField id="bin-rfid" label="RFID String" type="search"
                name="rfid_string" value={this.state.formControls.rfid_string.value} 
                onChange={this.changeHandler} 
                style={{margin: '10px'}} />
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
        else return <CircularProgress />
    }


}