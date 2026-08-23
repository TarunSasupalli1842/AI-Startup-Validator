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

def generate_mock_report(name: str, problem: str, solution: str, target_audience: str, industry: str, revenue_model: str, additional_notes: str = "") -> ValidationReportResponse:
    startup_name = name.strip() or "VentureX"
    prob = problem.strip() or "Manual operational inefficiencies in key workflows."
    sol = solution.strip() or "Automated AI platform for streamlined operations."
    audience = target_audience.strip() or "Target Users"
    ind = industry.strip() or "Technology"
    rev = revenue_model.strip() or "Monthly Subscription"
    
    seed_val = len(startup_name) + len(prob) + len(sol)
    random.seed(seed_val)
    
    prob_clarity = min(98, max(70, 80 + (seed_val % 15)))
    sol_strength = min(98, max(68, 76 + ((seed_val * 3) % 18)))
    market_potential = min(98, max(65, 75 + ((seed_val * 7) % 20)))
    comp_risk = min(98, max(60, 72 + ((seed_val * 11) % 20)))
    feasibility = min(98, max(70, 78 + ((seed_val * 13) % 18)))
    innovation = min(98, max(68, 76 + ((seed_val * 17) % 18)))
    
    overall_score = int((prob_clarity * 0.15) + (sol_strength * 0.20) + (market_potential * 0.25) + (comp_risk * 0.10) + (feasibility * 0.15) + (innovation * 0.15))
    
    if overall_score >= 82:
        verdict = f"High Viability — Strong demand from {audience} in {ind}."
    elif overall_score >= 72:
        verdict = f"Moderate Viability — Good concept; focus on fast execution."
    else:
        verdict = f"Feasible with Risks — Validate customer willingness to pay early."

    ind_keyword = ind.split()[0] if ind else "Market"
    comp_1_name = f"Legacy {ind_keyword} Tool"
    comp_2_name = f"Basic {ind_keyword} App"
    
    competitors_list = [
        CompetitorEntry(
            name=comp_1_name,
            description=f"Traditional software for {ind_keyword.lower()} operations.",
            strengths=["Established brand", "Large user base"],
            weaknesses=["High cost", "Slow manual setup"],
            comparison=f"Requires complex setup compared to {startup_name}'s instant app.",
            competitive_advantage="Faster setup, lower cost, and cleaner design."
        ),
        CompetitorEntry(
            name=comp_2_name,
            description="Simple basic tool with limited features.",
            strengths=["Low entry price", "Simple layout"],
            weaknesses=["No smart automation", "Basic reporting"],
            comparison=f"Lacks intelligent automation tailored to {audience}.",
            competitive_advantage="Automated end-to-end tasks in 1 click."
        )
    ]
    
    market_opportunity = MarketOpportunityData(
        tam=f"₹{150 + (seed_val % 250)},000 Cr Global {ind_keyword} Market",
        sam=f"₹{25 + (seed_val % 50)},000 Cr Target Market",
        som=f"₹{1200 + (seed_val % 2500)} Cr 3-Year Goal",
        market_growth_rate=f"{12 + (seed_val % 8)}.5% CAGR",
        market_drivers=[
            f"Growing digital adoption in {ind}",
            "Users want fast automated tools",
            "Move away from complex systems"
        ],
        entry_barriers=[
            "Loyalty to existing tools",
            "Data security expectations",
            "Rising online ad costs"
        ],
        unit_economics_summary=f"Strong 70%+ margins with simple recurring revenue via {rev} in ₹.",
        estimated_cac=f"₹{2500 + (seed_val % 2000):,} - ₹{5500 + (seed_val % 2000):,}",
        estimated_ltv=f"₹{35000 + (seed_val % 15000):,} - ₹{90000 + (seed_val % 25000):,}",
        pricing_power="High — saves hours of manual work."
    )
    
    customer_segmentation = CustomerSegmentationData(
        primary_segment=CustomerSegmentPersona(
            persona_name=f"Primary {audience}",
            target_profile=f"Teams and professionals needing fast daily workflow automation in {ind}.",
            key_pain_points=[
                "Wasting hours on manual tasks",
                "Existing software is too complicated"
            ],
            willingness_to_pay="High (₹2,999 - ₹7,999 / month)",
            acquisition_channels=[
                "Google Search & Guides",
                "Free Interactive Trial",
                "Industry Groups"
            ],
            buying_triggers=[
                "Heavy workload spikes",
                "Frequent manual errors"
            ]
        ),
        secondary_segments=[
            CustomerSegmentPersona(
                persona_name="Growing Teams",
                target_profile=f"Managers scaling operations across {ind} projects.",
                key_pain_points=[
                    "Fragmented team reporting"
                ],
                willingness_to_pay="Very High (₹12,999 - ₹29,999 / month)",
                acquisition_channels=[
                    "Direct Demos & Referrals"
                ],
                buying_triggers=[
                    "Team expansion"
                ]
            ),
            CustomerSegmentPersona(
                persona_name="Solo Operators",
                target_profile="Individuals wanting fast self-service tools.",
                key_pain_points=[
                    "Tight software budgets"
                ],
                willingness_to_pay="Moderate (₹1,499 - ₹2,999 / month)",
                acquisition_channels=[
                    "Social Video & Word of Mouth"
                ],
                buying_triggers=[
                    "Urgent project deadlines"
                ]
            )
        ],
        segmentation_strategy=f"Acquire {audience} via free interactive trial, then expand into paid team tiers."
    )
    
    comparison = ComparisonData(
        competitor_names=[comp_1_name, comp_2_name],
        comparison_matrix=[
            MatrixComparisonRow(
                dimension="Pricing",
                our_startup="Affordable monthly plan",
                primary_competitor="Expensive contracts",
                secondary_competitor="High per-user fees",
                our_advantage="Lower entry cost"
            ),
            MatrixComparisonRow(
                dimension="Ease of Use",
                our_startup="Instant 1-click setup",
                primary_competitor="Weeks of onboarding",
                secondary_competitor="Manual setup needed",
                our_advantage="Zero learning curve"
            ),
            MatrixComparisonRow(
                dimension="Speed & Automation",
                our_startup="Automated AI workflows",
                primary_competitor="Manual data entry",
                secondary_competitor="Basic templates only",
                our_advantage="Saves 10+ hours weekly"
            ),
            MatrixComparisonRow(
                dimension="Target Fit",
                our_startup=f"Built for {audience}",
                primary_competitor="Generic enterprise tool",
                secondary_competitor="Limited flexibility",
                our_advantage="Matches exact user needs"
            ),
            MatrixComparisonRow(
                dimension="Support",
                our_startup="Fast 24/7 self-service",
                primary_competitor="Slow email tickets",
                secondary_competitor="Community forum only",
                our_advantage="Instant AI guidance"
            )
        ],
        positioning_summary=f"Simple, automated, and built specifically for {audience} without complexity."
    )

    risk_analysis = RiskAnalysisData(
        overall_risk_level="Moderate",
        risk_summary=f"Manageable early risks around user awareness and market timing in {ind}.",
        risks=[
            RiskItem(
                category="Market Risk",
                risk=f"Users slow to change manual habits in {ind}.",
                probability="Medium",
                impact="High",
                severity="Medium",
                mitigation="Offer free instant demo trial."
            ),
            RiskItem(
                category="Competitor Risk",
                risk="Old tools adding simple automation.",
                probability="High",
                impact="Medium",
                severity="High",
                mitigation="Focus on speed and simpler UX."
            ),
            RiskItem(
                category="Financial Risk",
                risk="Higher cost to acquire early users.",
                probability="Low",
                impact="High",
                severity="Medium",
                mitigation="Focus on organic search and referrals."
            ),
            RiskItem(
                category="Technical Risk",
                risk="External API response latency.",
                probability="Medium",
                impact="Medium",
                severity="Medium",
                mitigation="Add smart caching and fallbacks."
            ),
            RiskItem(
                category="Operational Risk",
                risk="Small team handling multiple roles.",
                probability="Low",
                impact="Medium",
                severity="Low",
                mitigation="Use automated user guides."
            ),
            RiskItem(
                category="Customer Risk",
                risk="Users not adopting tool into routine.",
                probability="Medium",
                impact="High",
                severity="Medium",
                mitigation="Send weekly summary notifications."
            )
        ],
        key_mitigation_priorities=[
            "1. Launch free 1-click demo sandbox.",
            "2. Interview 20 early users for feedback.",
            "3. Add smart caching for instant speed.",
            "4. Focus on organic referral loops."
        ]
    )

    mvp_recommendation = MvpRecommendationData(
        mvp_summary=f"Launch a clean, fast app that solves the core problem for {audience} in 1 click.",
        target_timeline_weeks="4-6 Weeks",
        development_approach="Fast, simple web app to test the core user loop.",
        must_have=[
            MvpFeatureItem(
                feature_name="Core Automation Engine",
                description="Automates the primary workflow in 1 click.",
                rationale="Delivers the main value proposition.",
                complexity="Medium",
                priority="MUST HAVE"
            ),
            MvpFeatureItem(
                feature_name="Simple 1-Page Form",
                description="Easy input form for instant results.",
                rationale="Zero learning curve for users.",
                complexity="Low",
                priority="MUST HAVE"
            ),
            MvpFeatureItem(
                feature_name="Export & Share Results",
                description="Download PDF and copy report instantly.",
                rationale="Lets users share results immediately.",
                complexity="Low",
                priority="MUST HAVE"
            )
        ],
        should_have=[
            MvpFeatureItem(
                feature_name="User Accounts & History",
                description="Save and reload past evaluations.",
                rationale="Brings users back weekly.",
                complexity="Medium",
                priority="SHOULD HAVE"
            ),
            MvpFeatureItem(
                feature_name="Custom Presets",
                description="Ready-made templates for common tasks.",
                rationale="Saves users extra time.",
                complexity="Low",
                priority="SHOULD HAVE"
            )
        ],
        could_have=[
            MvpFeatureItem(
                feature_name="Team Collaboration",
                description="Share and review team projects.",
                rationale="Helps sell team plans.",
                complexity="Medium",
                priority="COULD HAVE"
            ),
            MvpFeatureItem(
                feature_name="Slack & Email Alerts",
                description="Send results straight to team chat.",
                rationale="Keeps users updated.",
                complexity="Low",
                priority="COULD HAVE"
            )
        ],
        wont_have=[
            MvpFeatureItem(
                feature_name="Native Mobile App",
                description="Dedicated iOS/Android app store builds.",
                rationale="Mobile web is enough for MVP.",
                complexity="High",
                priority="WON'T HAVE"
            ),
            MvpFeatureItem(
                feature_name="Custom Enterprise Hosting",
                description="Private server installations.",
                rationale="Too early before market fit.",
                complexity="High",
                priority="WON'T HAVE"
            )
        ]
    )

    gtm_strategy = GtmStrategyData(
        positioning_statement=f"For {audience}, {startup_name} is the simplest {ind} app that automates workflows.",
        target_customers=[
            f"Early adopters among {audience}",
            f"Small teams managing {ind} tasks",
            "Solo professionals needing speed"
        ],
        acquisition_channels=[
            GtmChannel(
                channel_name="Google Search & Helpful Guides",
                description=f"Publish simple guides on solving {ind} problems.",
                expected_cac="Low (₹500 - ₹1,500)",
                conversion_strategy="Free interactive demo trial."
            ),
            GtmChannel(
                channel_name="Direct Community Sharing",
                description=f"Share useful case studies in {audience} groups.",
                expected_cac="Organic (₹0 - ₹500)",
                conversion_strategy="Free beta invites."
            ),
            GtmChannel(
                channel_name="Targeted Search Ads",
                description="Target users searching for competitor alternatives.",
                expected_cac="Moderate (₹2,500 - ₹5,000)",
                conversion_strategy="Direct signup to free plan."
            )
        ],
        launch_strategy=[
            GtmLaunchPhase(
                phase_name="Phase 1: Waitlist & Feedback",
                timeline="Weeks 1-4",
                key_activities=[
                    "Build simple 1-page landing page",
                    "Talk to 20 target users",
                    "Get first 100 waitlist signups"
                ],
                goals="Validate core problem with 20 users."
            ),
            GtmLaunchPhase(
                phase_name="Phase 2: Closed Beta",
                timeline="Weeks 5-8",
                key_activities=[
                    "Invite waitlist to test app",
                    "Fix bugs and make it faster",
                    "Collect 5 positive reviews"
                ],
                goals="Reach 40%+ weekly active retention."
            ),
            GtmLaunchPhase(
                phase_name="Phase 3: Public Launch",
                timeline="Weeks 9-16",
                key_activities=[
                    "Launch on Product Hunt and forums",
                    "Start search marketing",
                    "Introduce discounted yearly plan"
                ],
                goals="Reach first ₹4,00,000 monthly revenue."
            )
        ],
        pricing_strategy="Simple free tier converting active users to a monthly paid plan.",
        pricing_tiers=[
            "Starter (Free): Basic features with monthly limits.",
            "Pro (₹2,499/mo): Unlimited workflows and fast support.",
            "Team (₹9,999/mo): Multi-user access and priority speed."
        ],
        key_kpis=[
            "Signup conversion rate > 15%",
            "Paid upgrade rate > 5%",
            "Monthly churn < 3%",
            "CAC payback under 60 days"
        ],
        how_to_get_started=[
            "1. Build a simple 1-page website.",
            "2. Message 20 target users for feedback.",
            "3. Build the 3 Must-Have core features.",
            "4. Launch closed beta to waitlist.",
            "5. Share launch on Product Hunt."
        ]
    )
    
    return ValidationReportResponse(
        summary=StartupSummary(
            high_level_description=f"{startup_name} automates {ind} workflows for {audience}.",
            target_market_summary=f"Serves {audience} seeking faster, automated {ind} tools.",
            feasibility_verdict=verdict
        ),
        extracted_idea=ExtractedIdea(
            startup_name=startup_name,
            core_problem=prob,
            core_solution=sol,
            target_audience=audience,
            industry=ind,
            revenue_model=rev,
            value_proposition=f"Simple, automated platform for {audience}."
        ),
        market_research=MarketResearchData(
            demand_analysis=f"High customer demand for simple, automated tools in {ind}.",
            industry_trends=[
                f"Rapid automation across {ind}",
                f"Shift to self-service cloud tools",
                "Focus on faster work speed",
                "Demand for transparent pricing"
            ],
            opportunities=[
                f"Target underserved {audience}",
                f"Add smart time-saving features",
                "Simple integrations with top tools",
                "Build active user community"
            ],
            customer_pain_points=[
                "High cost of old software",
                "Too many manual steps",
                "Slow and confusing tools",
                "Long setup time"
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
            unique_moat=f"Faster 1-click workflows tailored to {audience}."
        ),
        comparison=comparison,
        swot_analysis=SwotAnalysis(
            strengths=[
                f"Solves real daily friction in {ind}",
                f"Built specifically for {audience}",
                "Instant 1-click setup",
                f"Affordable {rev} in ₹"
            ],
            weaknesses=[
                "New brand entering market",
                "Initial small feature set",
                "Needs early user trust",
                "Early testing in progress"
            ],
            opportunities=[
                f"Untapped market of {audience}",
                "Add helpful team features",
                "Partner with existing tools",
                "Build loyal early community"
            ],
            threats=[
                "Old tools copying features",
                "Cheap simple clone apps",
                "Shifts in user search habits",
                "Rising online ad costs"
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
            "1. Build simple prototype for core feature.",
            "2. Interview 15 target users for feedback.",
            "3. Offer beta access to test pricing.",
            "4. Automate manual steps to save user time.",
            "5. Share free demo in niche communities."
        ]
    )
