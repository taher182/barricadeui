import React from 'react';
import BASE_URL from '../config'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import AddVehicle from '../addVehicle';
import Cookies from 'js-cookie';
class ListData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeData: [], // Initialize state with props
            list:true,
            edit:false,
            id:''
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.employeeData !== this.props.employeeData) {
            this.setState({ employeeData: this.props.employeeData });
        }
    }

    getEmployeeData = () =>{
        // e.preventDefault();
        let url = `${BASE_URL}/employee`
        axios.get(url)
        .then(response =>{
            this.setState({employeeData:response.data})
            Cookies.set('employeeData', JSON.stringify(response.data))
        })
        .catch(error =>{
            toast.error("Failed to fetch Vehicle Data");
        })
    }
    componentDidMount(){
        this.getEmployeeData();
        
    }

    deleteVehicle = (id) => {
        // e.preventDefault();
        let url = `${BASE_URL}/employee/${id}`
        axios.delete(url)
            .then(response => {
                toast.success("Vehicle deleted Successfully");
                toast.dismiss();
                this.setState(prevState => ({
                    employeeData: prevState.employeeData.filter(employee => employee.id !== id)
                }));
                Cookies.set('employeeData', JSON.stringify(this.state.employeeData))
            })
            .catch(error => {
                toast.error("Failed to delete vehicle");
            })

    }
    handleDelete = (id) => {
        toast.warn(
            <div>
                <p>Are you sure you want to delete this vehicle?</p>
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
                    onClick={() => this.deleteVehicle(id)} // Trigger delete function on "Yes" button click
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
        this.setState({id:userId});
        this.setState({ edit: true, list: false });
    }

    render() {
        const { employeeData } = this.state;

        return (

            <>
                <ToastContainer />
                {this.state.list &&
                    <div className='container-fluid  d-flex align-items-center justify-content-center' style={{overflow:"auto"}}>
                        <div className='row justify-content-center '>
                            <div className='col text-light text-center'>
                                <h4>Vehicle Data</h4>

                                <hr />
                            </div>
                            <div className='w-100'></div>
                            <div className='col m-1'>
                                <table className='table text-center'>
                                    <thead>
                                        <tr>
                                            <th>Employee Id</th>
                                            <th>Employee Name</th>
                                            <th>Vehicle Number Plate</th>
                                            <th>In Time</th>
                                            <th>Out Time</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeeData.map(employee => (
                                            <tr key={employee.id}>
                                                <td>{employee.employee_id}</td>
                                                <td>{employee.name}</td>
                                                <td>{employee.number_plate}</td>
                                                <td>{employee.in_time}</td>
                                                <td>{employee.out_time}</td>
                                                <td>
                                                    <button className='btn btn-info m-1' onClick={() => this.handleEdit(employee.id)}><FontAwesomeIcon icon={faEdit} /></button>
                                                    <button className='btn btn-danger m-1' onClick={() => this.handleDelete(employee.id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
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
                    <AddVehicle id={this.state.id}/>
                }
            </>
        );
    }
}

export default ListData;
