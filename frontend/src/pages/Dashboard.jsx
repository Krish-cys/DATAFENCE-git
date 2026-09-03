import { useState } from "react";

import {
    Shield,
    Search,
    AlertTriangle,
    Brain,
    Activity,
    Lock,
    LogOut,
    UserCircle,
} from "lucide-react";

import {
    runFullSecurityAnalysis,
    activateProtection,
} from "../services/api";

import BurstRadius from "../components/BurstRadius";
import ExposureBreakdown from "../components/ExposureBreakdown";
import ReconstructedProfile from "../components/ReconstructedProfile";
import ProtectionPanel from "../components/ProtectionPanel";


function Dashboard({ onLogout }) {

    const [analysis, setAnalysis] =
        useState(null);

    const [protection, setProtection] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [protecting, setProtecting] =
        useState(false);


    // ========================================================
    // USER
    // ========================================================

    const storedUser =
        localStorage.getItem(
            "datafence_user"
        );


    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch {

        user = null;
    }


    const userName =
        user?.name || "DATAFENCE User";

    const userEmail =
        user?.email || "";


    // ========================================================
    // ANALYZE
    // ========================================================

    const analyze = async () => {

        setLoading(true);

        try {

            const result =
                await runFullSecurityAnalysis();

            setAnalysis(result);

        } catch (error) {

            console.error(
                "Analysis error:",
                error
            );


            if (
                error.message.includes(
                    "Session expired"
                ) ||
                error.message.includes(
                    "Authentication"
                ) ||
                error.message.includes(
                    "401"
                )
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                onLogout();

                return;
            }


            alert(
                error.message ||
                "Unable to connect to DATAFENCE backend."
            );

        } finally {

            setLoading(false);
        }
    };


    // ========================================================
    // PROTECTION
    // ========================================================

    const protect = async () => {

        setProtecting(true);

        try {

            const result =
                await activateProtection();

            setProtection(result);

        } catch (error) {

            console.error(
                "Protection error:",
                error
            );

            alert(
                error.message ||
                "Protection engine unavailable."
            );

        } finally {

            setProtecting(false);
        }
    };


    const security =
        analysis?.security;

    const intelligence =
        analysis?.intelligence;

    const explanations =
        analysis?.explanations || {};


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="topbar">

                <div className="brand">

                    <Shield size={28} />

                    <div>

                        <h1>
                            DATAFENCE
                        </h1>

                        <span>
                            Personal Data Security
                        </span>

                    </div>

                </div>


                {/* USER */}

                <div className="topbar-user">

                    <UserCircle size={32} />

                    <div className="user-info">

                        <strong>
                            {userName}
                        </strong>

                        <span>
                            {userEmail}
                        </span>

                    </div>

                </div>


                {/* STATUS */}

                <div className="status">

                    <span className="status-dot"></span>

                    SYSTEM ONLINE

                </div>


                {/* LOGOUT */}

                <button
                    className="logout-button"
                    onClick={onLogout}
                >

                    <LogOut size={18} />

                    LOGOUT

                </button>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="hero">

                <div>

                    <p className="eyebrow">
                        PERSONAL DATA INTELLIGENCE
                    </p>

                    <h2>

                        Understand what your

                        <span>
                            {" "}data reveals.
                        </span>

                    </h2>

                    <p className="hero-text">

                        DATAFENCE analyzes your
                        digital exposure, hidden
                        inferences and security risks.

                    </p>


                    <p className="analyzing-account">

                        Analyzing account:

                        <strong>
                            {" "}
                            {userEmail}
                        </strong>

                    </p>

                </div>


                <button
                    className="analyze-button"
                    onClick={analyze}
                    disabled={loading}
                >

                    <Search size={20} />

                    {loading
                        ? "ANALYZING..."
                        : "ANALYZE MY DATA"
                    }

                </button>

            </section>


            {/* =================================================
                SCORE
            ================================================= */}

            {security && (

                <section className="score-section">

                    <div className="score-card">

                        <div className="score-ring">

                            <strong>
                                {
                                    security.security_score
                                }
                            </strong>

                            <span>
                                /100
                            </span>

                        </div>


                        <div>

                            <p>
                                SECURITY SCORE
                            </p>

                            <h3>
                                {
                                    security.risk_level
                                }
                            </h3>

                            <span>
                                Risk Score:{" "}
                                {
                                    security.risk_score
                                }
                            </span>

                        </div>

                    </div>


                    <button
                        className="protect-button"
                        onClick={protect}
                        disabled={protecting}
                    >

                        <Shield size={22} />

                        {protecting
                            ? "PROTECTING..."
                            : "PROTECT ME"
                        }

                    </button>

                </section>

            )}


            {/* =================================================
                SECURITY INTELLIGENCE
            ================================================= */}

            {intelligence && (

                <>

                    <h3 className="section-title">
                        Security Intelligence
                    </h3>


                    <section className="risk-grid">

                        <RiskCard
                            icon={
                                <AlertTriangle />
                            }
                            title="Data Exposure"
                            value={
                                intelligence
                                    .exposure
                                    .score
                            }
                            subtitle={
                                `${intelligence.exposure.total_items} data points`
                            }
                            explanation={explanations.exposure}
                        />


                        <RiskCard
                            icon={
                                <Brain />
                            }
                            title="Inference Risk"
                            value={
                                intelligence
                                    .inference
                                    .score
                            }
                            subtitle={
                                `${intelligence.inference.findings.length} inferred profiles`
                            }
                            explanation={explanations.inference}
                        />


                        <RiskCard
                            icon={
                                <Activity />
                            }
                            title="Threat Level"
                            value={
                                intelligence
                                    .threat
                                    .score
                            }
                            subtitle={
                                intelligence
                                    .threat
                                    .level
                            }
                            explanation={explanations.threat}
                        />


                        <RiskCard
                            icon={
                                <Lock />
                            }
                            title="Blast Radius"
                            value={
                                intelligence
                                    .blast_radius
                                    .score
                            }
                            subtitle={
                                `${intelligence.blast_radius.connected_services} connected services`
                            }
                            explanation={explanations.blast_radius}
                        />

                    </section>


                    {/* =========================================
                        RECONSTRUCTED PROFILE
                    ========================================= */}

                    <ReconstructedProfile
                        profile={intelligence.reconstructed_profile}
                    />


                    {/* =========================================
                        BURST RADIUS + EXPOSURE BREAKDOWN
                    ========================================= */}

                    <section className="visuals-grid">

                        <div className="visual-card">
                            <div className="section-header">
                                <Lock className="section-icon" />
                                <div>
                                    <h3>Burst Radius</h3>
                                    <p>
                                        If one connected service leaked,
                                        this is how far your data would
                                        spread from it.
                                    </p>
                                </div>
                            </div>

                            <BurstRadius
                                lineage={intelligence.lineage}
                                blastRadius={intelligence.blast_radius}
                            />
                        </div>

                        <div className="visual-card">
                            <div className="section-header">
                                <AlertTriangle className="section-icon" />
                                <div>
                                    <h3>What's Driving Your Exposure</h3>
                                    <p>
                                        Each category's share of your
                                        overall exposure score.
                                    </p>
                                </div>
                            </div>

                            <ExposureBreakdown
                                breakdown={intelligence.exposure.breakdown}
                            />
                        </div>

                    </section>


                    {/* =========================================
                        INFERENCE
                    ========================================= */}

                    <section className="inference-section">

                        <div className="section-header">

                            <Brain />

                            <div>

                                <h3>
                                    What Your Data Can Reveal
                                </h3>

                                <p>
                                    DATAFENCE detected
                                    potential inferred
                                    characteristics.
                                </p>

                            </div>

                        </div>


                        <div className="inference-list">

                            {
                                intelligence
                                    .inference
                                    .findings
                                    .map(
                                        (
                                            finding,
                                            index
                                        ) => (

                                            <div
                                                className="inference-item"
                                                key={index}
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            finding.inference
                                                        }
                                                    </strong>

                                                    <span>
                                                        Sources:{" "}
                                                        {
                                                            finding
                                                                .source_categories
                                                                .join(
                                                                    ", "
                                                                )
                                                        }
                                                    </span>

                                                </div>

                                                <b>
                                                    {
                                                        finding.severity
                                                    }
                                                </b>

                                            </div>

                                        )
                                    )
                            }

                        </div>

                    </section>

                </>

            )}


            {/* =================================================
                PROTECTION
            ================================================= */}

            {intelligence && (

                <ProtectionPanel
                    protection={protection}
                    protecting={protecting}
                    onProtect={protect}
                />

            )}

        </div>
    );
}


// ============================================================
// RISK CARD
// ============================================================

function RiskCard({
    icon,
    title,
    value,
    subtitle,
    explanation,
}) {

    return (

        <div className="risk-card" title={explanation}>

            <div className="risk-icon">
                {icon}
            </div>

            <span>
                {title}
            </span>

            <strong>
                {value}
            </strong>

            <small>
                {subtitle}
            </small>

            {explanation && (
                <p className="risk-explanation">
                    {explanation}
                </p>
            )}

        </div>
    );
}


export default Dashboard;