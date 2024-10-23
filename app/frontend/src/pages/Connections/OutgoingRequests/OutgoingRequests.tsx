import React, { useState, useEffect } from 'react';
import RequestCard from '../../../components/RequestCard/RequestCard';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './OutgoingRequests.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";

// Define the interfaces
interface Recipient {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    friendCode: string;
    profilePic?: string;
}

interface ConnectionRequest {
    _id: string;
    sender: string;
    recipient: Recipient;
    accepted: boolean;
}

const OutgoingRequestsPage: React.FC = () => {
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Function to revoke a request
    const revokeRequest = async (user2Id: string) => {
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
                // Remove the revoked request from the UI
                setOutgoingRequests(outgoingRequests.filter(request => request.recipient._id !== user2Id));
                console.log('Request revoked successfully');
            } else {
                console.error('Failed to revoke the request');
            }
        } catch (error) {
            console.error('Error revoking request:', error);
        }
    };

    // Fetch the outgoing requests
    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage

        if (!token) {
            console.error('No token found, redirecting to login');
            return;
        }

        fetch('/api/connections/sent-pending', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` // Include token in the headers
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch outgoing requests');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setOutgoingRequests(data);
                } else {
                    throw new Error('Unexpected response format');
                }
            })
            .catch(err => {
                console.error('Error fetching outgoing requests:', err);
            });
    }, []);

    return (
        <div className={styles.outgoingRequestsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className={styles.requestsSection}>
                {Array.isArray(outgoingRequests) && outgoingRequests.length > 0 ? (
                    outgoingRequests.map((request, index) => (
                        <RequestCard
                            key={index}
                            name={`${request.recipient.firstName} ${request.recipient.lastName}`} // Full name
                            profilePic={request.recipient.profilePic || 'default-profile-pic.png'} // Handle missing profilePic
                            isOutgoing
                            onRevoke={() => revokeRequest(request.recipient._id)} // Pass the recipient _id for revocation
                        />
                    ))
                ) : (
                    <p>No outgoing requests.</p>
                )}
            </div>
        </div>
    );
};

export default OutgoingRequestsPage;
