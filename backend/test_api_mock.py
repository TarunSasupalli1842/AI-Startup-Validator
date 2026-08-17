import asyncio
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from models.validation import (
    StartupIdeaInput, AdvisorChatRequest,
    ValidationReportResponse, SwotAnalysis, RiskAnalysisData,
    MvpRecommendationData, GtmStrategyData
)
from agents.mock_data import generate_mock_report
from agents.advisor_agent import AdvisorAgent

async def run_fast_test():
    print("==================================================")
    print("⚡ TESTING FAST-FAILSAFE MOCK & VALIDATION MODELS")
    print("==================================================")

    payload = {
        "name": "AgriScan AI",
        "problem": "Farmers lose 30% yield to delayed crop disease diagnosis.",
        "solution": "Smartphone app using computer vision to diagnose crop diseases and give localized treatment plans.",
        "target_audience": "Small-scale & organic farmers",
        "industry": "AgTech / AI Diagnostics",
        "revenue_model": "Freemium & B2B Retail Subscription",
        "additional_notes": "Focused on ease of use"
    }

    report = generate_mock_report(**payload)
    
    # Assertions on Milestone 3 Models
    assert isinstance(report, ValidationReportResponse)
    assert isinstance(report.swot_analysis, SwotAnalysis)
    assert isinstance(report.risk_analysis, RiskAnalysisData)
    assert isinstance(report.mvp_recommendation, MvpRecommendationData)
    assert isinstance(report.gtm_strategy, GtmStrategyData)

    print(f"  ✓ Startup Name: {report.extracted_idea.startup_name}")
    print(f"  ✓ Overall Score: {report.validation_scores.overall_score}%")
    print(f"  ✓ SWOT Strengths: {len(report.swot_analysis.strengths)} items")
    print(f"  ✓ Risk Pillars: {len(report.risk_analysis.risks)} items (Level: {report.risk_analysis.overall_risk_level})")
    print(f"  ✓ MoSCoW Must-Have: {len(report.mvp_recommendation.must_have)} features")
    print(f"  ✓ MoSCoW Should-Have: {len(report.mvp_recommendation.should_have)} features")
    print(f"  ✓ MoSCoW Could-Have: {len(report.mvp_recommendation.could_have)} features")
    print(f"  ✓ MoSCoW Won't-Have: {len(report.mvp_recommendation.wont_have)} features")
    print(f"  ✓ GTM Acquisition Channels: {len(report.gtm_strategy.acquisition_channels)} channels")
    print(f"  ✓ GTM Launch Strategy: {len(report.gtm_strategy.launch_strategy)} phases")
    print(f"  ✓ GTM How to Get Started: {len(report.gtm_strategy.how_to_get_started)} action steps")

    # Test Advisor Agent Fallback Engine
    advisor = AdvisorAgent()
    sample_queries = [
        "What should I build first?",
        "Why is my startup risky?",
        "How can I get my first 100 users?",
        "How should I price my MVP?"
    ]
    
    print("\n  [Advisor Chatbot Tests]")
    for q in sample_queries:
        req = AdvisorChatRequest(message=q, report_context=report.model_dump())
        resp = advisor._fallback_chat(q, report.model_dump())
        assert len(resp.reply) > 50
        assert len(resp.suggested_followups) > 0
        print(f"    ✓ Prompt: '{q}' -> Response: {len(resp.reply)} chars, {len(resp.suggested_followups)} suggested followups")

    print("\n==================================================")
    print("✅ FAST-FAILSAFE MOCK SUITE FULLY VERIFIED")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_fast_test())
