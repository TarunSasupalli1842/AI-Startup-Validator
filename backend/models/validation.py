from pydantic import BaseModel, Field
from typing import List, Optional

class StartupIdeaInput(BaseModel):
    name: str = Field(..., description="Name of the startup")
    problem: str = Field(..., description="The problem statement the startup solves")
    solution: str = Field(..., description="The proposed solution to the problem")
    target_audience: str = Field(..., description="The target customer base")
    industry: str = Field(..., description="The industry or domain of the startup")
    revenue_model: Optional[str] = Field("", description="The planned revenue model")
    additional_notes: Optional[str] = Field("", description="Any other additional details or notes")

class ExtractedIdea(BaseModel):
    startup_name: str
    core_problem: str
    core_solution: str
    target_audience: str
    industry: str
    revenue_model: str
    value_proposition: str

class MarketResearchData(BaseModel):
    demand_analysis: str
    industry_trends: List[str]
    opportunities: List[str]
    customer_pain_points: List[str]
    sources: List[str] = Field(default_factory=list, description="URLs or reference sources for research")

class CompetitorEntry(BaseModel):
    name: str
    description: str
    strengths: List[str]
    weaknesses: List[str]
    comparison: str = Field(..., description="How our startup compares to this competitor")
    competitive_advantage: str = Field(..., description="Our edge over this competitor")

class CompetitorAnalysisData(BaseModel):
    competitors: List[CompetitorEntry]
    unique_moat: str = Field(..., description="What makes our startup uniquely defensible")

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class ValidationScores(BaseModel):
    problem_clarity: int = Field(..., ge=0, le=100)
    solution_strength: int = Field(..., ge=0, le=100)
    market_potential: int = Field(..., ge=0, le=100)
    competition_risk: int = Field(..., ge=0, le=100) # Lower risk = higher score? Or Score represents how well we handle competition risk. Let's make it 0-100 where higher is better (e.g. 100 means low risk/excellent positioning)
    feasibility: int = Field(..., ge=0, le=100)
    innovation: int = Field(..., ge=0, le=100)
    overall_score: int = Field(..., ge=0, le=100)

class StartupSummary(BaseModel):
    high_level_description: str
    target_market_summary: str
    feasibility_verdict: str

class ValidationReportResponse(BaseModel):
    summary: StartupSummary
    extracted_idea: ExtractedIdea
    market_research: MarketResearchData
    competitor_analysis: CompetitorAnalysisData
    swot_analysis: SwotAnalysis
    validation_scores: ValidationScores
    ai_recommendations: List[str]
