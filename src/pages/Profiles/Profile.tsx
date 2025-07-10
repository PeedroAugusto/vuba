import styles from './Profile.module.scss';

export const Profile = () => {
    const profiles = [
        {
            "id": 1,
            "name": "Pedro",
            "profileUrl": "https://images.cdn.prd.api.discomax.com/2023%2F4%2F4%2F2128d6d8-3f57-45d7-9656-cd88b29be8bc.png",
            "accountId": 1,
            "isChildProfile": false,
            "isActive": true
        },
        {
            "id": 1,
            "name": "Pedro",
            "profileUrl": "https://images.cdn.prd.api.discomax.com/2023%2F4%2F4%2F2128d6d8-3f57-45d7-9656-cd88b29be8bc.png",
            "accountId": 1,
            "isChildProfile": false,
            "isActive": true
        }
    ]
    return (
        <div className={styles['profile-page']}>
            <div className={styles['profile-list']}>
                {profiles.map((profile) => (
                    <div className={styles['profile-item']} key={profile.id}>
                        <div className={styles['profile-image']}>
                            <img src={profile.profileUrl} alt={profile.name} />
                        </div>
                        <p className={styles['profile-name']}>{profile.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}