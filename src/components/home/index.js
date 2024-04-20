import React from 'react';
import Header from '../header';
import Footer from '../footer';
import BASE_URL from '../config';
import {toast, ToastContainer} from 'react-toastify';
import { Navigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import ListData from '../listData';
import AddUser from '../addUser';
import AddVehicle from '../addVehicle';
import ListUserData from '../listUserData';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus, faCar, faSignOutAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import TesseractVideoRecognition from '../tesseractVideoRecognition';
class Home extends React.Component{
    constructor(props){
        super(props);

        this.state ={
            home:true,
            edit:false,
            superUser:Cookies.get('super_user'),
            addUser:false,
            addVehicle:false,
            listUsers:false,
            employeeData:[],
            userData:[],
            toLogin:false,
            camera:false
        }
    }
    handleEdit = () =>{
        this.setState({home:false, edit:true})
    }
   
    checkData = () =>{
        

        const {superUser } = this.state
        if(superUser ==='undefined' || superUser ===undefined){
            this.setState({toLogin:true})
        }
    }
    componentDidMount(){
        // this.getEmployeeData();
        // this.getUserData();
        this.checkData();
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
        this.setState({home:false, addUser:true, addVehicle:false, listUsers:false, camera:false});
    }
    listUsers = () =>{
        this.setState({home:false, addUser:false, addVehicle:false,listUsers:true, camera:false});
    }
    listVehicles = () =>{
        this.setState({home:true, addUser:false, addVehicle:false,listUsers:false, camera:false});
    }
    textRecognition = () =>{
        this.setState({home:false, addUser:false, addVehicle:false,listUsers:false, camera:true});
    }
    addVehicle = () =>{
        this.setState({home:false, addUser:false, addVehicle:true, listUsers:false, camera:false});
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
    LogoutConfirmation = () =>{
        toast.warn(
          <div>
            <p>Are you sure you want to logout?</p>
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
              onClick={this.handleLogout} 
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
      }
      handleLogout = () => {
        Cookies.set('super_user',undefined);
        this.setState({toLogin:true, userImage:null});
        toast.dismiss();
      }
    render(){
        console.log("super user", this.state.superUser);
        return(
            <>
            <ToastContainer />
            <Header />
            {this.state.toLogin && <Navigate to='/' />}
           <div className='container mt-5'>
                <div className='row'>
                    <div className='col justify-content-center align-items-center mt-4'>
                        <center>
                        <button className='btn btn-primary m-2' onClick={this.addVehicle}> <FontAwesomeIcon icon={faPlus} /></button>
                        <button className='btn btn-secondary m-2'  onClick={this.listVehicles}><FontAwesomeIcon icon={faCar} /></button>
                        <button className='btn btn-info m-2'  onClick={this.textRecognition}><FontAwesomeIcon icon={faCamera} /></button>

                        {this.state.superUser ==='true' && 

                        <>
                        
                        <button className='btn btn-success m-2'  onClick={this.addUser}> <FontAwesomeIcon icon={faPlus} /></button>
                        <button className='btn btn-warning m-2'  onClick={this.listUsers}><FontAwesomeIcon icon={faUser} /></button>
                        
                        </>
                        }
                       <button className='btn btn-danger m-2'  onClick={this.LogoutConfirmation}> <FontAwesomeIcon icon={faSignOutAlt} /></button>
                        </center>
                    </div>
                    <div className='w-100'></div>
                    <hr />
                    <div className='w-100'></div>
                    {this.state.home &&  
                    <div className='col'>
                        <ListData />
                    </div>
                   }
                   {this.state.camera &&
                    <TesseractVideoRecognition />
                   }
                     {this.state.listUsers &&  
                    <div className='col'>
                        <ListUserData />
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