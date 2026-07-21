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

class MarketOpportunityData(BaseModel):
    tam: str = Field(..., description="Total Addressable Market estimation")
    sam: str = Field(..., description="Serviceable Addressable Market estimation")
    som: str = Field(..., description="Serviceable Obtainable Market estimation")
    market_growth_rate: str = Field(..., description="Estimated CAGR or growth trajectory")
    market_drivers: List[str] = Field(default_factory=list, description="Key macro tailwinds and growth drivers")
    entry_barriers: List[str] = Field(default_factory=list, description="Capital, regulatory, or tech barriers")
    unit_economics_summary: str = Field(..., description="Overview of unit economics potential")
    estimated_cac: str = Field(..., description="Estimated Customer Acquisition Cost range")
    estimated_ltv: str = Field(..., description="Estimated Customer Lifetime Value range")
    pricing_power: str = Field(..., description="Assessment of pricing strategy and flexibility")

class CustomerSegmentPersona(BaseModel):
    persona_name: str
    target_profile: str
    key_pain_points: List[str]
    willingness_to_pay: str
    acquisition_channels: List[str]
    buying_triggers: List[str]

class CustomerSegmentationData(BaseModel):
    primary_segment: CustomerSegmentPersona
    secondary_segments: List[CustomerSegmentPersona]
    segmentation_strategy: str = Field(..., description="Strategic recommendations for customer acquisition")

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

class MatrixComparisonRow(BaseModel):
    dimension: str = Field(..., description="Comparison dimension e.g. Pricing, AI Depth, Speed")
    our_startup: str = Field(..., description="Our feature or capability in this dimension")
    primary_competitor: str = Field(..., description="Main competitor's status")
    secondary_competitor: str = Field(..., description="Secondary competitor's status")
    our_advantage: str = Field(..., description="Clear win/differentiator for our startup")

class ComparisonData(BaseModel):
    competitor_names: List[str] = Field(default_factory=list, description="Names of key competitors compared")
    comparison_matrix: List[MatrixComparisonRow] = Field(default_factory=list, description="Head to head comparison table")
    positioning_summary: str = Field(..., description="Strategic positioning summary against alternatives")

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class ValidationScores(BaseModel):
    problem_clarity: int = Field(..., ge=0, le=100)
    solution_strength: int = Field(..., ge=0, le=100)
    market_potential: int = Field(..., ge=0, le=100)
    competition_risk: int = Field(..., ge=0, le=100)
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
    market_opportunity: MarketOpportunityData
    customer_segmentation: CustomerSegmentationData
    competitor_analysis: CompetitorAnalysisData
    comparison: ComparisonData
    swot_analysis: SwotAnalysis
    validation_scores: ValidationScores
    ai_recommendations: List[str]
