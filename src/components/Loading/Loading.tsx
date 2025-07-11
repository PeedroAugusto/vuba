import React from 'react';
import styles from './Loading.module.scss';

export const Loading: React.FC = () => {
  return (
    <div className={styles.loading} role="alert" aria-busy="true">
      <div className={styles.heroSkeleton}>
        <div className={styles.content}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.metaSkeleton}>
            <div className={styles.metaItem}></div>
            <div className={styles.metaItem}></div>
            <div className={styles.metaItem}></div>
          </div>
          <div className={styles.synopsisSkeleton}>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className={styles.buttonsSkeleton}>
            <div className={styles.button}></div>
            <div className={styles.button}></div>
          </div>
        </div>
      </div>

      <div className={styles.episodesSkeleton}>
        <div className={styles.episodeHeader}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.dropdownSkeleton}></div>
        </div>
        <div className={styles.episodeList}>
          {[1, 2, 3].map((_, index) => (
            <div key={index} className={styles.episodeCard}>
              <div className={styles.thumbSkeleton}></div>
              <div className={styles.infoSkeleton}>
                <div className={styles.titleSkeleton}></div>
                <div className={styles.metaSkeleton}>
                  <div></div>
                  <div></div>
                </div>
                <div className={styles.synopsisSkeleton}>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 