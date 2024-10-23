import React, { useState, useEffect } from 'react';
import RequestCard from '../../../components/RequestCard/RequestCard';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './IncomingRequests.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";

// Define the interface for the incoming request
interface Request {
    sender: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePic?: string;
    };
    status?: 'Online' | 'Offline';
}

const IncomingRequestsPage: React.FC = () => {
    const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Function to accept a request
    const acceptRequest = async (user2Id: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login');
            return;
        }

        try {
            const response = await fetch('/api/connections/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` // Include the token in headers
                },
                body: JSON.stringify({ user2Id })
            });

            if (response.ok) {
                // Remove the accepted request from the UI
                setIncomingRequests(incomingRequests.filter(request => request.sender._id !== user2Id));
                console.log('Request accepted successfully');
            } else {
                console.error('Failed to accept the request');
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    // Function to decline a request
    const declineRequest = async (user2Id: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login');
            return;
        }

        try {
            const response = await fetch('/api/connections/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` // Include the token in headers
                },
                body: JSON.stringify({ user2Id })
            });

            if (response.ok) {
                // Remove the declined request from the UI
                setIncomingRequests(incomingRequests.filter(request => request.sender._id !== user2Id));
                console.log('Request declined successfully');
            } else {
                console.error('Failed to decline the request');
            }
        } catch (error) {
            console.error('Error declining request:', error);
        }
    };

    // Fetch incoming requests
    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage

        if (!token) {
            console.error('No token found, redirecting to login');
            return;
        }

        fetch('/api/connections/received-pending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` // Include token in the headers
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch incoming requests');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setIncomingRequests(data);
                } else {
                    throw new Error('Unexpected response format');
                }
            })
            .catch(err => {
                console.error('Error fetching incoming requests:', err);
            });
    }, []);

    return (
        <div className={styles.incomingRequestsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className={styles.requestsSection}>
                {Array.isArray(incomingRequests) && incomingRequests.length > 0 ? (
                    incomingRequests.map((request, index) => (
                        <RequestCard
                            key={index}
                            name={`${request.sender.firstName} ${request.sender.lastName}`} // Full name
                            profilePic={request.sender.profilePic || 'default-profile-pic.png'} // Fallback profile picture
                            onAccept={() => acceptRequest(request.sender._id)} // Pass sender's ID to accept function
                            onDecline={() => declineRequest(request.sender._id)} // Pass sender's ID to decline function
                        />
                    ))
                ) : (
                    <p>No incoming requests.</p>
                )}
            </div>
        </div>
    );
};

export default IncomingRequestsPage;
