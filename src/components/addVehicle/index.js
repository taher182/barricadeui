import React from 'react';
import BASE_URL from '../config';
import Home from '../home';
import ListData from '../listData';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
let employeeData = Cookies.get('employeeData');
class addVehicle extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            employeeId:'',
            name:'',
            numberPlate:'',
            home:false,
            addUser:true,
            employeeError:false,
            employeeData:[]
        }
    }
    
    handleChange = (e) => {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
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
        // Retrieve employee data when 'Back' is clicked
        const employeeData = Cookies.get('employeeData');
        this.setState({
            home: true,
            addUser: false,
            employeeData: employeeData ? JSON.parse(employeeData) : [] // Parse and handle undefined/null
           
        });
        if (this.props.onBack) {
            this.props.onBack();
        }
    }
    // handleBack = (e) => {
    //     e.preventDefault();
    //     // Notify parent component (Home) to reset its state
       
    // };
    
    render(){
        return(
            <>
            {this.state.addUser && 
              <div className='container align-items-center justify-content-center d-flex ' style={{ minHeight: '75vh' }}>
                
              <div className='card p-4' style={{ width: '400px' }}>
              <h4 className='text-center'>Add Vehicle</h4>
              <hr />
                  <form onSubmit={this.createUser}>
                  <div className="form-group mb-3">
                              <label htmlFor="employeeId">Employee Id<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="employeeId" placeholder="Enter employee id" name='employeeId' onChange={this.handleChange} value={this.state.employeeId} required/>
                              {this.state.employeeError && <small className='text-danger'>Employee already exists</small>}
                          </div>
                  <div className="form-group mb-3">
                              <label htmlFor="name">Name<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="Email" placeholder="Enter name" name='name' onChange={this.handleChange} value={this.state.name} required/>

                          </div>
                  <div className="form-group mb-3">
                              <label htmlFor="numberplate">Number Plate<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="numberplate" placeholder="Enter number plate" name='numberPlate' onChange={this.handleChange} value={this.state.numberPlate} required/>

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
                <ListData employeeData={this.state.employeeData} />
            }
            </>
        )
    }
}


export default addVehicle;