class BlastRadiusEngine:

    WEIGHTS = {
        "email": 10,
        "contacts": 15,
        "documents": 20,
        "financial": 30,
        "identity": 20,
        "location": 10,
        "biometric": 30
    }

    def calculate(self, data):

        connections = data.get(
            "connections",
            []
        )

        score = 0

        breakdown = []

        for connection in connections:

            category = connection.get(
                "type",
                ""
            ).lower()

            weight = self.WEIGHTS.get(
                category,
                5
            )

            score += weight

            breakdown.append({
                "category": category,
                "weight": weight,
            })

        capped_score = min(score, 100)

        # Share of the (uncapped) raw score each category
        # contributes, so a pie/bar chart adds up to 100%.
        for item in breakdown:

            item["share"] = (
                round((item["weight"] / score) * 100, 1)
                if score else 0
            )

        return {
            "score": capped_score,
            "connected_services":
                len(connections),
            "breakdown": breakdown,
        }