import React from 'react'
import {FormGroup, TextField, Button, Input, Select, MenuItem, FormControl,
InputLabel, CircularProgress, FormControlLabel, Switch, withStyles} from '@material-ui/core'
import {DropzoneArea} from 'material-ui-dropzone'
import {Add, Clear} from '@material-ui/icons'
import config from '../../../../config'

const axios = require('axios').default;

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    inputEl: {
        minWidth: '60px',
        margin: '10px',
    }
});

class PartAdd extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.whenSubmitted = props.whenSubmitted;
        this.classes = props.classes;
        this.state = {
            formControls: {
                id: {
                    value: ''
                },
                name: {
                    value: ''
                },
                datasheetURL: {
                    value: ''
                },
                description: {
                    value: ''
                },
                tags: {
                    value: ''
                },
                isDiscrete: {
                    value: false
                },
                categoryId: {
                    value: ''
                },
                price: {
                    value: 0.0
                },
                quantity: {
                    value: 0
                },
                containerId: {
                    value: ''
                },
                binId: {
                    value: ''
                },
                isSMD: {
                    value: false
                },
                package: {
                    value: ''
                },
                value: {
                    value: ''
                },
                powerRating: {
                    value: ''
                }
            },
            loaded: false,
            categoryList: [],
            containerList: [],
            binList: [],
            uploadError: false,
            thumbnail: [],
            partImg: [],
        }
    }

    resetForm = () => {
        this.setState({formControls: {
            id: {
                value: ''
            },
            name: {
                value: ''
            },
            description: {
                value: ''
            },
            tags: {
                value: ''
            },
            datasheetURL: {
                value: ''
            },
            isDiscrete: {
                value: false
            },
            categoryId: {
                value: ''
            },
            price: {
                value: 0.0
            },
            quantity: {
                value: 0
            },
            containerId: {
                value: ''
            },
            binId: {
                value: ''
            },
            isSMD: {
                value: false
            },
            package: {
                value: ''
            },
            value: {
                value: ''
            },
            powerRating: {
                value: ''
            }
        }});
    }

    componentWillMount() {
        this.getCategories();
        this.getContainers();
    }

    boxChangeHandler = (event) => {
        this.changeHandler({target: {
            name: event.target.name,
            value: event.target.checked
        }});
        this.setState({});
    }

    changeHandler = event => {
        const name = event.target.name,
            value = event.target.value;
        console.log(event.target);
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

    discreteChangeHandler = (event) => {
        let name = event.target.name,
            value = event.target.value;
        if(name === "isSMD")
            value = event.target.checked;
        let is_smd = this.state.formControls.isSMD.value;
        let newName = (is_smd) ? "SMD " : "";
        newName += this.state.formControls.categoryId.value + ' ' +
            this.state.formControls.package.value + ' ' + 
            this.state.formControls.value.value + ' ' +
            this.state.formControls.powerRating.value;
        this.setState({
            formControls: {
                ...this.state.formControls,
                [name]: {
                    ...this.state.formControls[name],
                    value
                },
                "name": {
                    value: newName
                }
            }
        });
        this.setState({});
    }

    updateThumbnail = (files) => {
        console.log(files);
        this.setState({thumbnail: files});
    }

    updateFiles = (files) => {
        console.log(files);
        this.setState({partImg: files});
    }

    getCategories() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/category/all`)
        .then((response) => {
            this.setState({categoryList: response.data});
            console.log(this.state.categoryList);
            this.setState({loaded: true});
        })
    }

    getContainers() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/all`)
        .then((response) => {
            this.setState({containerList: response.data});
        })
    }

    containerChangeHandler = (event) => {
        this.changeHandler({target: {
            name: "containerId",
            value: event.target.value
        }});
        this.getBins(event.target.value);
    }

    updateName = () => {
        let is_smd = this.state.formControls.isSMD.value;
        let newName = (is_smd) ? "SMD " : "";
        newName += this.state.formControls.categoryId.value + ' ' +
            this.state.formControls.package.value + ' ' + 
            this.state.formControls.value.value + ' ' +
            this.state.formControls.powerRating.value;
        console.log(newName);
        let name = "name";
        this.setState({
            formControls: {
                ...this.state.formControls,
                [name]: {
                    value: newName
                }
            }
        });
    }

    getBins = (containerId) => {
        axios.get(
        `http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/bin?id=${containerId}`)
        .then((response) => {
            this.setState({binList: response.data});
        })
    }

    submitForm = () => {
        this.setState({uploadError: false});
        let formData = new FormData();
        const currentForm = this.state.formControls;
        let payload = {
            category: currentForm.categoryId.value,
            name: currentForm.name.value,
            price: currentForm.price.value,
            datasheet: currentForm.datasheetURL.value,
            description: currentForm.description.value,
            tags: JSON.stringify(currentForm.tags.value.split(',')),
            is_discrete: (currentForm.isDiscrete.value) ? '1' : '0',
            quantity: currentForm.quantity.value,
            bin_id: currentForm.binId.value,
            package: currentForm.package.value,
            is_smd: (currentForm.isSMD.value) ? '1' : '0',
            value: currentForm.value.value,
            power_rating: currentForm.powerRating.value,
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        };
        const file = new Blob([this.state.thumbnail[0]], 
            {type: this.state.thumbnail[0].type});
        formData.append('thumb', file, this.state.thumbnail[0].name);
        for(let name in payload)
            formData.append(name, payload[name]);
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/create`,
            formData, {headers: {"Content-Type": "multipart/form-data"}}
        )
        .then(res => {
            let imageFormData = new FormData();
            let counter = 0;
            for(let file of this.state.partImg) {
                console.log(file);
                let fileData = new Blob([file], {type: file.type});
                imageFormData.append("img" + String(counter++), fileData, file.name);
            }
            imageFormData.append('username', localStorage.getItem('username'));
            imageFormData.append('token', localStorage.getItem('token'));
            imageFormData.append('id', res.data.id);
            imageFormData.append('category', currentForm.categoryId.value);
            axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/part/add_image`,
                imageFormData, {headers: {"Content-Type": "multipart/form-data"}}
            )
            .then(res => {
                this.whenSubmitted();
            })
            .catch((error) => {
                this.setState({uploadError: true});
                console.log(error);
            })
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
            <h5>Add a new part</h5>
            <form>
            <div style={{width: '80%', margin: '0 auto', display: 'flex'}} className={this.classes.root}>
            <FormControl className={this.classes.inputEl}>
                <InputLabel shrink id="part-add-category">
                    Category
                </InputLabel>
                <Select labelId="part-add-category"
                value={this.state.formControls.categoryId.value}
                onChange={this.changeHandler}
                displayEmpty required name="categoryId">
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {this.state.categoryList.map((category) => {
                    return (
                        <MenuItem value={category.id}>
                            {category.name}
                        </MenuItem>
                    )
                })}
                </Select>
            </FormControl>
            <TextField id="part-name" label="Name" type="search"
                name="name" value={this.state.formControls.name.value}
                onChange={this.changeHandler} required 
                InputProps={{
                    readOnly: this.state.formControls.isDiscrete.value
                }} className={this.classes.inputEl} />
            <TextField id="part-desc" label="Description" type="search"
                name="description" value={this.state.formControls.description.value}
                multiline rowsMax={4} onChange={this.changeHandler} required 
                style={{width: '200px'}}
                className={this.classes.inputEl} />
            <TextField id="part-tags" label="Tags" type="search"
                name="tags" value={this.state.formControls.tags.value}
                onChange={this.changeHandler} 
                className={this.classes.inputEl} />
            <TextField id="part-datasheet" label="Datasheet URL" type="search"
                name="datasheetURL" value={this.state.formControls.datasheetURL.value}
                onChange={this.changeHandler} 
                className={this.classes.inputEl} />
            <FormControlLabel
            control={<Switch checked={this.state.formControls.isDiscrete.value}
                onChange={this.boxChangeHandler} name="isDiscrete" />}
            label="Discrete" color="primary" className={this.classes.inputEl}/>
            <FormControl className={this.classes.inputEl}>
                <InputLabel shrink id="part-add-container">
                    Storage Container
                </InputLabel>
                <Select labelId="part-add-container"
                value={this.state.formControls.containerId.value}
                onChange={this.containerChangeHandler}
                displayEmpty 
                required 
                name="containerId">
                <MenuItem value="" default>
                    <em>None</em>
                </MenuItem>
                {this.state.containerList.map((container) => {
                    return (
                        <MenuItem value={container.id}>
                            {container.name}
                        </MenuItem>
                    )
                })}
                </Select>
            </FormControl>
            <FormControl className={this.classes.inputEl}>
                <InputLabel shrink id="part-add-bin">
                    Bin
                </InputLabel>
                <Select labelId="part-add-bin"
                value={this.state.formControls.binId.value}
                onChange={this.changeHandler}
                displayEmpty 
                required 
                name="binId">
                <MenuItem value="" default>
                    <em>None</em>
                </MenuItem>
                {this.state.binList.map((bin) => {
                    return (
                        <MenuItem value={bin.id}>
                            {bin.name}
                        </MenuItem>
                    )
                })}
                </Select>
            </FormControl>
            <TextField label="Quantity" type="number"
            InputLabelProps={{shrink: true}}
            name="quantity"
            value={this.state.formControls.quantity.value}
            onChange={this.changeHandler} className={this.classes.inputEl} />
            <TextField label="Price" type="number"
            InputLabelProps={{shrink: true}}
            name="price" className={this.classes.inputEl}
            value={this.state.formControls.price.value}
            onChange={this.changeHandler} />
            {(this.state.formControls.isDiscrete.value) ? 
            <>
            <hr />
            <FormControlLabel
            control={<Switch checked={this.state.formControls.isSMD.value}
                onChange={this.discreteChangeHandler} name="isSMD" />}
            label="SMD" color="primary" className={this.classes.inputEl} />
            <TextField label="Package" type="search"
            InputLabelProps={{shrink: true}}
            name="package"
            value={this.state.formControls.package.value}
            onChange={this.discreteChangeHandler}
            required className={this.classes.inputEl} />
            <TextField label="Value" type="search"
            InputLabelProps={{shrink: true}}
            name="value"
            value={this.state.formControls.value.value}
            onChange={this.discreteChangeHandler} 
            required className={this.classes.inputEl} />
            <TextField label="Power Rating" type="search"
            InputLabelProps={{shrink: true}}
            name="powerRating" className={this.classes.inputEl}
            value={this.state.formControls.powerRating.value}
            onChange={this.discreteChangeHandler} />
            </> : 
            null}
            </div>
            <br />
            <h6>Thumbnail</h6>
            <DropzoneArea onChange={this.updateThumbnail} 
            acceptedFiles={['image/*']}
            filesLimit={1} showPreviewsInDropzone={true}
            showFileNames={true} maxFileSize={5000000} 
            style={{marginTop: '60px', height: '150px', width: '200px'}} />
            <br />
            <h6>Additional Images</h6>
            <DropzoneArea onChange={this.updateFiles} 
            acceptedFiles={['image/*']}
            filesLimit={12} showPreviewsInDropzone={true}
            showFileNames={true} maxFileSize={5000000} 
            style={{marginTop: '60px'}} />
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

export default withStyles(styles)(PartAdd);