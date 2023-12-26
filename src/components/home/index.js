import React from 'react';
import Header from '../header';
import Footer from '../footer';
import axios from 'axios';
import BASE_URL from '../config';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListData from '../listData';
import AddUser from '../addUser'
import AddVehicle from '../addVehicle'
class Home extends React.Component{
    constructor(props){
        super(props);

        this.state ={
            home:true,
            edit:false,
            superUser:true,
            addUser:false,
            addVehicle:false,
            employeeData:[]
        }
    }
    handleEdit = () =>{
        this.setState({home:false, edit:true})
    }
    getEmployeeData = () =>{
        // e.preventDefault();
        let url = `${BASE_URL}/employee`
        axios.get(url)
        .then(response =>{
            this.setState({employeeData:response.data})
        })
        .catch(error =>{
            toast.error("Failed to fetch Vehicle Data");
        })
    }
    componentDidMount(){
        this.getEmployeeData();
    }
    addUser = () =>{
        this.setState({home:false, addUser:true, addVehicle:false});
    }
    addVehicle = () =>{
        this.setState({home:false, addUser:false, addVehicle:true});
    }
    render(){
        return(
            <>
            <ToastContainer />
            <Header />
           {this.state.home &&  <div className='container mt-5'>
                <div className='row'>
                    <div className='col'>
                        <button className='btn btn-primary m-2' style={{float:"right"}} onClick={this.addVehicle}>Add Vehicle</button>
                        {this.state.superUser && <button className='btn btn-success m-2' style={{float:"right"}} onClick={this.addUser}>Add User</button>}
                    </div>
                    <div className='w-100'></div>
                    <hr />
                    <div className='w-100'></div>
                    <div className='col'>
                        <ListData employeeData={this.state.employeeData} />
                    </div>
                  
                </div>
            </div>
            }
            {this.state.addUser &&
                <AddUser />
            }
            {this.state.addVehicle &&
                <AddVehicle />
            }
            {this.state.edit && 
                <AddVehicle />
            }
            <Footer />
            </>
        )
    }
}

export default Home;