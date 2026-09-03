import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";

function ActionRow({ action, outcome }) {

    const applied = outcome?.status === "APPLIED";
    const pending = outcome?.status === "AWAITING_APPROVAL";

    return (
        <li className={`action-row ${action.priority?.toLowerCase()}`}>

            <div className="action-icon">
                {applied && <ShieldCheck size={16} />}
                {pending && <Clock size={16} />}
                {!applied && !pending && <ShieldAlert size={16} />}
            </div>

            <div className="action-body">
                <strong>{action.description}</strong>
                <span>
                    {action.category?.replaceAll("_", " ")} &middot;{" "}
                    {action.priority} priority
                </span>
            </div>

            <div className="action-status">
                {applied && "Applied"}
                {pending && "Needs your approval"}
                {!applied && !pending && action.mode}
            </div>

        </li>
    );
}

function ProtectionPanel({ protection, protecting, onProtect }) {

    const plan = protection?.plan;
    const result = protection?.result;

    const outcomeById = {};

    (result?.results || []).forEach((r) => {
        outcomeById[r.action_id] = r;
    });

    return (
        <section className="protection-panel">

            <div className="section-header">
                <ShieldCheck className="section-icon" />
                <div>
                    <h3>Protect Yourself</h3>
                    <p>
                        Real actions DATAFENCE can take (or ask you to
                        approve) based on what it just found.
                    </p>
                </div>
            </div>

            {!plan && (
                <button
                    className="protect-button protect-button--inline"
                    onClick={onProtect}
                    disabled={protecting}
                >
                    {protecting ? "BUILDING PLAN..." : "BUILD PROTECTION PLAN"}
                </button>
            )}

            {plan && (
                <>
                    <div className="plan-summary">
                        <span>{plan.total_actions} actions found</span>
                        <span>{plan.automatic_actions} automatic</span>
                        <span>{plan.approval_required} need your approval</span>
                    </div>

                    {plan.actions.length === 0 ? (
                        <p className="facet-empty">
                            No high-risk categories crossed the action
                            threshold this run — nothing urgent to do
                            right now.
                        </p>
                    ) : (
                        <ul className="action-list">
                            {plan.actions.map((action) => (
                                <ActionRow
                                    key={action.id}
                                    action={action}
                                    outcome={outcomeById[action.id]}
                                />
                            ))}
                        </ul>
                    )}

                    {result && (
                        <div className="verification-summary">
                            {result.verification.successful} applied
                            &middot; {result.verification.pending} pending
                            approval &middot;{" "}
                            {result.verification.success_rate}% success rate
                        </div>
                    )}
                </>
            )}

        </section>
    );
}

export default ProtectionPanel;
