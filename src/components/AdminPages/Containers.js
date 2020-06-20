import React from 'react'
import {withStyles, Table, TableBody, TableCell, TableContainer,
TableHead, TablePagination, TableRow, TableSortLabel, Typography, Paper,
FormControlLabel, Switch, CircularProgress, IconButton, Fab, Modal} from '@material-ui/core'
import {Delete, FilterList, Edit, Add} from '@material-ui/icons'
import ContainerAdd from './Forms/Add/ContainerAdd'
import config from '../../config'

const axios = require('axios').default;

const columns = [
    {id: 'id', label: 'ID', minWidth: 60},
    {id: 'name', label: 'Name', minWidth: 80},
    {id: 'location', label: 'Location', minWidth: 100},
    {id: 'rows', label: 'Rows', minWidth: 80},
    {id: 'columns', label: 'Columns', minWidth: 50},
    {id: 'modify', label: 'Edit', minWidth: 50},
    {id: 'delete', label: 'Delete', minWidth: 50},
];

const styles = theme => ({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: '75%',
        border: 'none',
    },
    categoryImg: {
        width: '80px',
        height: '80px',
        position: 'static',
        float: 'none',
    },
    fabBtn: {
        margin: 0,
        top: 'auto',
        right: '20px',
        bottom: '20px',
        left: 'auto',
        position: 'fixed'
    },
    modalPaper: {
        position: 'absolute',
        width: 650,
        backgroundColor: 'white',
        border: 'none',
        boxShadow: '10px 10px 5px #6a6a6a',
        padding: '20px',
    },
});

class Containers extends React.Component {

    constructor(props) {
        super(props);
        this.classes = props.classes;
        this.props = props;
        this.state = {
            page: 0,
            rowsPerPage: 10,
            loaded: false,
            data: null,
            modalOpen: false,
            modalStyle: {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            },
        };
    }

    componentWillMount() {
        this.getCategoryRows();
    }

    handleChangePage = (event, newPage) => {
        this.setState({page: newPage});
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({rowsPerPage: +event.target.value});
        this.setState({page: 0});
    }

    getCategoryRows() {
        axios.get(`http://${config.serverIP}:${config.serverPort}/inv_sys/api/storage_container/get/all`)
        .then((response) => {
            this.setState({data: response.data});
            //console.log(response.data);
            this.setState({loaded: true});
        })
        .catch((error) => {

        })
    }

    addCategory = () => {
        this.setState({modalOpen: true});
    }

    handleClose = () => {
        this.setState({modalOpen: false});
    }

    editCategory = (categoryId) => {
        console.log("editing ", categoryId);
    }

    deleteCategory = (categoryId) => {
        console.log("deleting ", categoryId);
    }

    catCreated = () => {
        this.setState({loaded: false});
        this.getCategoryRows();
        this.handleClose();
    }

    render() {
        return (
            <>
            {(this.state.loaded) ? 
                <>
                <Paper className={this.classes.root}>
                <TableContainer className={this.classes.container}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.id}
                                style={{minWidth: column.minWidth}}
                                align="center"
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.state.data.slice(this.state.page * this.state.rowsPerPage, this.state.page
                        * this.state.rowsPerPage + this.state.rowsPerPage).map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                <TableCell align="center">
                                    {row.id}
                                </TableCell>
                                <TableCell align="center">
                                    {row.name}
                                </TableCell>
                                <TableCell align="center">
                                    {row.location}
                                </TableCell>
                                <TableCell align="center">
                                    {row.rows}
                                </TableCell>
                                <TableCell align="center">
                                    {row.cols}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => {this.editCategory(row.id)}}>
                                        <Edit />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => {this.deleteCategory(row.id)}}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                </TableContainer>
                <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={this.state.data.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
                </Paper>
                <Fab color="primary" onClick={this.addCategory} className={this.classes.fabBtn}>
                    <Add />
                </Fab>
                <Modal
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                >
                    <div style={this.state.modalStyle} className={this.classes.modalPaper}>
                        <ContainerAdd whenSubmitted={this.catCreated} />
                    </div>
                    
                </Modal>
                </>
                :
                <CircularProgress />
            }
            </>
        )
    }
}

export default withStyles(styles)(Containers);