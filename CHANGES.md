# DATAFENCE — Changes in this pass

## Backend

1. **New engine — `backend/app/engines/lineage/lineage_engine.py`**
   `DataLineageEngine` turns raw data into a node/edge graph
   (identity -> data categories -> connected services). This is
   what powers the burst radius diagram — previously `engines/lineage/`
   was an empty stub.

2. **`engines/intelligence/blast_radius.py` and `exposure_engine.py`**
   now return a `breakdown` array (per-category weight + % share)
   instead of just a single aggregate score, so the frontend can
   chart what's actually driving the number.

3. **`engines/inference/profile_reconstructor.py`** rewritten to
   accept the intelligence pipeline's finding format (it previously
   only matched the older, disconnected `engines/inference` finding
   shape and was never actually wired up). Now returns a
   `reconstruction_percent`.

4. **`engines/intelligence/intelligence_pipeline.py`** now also runs
   lineage + profile reconstruction and includes them in its output.

5. **`api/security.py`**
   - Added a real `POST /api/security/protect` endpoint. This was
     the biggest gap: `SecurityEngine.create_protection_plan()` /
     `.protect()` already existed and worked, but no route called
     them — the frontend was faking a "Protection Ready" response
     with hardcoded zeros.
   - `/api/security/full-analysis` now also returns `explanations`
     (plain-language text for each score) and richer demo data
     (added `financial` category so every engine has something to
     react to).

## Known issue not yet resolved

`engines/data`, `engines/inference`, `engines/threat` (used only by
the older `/api/analysis/run` route) are a **separate, drifting
duplicate** of `engines/intelligence`'s exposure/inference/threat
logic. I didn't delete anything in case `/api/analysis/run` is still
depended on elsewhere, but recommend picking one pipeline as the
source of truth and retiring the other — right now a change to one
inference engine silently doesn't affect the other.

## Frontend

- `services/api.js` — `activateProtection()` now actually calls
  `/api/security/protect` instead of returning a hardcoded fake result.
- `package.json` — added `recharts` for charting.
- New components (`src/components/`):
  - `BurstRadius.jsx` — concentric-ring SVG diagram of the lineage
    graph (you -> data categories -> connected services).
  - `ExposureBreakdown.jsx` — horizontal bar chart of exposure by
    category.
  - `ReconstructedProfile.jsx` — gauge + plain-language summary of
    "how much of you has been rebuilt" (behavioral / lifestyle /
    social facets, confidence %).
  - `ProtectionPanel.jsx` — replaces the old fake protection result
    box; shows the real plan (automatic vs. approval-required
    actions) and lets the user trigger it.
- `pages/Dashboard.jsx` — wires all of the above in, plus each risk
  card now shows its plain-language explanation.
- `index.css` — styles for all new components, matching the existing
  dark theme.

## To run

```
cd frontend && npm install   # picks up recharts
npm run dev

cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload
```
