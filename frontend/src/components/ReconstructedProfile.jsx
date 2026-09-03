const FACET_LABELS = {
    behavioral_profile: {
        label: "Behavioral patterns",
        text: "what you do and when you do it",
    },
    lifestyle_profile: {
        label: "Lifestyle profile",
        text: "where you go and what you buy",
    },
    social_profile: {
        label: "Social graph",
        text: "who you know and talk to",
    },
};

function ReconstructedProfile({ profile }) {

    if (!profile) return null;

    const percent = profile.reconstruction_percent ?? 0;

    const facets = Object.entries(FACET_LABELS).filter(
        ([key]) => profile[key]
    );

    const circumference = 2 * Math.PI * 42;
    const offset = circumference * (1 - percent / 100);

    return (
        <section className="reconstruction-section">

            <div className="reconstruction-gauge">

                <svg viewBox="0 0 100 100" width="120" height="120">
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="#1b272d"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={percent >= 70 ? "#ff5555" : "#00e6a8"}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                    <text
                        x="50" y="46" textAnchor="middle"
                        className="reconstruction-percent"
                    >
                        {percent}%
                    </text>
                    <text
                        x="50" y="62" textAnchor="middle"
                        className="reconstruction-sub"
                    >
                        rebuilt
                    </text>
                </svg>

            </div>

            <div className="reconstruction-detail">

                <h3>How much of you has been reconstructed</h3>

                <p>
                    From the data DATAFENCE could see, it was able to
                    rebuild <strong>{percent}%</strong> of a working
                    profile of you — with{" "}
                    {Math.round((profile.confidence ?? 0) * 100)}%
                    average confidence.
                </p>

                {facets.length > 0 ? (
                    <ul className="facet-list">
                        {facets.map(([key, meta]) => (
                            <li key={key}>
                                <strong>{meta.label}</strong>
                                <span>{meta.text}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="facet-empty">
                        No high-confidence profile could be
                        reconstructed from what's currently exposed.
                    </p>
                )}

            </div>

        </section>
    );
}

export default ReconstructedProfile;
