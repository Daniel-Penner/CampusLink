import './App.css'
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from "./pages/Home/Home";

function App() {
    return (
        <Router>
                {/* Universal Home Page */}
                <Route path="/" element={<Home />} />
        </Router>
    );
}

export default App;