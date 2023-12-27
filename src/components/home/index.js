import React from 'react';
import Header from '../header';
import Footer from '../footer';
import axios from 'axios';
import BASE_URL from '../config';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListData from '../listData';
import AddUser from '../addUser';
import AddVehicle from '../addVehicle';
import ListUserData from '../listUserData';
import Cookies from 'js-cookie';
class Home extends React.Component{
    constructor(props){
        super(props);

        this.state ={
            home:true,
            edit:false,
            superUser:true,
            addUser:false,
            addVehicle:false,
            listUsers:false,
            employeeData:[],
            userData:[]
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
            Cookies.set('employeeData', JSON.stringify(response.data))
        })
        .catch(error =>{
            toast.error("Failed to fetch Vehicle Data");
        })
    }
    getUserData = () =>{
        // e.preventDefault();
        let url = `${BASE_URL}/user`
        axios.get(url)
        .then(response =>{
            this.setState({userData:response.data})
            Cookies.set('userData', JSON.stringify(response.data))
        })
        .catch(error =>{
            toast.error("Failed to fetch user Data");
        })
    }
    componentDidMount(){
        this.getEmployeeData();
        this.getUserData();
        Cookies.set('userData', JSON.stringify(this.state.userData));
    }
    updateUserData = (updatedUser) => {
        this.setState(prevState => ({
            userData: prevState.userData.map(user => 
                user.id === updatedUser.id ? updatedUser : user
            )
        }));
    }
    
    addUser = () =>{
        this.setState({home:false, addUser:true, addVehicle:false, listUsers:false});
    }
    listUsers = () =>{
        this.setState({home:false, addUser:false, addVehicle:false,listUsers:true});
    }
    listVehicles = () =>{
        this.setState({home:true, addUser:false, addVehicle:false,listUsers:false});
    }
    addVehicle = () =>{
        this.setState({home:false, addUser:false, addVehicle:true, listUsers:false});
    }

    handleAddVehicleBack = () => {
        this.setState({ home: true, addVehicle: false });
        this.getEmployeeData(); // Refresh data if needed
    };
    handleAddUserBack = () => {
        this.setState({ home: true, addUser: false });
        this.getEmployeeData(); // Refresh data if needed
    };
    handleAddListUsersBack = () => {
        this.setState({ home: true, listUsers: false });
        this.getEmployeeData(); // Refresh data if needed
    };
    render(){
        return(
            <>
            <ToastContainer />
            <Header />
           <div className='container mt-5'>
                <div className='row'>
                    <div className='col'>
                        <button className='btn btn-primary m-2' style={{float:"right"}} onClick={this.addVehicle}>Add Vehicle</button>
                        <button className='btn btn-secondary m-2' style={{float:"right"}} onClick={this.listVehicles}>List Vehicles</button>
                        {this.state.superUser && 
                        <>
                        <button className='btn btn-success m-2' style={{float:"right"}} onClick={this.addUser}>Add User</button>
                        <button className='btn btn-warning m-2' style={{float:"right"}} onClick={this.listUsers}>List Users</button>
                        
                        </>
                        }
                       
                    </div>
                    <div className='w-100'></div>
                    <hr />
                    <div className='w-100'></div>
                    {this.state.home &&  
                    <div className='col'>
                        <ListData employeeData={this.state.employeeData} />
                    </div>
                   }
                     {this.state.listUsers &&  
                    <div className='col'>
                        <ListUserData userData={this.state.userData} />
                    </div>
                   }
                   {this.state.edit && 
                   <AddVehicle />
                   }
                </div>
            </div>
            {this.state.addUser &&
    <AddUser onBack={this.handleAddUserBack} onUpdateUserData={this.updateUserData} />
}
            {this.state.listUsers &&
                <listUserData onBack={this.handleListUsersBack} />
            }
            {this.state.addVehicle &&
                <AddVehicle onBack={this.handleAddVehicleBack}/>
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