import React from 'react';
import BASE_URL from '../config';
import Home from '../home';
import axios from 'axios';
import Cookies from 'js-cookie';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListData from '../listData';
class AddUser extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            userName:'',
            password:'',
            home:false,
            addUser:true,
            userError:false,
            employeeData:[],
            id:this.props.id,
            formTitle:'Add User',
            buttonText:'Add',
            superUser:false,
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
    
    createUser = (e) =>{
        e.preventDefault();
        let formData = new FormData();
        formData.append('user_name',this.state.userName);
        formData.append('password',this.state.password);
        formData.append('super_user', false);

        let url =  `${BASE_URL}/user`
        axios.post(url,formData)
        .then(response =>{
            toast.success("User added successfully");
            this.setState({userName:'',password:''});
        })
        .catch(error =>{
            const userError = error?.response?.data?.user_name;
            if(userError){
                this.setState({userError:true})
            }
            toast.error("Failed to add user");
        })
    }

    editUser =(e) =>{
        const {userName, password, superUser} = this.state;
        e.preventDefault();
        let formData = new FormData();
        formData.append('user_name',userName)
        formData.append('password', password)
        formData.append('super_user', superUser)
        url = `${BASE_URL}/user/${this.state.id}`
        axios.put(url, formData)
        .then(response =>{
            toast.success("User update successful");
        })
        .then(error =>{
            toast.error("failed to update user");
        })
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
    componentDidUpdate(prevProps) {
        if (prevProps.id !== this.props.id) {
            this.setState({ id: this.props.id });
        }
    }
    getUserData(userId){
        let url = `${BASE_URL}/user/${userId}`
        axios.get(url)
        .then(response =>{
            this.setState({userName:response.data.user_name, password:response.data.password, superUser:response.data.super_user})
        })
        .catch(error =>{
            toast.error("Failed to fetch data")
        })
    }
    editCheck(id){
        if(id !==undefined){
            this.setState({formTitle:'Edit User', buttonText:'Edit'})
            this.getUserData(id);
        }
        else{
            this.setState({formTitle:'Add User', buttonText:'Add'})
        }
    }
    componentDidMount(){
        this.editCheck(this.state.id);
    }
    render(){
        return(
            <>
            {this.state.addUser && 
              <div className='container align-items-center justify-content-center d-flex ' style={{ minHeight: '75vh' }}>
              <div className='card p-4' style={{ width: '400px' }}>
                <h4 className='text-center'>{this.state.formTitle}</h4>
                <hr/>
                {console.log("this is id", this.state.id)}
                  <form onSubmit={this.state.id !=undefined?this.createUser:this.editUser}>
                  <div className="form-group mb-3">
                              <label htmlFor="username">User Name<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="username" placeholder="Enter user name" name='userName' onChange={this.handleUserNameChange} value={this.state.userName} required/>
                              {this.state.userError && <small className='text-danger'>User name already exists</small>}
                          </div>
                  <div className="form-group mb-3">
                              <label htmlFor="Email">password<span className='text-danger'>*</span></label>
                              <input type="text" className="form-control" id="Email" placeholder="Enter password" name='password' onChange={this.handleChange} value={this.state.password} required/>

                          </div>

                          <div className="form-group mb-3">
                              <button className="btn btn-primary w-100" >{this.state.buttonText}</button>
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


export default AddUser;