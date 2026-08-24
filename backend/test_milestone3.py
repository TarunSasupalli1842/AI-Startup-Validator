import asyncio
import sys
import os

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set stdout to UTF-8
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from models.validation import StartupIdeaInput, AdvisorChatRequest
from routes.validate import (
    validate_startup_idea, chat_with_advisor,
    run_swot_analysis, run_risk_analysis, run_mvp_analysis, run_gtm_analysis
)

async def run_full_suite():
    print("==================================================")
    print("[*] RUNNING VALISTART MILESTONE 3 VERIFICATION SUITE")
    print("==================================================")

    payload = StartupIdeaInput(
        name="EcoTrack Supply",
        problem="Mid-market consumer brands struggle with complex Scope 3 carbon supply chain tracking and audit compliance.",
        solution="Automated AI ESG intelligence platform that ingests supplier invoices and shipping manifests to calculate real-time carbon footprints.",
        target_audience="Supply chain directors and sustainability managers at consumer brands",
        industry="ClimateTech / Enterprise ESG",
        revenue_model="Annual tiered SaaS ($20,000 - $60,000 / year)"
    )

    print("\n[1] Testing Full Pipeline (/validate)...")
    report = await validate_startup_idea(payload)
    assert report.extracted_idea.startup_name == "EcoTrack Supply"
    assert report.validation_scores.overall_score > 0
    assert len(report.swot_analysis.strengths) > 0
    assert len(report.risk_analysis.risks) >= 6
    assert len(report.mvp_recommendation.must_have) > 0
    assert len(report.gtm_strategy.acquisition_channels) > 0
    assert len(report.gtm_strategy.how_to_get_started) >= 5
    print("  + Full Pipeline returned comprehensive validation dossier")
    print(f"  + Score: {report.validation_scores.overall_score}% ({report.summary.feasibility_verdict})")
    print(f"  + Risks: {len(report.risk_analysis.risks)} pillars evaluated (Overall: {report.risk_analysis.overall_risk_level})")
    print(f"  + MVP: {len(report.mvp_recommendation.must_have)} Must-Have features ({report.mvp_recommendation.target_timeline_weeks})")
    print(f"  + GTM: {len(report.gtm_strategy.acquisition_channels)} acquisition channels & {len(report.gtm_strategy.how_to_get_started)} launch steps")

    print("\n[2] Testing Standalone SWOT Agent (/agents/swot)...")
    swot = await run_swot_analysis(payload)
    assert len(swot.strengths) > 0
    assert len(swot.weaknesses) > 0
    assert len(swot.opportunities) > 0
    assert len(swot.threats) > 0
    print("  + SWOT Agent: 4 quadrants populated with structured JSON")

    print("\n[3] Testing Standalone Risk Agent (/agents/risk)...")
    risk_data = await run_risk_analysis(payload)
    assert len(risk_data.risks) >= 6
    assert risk_data.overall_risk_level != ""
    print(f"  + Risk Agent: {len(risk_data.risks)} risk pillars analyzed with mitigations")

    print("\n[4] Testing Standalone MoSCoW MVP Agent (/agents/mvp)...")
    mvp_data = await run_mvp_analysis(payload)
    assert len(mvp_data.must_have) > 0
    assert len(mvp_data.should_have) > 0
    assert len(mvp_data.could_have) > 0
    assert len(mvp_data.wont_have) > 0
    print("  + MoSCoW MVP Agent: Must, Should, Could, and Won't Have categories structured")

    print("\n[5] Testing Standalone GTM Strategy Agent (/agents/gtm)...")
    gtm_data = await run_gtm_analysis(payload)
    assert len(gtm_data.acquisition_channels) > 0
    assert len(gtm_data.launch_strategy) >= 3
    assert len(gtm_data.how_to_get_started) >= 5
    print("  + GTM Agent: Positioning, Channels, Phased Roadmap, and Getting Started generated")

    print("\n[6] Testing Conversational Startup Advisor (/advisor/chat)...")
    test_queries = [
        "What should I build first?",
        "Why is my startup risky?",
        "How can I get my first 100 users?"
    ]
    for q in test_queries:
        req = AdvisorChatRequest(
            message=q,
            report_context=report.model_dump()
        )
        resp = await chat_with_advisor(req)
        assert len(resp.reply) > 50
        assert len(resp.suggested_followups) > 0
        print(f"  + Question: '{q}' -> Reply received ({len(resp.reply)} chars, {len(resp.suggested_followups)} followups)")

    print("\n==================================================")
    print("[SUCCESS] ALL TESTS PASSED! MILESTONE 3 INTEGRATION VERIFIED")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_full_suite())
