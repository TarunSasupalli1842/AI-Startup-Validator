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
    
    prob_clarity = min(98, max(70, 82 + (seed_val % 14)))
    sol_strength = min(98, max(68, 78 + ((seed_val * 3) % 16)))
    market_potential = min(98, max(65, 80 + ((seed_val * 7) % 16)))
    comp_risk = min(98, max(60, 72 + ((seed_val * 11) % 18)))
    feasibility = min(98, max(70, 80 + ((seed_val * 13) % 16)))
    innovation = min(98, max(68, 78 + ((seed_val * 17) % 16)))
    
    overall_score = int((prob_clarity * 0.15) + (sol_strength * 0.20) + (market_potential * 0.25) + (comp_risk * 0.10) + (feasibility * 0.15) + (innovation * 0.15))
    
    if overall_score >= 82:
        verdict = f"High Viability — Strong market demand from {audience} in {ind}."
    elif overall_score >= 72:
        verdict = f"Moderate Viability — Validated concept; focus on swift execution."
    else:
        verdict = f"Feasible with Execution Risks — Pre-sell to confirm customer budget."

    text_corpus = f"{startup_name} {ind} {prob} {sol} {audience}".lower()

    # Multi-Industry Domain Intelligence Profiles
    if any(k in text_corpus for k in ["hotel", "hospitality", "resort", "guest", "booking", "concierge"]):
        # Hospitality / HotelHive
        comp_1_name = "Cloudbeds & Opera PMS"
        comp_2_name = "Little Hotelier & SiteMinder"
        comp_1_desc = "Legacy property management systems with complex legacy interfaces."
        comp_2_desc = "Standard channel manager focused on OTA distribution."
        moat_text = f"Direct 24/7 WhatsApp AI concierge and 0% commission direct booking flows tailored for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="WhatsApp 24/7 AI Guest Concierge", description="Handles guest requests, FAQs, and contactless check-ins automatically via WhatsApp.", rationale="Solves 24/7 front-desk overload and provides instant response.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Direct Commission-Free Booking Engine", description="Seamless mobile booking flow with instant payments to bypass 15-25% OTA fees.", rationale="Directly increases net hotel margins.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="PMS Integration & Room Sync", description="Real-time two-way synchronization with major hotel PMS systems.", rationale="Eliminates double bookings and operational overhead.", complexity="High", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Direct Outreach to Boutique Hotel Owners", description="Personalized video teardowns auditing lost direct bookings and OTA commission leaks.", expected_cac="Moderate (₹3,500 - ₹6,000)", conversion_strategy="Free 30-day pilot with direct PMS integration."),
            GtmChannel(channel_name="PMS App Marketplace Listings", description="Listings on Cloudbeds, Mews, and Opera app stores as a certified guest operations plugin.", expected_cac="Low (₹1,500 - ₹3,000)", conversion_strategy="1-click app install with pre-configured templates."),
            GtmChannel(channel_name="Hospitality Associations & Conferences", description="Partner with regional boutique hotel associations and showcase live WhatsApp guest flows.", expected_cac="Organic (₹0 - ₹2,000)", conversion_strategy="Free hotel audit report and revenue recovery calculator.")
        ]
        pricing_tiers_list = [
            "Boutique Starter: ₹7,999/month (Up to 25 rooms)",
            "Resort Pro: ₹19,999/month (Up to 75 rooms + 1% direct booking fee)",
            "Multi-Property Enterprise: ₹39,999/month (Unlimited rooms & custom integrations)"
        ]

    elif any(k in text_corpus for k in ["study", "edtech", "student", "exam", "flashcard", "lecture", "quiz", "school", "course", "learn"]):
        # EdTech / Education
        comp_1_name = "Quizlet & Anki"
        comp_2_name = "Chegg Study & CourseHero"
        comp_1_desc = "Manual flashcard platforms requiring hours of tedious card creation."
        comp_2_desc = "Subscription homework and textbook solution repositories with high pricing."
        moat_text = f"Automated lecture audio and PDF parsing into spaced-repetition active recall test decks for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Lecture Audio & PDF-to-Flashcard AI Generator", description="Upload lecture audio or slide PDFs to automatically extract high-yield smart flashcards.", rationale="Saves students 5+ hours of manual study prep per exam.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Spaced-Repetition Active Recall Quizzing", description="Adaptive practice quiz engine that schedules reviews based on memory retention curves.", rationale="Maximizes test score improvements and student retention.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Offline Sync & Collaborative Study Decks", description="Mobile-optimized flashcard sync with 1-click sharing to study groups.", rationale="Drives organic viral peer-to-peer student growth.", complexity="Low", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Campus Ambassador & Student Discord Hubs", description="Recruit student ambassadors at major universities to seed course study decks in course Discords.", expected_cac="Organic (₹0 - ₹200)", conversion_strategy="Free Pro tier for course deck creators."),
            GtmChannel(channel_name="Short-Form Study Reels (TikTok & Instagram)", description="Viral 15-second before/after clips showing instant slide-to-quiz generation.", expected_cac="Low (₹150 - ₹500)", conversion_strategy="Free trial with 3 free course uploads."),
            GtmChannel(channel_name="University Course Exam SEO", description="Publish automated study guides and practice flashcard decks for top college courses.", expected_cac="Low (₹200 - ₹600)", conversion_strategy="Instant quiz sandbox without login.")
        ]
        pricing_tiers_list = [
            "Free Student: ₹0/month (3 course uploads & basic flashcards)",
            "StudyFlow Pro: ₹499/month or ₹3,999/year (Unlimited uploads, AI mock exams & audio ingestion)",
            "Campus Study Group: ₹1,499/semester (Up to 5 student accounts)"
        ]

    elif any(k in text_corpus for k in ["food", "plate", "meal", "recipe", "grocery", "fridge", "waste", "cooking", "restaurant"]):
        # FoodTech / Food & Grocery
        comp_1_name = "Mealime & Paprika"
        comp_2_name = "MyFitnessPal & Yummly"
        comp_1_desc = "Standard recipe libraries requiring manual grocery planning and ingredient entry."
        comp_2_desc = "Calorie tracking databases focused on fitness rather than food waste reduction."
        moat_text = f"Smart fridge ingredient scanner with dynamic zero-waste recipe matching and 1-click grocery replenishment for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Fridge Ingredient Scanner & AI Recipe Matcher", description="Enter or scan on-hand fridge ingredients to instantly generate healthy, delicious recipes.", rationale="Stops annual grocery waste and answers 'what's for dinner'.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Smart Grocery List & Expiration Tracker", description="Automated shopping list builder that tracks item freshness and alerts before expiration.", rationale="Saves households ₹12,000+ annually on wasted groceries.", complexity="Low", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="1-Click Supermarket Cart Sync", description="Export missing recipe ingredients directly to grocery delivery partner carts (Zepto/Blinkit/Instacart).", rationale="Unlocks instant affiliate monetization per order.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Food & Meal-Prep Creator Partnerships", description="Partner with food influencers for 'Fridge Cleanout Challenge' videos using FreshPlate.", expected_cac="Low (₹200 - ₹600)", conversion_strategy="Free 14-day premium trial with custom meal plans."),
            GtmChannel(channel_name="Supermarket & Quick-Commerce Affiliate Integrations", description="In-app ingredient replenishment revenue sharing with local delivery platforms.", expected_cac="Organic (₹0 - ₹300)", conversion_strategy="₹100 discount coupon on first delivery order."),
            GtmChannel(channel_name="Zero-Waste & Budget Family Communities", description="Community guides and weekly meal plans shared in parenting and budget living forums.", expected_cac="Low (₹150 - ₹400)", conversion_strategy="Free printable weekly meal calendar.")
        ]
        pricing_tiers_list = [
            "Free Meal Planner: ₹0/month (Basic fridge recipes & manual shopping list)",
            "FreshPlate Premium: ₹299/month or ₹2,499/year (Unlimited AI recipes, nutrition tracking & auto-cart sync)",
            "Family Chef Plan: ₹599/month (Multi-diet profiles, allergen filters & pantry sync)"
        ]

    elif any(k in text_corpus for k in ["creator", "video", "audio", "youtube", "podcast", "dubbing", "influencer", "content creation", "social media"]):
        # Creator Economy & Media AI (checked before health/med)
        comp_1_name = "Descript & CapCut"
        comp_2_name = "ElevenLabs & Jasper"
        comp_1_desc = "General video editors without specialized multi-language viral distribution."
        comp_2_desc = "Standalone AI audio tools requiring separate workflow stitching."
        moat_text = f"End-to-end multilingual voice localization and automated viral short extraction for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="AI Video/Audio Transcription & Smart Editor", description="Edit video by editing text, removing filler words, and generating instant captions.", rationale="Cuts video post-production editing time by 75%.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Multilingual Voice Cloning & Auto-Dubbing", description="Dub long-form content into 15+ languages while preserving original speaker voice timbre.", rationale="Expands creator reach into global international markets.", complexity="High", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="1-Click Viral Shorts & Reel Clip Generator", description="Extracts top hook moments with auto-reframing and dynamic subtitles for TikTok/Reels.", rationale="Drives 10x content output across vertical video platforms.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Creator Discord & YouTube Communities", description="Partner with mid-tier YouTubers to show 10-minute workflow transformations.", expected_cac="Low (₹200 - ₹600)", conversion_strategy="Free 30 minutes of AI video processing."),
            GtmChannel(channel_name="Short-Form Feature Demos (TikTok/Reels)", description="Viral side-by-side clips demonstrating 1-click voice dubbing and auto-captions.", expected_cac="Low (₹150 - ₹450)", conversion_strategy="Free trial watermark-free on first export."),
            GtmChannel(channel_name="Creator Management Agency Partnerships", description="Bulk licensing for talent management agencies handling multiple creator channels.", expected_cac="Moderate (₹1,500 - ₹3,000)", conversion_strategy="Agency revenue share and volume discounts.")
        ]
        pricing_tiers_list = [
            "Creator Starter: ₹0/month (15 mins/mo video export & basic captions)",
            "Pro Creator: ₹799/month or ₹6,999/year (Unlimited exports, 4K render & 3-language dubbing)",
            "Studio Agency: ₹3,499/month (Multi-creator workspace, unlimited dubbing & priority GPU)"
        ]

    elif any(k in text_corpus for k in ["healthtech", "medicine", "medical", "doctor", "clinic", "patient", "dermatology", "pharma", "clinical", "hospital"]):
        # HealthTech / MedTech
        comp_1_name = "Practo & Epic EHR"
        comp_2_name = "Teladoc Health & Cerner"
        comp_1_desc = "Legacy medical record and appointment systems with slow physician workflow."
        comp_2_desc = "Standard telehealth tools with minimal automated clinical diagnostic support."
        moat_text = f"Specialized AI diagnostic screening and compliant triage workflows tailored for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="AI Clinical Diagnostic Screening Engine", description="Analyzes symptoms, images, and patient intake data in under 30 seconds.", rationale="Accelerates physician triage and catches critical symptoms early.", complexity="High", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="NABH/HIPAA Compliant Patient Record Portal", description="Secure encrypted records management with structured clinical summary exports.", rationale="Ensures medical regulatory compliance and patient trust.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="1-Click Teleconsult & Prescription Flow", description="Integrated video triage and digital prescription generator.", rationale="Enables remote care delivery without friction.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Direct Outreach to Clinic Owners & Doctors", description="Clinical workflow demos showcasing 50% reduction in patient triage documentation time.", expected_cac="Moderate (₹3,500 - ₹7,500)", conversion_strategy="Free 30-day clinical sandbox with priority onboarding."),
            GtmChannel(channel_name="Medical Associations & CME Conferences", description="Live diagnostic accuracy presentations at state medical conferences.", expected_cac="Low (₹1,500 - ₹3,500)", conversion_strategy="Free clinical research evaluation account."),
            GtmChannel(channel_name="Physician-to-Physician Referral Network", description="Referral incentives for doctors recommending the triage tool to partner clinics.", expected_cac="Organic (₹0 - ₹1,500)", conversion_strategy="Extended practice subscription credits.")
        ]
        pricing_tiers_list = [
            "Solo Practice: ₹3,999/month (1 doctor & up to 300 consultations/mo)",
            "Clinic Pro: ₹12,999/month (Up to 5 doctors, full EHR sync & AI triage)",
            "Hospital Network: ₹39,999/month (Multi-department triage & custom HIS integration)"
        ]

    elif any(k in text_corpus for k in ["fintech", "finance", "invoice", "accounting", "tax", "gst", "payment", "bank", "credit", "ledger"]):
        # FinTech / Accounting
        comp_1_name = "Tally Prime & QuickBooks"
        comp_2_name = "Razorpay & Zoho Books"
        comp_1_desc = "Legacy desktop accounting software requiring complex manual data entry."
        comp_2_desc = "Standard payment gateways with basic invoicing and separate reconciliation tools."
        moat_text = f"Autonomous AI reconciliation, real-time GST/tax audit, and cashflow optimization for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Automated Invoice & Tax Reconciliation Engine", description="Extracts line items, validates tax compliance, and flags discrepancies instantly.", rationale="Eliminates 15+ hours of manual month-end bookkeeping.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Real-Time Bank Feed & Ledger Sync", description="Two-way automated bank statement matching with 99.5% accuracy.", rationale="Stops cash leaks and gives real-time financial health visibility.", complexity="High", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Cashflow Forecast & Smart Alert Hub", description="Predicts working capital bottlenecks and triggers automated payment reminders.", rationale="Reduces debtor days and prevents liquidity crunches.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Chartered Accountant (CA) & CFO Networks", description="Partner with accounting firms who manage bookkeeping for 50+ SME clients.", expected_cac="Low (₹1,500 - ₹3,500)", conversion_strategy="Free multi-client dashboard for CAs."),
            GtmChannel(channel_name="SME Trade Associations & Business Summits", description="Workshops on GST audit readiness and cashflow automation.", expected_cac="Moderate (₹2,500 - ₹5,000)", conversion_strategy="Free 1-click ledger audit."),
            GtmChannel(channel_name="B2B LinkedIn Outbound to Finance Directors", description="Personalized benchmark reports showing hours saved on month-end closing.", expected_cac="Moderate (₹3,000 - ₹6,000)", conversion_strategy="Free 14-day reconciliation trial.")
        ]
        pricing_tiers_list = [
            "SME Starter: ₹1,999/month (Up to 500 transactions & basic GST)",
            "Growth Ledger: ₹6,999/month (Unlimited invoices, multi-bank sync & cashflow AI)",
            "Enterprise Finance: ₹24,999/month (Multi-entity consolidation & ERP integration)"
        ]

    elif any(k in text_corpus for k in ["agri", "farm", "crop", "soil", "agriculture", "farmer", "paddy", "yield", "irrigation"]):
        # AgriTech / Farming
        comp_1_name = "AgroStar & CropIn"
        comp_2_name = "DeHaat & Fasal IoT"
        comp_1_desc = "E-commerce focused agri-retail apps with generic advisory."
        comp_2_desc = "Expensive hardware IoT sensor setups difficult for smallholder farmers to afford."
        moat_text = f"Hyperlocal satellite and weather-driven crop yield prediction and direct market linkage for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Satellite & Weather Soil Moisture Predictor", description="Monitors field health and optimal irrigation windows without costly hardware.", rationale="Increases crop yield by 20% while saving 30% water.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="AI Crop Pest & Disease Diagnostic Scanner", description="Take a photo of infected leaves to get instant verified treatment recommendations.", rationale="Prevents catastrophic crop loss from uncontained pest outbreaks.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Real-Time Mandi Price & Market Linkage", description="Live price comparisons across nearby wholesale markets with direct buyer orders.", rationale="Eliminates middleman commission and guarantees fair harvest pricing.", complexity="Low", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Farmer Producer Organizations (FPOs) & Cooperatives", description="Demonstrations to FPO leadership representing thousands of local farmers.", expected_cac="Low (₹300 - ₹1,000)", conversion_strategy="Free trial season for FPO cluster leaders."),
            GtmChannel(channel_name="WhatsApp Voice & Vernacular Community Hubs", description="Localized crop advisory voice notes and market price updates.", expected_cac="Organic (₹0 - ₹200)", conversion_strategy="Free disease diagnostic scans via WhatsApp."),
            GtmChannel(channel_name="Agri-Input Retailer Partnerships", description="Place QR codes and interactive kiosks at fertilizer and seed stores.", expected_cac="Low (₹400 - ₹800)", conversion_strategy="Instant free soil advisory on first scan.")
        ]
        pricing_tiers_list = [
            "Farmer Season Pass: ₹299/crop cycle (Full advisory & disease scanning)",
            "FPO Village Hub: ₹4,999/season (Up to 100 farmer profiles & group market linkage)",
            "Agri-Enterprise: ₹24,999/year (Supply chain traceability & procurement analytics)"
        ]

    elif any(k in text_corpus for k in ["legal", "contract", "lawyer", "compliance", "clause", "nda", "advocate", "law firm"]):
        # LegalTech / Compliance
        comp_1_name = "SpotDraft & Ironclad"
        comp_2_name = "Vakilsearch & Lawyered"
        comp_1_desc = "Heavy enterprise contract lifecycle tools with lengthy multi-month onboarding."
        comp_2_desc = "Manual marketplace lawyer directories with slow turnaround times."
        moat_text = f"Instant contract risk clause scoring and localized regulatory compliance validation for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="AI Contract Clause Risk & Redline Analyzer", description="Upload agreements to instantly detect one-sided indemnities, liability caps, and risks.", rationale="Reduces contract review time from 3 days to 45 seconds.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Regulatory Compliance & Audit Tracker", description="Automated tracking of statutory filings, labor laws, and regulatory updates.", rationale="Prevents expensive non-compliance penalties.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Standardized Legal Template & e-Sign Hub", description="Pre-vetted NDAs, vendor agreements, and employment contracts with built-in e-signatures.", rationale="Accelerates deal execution without routine legal spend.", complexity="Low", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="In-House Legal Counsel & CFO LinkedIn Outreach", description="Audit sample contracts showing hidden indemnity risks detected in <1 minute.", expected_cac="Moderate (₹2,500 - ₹6,000)", conversion_strategy="3 free full contract risk audits."),
            GtmChannel(channel_name="Startup Incubator & Founder Webinars", description="Workshops on 'How Founders Lose Equity & Money in Bad Vendor Contracts'.", expected_cac="Low (₹1,000 - ₹2,500)", conversion_strategy="Free standard startup legal stack."),
            GtmChannel(channel_name="Law Firm & Boutique Practice Referrals", description="Provide law firms with a co-branded redline assistant for their SME clients.", expected_cac="Organic (₹0 - ₹1,500)", conversion_strategy="Partner revenue share on paid seats.")
        ]
        pricing_tiers_list = [
            "Legal Starter: ₹3,499/month (Up to 20 contract reviews/mo & standard templates)",
            "In-House Counsel Pro: ₹12,999/month (Unlimited reviews, redline editor & e-sign)",
            "Law Firm Enterprise: ₹34,999/month (Multi-client management & custom risk playbooks)"
        ]

    elif any(k in text_corpus for k in ["logistics", "supply chain", "fleet", "warehouse", "delivery", "shipping", "freight", "electric vehicle", "ev route"]):
        # Logistics & Fleet Management
        comp_1_name = "Shiprocket & Delhivery Dashboard"
        comp_2_name = "FarEye & Locus AI"
        comp_1_desc = "Standard courier aggregators without autonomous route and fleet charging automation."
        comp_2_desc = "Complex enterprise logistics software requiring expensive systems integration."
        moat_text = f"Dynamic multi-stop dispatch optimization and automated EV charging schedule algorithms for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Autonomous Multi-Stop Delivery Dispatcher", description="Calculates optimal delivery routes considering traffic, vehicle payload, and delivery windows.", rationale="Cuts last-mile delivery fuel and driver costs by 25%.", complexity="High", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Real-Time Fleet Battery & Telemetry Monitor", description="Tracks EV battery depletion in real time and routes to the closest available charging hub.", rationale="Prevents vehicle stranding and extends fleet uptime.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="1-Click Customer Tracking & WhatsApp ETA Link", description="Automated live tracking links and SMS/WhatsApp notifications for recipients.", rationale="Reduces failed delivery attempts and customer support calls.", complexity="Low", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="Direct Outreach to Fleet Owners & 3PL Operators", description="Route efficiency audits showing monthly fuel and charging savings.", expected_cac="Moderate (₹3,000 - ₹6,500)", conversion_strategy="Free 14-day fleet tracking trial on up to 5 vehicles."),
            GtmChannel(channel_name="E-Commerce Logistics Summits & Fleet Expos", description="Live dispatch optimization demos with local delivery fleet heads.", expected_cac="Low (₹1,500 - ₹3,500)", conversion_strategy="Free fleet efficiency ROI audit."),
            GtmChannel(channel_name="EV Fleet & Charging Infrastructure Alliances", description="Co-marketing with commercial EV manufacturers and charging station networks.", expected_cac="Organic (₹0 - ₹1,500)", conversion_strategy="Pre-installed software discounts.")
        ]
        pricing_tiers_list = [
            "Fleet Starter: ₹4,999/month (Up to 15 vehicles & basic route optimizer)",
            "Logistics Pro: ₹14,999/month (Up to 50 vehicles, live telemetry & driver app)",
            "Enterprise Fleet: ₹39,999/month (Unlimited vehicles & custom ERP integration)"
        ]

    elif any(k in text_corpus for k in ["recruiting", "recruitment", "hiring", "hrtech", "talent", "resume", "applicant", "interviews"]):
        # HRTech & Talent Acquisition
        comp_1_name = "Naukri & LinkedIn Recruiter"
        comp_2_name = "Greenhouse & Lever"
        comp_1_desc = "High-priced resume search portals with overwhelming irrelevant candidate applications."
        comp_2_desc = "Standard applicant tracking systems requiring hours of manual candidate review."
        moat_text = f"Automated AI resume match scoring and asynchronous technical assessment pipeline for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="AI Candidate Resume Match & Score Engine", description="Parses candidate resumes against role requirements and ranks top 5% fit automatically.", rationale="Saves recruiters 20+ hours weekly on manual resume screening.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Automated WhatsApp Interview Scheduler", description="Coordinates availability with candidates and syncs calendar invites in real time.", rationale="Eliminates interview scheduling drop-offs and email ping-pong.", complexity="Low", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Asynchronous Skills Video & Coding Assessor", description="Sends pre-screening assessment links and auto-grades responses against hiring rubrics.", rationale="Ensures only qualified candidates reach the final interview stage.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="HR Leaders & Talent Acquisition LinkedIn Outreach", description="Audit hiring bottlenecks and demonstrate 70% faster time-to-hire.", expected_cac="Moderate (₹2,500 - ₹5,500)", conversion_strategy="Free hiring trial on first 2 open roles."),
            GtmChannel(channel_name="Startup Founder Hiring Communities", description="Sponsor founder hiring masterclasses in YC/startup alumni networks.", expected_cac="Low (₹1,000 - ₹2,500)", conversion_strategy="Free starter recruitment tier."),
            GtmChannel(channel_name="Recruitment Agency Channel Partnerships", description="Provide boutique recruitment agencies with an automated pre-screening dashboard.", expected_cac="Organic (₹0 - ₹1,500)", conversion_strategy="Agency volume licensing revenue share.")
        ]
        pricing_tiers_list = [
            "Recruiter Starter: ₹3,499/month (Up to 3 active jobs & 200 candidate screenings)",
            "Growth Talent: ₹9,999/month (Unlimited active jobs, auto-scheduling & assessments)",
            "Enterprise Staffing: ₹29,999/month (Multi-recruiter seats & ATS integration)"
        ]

    elif any(k in text_corpus for k in ["code", "developer", "devtools", "cyber", "github", "cve", "vulnerability", "devops", "cloud", "security"]):
        # Developer Tools / CyberSecurity
        comp_1_name = "Snyk & GitHub Dependabot"
        comp_2_name = "SonarQube & Datadog"
        comp_1_desc = "Alert-heavy scanners generating hundreds of false positives that engineers ignore."
        comp_2_desc = "Legacy code quality suites requiring dedicated infrastructure servers."
        moat_text = f"Autonomous PR vulnerability verification and instant actionable remediation patches for {audience}."
        must_features = [
            MvpFeatureItem(feature_name="Real-Time GitHub PR Vulnerability Scanner", description="Scans code diffs for CVEs, logic flaws, and leaked secrets in under 30 seconds.", rationale="Blocks security flaws before merging into production.", complexity="High", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="1-Click Auto-Remediation PR Generator", description="Automatically generates pull requests containing validated dependency and code fixes.", rationale="Fixes vulnerabilities in 1 click instead of just alerting.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="CI/CD Pipeline Security Gate & Policy Hub", description="Customizable pass/fail rules to enforce compliance (SOC2, ISO27001) automatically.", rationale="Guarantees enterprise compliance without slowing release velocity.", complexity="Medium", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name="GitHub Marketplace & Open Source Repos", description="Free security badge for open-source repositories driving developer awareness.", expected_cac="Organic (₹0 - ₹500)", conversion_strategy="1-click GitHub App installation."),
            GtmChannel(channel_name="Engineering Lead & DevSecOps LinkedIn Outbound", description="Free automated repository security audits demonstrating immediate risk remediation.", expected_cac="Low (₹1,500 - ₹3,500)", conversion_strategy="Free trial on up to 3 private repositories."),
            GtmChannel(channel_name="Developer Discord & Reddit Tech Communities", description="Technical postmortems and teardowns of real-world dependency supply chain attacks.", expected_cac="Organic (₹0 - ₹800)", conversion_strategy="Free CLI scanner tool.")
        ]
        pricing_tiers_list = [
            "Developer Free: ₹0/month (Public repositories & 1 private repo)",
            "Team Security Pro: ₹4,999/month (Up to 10 private repos & automated PR fixes)",
            "Enterprise DevSecOps: ₹29,999/month (Unlimited repos, SOC2 compliance & custom policies)"
        ]

    else:
        # Dynamic Synthesis for Any Custom Startup Idea
        ind_keyword = ind.split()[0] if ind else "Industry"
        comp_1_name = f"Legacy {ind_keyword} Software"
        comp_2_name = f"Manual Spreadsheets & Workarounds"
        comp_1_desc = f"Established enterprise software for {ind_keyword.lower()} with high pricing and complex UI."
        comp_2_desc = "Manual tracking methods that lack real-time automation and error prevention."
        moat_text = f"Specialized AI workflow automation engine built strictly for {audience} in {ind}."
        must_features = [
            MvpFeatureItem(feature_name=f"{startup_name} AI Core Engine", description=f"Automates key {ind} workflows to solve {prob[:55]} in 1 click.", rationale="Delivers the primary core value proposition instantly.", complexity="Medium", priority="MUST HAVE"),
            MvpFeatureItem(feature_name=f"Self-Service Workflow Portal for {audience.split(',')[0]}", description="Intuitive interface designed for frictionless onboarding and immediate output.", rationale="Eliminates the steep learning curve of legacy tools.", complexity="Low", priority="MUST HAVE"),
            MvpFeatureItem(feature_name="Automated Insights & Export Hub", description="Download PDF summaries, copy reports, and sync results with existing toolsets.", rationale="Enables immediate sharing and stakeholder alignment.", complexity="Low", priority="MUST HAVE")
        ]
        channels_list = [
            GtmChannel(channel_name=f"Direct Founder Outreach to {audience.split(',')[0]}", description=f"Personalized audits showing decision-makers how {startup_name} saves 10+ hours weekly.", expected_cac="Low (₹1,500 - ₹3,500)", conversion_strategy="Free interactive pilot with priority support."),
            GtmChannel(channel_name=f"Targeted {ind} Community Hubs & Case Studies", description=f"Publish teardowns solving {prob[:45]} in niche industry groups and forums.", expected_cac="Organic (₹0 - ₹1,000)", conversion_strategy="Free beta sandbox access."),
            GtmChannel(channel_name=f"Google Search & Problem Solution Guides", description=f"SEO guides addressing high-intent queries around {ind} workflow bottlenecks.", expected_cac="Moderate (₹2,000 - ₹4,500)", conversion_strategy="Instant self-service demo trial.")
        ]
        pricing_tiers_list = [
            f"Starter Tier: ₹2,499/month (Core {ind} automation for {audience.split(',')[0]})",
            f"Pro Tier: ₹7,999/month (Advanced automation, team collaboration & integrations)",
            f"Enterprise Tier: ₹24,999/month (Dedicated support, custom rules & priority SLAs)"
        ]

    competitors_list = [
        CompetitorEntry(
            name=comp_1_name,
            description=comp_1_desc,
            strengths=["Established brand recognition", "Large user base"],
            weaknesses=["High cost", "Steep learning curve and slow manual setup"],
            comparison=f"Requires complex setup compared to {startup_name}'s instant AI app.",
            competitive_advantage="Faster time-to-value, lower cost, and cleaner UX."
        ),
        CompetitorEntry(
            name=comp_2_name,
            description=comp_2_desc,
            strengths=["Zero software cost", "Familiar to users"],
            weaknesses=["Zero intelligent automation", "High manual error rate and time loss"],
            comparison=f"Lacks intelligent end-to-end automation tailored to {audience}.",
            competitive_advantage="Automates tasks end-to-end in seconds."
        )
    ]
    
    market_opportunity = MarketOpportunityData(
        tam=f"₹{120 + (seed_val % 280)},000 Cr Global {ind.split()[0]} Market",
        sam=f"₹{20 + (seed_val % 45)},000 Cr Target Addressable Market",
        som=f"₹{1500 + (seed_val % 3000)} Cr 3-Year Obtainable Market",
        market_growth_rate=f"{14 + (seed_val % 7)}.2% CAGR",
        market_drivers=[
            f"Rapid digital adoption across {ind}",
            "Customers demanding fast self-service automated tools",
            "Urgent need to eliminate manual operational waste"
        ],
        entry_barriers=[
            "Switching friction from legacy habits",
            "Data security and trust expectations",
            "Customer acquisition channel saturation"
        ],
        unit_economics_summary=f"Strong 75%+ gross margins with recurring revenue via {rev} in Indian Rupees (₹).",
        estimated_cac=f"₹{2200 + (seed_val % 1800):,} - ₹{5200 + (seed_val % 1800):,}",
        estimated_ltv=f"₹{38000 + (seed_val % 14000):,} - ₹{95000 + (seed_val % 22000):,}",
        pricing_power="High — delivers measurable time and cost savings."
    )
    
    customer_segmentation = CustomerSegmentationData(
        primary_segment=CustomerSegmentPersona(
            persona_name=f"Primary {audience.split(',')[0]}",
            target_profile=f"Teams and professionals seeking automated solutions for {prob[:50]}.",
            key_pain_points=[
                f"Losing hours on {prob[:45]}",
                "Existing legacy software is overly complex and costly"
            ],
            willingness_to_pay="High (₹2,999 - ₹8,999 / month)",
            acquisition_channels=[
                "Direct Founder Outreach",
                "Free Interactive Sandbox",
                "Industry Communities"
            ],
            buying_triggers=[
                "Workload volume spikes",
                "Urgent need to cut costs and manual errors"
            ]
        ),
        secondary_segments=[
            CustomerSegmentPersona(
                persona_name="High-Volume Teams",
                target_profile=f"Growing organizations scaling operations across {ind}.",
                key_pain_points=["Fragmented multi-user workflows and lack of visibility"],
                willingness_to_pay="Very High (₹14,999 - ₹34,999 / month)",
                acquisition_channels=["Direct Product Demos", "Referrals"],
                buying_triggers=["Team headcount growth and compliance requirements"]
            ),
            CustomerSegmentPersona(
                persona_name="Individual Operators",
                target_profile="Solo operators needing fast 1-click self-service.",
                key_pain_points=["Limited budget for heavy enterprise software"],
                willingness_to_pay="Moderate (₹999 - ₹2,499 / month)",
                acquisition_channels=["Social Channels", "Word of Mouth"],
                buying_triggers=["Project deadline pressures"]
            )
        ],
        segmentation_strategy=f"Acquire {audience} with a frictionless free trial, then expand into paid team subscriptions."
    )
    
    comparison = ComparisonData(
        competitor_names=[comp_1_name, comp_2_name],
        comparison_matrix=[
            MatrixComparisonRow(dimension="Pricing", our_startup="Transparent subscription in ₹", primary_competitor="Opaque enterprise contracts", secondary_competitor="Hidden time cost", our_advantage="Lower TCO & instant ROI"),
            MatrixComparisonRow(dimension="Time to Value", our_startup="Instant <60s value", primary_competitor="Weeks of implementation", secondary_competitor="Manual effort required", our_advantage="Zero onboarding friction"),
            MatrixComparisonRow(dimension="Automation", our_startup="AI-native workflows", primary_competitor="Static legacy forms", secondary_competitor="Zero automation", our_advantage="Saves 10+ hours weekly"),
            MatrixComparisonRow(dimension="Audience Fit", our_startup=f"Tailored for {audience.split(',')[0]}", primary_competitor="Generic multi-industry tool", secondary_competitor="Unstandardized setup", our_advantage="Solves exact core pain point"),
            MatrixComparisonRow(dimension="Support", our_startup="24/7 AI-guided assistant", primary_competitor="Slow email ticketing", secondary_competitor="Community forums only", our_advantage="Instant resolution")
        ],
        positioning_summary=f"Fast, automated, and built specifically for {audience} without enterprise complexity."
    )

    risk_analysis = RiskAnalysisData(
        overall_risk_level="Moderate",
        risk_summary=f"Manageable operational and adoption risks with high market upside in {ind}.",
        risks=[
            RiskItem(category="Market Risk", risk=f"Inertia among {audience} switching from existing routines.", probability="Medium", impact="High", severity="Medium", mitigation="Offer free self-service trial with 1-minute time-to-value."),
            RiskItem(category="Competitor Risk", risk=f"Incumbents like {comp_1_name} launching basic AI features.", probability="High", impact="Medium", severity="High", mitigation=f"Double down on {moat_text[:50]} and execution speed."),
            RiskItem(category="Financial Risk", risk="Rising customer acquisition costs across paid channels.", probability="Low", impact="High", severity="Medium", mitigation="Drive organic community word-of-mouth and case study referrals."),
            RiskItem(category="Technical Risk", risk="Third-party AI API response latency or downtime.", probability="Medium", impact="Medium", severity="Medium", mitigation="Implement local intelligent caching and automated fallbacks."),
            RiskItem(category="Operational Risk", risk="Small early team balancing product engineering and sales.", probability="Low", impact="Medium", severity="Low", mitigation="Automate user onboarding and self-serve documentation."),
            RiskItem(category="Customer Retention Risk", risk="Users failing to build daily product habits.", probability="Medium", impact="High", severity="Medium", mitigation="Automate weekly value summary emails and proactive notifications.")
        ],
        key_mitigation_priorities=[
            "1. Launch free interactive sandbox for immediate user aha-moment.",
            "2. Interview 15-20 early beta users to refine onboarding UX.",
            "3. Secure 5 letters of intent (LOIs) before heavy feature expansion.",
            "4. Build organic referral loops into core user export workflows."
        ]
    )

    mvp_recommendation = MvpRecommendationData(
        mvp_summary=f"Launch a focused, lightning-fast application solving the primary pain point for {audience} in under 60 seconds.",
        target_timeline_weeks="4-6 Weeks",
        development_approach="Lean web architecture with immediate time-to-value.",
        must_have=must_features,
        should_have=[
            MvpFeatureItem(feature_name="User Accounts & Saved History", description="Save past workflows and reload previous evaluations seamlessly.", rationale="Increases weekly retention and recurring usage.", complexity="Medium", priority="SHOULD HAVE"),
            MvpFeatureItem(feature_name="Custom Presets & Templates", description="Pre-configured templates for common industry scenarios.", rationale="Reduces setup time for new team members.", complexity="Low", priority="SHOULD HAVE")
        ],
        could_have=[
            MvpFeatureItem(feature_name="Team Collaboration & Shared Workspaces", description="Multi-user permissioning and workspace sharing.", rationale="Drives expansion into higher-tier team plans.", complexity="Medium", priority="COULD HAVE"),
            MvpFeatureItem(feature_name="Automated Slack & Email Alerts", description="Deliver key results and notifications directly to team communication channels.", rationale="Keeps users engaged outside the main dashboard.", complexity="Low", priority="COULD HAVE")
        ],
        wont_have=[
            MvpFeatureItem(feature_name="Native Mobile App Store Builds", description="Dedicated iOS and Android binaries.", rationale="Responsive web app satisfies initial validation requirements.", complexity="High", priority="WON'T HAVE"),
            MvpFeatureItem(feature_name="Custom On-Premises Enterprise Deployments", description="Private cloud infrastructure installations.", rationale="Focus on cloud multi-tenant SaaS before PMF.", complexity="High", priority="WON'T HAVE")
        ]
    )

    gtm_strategy = GtmStrategyData(
        positioning_statement=f"For {audience}, {startup_name} is the AI-powered {ind} platform that {sol[:60]}.",
        target_customers=[
            f"Early adopters among {audience}",
            f"Forward-thinking teams managing {ind} workloads",
            "Professionals wanting fast automation over manual work"
        ],
        acquisition_channels=channels_list,
        launch_strategy=[
            GtmLaunchPhase(
                phase_name="Phase 1: Pre-Launch Validation & Waitlist",
                timeline="Weeks 1-4",
                key_activities=["Build high-converting 1-page landing page", "Interview 20 target users from ideal customer profile", "Collect 100 early beta waitlist signups"],
                goals="Confirm core value proposition with 20 founder interviews."
            ),
            GtmLaunchPhase(
                phase_name="Phase 2: Closed Beta Pilot",
                timeline="Weeks 5-8",
                key_activities=["Onboard first 25 beta users with white-glove setup", "Iterate core workflow based on daily feedback", "Collect 5 video testimonials and case study metrics"],
                goals="Achieve 80%+ task completion rate on primary workflow."
            ),
            GtmLaunchPhase(
                phase_name="Phase 3: Public Launch & Growth Sprints",
                timeline="Weeks 9-12",
                key_activities=["Public launch on Product Hunt and niche industry hubs", "Activate founder-led outbound campaigns", "Launch paid referral and partner affiliate incentives"],
                goals="Reach 100 paying customers and initial MRR milestone."
            )
        ],
        pricing_strategy=f"Value-aligned subscription model tailored for {audience} with instant ROI in ₹.",
        pricing_tiers=pricing_tiers_list,
        key_kpis=[
            "Active Weekly Usage (WAU / MAU ratio > 40%)",
            "Time to First Value (<60 seconds on initial login)",
            "Net Customer Acquisition Cost (LTV:CAC ratio > 3:1)",
            "Net Revenue Retention (>105% on annual plans)"
        ],
        how_to_get_started=[
            f"1. Setup a dedicated 1-page waitlist landing page for {startup_name}.",
            f"2. Conduct 15 structured problem interviews with {audience}.",
            f"3. Build the core must-have workflow: '{must_features[0].feature_name}'.",
            "4. Onboard 10 beta testers with white-glove support in exchange for case studies.",
            f"5. Launch outbound founder campaigns across '{channels_list[0].channel_name}'."
        ]
    )
    
    return ValidationReportResponse(
        summary=SummaryData(
            high_level_description=f"{startup_name} is an AI-powered platform for {audience} in {ind}, providing {sol}.",
            target_market_summary=f"Serves {audience} seeking to eliminate {prob[:60]} with automated workflows.",
            feasibility_verdict=verdict
        ) if 'SummaryData' in globals() else StartupSummary(
            high_level_description=f"{startup_name} is an AI-powered platform for {audience} in {ind}, providing {sol}.",
            target_market_summary=f"Serves {audience} seeking to eliminate {prob[:60]} with automated workflows.",
            feasibility_verdict=verdict
        ),
        extracted_idea=ExtractedIdea(
            startup_name=startup_name,
            core_problem=prob,
            core_solution=sol,
            target_audience=audience,
            industry=ind,
            revenue_model=rev,
            value_proposition=f"Automated, fast {ind} solution solving {prob[:50]} for {audience}."
        ),
        market_research=MarketResearchData(
            demand_analysis=f"Strong and growing demand across {ind} as {audience} shift toward AI automation tools.",
            industry_trends=[
                f"Rapid AI automation adoption across {ind}",
                "Demand for transparent subscription pricing over heavy enterprise contracts",
                "Shift from complex desktop software to lightweight mobile-first workflows"
            ],
            opportunities=[
                f"Disrupting legacy players with modern AI UX for {audience}",
                "Capturing unserved mid-market and solo operators",
                "Expanding customer lifetime value via workflow add-ons"
            ],
            customer_pain_points=[
                f"Wasting hours on {prob[:50]}",
                "High software costs with low day-to-day usability",
                "Lack of seamless automated workflows"
            ],
            sources=["Industry Market Reports", "Live Ecosystem Search", "Product Analytics Index"]
        ),
        market_opportunity=market_opportunity,
        customer_segmentation=customer_segmentation,
        competitor_analysis=CompetitorAnalysisData(
            competitors=competitors_list,
            unique_moat=moat_text
        ),
        comparison=comparison,
        swot_analysis=SwotAnalysis(
            strengths=[
                f"First-mover advantage with AI-native workflow built specifically for {audience}",
                f"Rapid time to value (<60s) compared to legacy tools like {comp_1_name}",
                "Lean operating cost structure allowing disruptive transparent pricing in ₹"
            ],
            weaknesses=[
                "Early brand recognition compared to well-funded incumbents",
                "Need to build extensive integration ecosystem with legacy software",
                "Requires continuous product iteration to build strong user retention habits"
            ],
            opportunities=[
                f"Expanding digital adoption and software spend across target market",
                f"High dissatisfaction among {audience} with clunky legacy tools",
                "Potential for organic viral expansion through team collaboration and export loops"
            ],
            threats=[
                f"Incumbents like {comp_1_name} attempting to launch similar AI add-ons",
                "Rising digital customer acquisition costs across standard paid ad channels",
                "Customer inertia and friction when migrating data from legacy setups"
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
            f"1. Focus initial MVP strictly on '{must_features[0].feature_name}' to validate user engagement.",
            f"2. Validate willingness to pay by offering early beta users the '{pricing_tiers_list[0].split(':')[0]}' plan.",
            f"3. Activate founder-led outbound campaigns across '{channels_list[0].channel_name}'.",
            f"4. Mitigate competitor risk by doubling down on your core moat: '{moat_text[:60]}'."
        ]
    )
