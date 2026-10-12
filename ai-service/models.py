from pydantic import BaseModel, Field
from typing import List, Optional


class PerformanceInput(BaseModel):
    studentId: int
    studentName: str
    rollNumber: str
    attendancePercentage: float = 0.0
    averageExamMarks: float = 0.0
    totalAssignmentsSubmitted: int = 0
    dataSufficient: bool = False
    riskStatus: Optional[str] = "INSUFFICIENT_DATA"
    statusMessage: Optional[str] = None
    strengths: Optional[List[str]] = Field(default_factory=list)
    areasForImprovement: Optional[List[str]] = Field(default_factory=list)
    recommendations: Optional[List[str]] = Field(default_factory=list)


class PerformanceOutput(BaseModel):
    studentId: int
    studentName: str
    rollNumber: str
    attendancePercentage: float
    averageExamMarks: float
    totalAssignmentsSubmitted: int
    riskStatus: str
    dataSufficient: bool
    statusMessage: str
    predictedScoreRange: Optional[str] = None
    confidenceScore: Optional[float] = None
    aiModel: str
    strengths: List[str]
    areasForImprovement: List[str]
    recommendations: List[str]


class PlacementInput(BaseModel):
    studentId: int
    studentName: str
    rollNumber: str
    currentCgpa: float = 0.0
    attendancePercentage: float = 0.0
    readinessScore: int = 0
    readinessLevel: str = "NOT_READY"
    eligible: bool = False
    eligibleDrivesCount: int = 0
    explanation: Optional[str] = None
    positiveFactors: Optional[List[str]] = Field(default_factory=list)
    gapFactors: Optional[List[str]] = Field(default_factory=list)
    recommendedActions: Optional[List[str]] = Field(default_factory=list)


class PlacementOutput(BaseModel):
    studentId: int
    studentName: str
    rollNumber: str
    readinessScore: int
    readinessLevel: str
    eligibilityIndex: float
    aiModel: str
    explanation: str
    positiveFactors: List[str]
    gapFactors: List[str]
    recommendedActions: List[str]
