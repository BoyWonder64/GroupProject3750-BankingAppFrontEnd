import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth.js'

export default function Login(){
    const [form, setForm] = useState({
        username: "",
        password: ""

    });

    const navigate = useNavigate();
    const { setAuthState } = useAuth();

    const updateForm = e => {
        const { name, value } = e.target
        setForm(prevForm => ({...prevForm,[name]: value}))
      }
    

     const onSubmit = async e => {
        e.preventDefault();
        // const newPerson = {...form};
        const response =  await fetch("http://localhost:4000/record/login", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            credentials: 'include',
            body: JSON.stringify(form),
        })
        .catch(error => {
            window.alert(error);
            return
        });

        if(response.ok)
        {   // set authentication state
            setAuthState({ isAuthenticated: true, role: DataTransfer.role });
            //message says its valid navigate to next page
            navigate("/accountSummary");
        } else {
            window.alert("An error occured during the login process...")
                 setForm({username: "", password: ""}); //clear the form
        }
    }

    return(
        <div>
            <h3>Login</h3>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Username: </label>
                <input
                    type="username"
                    name="username"
                    value={form.username}
                    onChange={updateForm}
                />
                </div>
                <div>
                <label>Password: </label>
                <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={updateForm}
                />
                </div>
                <br/>
                <input
                    type="submit"
                    value="Login"
                />
            </form>
        </div>
    );
}