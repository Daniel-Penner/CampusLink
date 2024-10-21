import React, { useState, useEffect } from 'react';
import RequestCard from '../../../components/RequestCard/RequestCard';
import ConnectionsNavbar from '../../../components/ConnectionsNavbar/ConnectionsNavbar';
import styles from './IncomingRequests.module.css';
import Navbar from "../../../components/Navbar/Navbar.tsx";

interface Request {
    name: string;
    profilePic: string;
    status: 'Online' | 'Offline';
}

const dummyIncomingRequests: Request[] = [
    { name: 'Peter Parker', profilePic: 'https://i.pravatar.cc/150?img=1', status: 'Online' },
    { name: 'Tony Stark', profilePic: 'https://i.pravatar.cc/150?img=2', status: 'Offline' }
];

const IncomingRequestsPage: React.FC = () => {
    const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        /*fetch('/api/incoming-requests')
            .then(res => res.json())
            .then(data => setIncomingRequests(data))
            .catch(err => {
                console.error('Error fetching incoming requests:', err);
          */      // Use dummy data in case of failure
                setIncomingRequests(dummyIncomingRequests);
            });
    //}, []);

    return (
        <div className={styles.incomingRequestsPage}>
            <Navbar />
            <ConnectionsNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <div className={styles.requestsSection}>
                {incomingRequests.map((request, index) => (
                    <RequestCard
                        key={index}
                        name={request.name}
                        profilePic={request.profilePic}
                        status={request.status}
                        onAccept={() => console.log('Accept request', request.name)}
                        onDecline={() => console.log('Decline request', request.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default IncomingRequestsPage;
