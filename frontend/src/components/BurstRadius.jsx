import { useMemo } from "react";

// ================================================================
// BURST RADIUS DIAGRAM
//
// Renders the lineage graph returned by the backend
// (identity -> data categories -> connected services) as
// concentric rings. Ring distance = "hops" from the user;
// dot size = how much that node adds to blast radius risk.
// This turns "blast_radius.score = 62" into something a
// non-technical person can actually read at a glance.
// ================================================================

const RING_COLORS = {
    identity: "#00e6a8",
    data_point: "#3fb8ff",
    connection: "#ff9d4d",
};

function weightFor(node, breakdownByCategory) {

    if (node.kind === "connection") {
        const entry = breakdownByCategory[node.label];
        return entry ? entry.weight : 8;
    }

    if (node.kind === "data_point") {
        return 12;
    }

    return 0;
}

function BurstRadius({ lineage, blastRadius }) {

    const width = 360;
    const height = 360;
    const cx = width / 2;
    const cy = height / 2;

    const ringRadius = { 0: 0, 1: 90, 2: 155 };

    const breakdownByCategory = useMemo(() => {

        const map = {};

        (blastRadius?.breakdown || []).forEach((entry) => {
            map[entry.category] = entry;
        });

        return map;

    }, [blastRadius]);

    const positioned = useMemo(() => {

        if (!lineage) return [];

        const byHop = { 1: [], 2: [] };

        lineage.nodes.forEach((node) => {
            if (node.hop === 1 || node.hop === 2) {
                byHop[node.hop].push(node);
            }
        });

        const placed = [];

        [1, 2].forEach((hop) => {

            const items = byHop[hop];
            const radius = ringRadius[hop];

            items.forEach((node, index) => {

                const angle =
                    (index / Math.max(items.length, 1)) *
                        Math.PI * 2 -
                    Math.PI / 2;

                placed.push({
                    ...node,
                    x: cx + radius * Math.cos(angle),
                    y: cy + radius * Math.sin(angle),
                    weight: weightFor(node, breakdownByCategory),
                });
            });
        });

        return placed;

    }, [lineage, breakdownByCategory]);

    if (!lineage) return null;

    const score = blastRadius?.score ?? 0;

    return (
        <div className="burst-radius">

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="auto"
                role="img"
                aria-label={`Burst radius score ${score} out of 100`}
            >
                {/* Guide rings */}
                <circle cx={cx} cy={cy} r={ringRadius[1]} className="burst-ring" />
                <circle cx={cx} cy={cy} r={ringRadius[2]} className="burst-ring" />

                {/* Edges */}
                {lineage.edges.map((edge, i) => {

                    const source =
                        edge.source === "identity"
                            ? { x: cx, y: cy }
                            : positioned.find((n) => n.id === edge.source);

                    const target = positioned.find(
                        (n) => n.id === edge.target
                    );

                    if (!source || !target) return null;

                    return (
                        <line
                            key={i}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            className="burst-edge"
                        />
                    );
                })}

                {/* Ring 1 + Ring 2 nodes */}
                {positioned.map((node) => (
                    <g key={node.id}>
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={6 + Math.min(node.weight, 30) / 4}
                            fill={RING_COLORS[node.kind]}
                            className="burst-node"
                        />
                        <text
                            x={node.x}
                            y={node.y + (node.kind === "connection" ? 18 : -12)}
                            textAnchor="middle"
                            className="burst-label"
                        >
                            {node.label}
                        </text>
                    </g>
                ))}

                {/* Center: identity */}
                <circle cx={cx} cy={cy} r={22} fill={RING_COLORS.identity} />
                <text x={cx} y={cy + 4} textAnchor="middle" className="burst-you">
                    YOU
                </text>
            </svg>

            <div className="burst-legend">
                <span><i style={{ background: RING_COLORS.identity }} /> You</span>
                <span><i style={{ background: RING_COLORS.data_point }} /> Data category exposed</span>
                <span><i style={{ background: RING_COLORS.connection }} /> Connected service that can see it</span>
            </div>

        </div>
    );
}

export default BurstRadius;
