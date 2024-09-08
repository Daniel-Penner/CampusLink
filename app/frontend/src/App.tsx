import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from "./pages/Home/Home";
import './globals/colors.css'
import Register from "./pages/Register/Register";
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
    return (
        <GoogleOAuthProvider clientId="<your_client_id>">
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register/>} />
            </Routes>
        </Router>
        </GoogleOAuthProvider>
    );
}

export default App;