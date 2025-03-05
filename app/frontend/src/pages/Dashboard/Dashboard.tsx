import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import {useNavigate} from "react-router-dom";

interface Message {
    content: string;
    channelName: string;
    timestamp: string;
}

interface Server {
    name: string;
    lastActivity: string;
}

interface Location {
    name: string;
    rating: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext is not provided.');
    }

    const { isAuthenticated, name } = authContext;

    const [recentMessages, setRecentMessages] = useState<Message[]>([]);
    const [mostActiveServer, setMostActiveServer] = useState<Server | null>(null);
    const [topLocations, setTopLocations] = useState<Location[]>([]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        fetch('/api/dashboard/info', { method: 'GET', headers })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch dashboard data.');
                return res.json();
            })
            .then((data) => {
                setRecentMessages(data.recentMessages);
                setMostActiveServer(data.mostActiveServer);
                setTopLocations(data.topLocations);
            })
            .catch((err) => console.error('Error fetching dashboard data:', err));
    }, [isAuthenticated]);

    return (
        <div className="flex flex-col w-screen h-screen bg-secondaryBackground text-textColor">
            <Navbar />
            {isAuthenticated ? (
                <>
                    <h1 className="text-3xl font-bold text-center mt-8">Welcome, {name}</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
                        {/* Recent Messages Section */}
                        <div className="bg-background rounded-lg p-6 flex flex-col">
                            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
                            <div className="flex-grow overflow-y-auto">
                                {recentMessages.length > 0 ? (
                                    recentMessages.map((msg, index) => (
                                        <div key={index} className="bg-lighterGrey p-4 rounded-lg mb-4">
                                            <strong>{msg.channelName}:</strong> {msg.content}
                                            <p className="text-sm text-gray-500 mt-2">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No recent messages!</p>
                                )}
                            </div>
                            <button
                                className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-buttonHover"
                                onClick={() => navigate('/messages')}
                            >
                                View All Messages
                            </button>
                        </div>

                        {/* Most Active Server Section */}
                        <div className="bg-background rounded-lg p-6 flex flex-col">
                            <h2 className="text-xl font-semibold mb-4">Most Active Server</h2>
                            {mostActiveServer ? (
                                <div>
                                    <p className="font-bold">{mostActiveServer.name}</p>
                                    <p className="text-sm text-gray-500">
                                        Last activity: {new Date(mostActiveServer.lastActivity).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <p>No active servers!</p>
                            )}
                            <button
                                className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-buttonHover"
                                onClick={() => navigate('/servers')}
                            >
                                View All Servers
                            </button>
                        </div>

                        {/* Top Rated Locations Section */}
                        <div className="bg-background rounded-lg p-6 flex flex-col">
                            <h2 className="text-xl font-semibold mb-4">Top Rated Locations</h2>
                            <div className="flex-grow overflow-y-auto">
                                {topLocations.length > 0 ? (
                                    topLocations.map((location, index) => (
                                        <div
                                            key={index}
                                            className="bg-lighterGrey p-4 rounded-lg mb-4 hover:bg-lighterGreyHover cursor-pointer"
                                        >
                                            <p className="font-bold">{location.name}</p>
                                            <p className="text-sm text-gray-500">Rating: {location.rating.toFixed(1)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No top-rated locations found!</p>
                                )}
                            </div>
                            <button
                                className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-buttonHover"
                                onClick={() => navigate('/locations')}
                            >
                                View All Locations
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <h1 className="text-center mt-20">Please log in or create an account before attempting to access this page.</h1>
            )}
        </div>
    );
};

export default Dashboard;
