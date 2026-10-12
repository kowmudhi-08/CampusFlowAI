from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from models import PerformanceInput, PerformanceOutput, PlacementInput, PlacementOutput
from ml_engine import AcademicMLEngine

app = FastAPI(
    title="CampusFlow AI — Academic ML Microservice",
    description="Python FastAPI service providing scikit-learn academic analytics and placement readiness inference",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = AcademicMLEngine()


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "CampusFlow AI ML Engine",
        "version": "1.0.0",
        "model": engine.model_name,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/v1/ai/performance-analysis", response_model=PerformanceOutput)
def analyze_performance(payload: PerformanceInput):
    analysis = engine.analyze_performance(payload.model_dump())

    return PerformanceOutput(
        studentId=payload.studentId,
        studentName=payload.studentName,
        rollNumber=payload.rollNumber,
        attendancePercentage=payload.attendancePercentage,
        averageExamMarks=payload.averageExamMarks,
        totalAssignmentsSubmitted=payload.totalAssignmentsSubmitted,
        riskStatus=analysis["riskStatus"],
        dataSufficient=payload.dataSufficient,
        statusMessage=analysis["statusMessage"],
        predictedScoreRange=analysis.get("predictedScoreRange"),
        confidenceScore=analysis.get("confidenceScore"),
        aiModel=analysis["aiModel"],
        strengths=payload.strengths or [],
        areasForImprovement=payload.areasForImprovement or [],
        recommendations=payload.recommendations or []
    )


@app.post("/api/v1/ai/placement-readiness", response_model=PlacementOutput)
def evaluate_placement(payload: PlacementInput):
    eval_res = engine.evaluate_readiness(payload.model_dump())

    return PlacementOutput(
        studentId=payload.studentId,
        studentName=payload.studentName,
        rollNumber=payload.rollNumber,
        readinessScore=eval_res["readinessScore"],
        readinessLevel=eval_res["readinessLevel"],
        eligibilityIndex=eval_res["eligibilityIndex"],
        aiModel=eval_res["aiModel"],
        explanation=eval_res["explanation"],
        positiveFactors=payload.positiveFactors or [],
        gapFactors=payload.gapFactors or [],
        recommendedActions=payload.recommendedActions or []
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
