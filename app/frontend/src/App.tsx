import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from "./pages/Home/Home";
import './globals/colors.css'
import Register from "./pages/Register/Register";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import PasswordReset from "./pages/PasswordReset/PasswordReset.tsx";
import Login from "./pages/Login/Login.tsx";
import NewPassword from "./pages/NewPassword/NewPassword.tsx";
import Messages from "./pages/Messages/Messages.tsx";
import Verification from "./pages/Verification/Verification.tsx";
import Friends from "./pages/Connections/Friends/Friends.tsx";
import OutgoingRequests from "./pages/Connections/OutgoingRequests/OutgoingRequests.tsx";
import IncomingRequests from "./pages/Connections/IncomingRequests/IncomingRequests.tsx";

function App() {
    return (
        <AuthProvider>
        <GoogleOAuthProvider clientId="<your_client_id>">
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/password-reset" element={<PasswordReset/>}/>
                <Route path="/verify-email/:token" element={<Verification/>}/>
                <Route path="/new-password/:token" element={<NewPassword/>}/>
                <Route path="/messages" element={<Messages/>}/>
                <Route path="/connections" element={<Friends/>}/>
                <Route path="/incoming-requests" element={<IncomingRequests/>}/>
                <Route path="/outgoing-requests" element={<OutgoingRequests/>}/>
            </Routes>
        </Router>
        </GoogleOAuthProvider>
        </AuthProvider>
    );
}

export default App;