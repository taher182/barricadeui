import React from 'react';
import BASE_URL from '../config'
import axios from 'axios'
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

class ListData extends React.Component {

    deleteVehicle = (id) =>{
        // e.preventDefault();
        let url = `${BASE_URL}/employee/${id}`
        axios.delete(url)
        .then(response =>{
            toast.success("Vehicle deleted Successfully");
        })
        .catch(error=>{
            toast.error("Failed to delete vehicle");
        })

    }
    render() {
        const { employeeData } = this.props;

        return (
            <div className='container-fluid d-flex align-items-center justify-content-center' >
                <div className='row justify-content-center'>
                    <div className='col-auto'>
                        <table className='table rounded-table text-center'>
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
                                            <button className='btn btn-info m-1'><FontAwesomeIcon icon={faEdit} /></button>
                                            <button className='btn btn-danger m-1'><FontAwesomeIcon icon={faTrashAlt} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default ListData;
