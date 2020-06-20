import React from 'react'
import {FormGroup, TextField, Button, Input} from '@material-ui/core'
import {DropzoneArea} from 'material-ui-dropzone'
import {Add, Clear} from '@material-ui/icons'
import config from '../../../../config'

const axios = require('axios').default;

export default class CategoryAdd extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.whenSubmitted = props.whenSubmitted;
        this.state = {
            formControls: {
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
                }
            },
            uploadError: false,
            catImg: [],
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
            }
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

    updateFiles = (files) => {
        console.log(files);
        this.setState({catImg: files});
    }

    submitForm = () => {
        this.setState({uploadError: false});
        let formData = new FormData;
        const currentForm = this.state.formControls;
        let payload = {
            id: currentForm.id.value,
            name: currentForm.name.value,
            description: currentForm.description.value,
            tags: JSON.stringify(currentForm.tags.value.split(',')),
            username: localStorage.getItem('username'),
            token: localStorage.getItem('token')
        };
        const file = new Blob([this.state.catImg[0]], 
            {type: this.state.catImg[0].type});
        formData.append('thumb', file, this.state.catImg[0].name);
        for(let name in payload)
            formData.append(name, payload[name]);
        axios.post(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/category/create`,
            formData, {headers: {"Content-Type": "multipart/form-data"}}
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
            <h5>Add a new category</h5>
            <form>
            <div style={{width: '80%', margin: '0 auto'}}>
            <TextField id="cat-id" label="ID" type="search"
                name="id" value={this.state.formControls.id.value} 
                onChange={this.changeHandler} required 
                error={this.state.uploadError}
                style={{margin: '20px'}} />
            <TextField id="cat-name" label="Name" type="search"
                name="name" value={this.state.formControls.name.value}
                onChange={this.changeHandler} required 
                style={{margin: '20px 20px 20px 50px'}} />
            <TextField id="cat-desc" label="Description" type="search"
                name="description" value={this.state.formControls.description.value}
                multiline rowsMax={4} onChange={this.changeHandler} required 
                style={{width: '200px', margin: '20px'}} />
            <TextField id="cat-tags" label="Tags" type="search"
                name="tags" value={this.state.formControls.tags.value}
                onChange={this.changeHandler} 
                style={{margin: '20px'}} />
            </div>
            <br />
            <DropzoneArea onChange={this.updateFiles} 
            acceptedFiles={['image/*']}
            filesLimit={1} showPreviewsInDropzone={true}
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
    }


}