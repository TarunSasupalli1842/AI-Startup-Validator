from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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
    strengths: List[str] = Field(..., description="Internal tangible strengths & unique advantages")
    weaknesses: List[str] = Field(..., description="Internal liabilities, resource gaps, or vulnerabilities")
    opportunities: List[str] = Field(..., description="External market opportunities, tailwinds & expansion vectors")
    threats: List[str] = Field(..., description="External market risks, incumbents & macro threats")

class RiskItem(BaseModel):
    category: str = Field(..., description="Market, Competitor, Financial, Technical, Operational, or Customer")
    risk: str = Field(..., description="Description of the risk")
    probability: str = Field(..., description="Probability level: Low, Medium, High")
    impact: str = Field(..., description="Impact level: Low, Medium, High, Critical")
    severity: str = Field(..., description="Overall severity: Low, Medium, High, Critical")
    mitigation: str = Field(..., description="Actionable mitigation strategy")

class RiskAnalysisData(BaseModel):
    overall_risk_level: str = Field(..., description="Overall risk rating: Low, Moderate, High, or Critical")
    risk_summary: str = Field(..., description="Executive summary of venture risk profile")
    risks: List[RiskItem] = Field(..., description="Detailed risk breakdown across 6 core pillars")
    key_mitigation_priorities: List[str] = Field(..., description="Top immediate risk mitigation action items")

class MvpFeatureItem(BaseModel):
    feature_name: str = Field(..., description="Name of the feature")
    description: str = Field(..., description="Brief functionality description")
    rationale: str = Field(..., description="Strategic reason for this MoSCoW prioritization")
    complexity: str = Field(..., description="Estimated build complexity: Low, Medium, High")
    priority: str = Field(..., description="MoSCoW category: MUST HAVE, SHOULD HAVE, COULD HAVE, WON'T HAVE")

class MvpRecommendationData(BaseModel):
    mvp_summary: str = Field(..., description="Executive philosophy and core focus for the Minimum Viable Product")
    target_timeline_weeks: str = Field(..., description="Estimated build and launch timeframe e.g. 4-6 Weeks")
    development_approach: str = Field(..., description="Recommended technical build strategy and architecture")
    must_have: List[MvpFeatureItem] = Field(..., description="Essential core features required for MVP validation")
    should_have: List[MvpFeatureItem] = Field(..., description="High-priority features for fast follow-on release")
    could_have: List[MvpFeatureItem] = Field(..., description="Nice-to-have features if bandwidth allows")
    wont_have: List[MvpFeatureItem] = Field(..., description="Explicitly deferred out-of-scope features for initial launch")

class GtmChannel(BaseModel):
    channel_name: str = Field(..., description="Name of customer acquisition channel")
    description: str = Field(..., description="How to activate and scale this channel")
    expected_cac: str = Field(..., description="Estimated acquisition cost tier")
    conversion_strategy: str = Field(..., description="Conversion funnel tactic for this channel")

class GtmLaunchPhase(BaseModel):
    phase_name: str = Field(..., description="Phase identifier e.g. Phase 1: Alpha & Community Waitlist")
    timeline: str = Field(..., description="Phase duration e.g. Weeks 1-4")
    key_activities: List[str] = Field(..., description="Tactical execution checklist")
    goals: str = Field(..., description="Measurable milestones for this phase")

class GtmStrategyData(BaseModel):
    positioning_statement: str = Field(..., description="Formal positioning formula statement")
    target_customers: List[str] = Field(..., description="Specific initial customer segments to target")
    acquisition_channels: List[GtmChannel] = Field(..., description="Top customer acquisition channels")
    launch_strategy: List[GtmLaunchPhase] = Field(..., description="Phased launch timeline and roadmap")
    pricing_strategy: str = Field(..., description="Core monetization model and pricing structure")
    pricing_tiers: List[str] = Field(..., description="Recommended pricing tiers and packages")
    key_kpis: List[str] = Field(..., description="North Star and secondary KPIs to track")
    how_to_get_started: List[str] = Field(..., description="Immediate actionable 5-step checklist for immediate launch")

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
    risk_analysis: RiskAnalysisData
    mvp_recommendation: MvpRecommendationData
    gtm_strategy: GtmStrategyData
    validation_scores: ValidationScores
    ai_recommendations: List[str]

class AdvisorChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")

class AdvisorChatRequest(BaseModel):
    message: str = Field(..., description="User's query or follow-up question")
    history: List[AdvisorChatMessage] = Field(default_factory=list, description="Recent conversation history")
    report_context: Optional[Dict[str, Any]] = Field(default=None, description="Full or partial validation report context")

class AdvisorChatResponse(BaseModel):
    reply: str = Field(..., description="AI Startup Advisor response")
    suggested_followups: List[str] = Field(default_factory=list, description="Smart follow-up suggestions")
    confidence: Optional[str] = Field("High", description="Response confidence")
