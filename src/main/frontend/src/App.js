import "milligram";
import './App.css';
import {useState} from "react";
import LoginForm from "./LoginForm";
import UserPanel from "./UserPanel";

function App() {
    const [loggedIn, setLoggedIn] = useState('');

    async function login(email) {
        if (email) {
            const response = await fetch(`/api/participants/${email}`);
            if (response.status === 404) {
                const  createResponse = await fetch('/api/participants/', {
                    method: 'POST',
                    body: JSON.stringify({login: email}),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (createResponse.ok) {
                    setLoggedIn(email);
                } else {
                    console.error('Failed to create participant:', createResponse.statusText);
                }
            } else if (response.ok) {
                setLoggedIn(email);
            } else {
                console.error('Failed to check participant:', response.statusText);
            }
        }
    }

    function logout() {
        setLoggedIn('');
    }

    return (
        <div>
            <h1>System do zapisów na zajęcia</h1>
            {loggedIn ? <UserPanel username={loggedIn} onLogout={logout}/> : <LoginForm onLogin={login}/>}
        </div>
    );
}

export default App;
