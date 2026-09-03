class DataLineageEngine:
    """
    Traces how a user's personal data spreads outward:

        identity (hop 0)
            -> data points the person directly owns (hop 1)
                -> connected services/third parties that can
                   see or receive that category of data (hop 2)

    The output is a small node/edge graph. This is what lets the
    frontend draw an actual "burst radius" diagram (concentric
    rings of exposure) instead of a single opaque number.
    """

    def build(self, data):

        data_points = data.get("data_points", [])
        connections = data.get("connections", [])

        nodes = [
            {
                "id": "identity",
                "label": "You",
                "hop": 0,
                "kind": "identity",
            }
        ]

        edges = []

        seen_categories = set()

        for point in data_points:

            category = point.get("type", "unknown").lower()

            node_id = f"data:{category}"

            if node_id not in seen_categories:

                seen_categories.add(node_id)

                nodes.append({
                    "id": node_id,
                    "label": category,
                    "hop": 1,
                    "kind": "data_point",
                })

                edges.append({
                    "source": "identity",
                    "target": node_id,
                })

        seen_connections = set()

        for index, connection in enumerate(connections):

            category = connection.get("type", "unknown").lower()

            data_node_id = f"data:{category}"

            connection_id = f"connection:{category}:{index}"

            # Make sure the data-point ring node exists even if it
            # wasn't in data_points directly (a connection can expose
            # a category the user never explicitly listed).
            if data_node_id not in seen_categories:

                seen_categories.add(data_node_id)

                nodes.append({
                    "id": data_node_id,
                    "label": category,
                    "hop": 1,
                    "kind": "data_point",
                })

                edges.append({
                    "source": "identity",
                    "target": data_node_id,
                })

            if connection_id not in seen_connections:

                seen_connections.add(connection_id)

                nodes.append({
                    "id": connection_id,
                    "label": connection.get("name", category),
                    "hop": 2,
                    "kind": "connection",
                })

                edges.append({
                    "source": data_node_id,
                    "target": connection_id,
                })

        return {
            "nodes": nodes,
            "edges": edges,
            "hop_counts": {
                "identity": 1,
                "data_points": len(seen_categories),
                "connections": len(seen_connections),
            },
        }
