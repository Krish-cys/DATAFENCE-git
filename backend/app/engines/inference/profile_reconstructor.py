class ProfileReconstructor:
    """
    Turns a list of inference findings into a plain-English
    answer to "how much of me has been reconstructed?".

    Accepts findings shaped like either engine variant DATAFENCE
    has used:
      - {"type": "INTEREST_PROFILE", "confidence": 0.91, ...}
      - {"inference": "Behavioral patterns", "severity": 65, ...}
    """

    FACET_KEYWORDS = {
        "behavioral_profile": ("behavioral", "interest"),
        "lifestyle_profile": ("lifestyle",),
        "social_profile": ("social",),
    }

    def reconstruct(self, inferences):

        profile = {
            "behavioral_profile": False,
            "lifestyle_profile": False,
            "social_profile": False,
            "confidence": 0,
            "reconstruction_percent": 0,
        }

        confidence_values = []

        for inference in inferences:

            label = (
                inference.get("type")
                or inference.get("inference")
                or ""
            ).lower()

            for facet, keywords in self.FACET_KEYWORDS.items():
                if any(keyword in label for keyword in keywords):
                    profile[facet] = True

            if "confidence" in inference:
                confidence_values.append(inference["confidence"])
            elif "severity" in inference:
                confidence_values.append(inference["severity"] / 100)

        if confidence_values:

            avg_confidence = sum(confidence_values) / len(
                confidence_values
            )

            profile["confidence"] = round(avg_confidence, 2)

            profile["reconstruction_percent"] = round(
                avg_confidence * 100
            )

        return profile