import React, { useMemo } from "react";

const COOLDOWN_DAYS = 90;

/**
 * Calculates eligibility data from a lastDonationDate.
 * @param {string|Date|null} lastDonationDate
 * @returns {{ isEligible: boolean, daysPassed: number, daysRemaining: number, percentage: number, eligibleDate: Date|null }}
 */
const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) {
        return {
            isEligible: true,
            daysPassed: COOLDOWN_DAYS,
            daysRemaining: 0,
            percentage: 100,
            eligibleDate: null,
        };
    }

    const lastDate = new Date(lastDonationDate);
    const now = new Date();
    const diffMs = now - lastDate;
    const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, COOLDOWN_DAYS - daysPassed);
    const percentage = Math.min(100, Math.round((daysPassed / COOLDOWN_DAYS) * 100));
    const isEligible = daysPassed >= COOLDOWN_DAYS;

    const eligibleDate = new Date(lastDate);
    eligibleDate.setDate(eligibleDate.getDate() + COOLDOWN_DAYS);

    return { isEligible, daysPassed, daysRemaining, percentage, eligibleDate };
};

const EligibilityCard = ({ lastDonationDate, bloodGroup }) => {
    const eligibility = useMemo(
        () => calculateEligibility(lastDonationDate),
        [lastDonationDate]
    );

    const { isEligible, daysPassed, daysRemaining, percentage, eligibleDate } = eligibility;

    return (
        <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.heartIcon}>❤️</span>
                    <h5 style={styles.title}>Biological Eligibility</h5>
                </div>
                {bloodGroup && (
                    <span style={styles.bloodBadge}>{bloodGroup}</span>
                )}
            </div>

            {/* Progress section */}
            <div style={styles.progressSection}>
                <div style={styles.progressLabelRow}>
                    <span style={styles.progressLabel}>Cooldown Progress</span>
                    <span style={{
                        ...styles.progressPercent,
                        color: isEligible ? '#16a34a' : '#ea580c',
                    }}>
                        {percentage}%
                    </span>
                </div>
                <div style={styles.progressTrack}>
                    <div
                        style={{
                            ...styles.progressFill,
                            width: `${percentage}%`,
                            background: isEligible
                                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                : 'linear-gradient(90deg, #f97316, #ea580c)',
                        }}
                    />
                </div>
                <div style={styles.progressMeta}>
                    <span style={styles.metaText}>
                        {daysPassed >= COOLDOWN_DAYS ? COOLDOWN_DAYS : daysPassed} / {COOLDOWN_DAYS} days
                    </span>
                </div>
            </div>

            {/* Status message */}
            <div
                style={{
                    ...styles.statusBox,
                    background: isEligible
                        ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                        : 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                    borderColor: isEligible ? '#bbf7d0' : '#fed7aa',
                }}
            >
                {isEligible ? (
                    <div style={styles.statusContent}>
                        <span style={styles.statusIcon}>✅</span>
                        <div>
                            <p style={{ ...styles.statusTitle, color: '#15803d' }}>
                                You are fully eligible to donate!
                            </p>
                            <p style={styles.statusSubtext}>
                                Save a life today — book an appointment now and make a difference.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div style={styles.statusContent}>
                        <span style={styles.statusIcon}>⏳</span>
                        <div>
                            <p style={{ ...styles.statusTitle, color: '#c2410c' }}>
                                Rest up, hero! You can donate again in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
                            </p>
                            <p style={styles.statusSubtext}>
                                Eligible on:{" "}
                                <strong>
                                    {eligibleDate?.toLocaleDateString("en-IN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </strong>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    card: {
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: '1px solid #f1f5f9',
        transition: 'box-shadow 0.3s ease',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    heartIcon: {
        fontSize: '22px',
    },
    title: {
        margin: 0,
        fontWeight: '700',
        fontSize: '18px',
        color: '#1e293b',
        letterSpacing: '-0.3px',
    },
    bloodBadge: {
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        color: '#fff',
        padding: '6px 16px',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '14px',
        letterSpacing: '0.5px',
    },
    progressSection: {
        marginBottom: '20px',
    },
    progressLabelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    },
    progressLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    progressPercent: {
        fontSize: '15px',
        fontWeight: '700',
    },
    progressTrack: {
        width: '100%',
        height: '12px',
        background: '#f1f5f9',
        borderRadius: '100px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '100px',
        transition: 'width 1s ease-in-out',
    },
    progressMeta: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '6px',
    },
    metaText: {
        fontSize: '12px',
        color: '#94a3b8',
        fontWeight: '500',
    },
    statusBox: {
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid',
    },
    statusContent: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
    },
    statusIcon: {
        fontSize: '24px',
        flexShrink: 0,
        marginTop: '2px',
    },
    statusTitle: {
        margin: '0 0 4px 0',
        fontWeight: '700',
        fontSize: '15px',
    },
    statusSubtext: {
        margin: 0,
        fontSize: '13px',
        color: '#64748b',
        lineHeight: '1.5',
    },
};

export default EligibilityCard;
