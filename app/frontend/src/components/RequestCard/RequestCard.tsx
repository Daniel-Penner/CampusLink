import React from 'react';
import styles from './RequestCard.module.css';

interface RequestCardProps {
    name: string;
    profilePicture?: string;
    status?: 'Online' | 'Offline';
    isOutgoing?: boolean;
    onAccept?: () => void;
    onDecline?: () => void;
    onRevoke?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
                                                     name,
                                                     profilePicture,
                                                     isOutgoing,
                                                     onAccept,
                                                     onDecline,
                                                     onRevoke,
                                                 }) => {
    const defaultProfilePicture = '/uploads/profile_pictures/default-profile.png'; // Default path

    return (
        <div className={styles.requestCard}>
            <img
                src={profilePicture || defaultProfilePicture}
                alt={`${name} profile`}
                className={styles.profilePic}
            />
            <div className={styles.info}>
                <h3>{name}</h3>
            </div>
            <div className={styles.actions}>
                {isOutgoing ? (
                    <button onClick={onRevoke} className={styles.revokeButton} disabled={!onRevoke}>
                        Revoke
                    </button>
                ) : (
                    <>
                        <button onClick={onAccept} className={styles.acceptButton} disabled={!onAccept}>
                            Accept
                        </button>
                        <button onClick={onDecline} className={styles.declineButton} disabled={!onDecline}>
                            Decline
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestCard;
