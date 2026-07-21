import random
from typing import Dict, Any
from models.validation import (
    ValidationReportResponse, StartupSummary, ExtractedIdea,
    MarketResearchData, MarketOpportunityData, CustomerSegmentationData, CustomerSegmentPersona,
    CompetitorAnalysisData, CompetitorEntry, ComparisonData, MatrixComparisonRow,
    SwotAnalysis, ValidationScores
)

def generate_mock_report(name: str, problem: str, solution: str, target_audience: str, industry: str, revenue_model: str, additional_notes: str = "") -> ValidationReportResponse:
    random.seed(name)
    
    startup_name = name.strip() or "InnovateX"
    prob = problem.strip() or "Difficulty in managing daily schedules."
    sol = solution.strip() or "An AI-powered smart scheduling assistant."
    audience = target_audience.strip() or "Busy professionals and students"
    ind = industry.strip() or "Productivity & Software"
    rev = revenue_model.strip() or "SaaS Subscription"
    
    seed_val = len(startup_name) + len(prob) + len(sol)
    
    prob_clarity = 75 + (seed_val % 21)
    sol_strength = 70 + ((seed_val * 3) % 26)
    market_potential = 65 + ((seed_val * 7) % 31)
    comp_risk = 60 + ((seed_val * 11) % 31)
    feasibility = 70 + ((seed_val * 13) % 26)
    innovation = 68 + ((seed_val * 17) % 28)
    
    overall_score = int((prob_clarity * 0.15) + (sol_strength * 0.20) + (market_potential * 0.25) + (comp_risk * 0.10) + (feasibility * 0.15) + (innovation * 0.15))
    
    if overall_score >= 85:
        verdict = "Excellent Potential. High market viability, clear problem alignment, and a solid proposed solution. Recommended for immediate MVP development."
    elif overall_score >= 75:
        verdict = "Strong Viability. Solid concept with a defined target audience. Minor refinements to the revenue model and competitive positioning are advised before launch."
    else:
        verdict = "Moderate Feasibility. Good foundational concept but faces stiff competition or high entry barriers. Consider running rapid prototyping to validate customer willingness to pay."

    ind_kw = ind.split(" ")[0] if ind else "Enterprise"
    comp_1_name = f"{ind_kw}Flow Systems"
    comp_2_name = f"Sync{startup_name[:4] or 'Sync'} Hub"
    
    competitors_list = [
        CompetitorEntry(
            name=comp_1_name,
            description=f"An established traditional player in the {ind} space, providing standard but static solutions to the problem of {prob[:60]}...",
            strengths=["Wide brand recognition", "Large existing enterprise customer base", "Feature-rich platform"],
            weaknesses=["High price tag", "Complex user interface", "Slow integration of modern AI capabilities"],
            comparison=f"Unlike {comp_1_name}, our solution focuses on dynamic automation and simple onboarding, reducing user friction.",
            competitive_advantage="Lower cost structure, mobile-first design, and deep AI-driven automation."
        ),
        CompetitorEntry(
            name=comp_2_name,
            description=f"A newer, agile competitor focusing specifically on {audience} using basic automation plugins.",
            strengths=["Simple onboarding", "Low entry cost", "Good community support"],
            weaknesses=["Lacks advanced analytical features", "Fragile integration structure", "Poor scalability for larger teams"],
            comparison=f"{comp_2_name} addresses basic needs but fails to solve core scalability issues.",
            competitive_advantage="Comprehensive end-to-end integration and native intelligence built into workflows."
        )
    ]
    
    market_opportunity = MarketOpportunityData(
        tam=f"${28 + (seed_val % 40)}.5 Billion Global Market",
        sam=f"${5 + (seed_val % 8)}.2 Billion Addressable Segment",
        som=f"${350 + (seed_val % 300)} Million Realistic 3-Year Target",
        market_growth_rate=f"{14 + (seed_val % 10)}.8% CAGR (2024-2030)",
        market_drivers=[
            f"Rapid digitization and AI automation in the {ind} sector.",
            f"High adoption rates among {audience} seeking speed and efficiency.",
            "Transition from legacy desktop applications to API-first cloud solutions.",
            "Rising demand for self-service analytics and automated decision engines."
        ],
        entry_barriers=[
            "Established customer trust with traditional legacy platforms.",
            "Customer compliance requirements and data privacy standards.",
            "Acquisition cost competition in digital marketing channels."
        ],
        unit_economics_summary=f"High gross margin potential (72%+) with recurring revenues based on the {rev} model.",
        estimated_cac=f"${35 + (seed_val % 40)} - ${90 + (seed_val % 50)}",
        estimated_ltv=f"${450 + (seed_val % 200)} - ${1200 + (seed_val % 500)}",
        pricing_power=f"Strong — high user willingness to pay for automation targeting '{prob[:40]}'."
    )
    
    customer_segmentation = CustomerSegmentationData(
        primary_segment=CustomerSegmentPersona(
            persona_name=f"Primary {ind_kw} Operators",
            target_profile=f"Tech-savvy professionals and team leads within {audience} looking to eliminate friction.",
            key_pain_points=[
                f"Wasting time on manual workflows related to {prob[:40]}",
                "High complexity of legacy software tools",
                "Lack of proactive, real-time AI assistance"
            ],
            willingness_to_pay="High ($39 - $149/month)",
            acquisition_channels=[
                "SEO & Organic Content Marketing",
                "Product-Led Growth (Freemium Sandbox)",
                "Niche Community Platforms (Product Hunt, Reddit)"
            ],
            buying_triggers=[
                "Productivity bottlenecks",
                "Frustration with manual errors in existing tools"
            ]
        ),
        secondary_segments=[
            CustomerSegmentPersona(
                persona_name="Mid-Market Growth Teams",
                target_profile=f"Department leaders in medium companies seeking standardized solutions for {ind}.",
                key_pain_points=[
                    "Lack of centralized reporting",
                    "Difficulty scaling workflows across multiple team members"
                ],
                willingness_to_pay="Very High ($249 - $699/month)",
                acquisition_channels=[
                    "LinkedIn Targeted Campaigns",
                    "Direct Outbound Sales & Product Demos"
                ],
                buying_triggers=[
                    "Scaling team headcount",
                    "Quarterly audit on operational efficiency"
                ]
            ),
            CustomerSegmentPersona(
                persona_name="Indie Freelancers & Students",
                target_profile="Solo users needing affordable, fast execution tools.",
                key_pain_points=[
                    "Limited budget for expensive software",
                    "Need instant results without long setup time"
                ],
                willingness_to_pay="Moderate ($12 - $29/month)",
                acquisition_channels=[
                    "Social Video Marketing (TikTok, YouTube)",
                    "Word-of-Mouth & Student Discounts"
                ],
                buying_triggers=[
                    "Urgent project deadline or assignment"
                ]
            )
        ],
        segmentation_strategy=f"First capture high-intent users in the '{audience}' segment through Product-Led Growth, then launch team accounts for mid-market upsell."
    )
    
    comparison = ComparisonData(
        competitor_names=[comp_1_name, comp_2_name],
        comparison_matrix=[
            MatrixComparisonRow(
                dimension="Pricing Model & Transparency",
                our_startup=f"Transparent, usage-aligned {rev}",
                primary_competitor="Expensive annual enterprise contracts",
                secondary_competitor="Tiered seat limits with add-on fees",
                our_advantage="Pay-as-you-grow flexibility with zero hidden setup fees"
            ),
            MatrixComparisonRow(
                dimension="AI & Multi-Agent Intelligence",
                our_startup="Autonomous multi-agent synthesis & web research",
                primary_competitor="Manual entry with rule-based triggers",
                secondary_competitor="Basic single-prompt AI assistant",
                our_advantage="End-to-end multi-agent orchestration"
            ),
            MatrixComparisonRow(
                dimension="Time-to-Value & Onboarding",
                our_startup="Instant 1-click execution & report generation",
                primary_competitor="2-4 weeks mandatory onboarding consultation",
                secondary_competitor="Manual template building required",
                our_advantage="Zero setup friction with instant actionable reports"
            ),
            MatrixComparisonRow(
                dimension="User Interface & Usability",
                our_startup="Modern, high-aesthetic Glassmorphism UI",
                primary_competitor="Cluttered legacy enterprise portal",
                secondary_competitor="Basic web form interface",
                our_advantage="State-of-the-art interactive workspace & clear metrics"
            ),
            MatrixComparisonRow(
                dimension="Defensible Strategic Moat",
                our_startup=f"Proprietary workflow & vertical data loop for {audience}",
                primary_competitor="High legacy technical debt",
                secondary_competitor="Indie wrapper vulnerable to copycats",
                our_advantage="Deep domain integration & multi-agent network feedback"
            )
        ],
        positioning_summary=f"{startup_name} effectively bridges the gap between complex enterprise software ({comp_1_name}) and basic single-purpose tools ({comp_2_name}), delivering enterprise-grade AI depth with consumer-grade simplicity."
    )
    
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
        market_opportunity=market_opportunity,
        customer_segmentation=customer_segmentation,
        competitor_analysis=CompetitorAnalysisData(
            competitors=competitors_list,
            unique_moat=f"Our core defensibility relies on a highly verticalized approach tailored for {audience}, combined with a proprietary workflow that minimizes the user's manual configuration. By integrating search intelligence and structured parsing directly into {sol[:50]}, we create a feedback loop that competitors cannot easily replicate without rebuilding their legacy architectures."
        ),
        comparison=comparison,
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
                "Fluctuations in AI API pricing affecting operating margins."
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
            f"2. Conduct Beta Testing: Launch a closed beta with 50 early adopters to refine product UI and address initial friction points.",
            f"3. Establish Revenue Funnel: Validate the {rev} model early by testing pre-orders or offering a freemium tier with low subscription fees.",
            f"4. Refine Defensibility Moat: Focus on securing user data loops and build specialized integrations hard for generic competitors to copy.",
            f"5. Enhance Content Marketing: Target long-tail search terms related to '{prob[:40]}...' to attract organic search traffic without high advertising costs."
        ]
    )
