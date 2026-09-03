from fastapi import (
    APIRouter,
    Depends,
)

from app.api.auth import get_current_user

from app.engines.intelligence.intelligence_pipeline import (
    IntelligencePipeline,
)

from app.engines.security.security_engine import (
    SecurityEngine,
)


router = APIRouter(
    prefix="/api/security",
    tags=["DATAFENCE Security"],
)


intelligence = IntelligencePipeline()

security_engine = SecurityEngine()


# ============================================================
# DEMO DATA
#
# In production this comes from the sources the user actually
# connects (email provider, browser history export, linked
# accounts, etc). Until that ingestion exists, this fixture
# stands in so every engine has realistic input to work with.
# ============================================================

def build_sample_data(current_user):

    return {

        "identity": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
        },

        "data_points": [
            {"type": "email"},
            {"type": "location"},
            {"type": "activity"},
            {"type": "purchases"},
            {"type": "contacts"},
            {"type": "search"},
            {"type": "financial"},
        ],

        "connections": [
            {"type": "email", "name": "Gmail"},
            {"type": "contacts", "name": "Phone Contacts"},
            {"type": "documents", "name": "Cloud Drive"},
            {"type": "financial", "name": "Payment App"},
            {"type": "location", "name": "Maps / Location History"},
        ],
    }


# Plain-language explanations so the UI never has to show a
# bare score without context for what it means or why it moved.
RISK_EXPLANATIONS = {
    "exposure": (
        "How much raw personal data about you is out there "
        "across the sources DATAFENCE looked at."
    ),
    "inference": (
        "How confidently that raw data can be combined to guess "
        "things you never explicitly shared, like your habits "
        "or routine."
    ),
    "threat": (
        "Overall likelihood that your exposure and inference "
        "risk could be used against you right now."
    ),
    "blast_radius": (
        "If one connected service were breached, how many other "
        "categories of your personal data would be dragged down "
        "with it."
    ),
}


# ============================================================
# FULL SECURITY ANALYSIS
# ============================================================

@router.post("/full-analysis")
def full_analysis(
    current_user=Depends(
        get_current_user
    ),
):

    sample_data = build_sample_data(current_user)

    # ========================================================
    # INTELLIGENCE PIPELINE
    # ========================================================

    intelligence_result = intelligence.analyze(
        sample_data
    )

    # ========================================================
    # SECURITY ASSESSMENT
    # ========================================================

    assessment = security_engine.assess(

        exposure_score=(
            intelligence_result[
                "exposure"
            ]["score"]
        ),

        inference_score=(
            intelligence_result[
                "inference"
            ]["score"]
        ),

        threat_score=(
            intelligence_result[
                "threat"
            ]["score"]
        ),

        blast_radius=(
            intelligence_result[
                "blast_radius"
            ]["score"]
        ),
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "status": "FULL_ANALYSIS_COMPLETE",

        "identity": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
        },

        "intelligence": intelligence_result,

        "security": assessment,

        "explanations": RISK_EXPLANATIONS,
    }


# ============================================================
# PROTECTION PLAN + APPLY
#
# Wires the previously-unused SecurityEngine remediation
# pipeline (policy -> orchestrator -> remediation ->
# verification) up to a real endpoint. Re-runs the same
# analysis so the plan always reflects current risk.
# ============================================================

@router.post("/protect")
def protect(
    current_user=Depends(
        get_current_user
    ),
):

    sample_data = build_sample_data(current_user)

    intelligence_result = intelligence.analyze(sample_data)

    assessment = security_engine.assess(
        exposure_score=intelligence_result["exposure"]["score"],
        inference_score=intelligence_result["inference"]["score"],
        threat_score=intelligence_result["threat"]["score"],
        blast_radius=intelligence_result["blast_radius"]["score"],
    )

    plan = security_engine.create_protection_plan(assessment)

    result = security_engine.protect(plan)

    return {
        "status": "PROTECTION_PROCESSED",
        "plan": plan,
        "result": result,
    }