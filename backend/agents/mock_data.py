import random
from typing import Dict, Any
from models.validation import (
    ValidationReportResponse, StartupSummary, ExtractedIdea,
    MarketResearchData, CompetitorAnalysisData, CompetitorEntry,
    SwotAnalysis, ValidationScores
)

def generate_mock_report(name: str, problem: str, solution: str, target_audience: str, industry: str, revenue_model: str, additional_notes: str = "") -> ValidationReportResponse:
    # Set a seed based on the startup name to keep it consistent but unique per startup
    random.seed(name)
    
    # Standardize names and inputs
    startup_name = name.strip() or "InnovateX"
    prob = problem.strip() or "Difficulty in managing daily schedules."
    sol = solution.strip() or "An AI-powered smart scheduling assistant."
    audience = target_audience.strip() or "Busy professionals and students"
    ind = industry.strip() or "Productivity & Software"
    rev = revenue_model.strip() or "SaaS Subscription"
    
    # Calculate scores dynamically but deterministically based on lengths/chars
    seed_val = len(startup_name) + len(prob) + len(sol)
    
    prob_clarity = 75 + (seed_val % 21) # 75 - 95
    sol_strength = 70 + ((seed_val * 3) % 26) # 70 - 95
    market_potential = 65 + ((seed_val * 7) % 31) # 65 - 95
    comp_risk = 60 + ((seed_val * 11) % 31) # 60 - 90
    feasibility = 70 + ((seed_val * 13) % 26) # 70 - 95
    innovation = 68 + ((seed_val * 17) % 28) # 68 - 95
    
    overall_score = int((prob_clarity * 0.15) + (sol_strength * 0.20) + (market_potential * 0.25) + (comp_risk * 0.10) + (feasibility * 0.15) + (innovation * 0.15))
    
    # Determine feasibility status
    if overall_score >= 85:
        verdict = "Excellent Potential. High market viability, clear problem alignment, and a solid proposed solution. Recommended for immediate MVP development."
    elif overall_score >= 75:
        verdict = "Strong Viability. Solid concept with a defined target audience. Minor refinements to the revenue model and competitive positioning are advised before launch."
    else:
        verdict = "Moderate Feasibility. Good foundational concept but faces stiff competition or high entry barriers. Consider running rapid prototyping to validate customer willingness to pay."

    # Extract industry keywords for competitors
    ind_kw = ind.split(" ")[0] if ind else "Enterprise"
    
    competitors_list = [
        CompetitorEntry(
            name=f"{ind_kw}Flow Systems",
            description=f"An established traditional player in the {ind} space, providing standard but static solutions to the problem of {prob[:60]}...",
            strengths=["Wide brand recognition", "Large existing enterprise customer base", "Feature-rich platform"],
            weaknesses=["High price tag", "Complex user interface", "Slow integration of modern AI capabilities"],
            comparison=f"Unlike {ind_kw}Flow, our solution focuses on dynamic automation and simple onboarding, reducing user friction.",
            competitive_advantage="Lower cost structure, mobile-first design, and deep AI-driven automation."
        ),
        CompetitorEntry(
            name=f"Sync{startup_name[:4] or 'Sync'} Hub",
            description=f"A newer, agile competitor focusing specifically on {target_audience} using basic automation plugins.",
            strengths=["Simple onboarding", "Low entry cost", "Good community support"],
            weaknesses=["Lacks advanced analytical features", "Fragile integration structure", "Poor scalability for larger teams"],
            comparison=f"SyncHub addresses the basic needs but fails to solve the core scalability issue that our proposed solution of {sol[:60]}... tackles head-on.",
            competitive_advantage="Comprehensive end-to-end integration and native intelligence built into the workflows."
        )
    ]
    
    return ValidationReportResponse(
        summary=StartupSummary(
            high_level_description=f"{startup_name} is an innovative project designed to operate within the {ind} industry. The solution aims to directly address the problem where users face: '{prob}'. By leveraging '{sol}', the venture creates a highly customized experience for users.",
            target_market_summary=f"The primary target market consists of {audience}. Current market indicators suggest a growing demand for customized, AI-integrated solutions in the {ind} domain, driven by a global shift towards automation, digital efficiency, and user-centric systems.",
            feasibility_verdict=verdict
        ),
        extracted_idea=ExtractedIdea(
            startup_name=startup_name,
            core_problem=prob,
            core_solution=sol,
            target_audience=audience,
            industry=ind,
            revenue_model=rev,
            value_proposition=f"Provides a friction-free, modern approach to {sol[:80]}... which solves {prob[:80]}... for {audience} with a sustainable {rev} model."
        ),
        market_research=MarketResearchData(
            demand_analysis=f"Our analysis indicates a strong macro-trend in the {ind} space. Search interest highlights that {audience} are actively seeking products that address scheduling, manual overhead, and workflow optimization. The rise of generative AI tools has set a high standard, prompting users to expect proactive solutions rather than manual configuration dashboards.",
            industry_trends=[
                f"Accelerated integration of Generative AI assistants in the {ind} sector.",
                f"Shift from desktop-first enterprise portals to context-aware, mobile-first apps for {audience}.",
                "Increasing demand for subscription-based micro-services with transparent pricing.",
                "High priority on data privacy, secure API keys, and compliance."
            ],
            opportunities=[
                f"Capturing the underserved segment of {audience} who find existing tools too complex.",
                f"Expanding the core solution to adjacent workflows within the {ind} industry.",
                "Offering premium analytical reports and team collaboration add-ons.",
                "Partnerships with existing platform ecosystems to offer native integrations."
            ],
            customer_pain_points=[
                "Steep learning curves and high cost of existing premium alternatives.",
                "Lack of customization and context-awareness in legacy platforms.",
                "Scattered tools requiring constant switching and copy-pasting.",
                "High manual overhead required to keep data synchronized."
            ],
            sources=[
                "https://www.statista.com/search/?q=" + ind_kw.lower(),
                "https://trends.google.com/trends/explore?q=" + ind_kw.lower() + "+software",
                "https://www.g2.com/categories/" + ind_kw.lower().replace("&", "-")
            ]
        ),
        competitor_analysis=CompetitorAnalysisData(
            competitors=competitors_list,
            unique_moat=f"Our core defensibility relies on a highly verticalized approach tailored for {audience}, combined with a proprietary workflow that minimizes the user's manual configuration. By integrating search intelligence and structured parsing directly into {sol[:50]}, we create a feedback loop that competitors cannot easily replicate without rebuilding their legacy architectures."
        ),
        swot_analysis=SwotAnalysis(
            strengths=[
                f"Highly aligned solution architecture targeting the core issue of '{prob[:50]}...'",
                f"Tailored specifically to the distinct pain points of {audience}.",
                "Modern multi-agent AI framework allowing real-time adjustments and analysis.",
                f"Flexible {rev} model lowering the barrier to entry."
            ],
            weaknesses=[
                "Dependence on third-party LLMs and external search engines for real-time analysis.",
                "Initial lack of brand presence in a competitive space.",
                "High dependency on continuous user adoption to build a data network effect.",
                "Potential operational complexity in scaling multi-agent tasks for complex inputs."
            ],
            opportunities=[
                f"First-mover advantage in using multi-agent workflows for {ind} validation.",
                "Opportunity to upsell enterprise-tier validation features and compliance checks.",
                "Expanding integration into popular collaboration tools (Slack, Teams, Discord).",
                "Monetizing anonymized aggregated industry trends and research insights."
            ],
            threats=[
                "Rapid commoditization of basic AI wrappers leading to copycat entries.",
                "Incumbents with deep pockets rapidly copying the core features.",
                "Changes in data security regulations limiting real-time web scraping and data processing.",
                "Fluctuations in AI API pricing affecting the operating margins of the validation service."
            ]
        ),
        validation_scores=ValidationScores(
            problem_clarity=prob_clarity,
            solution_strength=sol_strength,
            market_potential=market_potential,
            competition_risk=comp_risk,
            feasibility=feasibility,
            innovation=innovation,
            overall_score=overall_score
        ),
        ai_recommendations=[
            f"1. Build a Simple MVP: Create a single-feature prototype of {sol[:60]}... specifically focused on {audience} to validate core user engagement.",
            f"2. Conduct Beta Testing: Launch a closed beta with 50 early adopters to refine the product UI and address initial friction points.",
            f"3. Establish the Revenue Funnel: Validate the {rev} model early by testing pre-orders or offering a freemium tier with a low subscription fee.",
            f"4. Refine the Defensibility Moat: Focus on securing user data loops and build specialized integrations that are hard for generic competitors to copy.",
            f"5. Enhance SEO and Content Marketing: Target long-tail search terms related to '{prob[:40]}...' to attract organic search traffic without high advertising costs."
        ]
    )
