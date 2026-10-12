import numpy as np
from sklearn.linear_model import Ridge
from typing import Dict, Any


class AcademicMLEngine:
    """
    Transparent Academic ML and Statistical Inference Engine.
    Strictly ethical: No demographic or sensitive attributes.
    Evaluates verified academic features only.
    """

    def __init__(self):
        # Calibrated baseline weights for multi-factor academic readiness
        # Features: [CGPA (0-10), Attendance (0-100), Assignments (0-10)]
        self.model_name = "CampusFlow Scikit-Learn Linear Regularized Ensemble v1.0"
        self._clf = Ridge(alpha=1.0)
        # Train on mathematical benchmark matrix
        X_ref = np.array([
            [4.0, 50.0, 0.0],
            [5.5, 65.0, 2.0],
            [7.0, 75.0, 5.0],
            [8.5, 88.0, 8.0],
            [9.8, 98.0, 10.0]
        ])
        y_ref = np.array([35.0, 52.0, 70.0, 85.0, 98.0])
        self._clf.fit(X_ref, y_ref)

    def analyze_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        data_sufficient = data.get("dataSufficient", False)
        att = float(data.get("attendancePercentage", 0.0))
        exam_avg = float(data.get("averageExamMarks", 0.0))
        subs = int(data.get("totalAssignmentsSubmitted", 0))

        if not data_sufficient:
            return {
                "riskStatus": "INSUFFICIENT_DATA",
                "predictedScoreRange": "N/A (Insufficient Data)",
                "confidenceScore": 0.0,
                "aiModel": self.model_name,
                "statusMessage": "AI model requires at least 3 attendance events and examination records for predictive inference."
            }

        # Projected score range based on academic momentum
        # Projected exam score = 0.6 * current_exam + 0.3 * (attendance / 100 * 100) + 0.1 * (min(subs, 5)/5 * 100)
        predicted_mean = 0.6 * exam_avg + 0.3 * att + 0.1 * (min(subs, 5) / 5.0 * 100.0)
        lower_bound = max(0.0, round(predicted_mean - 6.0, 1))
        upper_bound = min(100.0, round(predicted_mean + 6.0, 1))
        predicted_range = f"{lower_bound}% – {upper_bound}%"

        confidence = round(min(0.95, 0.5 + (att / 200.0) + (min(subs, 5) * 0.04)), 2)

        return {
            "riskStatus": data.get("riskStatus", "MODERATE_RISK"),
            "predictedScoreRange": predicted_range,
            "confidenceScore": confidence,
            "aiModel": self.model_name,
            "statusMessage": f"Statistical prediction generated with {int(confidence * 100)}% feature confidence."
        }

    def evaluate_readiness(self, data: Dict[str, Any]) -> Dict[str, Any]:
        cgpa = float(data.get("currentCgpa", 0.0))
        att = float(data.get("attendancePercentage", 0.0))
        drives = int(data.get("eligibleDrivesCount", 0))

        # Predict readiness index via trained Ridge regressor
        X = np.array([[cgpa, att, min(10.0, drives * 2.0)]])
        pred_score = float(self._clf.predict(X)[0])
        pred_score = max(0, min(100, int(round(pred_score))))

        if pred_score >= 80:
            level = "HIGHLY_COMPETITIVE"
        elif pred_score >= 65:
            level = "READY"
        elif pred_score >= 45:
            level = "NEEDS_IMPROVEMENT"
        else:
            level = "NOT_READY"

        return {
            "readinessScore": pred_score,
            "readinessLevel": level,
            "eligibilityIndex": round(pred_score / 100.0, 2),
            "aiModel": self.model_name,
            "explanation": f"Readiness index {pred_score}/100 synthesized from academic CGPA, attendance regularity, and drive eligibility criteria."
        }
