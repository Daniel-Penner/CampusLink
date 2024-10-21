import React from 'react';
import styles from './RequestCard.module.css';

interface RequestCardProps {
    name: string;
    profilePic: string;
    status: 'Online' | 'Offline';
    description?: string;
    isOutgoing?: boolean;
    onAccept?: () => void;
    onDecline?: () => void;
    onRevoke?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
                                                     name,
                                                     profilePic,
                                                     status,
                                                     description,
                                                     isOutgoing,
                                                     onAccept,
                                                     onDecline,
                                                     onRevoke,
                                                 }) => {
    return (
        <div className={styles.requestCard}>
            <img src={profilePic} alt={`${name} profile`} className={styles.profilePic} />
            <div className={styles.info}>
                <h3>{name}</h3>
                {description && <p>{description}</p>}
                <span className={status === 'Online' ? styles.online : styles.offline}>{status}</span>
            </div>
            <div className={styles.actions}>
                {isOutgoing ? (
                    <button onClick={onRevoke} className={styles.revokeButton}>Revoke</button>
                ) : (
                    <>
                        <button onClick={onAccept} className={styles.acceptButton}>Accept</button>
                        <button onClick={onDecline} className={styles.declineButton}>Decline</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestCard;
