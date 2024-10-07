import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from "./pages/Home/Home";
import './globals/colors.css'
import Register from "./pages/Register/Register";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";

function App() {
    return (
        <AuthProvider>
        <GoogleOAuthProvider clientId="<your_client_id>">
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
            </Routes>
        </Router>
        </GoogleOAuthProvider>
        </AuthProvider>
    );
}

export default App;