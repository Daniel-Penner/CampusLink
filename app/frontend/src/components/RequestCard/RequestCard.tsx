import React from 'react';
import styles from './RequestCard.module.css';
import profile from '../../assets/profile.png'

interface RequestCardProps {
    name: string;
    profilePic?: string;
    status?: 'Online' | 'Offline';
    isOutgoing?: boolean;
    onAccept?: () => void;
    onDecline?: () => void;
    onRevoke?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
                                                     name,
                                                     profilePic,
                                                     status,
                                                     isOutgoing,
                                                     onAccept,
                                                     onDecline,
                                                     onRevoke,
                                                 }) => {
    return (
        <div className={styles.requestCard}>
            <img src={profilePic || profile} alt={`${name} profile`} className={styles.profilePic}/>
            <div className={styles.info}>
                <h3>{name}</h3>
                <span className={status === 'Online' ? styles.online : styles.offline}>{status || 'online'}</span>
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
