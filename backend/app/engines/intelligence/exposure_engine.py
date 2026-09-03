class ExposureEngine:

    SENSITIVE_TYPES = {
        "email": 10,
        "phone": 15,
        "location": 20,
        "contacts": 20,
        "documents": 25,
        "financial": 30,
        "identity": 25,
        "biometric": 30
    }

    def analyze(self, data):

        data_points = data.get("data_points", [])

        if not data_points:
            return {
                "score": 0,
                "exposed_categories": [],
                "total_items": 0,
                "breakdown": [],
            }

        raw_score = 0
        categories = []
        weight_by_category = {}

        for item in data_points:

            category = item.get(
                "type",
                "unknown"
            ).lower()

            weight = self.SENSITIVE_TYPES.get(
                category,
                5
            )

            raw_score += weight

            if category not in categories:
                categories.append(category)
                weight_by_category[category] = weight
            else:
                weight_by_category[category] += weight

        score = min(raw_score, 100)

        breakdown = [
            {
                "category": category,
                "weight": weight_by_category[category],
                "share": (
                    round(
                        (weight_by_category[category] / raw_score) * 100,
                        1,
                    )
                    if raw_score else 0
                ),
            }
            for category in categories
        ]

        return {
            "score": score,
            "exposed_categories": categories,
            "total_items": len(data_points),
            "breakdown": breakdown,
        }