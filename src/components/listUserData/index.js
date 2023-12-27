import React from 'react';
import BASE_URL from '../config'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import AddUser from '../addUser';
import Cookies from 'js-cookie';
class ListUserData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: this.props.userData, // Initialize state with props
            list:true,
            edit:false,
            id:''
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.userData !== this.props.userData) {
            this.setState({ userData: this.props.userData });
        }
    }

    deleteUser = (id) => {
        // e.preventDefault();
        let url = `${BASE_URL}/user/${id}`
        axios.delete(url)
            .then(response => {
                toast.success("User deleted Successfully");
                toast.dismiss();
                this.setState(prevState => ({
                    userData: prevState.userData.filter(user => user.id !== id)
                }));
                Cookies.set('userData', JSON.stringify(this.state.userData))
            })
            .catch(error => {
                toast.error("Failed to delete User");
            })

    }
    handleDelete = (id) => {
        toast.warn(
            <div>
                <p>Are you sure you want to delete this user?</p>
                <button
                    className='btn btn-outline-warning m-1'
                    style={{ float: 'right' }}
                    onClick={() => toast.dismiss()} // Dismiss the toast on "No" button click
                >
                    No
                </button>
                <button
                    className='btn btn-warning m-1'
                    style={{ float: 'right' }}
                    onClick={() => this.deleteUser(id)} // Trigger delete function on "Yes" button click
                >
                    Yes
                </button>
            </div>,
            {
                position: toast.POSITION.TOP_CENTER,
                autoClose: false,
                closeButton: false,

            }
        );
    };

    handleEdit = (userId) => {
        this.setState({id:userId})
        this.setState({ edit: true, list: false });
    }
    
    render() {
        const { userData } = this.state;

        return (

            <>
                <ToastContainer />
                {this.state.list &&
                    <div className='container-fluid d-flex align-items-center justify-content-center' >
                        <div className='row justify-content-center'>
                        <div className='col text-light text-center'>
                                <h4>User Data</h4>

                                <hr />
                            </div>
                            <div className='w-100'></div>
                            <div className='col-auto'>
                                <table className='table rounded-table text-center'>
                                    <thead>
                                        <tr>
                                            <th>User Name</th>
                                            <th>Super User</th>
                                            <th>Password</th>
                                            <th>Action</th>
                                          
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {userData.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.user_name}</td>
                                                <td>{user.super_user ? 'Yes' : 'No'}</td>
                                                <td>{user.password}</td>
                                               
                                                <td>
                                                    <button className='btn btn-info m-1' onClick={() => this.handleEdit(user.id)}><FontAwesomeIcon icon={faEdit} /></button>
                                                    <button className='btn btn-danger m-1' onClick={() => this.handleDelete(user.id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                }

                {this.state.edit && 
                    <AddUser id={this.state.id} />
                }
            </>
        );
    }
}

export default ListUserData;
