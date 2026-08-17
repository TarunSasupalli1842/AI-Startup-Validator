import random
from typing import Dict, Any
from models.validation import (
    ValidationReportResponse, StartupSummary, ExtractedIdea,
    MarketResearchData, MarketOpportunityData, CustomerSegmentationData, CustomerSegmentPersona,
    CompetitorAnalysisData, CompetitorEntry, ComparisonData, MatrixComparisonRow,
    SwotAnalysis, RiskAnalysisData, RiskItem,
    MvpRecommendationData, MvpFeatureItem,
    GtmStrategyData, GtmChannel, GtmLaunchPhase,
    ValidationScores
)

def _clean_str(text: str, max_words: int = 12) -> str:
    """Helper to get a clean, short sentence snippet without cutting off mid-word."""
    words = text.strip().split()
    if len(words) <= max_words:
        return text.strip()
    return " ".join(words[:max_words]) + "..."

def generate_mock_report(name: str, problem: str, solution: str, target_audience: str, industry: str, revenue_model: str, additional_notes: str = "") -> ValidationReportResponse:
    startup_name = name.strip() or "VentureX"
    prob = problem.strip() or "Manual operational inefficiencies in key workflows."
    sol = solution.strip() or "Automated AI-driven platform for streamlined operations."
    audience = target_audience.strip() or "Target Business Users"
    ind = industry.strip() or "Technology"
    rev = revenue_model.strip() or "Subscription SaaS"
    
    seed_val = len(startup_name) + len(prob) + len(sol)
    random.seed(seed_val)
    
    prob_clarity = min(98, max(70, 78 + (seed_val % 18)))
    sol_strength = min(98, max(68, 74 + ((seed_val * 3) % 22)))
    market_potential = min(98, max(65, 72 + ((seed_val * 7) % 24)))
    comp_risk = min(98, max(60, 70 + ((seed_val * 11) % 25)))
    feasibility = min(98, max(70, 76 + ((seed_val * 13) % 20)))
    innovation = min(98, max(68, 75 + ((seed_val * 17) % 21)))
    
    overall_score = int((prob_clarity * 0.15) + (sol_strength * 0.20) + (market_potential * 0.25) + (comp_risk * 0.10) + (feasibility * 0.15) + (innovation * 0.15))
    
    if overall_score >= 82:
        verdict = f"High Viability — Strong problem-solution fit addressing real pain points in {ind}."
    elif overall_score >= 72:
        verdict = f"Moderate Viability — Viable concept with clear demand; focus on differentiation and GTM execution."
    else:
        verdict = f"Feasible with Risks — Valid market need; validate customer willingness to pay early."

    ind_keyword = ind.split()[0] if ind else "Market"
    comp_1_name = f"Legacy {ind_keyword} Systems"
    comp_2_name = f"Generic {ind_keyword} Tool"
    
    competitors_list = [
        CompetitorEntry(
            name=comp_1_name,
            description=f"Traditional incumbent offering legacy solutions for {ind_keyword.lower()} operations.",
            strengths=["Established brand presence", "Existing enterprise user base", "Broad feature coverage"],
            weaknesses=["High licensing costs", "Complex manual setup", "Slow UI innovation"],
            comparison=f"Requires complex manual setup compared to {startup_name}'s streamlined automation.",
            competitive_advantage=f"Faster time-to-value, lower cost, and modern user-centric design."
        ),
        CompetitorEntry(
            name=comp_2_name,
            description=f"Basic single-purpose software catering to general {audience} needs.",
            strengths=["Low entry price", "Quick basic setup", "Lightweight interface"],
            weaknesses=["Limited scalability", "No intelligent automation", "Basic reporting"],
            comparison=f"Lacks deep workflow intelligence and specialized automation for {ind}.",
            competitive_advantage=f"End-to-end workflow automation tailored directly to {audience}."
        )
    ]
    
    market_opportunity = MarketOpportunityData(
        tam=f"${20 + (seed_val % 40)}.0B Global {ind_keyword} Market",
        sam=f"${3 + (seed_val % 8)}.5B Addressable Target Segment",
        som=f"${150 + (seed_val % 300)}M Realistic 3-Year Target",
        market_growth_rate=f"{11 + (seed_val % 9)}.2% CAGR (2024-2030)",
        market_drivers=[
            f"Accelerating digital adoption in the {ind} sector",
            f"Demand for self-service automated tools among {audience}",
            "Shift from complex legacy tools to intuitive cloud solutions"
        ],
        entry_barriers=[
            "Customer loyalty to existing legacy vendor relationships",
            "Stringent data security and compliance expectations",
            "Customer acquisition cost in competitive digital channels"
        ],
        unit_economics_summary=f"Strong potential for 70%+ gross margins with scalable recurring revenue via {rev}.",
        estimated_cac=f"${35 + (seed_val % 25)} - ${75 + (seed_val % 35)}",
        estimated_ltv=f"${450 + (seed_val % 200)} - ${1200 + (seed_val % 350)}",
        pricing_power=f"High — clear value delivery directly solving customer pain points."
    )
    
    customer_segmentation = CustomerSegmentationData(
        primary_segment=CustomerSegmentPersona(
            persona_name=f"Primary {ind_keyword} Decision Makers",
            target_profile=f"Key operators and decision-makers within {audience} seeking speed and efficiency.",
            key_pain_points=[
                f"Time lost to manual tasks and inefficient workflows",
                "High complexity of legacy software tools",
                "Lack of real-time automated assistance"
            ],
            willingness_to_pay="High ($49 - $149 / month)",
            acquisition_channels=[
                "Targeted Content & Search Engine Marketing",
                "Product-Led Growth (Freemium Sandbox)",
                "Niche Industry Communities & Social Proof"
            ],
            buying_triggers=[
                "Operational bottlenecks and process delays",
                "Frustration with manual errors in existing tools"
            ]
        ),
        secondary_segments=[
            CustomerSegmentPersona(
                persona_name="Growing Mid-Market Teams",
                target_profile=f"Department leads requiring standardized, scalable solutions in {ind}.",
                key_pain_points=[
                    "Fragmented team reporting and lack of central visibility",
                    "Difficulty scaling manual processes across team members"
                ],
                willingness_to_pay="Very High ($199 - $499 / month)",
                acquisition_channels=[
                    "Direct Outbound Outreach & Demos",
                    "Industry Partner Networks & Integrations"
                ],
                buying_triggers=[
                    "Team growth and expanding operational workload"
                ]
            ),
            CustomerSegmentPersona(
                persona_name="Independent Specialists & Solo Operators",
                target_profile="Individual professionals needing affordable, instant setup.",
                key_pain_points=[
                    "Constrained software budgets",
                    "Need instant self-service without sales calls"
                ],
                willingness_to_pay="Moderate ($19 - $39 / month)",
                acquisition_channels=[
                    "Social Video Marketing & Educational Content",
                    "Word of Mouth & Direct Referrals"
                ],
                buying_triggers=[
                    "Urgent task demands or client deadlines"
                ]
            )
        ],
        segmentation_strategy=f"Acquire high-intent users in {audience} via product-led freemium, then expand into team collaboration tiers."
    )
    
    comparison = ComparisonData(
        competitor_names=[comp_1_name, comp_2_name],
        comparison_matrix=[
            MatrixComparisonRow(
                dimension="Pricing & Value",
                our_startup=f"Transparent, flexible {rev}",
                primary_competitor="High enterprise contract costs",
                secondary_competitor="Rigid feature tier caps",
                our_advantage="Pay-as-you-grow flexibility with zero hidden fees"
            ),
            MatrixComparisonRow(
                dimension="Automation & Speed",
                our_startup="Native automated workflow engine",
                primary_competitor="Manual input with legacy triggers",
                secondary_competitor="Basic single-prompt plugin",
                our_advantage="End-to-end task automation"
            ),
            MatrixComparisonRow(
                dimension="Time-to-Value",
                our_startup="Instant execution & rapid setup",
                primary_competitor="Multi-week consulting setup",
                secondary_competitor="Manual template configuration",
                our_advantage="Zero-friction setup with immediate output"
            ),
            MatrixComparisonRow(
                dimension="User Experience",
                our_startup="Modern, intuitive single-screen UI",
                primary_competitor="Cluttered legacy interface",
                secondary_competitor="Basic form layout",
                our_advantage="Clean workspace with clear actionable insights"
            ),
            MatrixComparisonRow(
                dimension="Domain Specialization",
                our_startup=f"Built specifically for {audience}",
                primary_competitor="Generic enterprise tool",
                secondary_competitor="Narrow feature set",
                our_advantage=f"Tailored to {ind} domain workflows"
            )
        ],
        positioning_summary=f"{startup_name} combines modern automation with simplicity, delivering high-impact results for {audience} without enterprise complexity."
    )

    risk_analysis = RiskAnalysisData(
        overall_risk_level="Moderate",
        risk_summary=f"{startup_name} carries strong upside potential in {ind} with manageable early-stage risks around customer education and competitive defensibility.",
        risks=[
            RiskItem(
                category="Market Risk",
                risk=f"Customer habit inertia as {audience} continue using traditional manual tools.",
                probability="Medium",
                impact="High",
                severity="High",
                mitigation="Offer zero-friction sandbox trial showing measurable ROI in under 2 minutes."
            ),
            RiskItem(
                category="Competitor Risk",
                risk=f"Incumbents in {ind} adding automated capabilities to existing suites.",
                probability="High",
                impact="Medium",
                severity="High",
                mitigation="Focus on vertical UX differentiation and build sticky workflow data integrations."
            ),
            RiskItem(
                category="Financial Risk",
                risk="Customer acquisition costs rising during paid ad scale.",
                probability="Medium",
                impact="High",
                severity="Medium",
                mitigation="Rely on product-led viral loops, search engine authority, and upfront annual plan discounts."
            ),
            RiskItem(
                category="Technical Risk",
                risk="External API response latency impacting real-time user experiences.",
                probability="Medium",
                impact="Medium",
                severity="Medium",
                mitigation="Implement multi-layer Redis caching, streaming responses, and redundant model fallbacks."
            ),
            RiskItem(
                category="Operational Risk",
                risk="Founder bandwidth constraints balancing product development with sales and support.",
                probability="Low",
                impact="Medium",
                severity="Low",
                mitigation="Standardize user onboarding documentation and create automated self-service tutorials."
            ),
            RiskItem(
                category="Customer Risk",
                risk="Churn caused by users failing to integrate the product into regular weekly routines.",
                probability="Medium",
                impact="High",
                severity="Medium",
                mitigation="Send automated weekly digest reports and proactive workflow prompt notifications."
            )
        ],
        key_mitigation_priorities=[
            f"1. Ship interactive sandbox demo to eliminate onboarding friction for {audience}.",
            "2. Implement robust API caching to ensure high availability and sub-second response times.",
            "3. Secure 15 design partner commitments before full public launch.",
            "4. Build custom export integrations to lock in workflow defensibility."
        ]
    )

    mvp_recommendation = MvpRecommendationData(
        mvp_summary=f"Deliver the single most critical workflow automation for {audience} with a lean, blazing-fast product interface.",
        target_timeline_weeks="4-6 Weeks",
        development_approach="Single-page responsive React web application backed by modular FastAPI async endpoints.",
        must_have=[
            MvpFeatureItem(
                feature_name="Core Automated Engine",
                description=f"Primary automation system that executes {sol[:50]}.",
                rationale="Delivers the foundational value proposition and validates customer utility.",
                complexity="Medium",
                priority="MUST HAVE"
            ),
            MvpFeatureItem(
                feature_name="One-Click Guided Workflow",
                description=f"Streamlined form interface allowing {audience} to get instant results.",
                rationale="Minimizes onboarding drop-off and demonstrates instant time-to-value.",
                complexity="Low",
                priority="MUST HAVE"
            ),
            MvpFeatureItem(
                feature_name="Structured Results & Export",
                description="Interactive dashboard with PDF and clipboard export capabilities.",
                rationale="Allows users to immediately utilize and share generated outputs.",
                complexity="Low",
                priority="MUST HAVE"
            )
        ],
        should_have=[
            MvpFeatureItem(
                feature_name="User Accounts & History Log",
                description="Save, reload, and review past analysis and project sessions.",
                rationale="Increases multi-session retention and customer stickiness.",
                complexity="Medium",
                priority="SHOULD HAVE"
            ),
            MvpFeatureItem(
                feature_name="Custom Workflow Presets",
                description=f"Pre-configured templates tailored to specific {ind} scenarios.",
                rationale="Accelerates output quality for diverse customer sub-segments.",
                complexity="Medium",
                priority="SHOULD HAVE"
            )
        ],
        could_have=[
            MvpFeatureItem(
                feature_name="Interactive Team Workspace",
                description="Invite team members to comment on and review outputs collaboratively.",
                rationale="Expands single-user utility into B2B team licensing.",
                complexity="High",
                priority="COULD HAVE"
            ),
            MvpFeatureItem(
                feature_name="Third-party Webhook Integration",
                description="Push output notifications directly to Slack, Notion, or Email.",
                rationale="Increases workflow embeddability across enterprise toolsets.",
                complexity="Medium",
                priority="COULD HAVE"
            )
        ],
        wont_have=[
            MvpFeatureItem(
                feature_name="Native Mobile Applications (iOS/Android)",
                description="Dedicated native apps on app stores.",
                rationale="High build & review overhead; mobile web responsive view is sufficient for validation.",
                complexity="High",
                priority="WON'T HAVE"
            ),
            MvpFeatureItem(
                feature_name="Custom On-Premise Enterprise Deployment",
                description="Private cloud infrastructure installations.",
                rationale="Too early in lifecycle; introduces complex sales cycles before product-market fit.",
                complexity="High",
                priority="WON'T HAVE"
            )
        ]
    )

    gtm_strategy = GtmStrategyData(
        positioning_statement=f"For {audience} struggling with manual workflows, {startup_name} is the {ind} platform that provides automated clarity, unlike legacy alternatives.",
        target_customers=[
            f"Early adopter operators within {audience} seeking speed and efficiency",
            f"Boutique teams and mid-sized departments managing multiple {ind} workflows",
            "Independent professionals needing instant self-service automation"
        ],
        acquisition_channels=[
            GtmChannel(
                channel_name="Product-Led Organic Search & Guides",
                description=f"Publish high-intent workflow guides and solution teardowns targeting {ind} keywords.",
                expected_cac="Low ($10 - $25)",
                conversion_strategy="Interactive free sandbox requiring zero signup to test."
            ),
            GtmChannel(
                channel_name="Targeted Community & Social Seeding",
                description=f"Engage in niche Subreddits, Discord groups, and LinkedIn circles for {audience}.",
                expected_cac="Near Zero (Founder Time)",
                conversion_strategy="Share actionable case studies and invite members to exclusive beta access."
            ),
            GtmChannel(
                channel_name="High-Intent Search & Retargeting Ads",
                description="Target competitor brand search terms and high-intent industry queries.",
                expected_cac="Moderate ($45 - $80)",
                conversion_strategy="Direct landing page offering free trial with instant value demonstration."
            )
        ],
        launch_strategy=[
            GtmLaunchPhase(
                phase_name="Phase 1: Pre-Launch Validation & Waitlist",
                timeline="Weeks 1-4",
                key_activities=[
                    "Publish interactive landing page with core value proposition and demo preview.",
                    f"Conduct 20 user interviews with {audience} to refine messaging.",
                    "Build an initial waitlist of 150+ verified early adopters."
                ],
                goals="Validate problem-solution fit and secure 25 active alpha commitments."
            ),
            GtmLaunchPhase(
                phase_name="Phase 2: Closed Beta & Iteration Loop",
                timeline="Weeks 5-8",
                key_activities=[
                    "Deploy MVP core functionality to waitlist cohort in weekly batches.",
                    "Implement in-app feedback widgets and monitor user drop-off points.",
                    "Gather 10 detailed video testimonials and quantifiable case studies."
                ],
                goals="Achieve 40%+ weekly active retention and zero critical bugs."
            ),
            GtmLaunchPhase(
                phase_name="Phase 3: Public Launch & Scaled Growth",
                timeline="Weeks 9-16",
                key_activities=[
                    "Launch publicly on Product Hunt, Hacker News, and industry directories.",
                    "Activate paid search campaigns and integration partnerships.",
                    "Roll out self-service paid tiers with introductory annual discount incentives."
                ],
                goals="Reach first $5,000 Monthly Recurring Revenue with under 90-day payback."
            )
        ],
        pricing_strategy=f"Value-aligned subscription featuring a generous free tier to foster virality, converting power users through workflow caps and team collaboration tiers.",
        pricing_tiers=[
            "Starter (Free): 5 free monthly evaluations and basic reporting.",
            "Professional ($39/month): Unlimited evaluations, advanced export options, and custom presets.",
            "Team / Organization ($149/month): 5 seats, collaborative workspaces, and priority API access."
        ],
        key_kpis=[
            "Trial-to-Paid Conversion Rate > 6.5%",
            "Visitor-to-Signup Landing Page Rate > 18%",
            "CAC to LTV Ratio > 3.5x",
            "Monthly User Churn Rate < 3.5%"
        ],
        how_to_get_started=[
            "1. Set up a simple landing page showcasing the core value proposition and interactive demo.",
            "2. Outreach directly to 25 target prospective users on LinkedIn/Twitter for 15-minute feedback calls.",
            "3. Build and test the 3 Must-Have MVP features to validate customer satisfaction early.",
            "4. Launch closed beta access to initial interviewees and iterate based on their direct feedback.",
            "5. Prepare Product Hunt and community launch assets once 80%+ satisfaction is verified."
        ]
    )
    
    return ValidationReportResponse(
        summary=StartupSummary(
            high_level_description=f"{startup_name} solves key operational pain points in {ind} by providing {sol} specifically designed for {audience}.",
            target_market_summary=f"Serves {audience} in the growing {ind} market with strong demand for automated solutions.",
            feasibility_verdict=verdict
        ),
        extracted_idea=ExtractedIdea(
            startup_name=startup_name,
            core_problem=prob,
            core_solution=sol,
            target_audience=audience,
            industry=ind,
            revenue_model=rev,
            value_proposition=f"Delivers frictionless, automated results to eliminate operational friction for {audience}."
        ),
        market_research=MarketResearchData(
            demand_analysis=f"Strong market demand in {ind} as {audience} actively seek modern automation tools over manual legacy processes.",
            industry_trends=[
                f"Rapid adoption of automated workflows across {ind}",
                f"Shift toward intuitive cloud tools for {audience}",
                "Growing focus on operational speed and cost reduction",
                "High customer demand for transparent subscription pricing"
            ],
            opportunities=[
                f"Capturing underserved {audience} frustrated by complex tools",
                f"Expanding core solution across complementary {ind} workflows",
                "Offering value-add analytics and team features",
                "Building integrations into popular ecosystem platforms"
            ],
            customer_pain_points=[
                "High cost and complexity of legacy alternatives",
                "Inflexible tools requiring manual workarounds",
                "Fragmented software requiring constant manual switching",
                "Slow onboarding and long setup delays"
            ],
            sources=[
                f"https://statista.com/topics/{ind_keyword.lower()}",
                f"https://trends.google.com/explore?q={ind_keyword.lower()}+software"
            ]
        ),
        market_opportunity=market_opportunity,
        customer_segmentation=customer_segmentation,
        competitor_analysis=CompetitorAnalysisData(
            competitors=competitors_list,
            unique_moat=f"Specialized workflow automation for {audience} combined with frictionless onboarding that legacy incumbents cannot easily copy."
        ),
        comparison=comparison,
        swot_analysis=SwotAnalysis(
            strengths=[
                f"Directly solves core user pain point in {ind}",
                f"Tailored specifically for {audience}",
                "Modern automated architecture delivering fast execution",
                f"Flexible {rev} model lowering customer barrier to entry"
            ],
            weaknesses=[
                "New brand entering an established market",
                "Initial feature set focused on core use cases",
                "Need for ongoing user feedback loop calibration",
                "Building early customer awareness and trust"
            ],
            opportunities=[
                f"First-mover advantage in automated solutions for {ind}",
                "Expanding into team and enterprise feature tiers",
                "Integrating with popular industry software tools",
                "Building a strong community of early advocates"
            ],
            threats=[
                "Incumbents adding automated features to existing suites",
                "Emergence of generic software wrappers",
                "Evolving security and compliance standards",
                "Shifts in customer acquisition costs"
            ]
        ),
        risk_analysis=risk_analysis,
        mvp_recommendation=mvp_recommendation,
        gtm_strategy=gtm_strategy,
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
            f"1. Build Lean MVP: Launch core automated solution focused on primary use case for {audience}.",
            "2. Conduct Beta Testing: Onboard 20-30 target users to gather immediate feedback and refine UX.",
            f"3. Validate Pricing: Test initial willingness to pay under the proposed {rev} model.",
            "4. Strengthen Moat: Focus on proprietary workflow speed and seamless user onboarding.",
            f"5. Focus Acquisition: Build targeted organic content highlighting solution benefits for {audience}."
        ]
    )
