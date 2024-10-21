import React, { useState, useEffect } from 'react';
import RequestCard from '../../../components/RequestCard/RequestCard';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './OutgoingRequests.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";

interface Request {
    name: string;
    profilePic: string;
    status: 'Online' | 'Offline';
}

const dummyOutgoingRequests: Request[] = [
    { name: 'Bruce Wayne', profilePic: 'https://i.pravatar.cc/150?img=3', status: 'Online' },
    { name: 'Clark Kent', profilePic: 'https://i.pravatar.cc/150?img=4', status: 'Offline' }
];

const OutgoingRequestsPage: React.FC = () => {
    const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        /*fetch('/api/outgoing-requests')
            .then(res => res.json())
            .then(data => setOutgoingRequests(data))
            .catch(err => {
                console.error('Error fetching outgoing requests:', err);
          */      // Use dummy data in case of failure
                setOutgoingRequests(dummyOutgoingRequests);
            });
    //}, []);

    return (
        <div className={styles.outgoingRequestsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className={styles.requestsSection}>
                {outgoingRequests.map((request, index) => (
                    <RequestCard
                        key={index}
                        name={request.name}
                        profilePic={request.profilePic}
                        status={request.status}
                        isOutgoing
                        onRevoke={() => console.log('Revoke request', request.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default OutgoingRequestsPage;
