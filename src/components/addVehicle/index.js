import React from 'react';
import BASE_URL from '../config';
import Home from '../home';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
class addVehicle extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            employeeId:'',
            name:'',
            numberPlate:'',
            home:false,
            addUser:true,
            employeeError:false
        }
    }
    handleChange = (e) => {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
    }
    handleUserNameChange = (e) =>{
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value, userError:false });
    }
    createUser = (e) => {
        e.preventDefault();
        let formData = new FormData();
        formData.append('employee_id', this.state.employeeId);
        formData.append('name', this.state.name);
        formData.append('number_plate', this.state.numberPlate);
    
        let url = `${BASE_URL}/employee`;
        axios.post(url, formData)
            .then(response => {
                toast.success("Vehicle added successfully");
                // Clear form values after successful addition
                this.setState({
                    employeeId: '',
                    name: '',
                    numberPlate: '',
                    employeeError: false // Reset any error states if needed
                });
            })
            .catch(error => {
                const employeeError = error?.response?.data?.user_name;
                if (employeeError) {
                    this.setState({ employeeError: true });
                }
                toast.error("Failed to add Vehicle");
            });
    }
    handleBack = (e) =>{
        e.preventDefault();
        this.setState({
            home:true, addUser:false
        });
    }
    render(){
        return(
            <>
            {this.state.addUser && 
              <div className='container align-items-center justify-content-center d-flex mt-5' style={{ minHeight: '75vh' }}>
                
              <div className='card p-4' style={{ width: '400px' }}>
              <h4 className='text-center'>Add Vehicle</h4>
              <hr />
                  <form onSubmit={this.createUser}>
                  <div className="form-group mb-3">
                              <label htmlFor="employeeId">Employee Id<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="employeeId" placeholder="Enter employee id" name='employeeId' onChange={this.handleUserNameChange} value={this.state.userName} required/>
                              {this.state.employeeError && <small className='text-danger'>Employee already exists</small>}
                          </div>
                  <div className="form-group mb-3">
                              <label htmlFor="name">Name<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="Email" placeholder="Enter name" name='name' onChange={this.handleChange} value={this.state.password} required/>

                          </div>
                  <div className="form-group mb-3">
                              <label htmlFor="numberplate">Number Plate<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="numberplate" placeholder="Enter number plate" name='numberPlate' onChange={this.handleChange} value={this.state.password} required/>

                          </div>

                          <div className="form-group mb-3">
                              <button className="btn btn-primary w-100" >Add</button>
                          </div>
                  </form>
                  <hr />
                  <button className=' btn btn-info mt-2' onClick={this.handleBack}>Back</button>
                  </div>

              </div>
            }
            {
                this.state.home &&
                <Home />
            }
            </>
        )
    }
}


export default addVehicle;