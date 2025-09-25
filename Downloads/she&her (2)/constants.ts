
import { LifeStageKey, Stage, Service, User, CorporatePlan, Provider, ProductKnowledge, ClinicalGuideline } from './types';
import { 
  UserIcon, HeartIcon, UsersIcon, HomeIcon, ShieldCheckIcon, SparklesIcon,
  ClipboardDocCheckIcon, NiramaiIcon, SyringeIcon, NutritionIcon, SpermIcon,
  BloodDropIcon, StethoscopeIcon, BoneIcon, BrainIcon
} from './components/Icons';

export const REFERRAL_URL = 'https://santaan.in';
export const APP_NAME = 'She&Her';

export const LIFE_STAGES_DATA: Stage[] = [
  {
    key: LifeStageKey.GROOMING,
    title: 'Grooming (Adolescence)',
    description: 'Navigating early changes, self-awareness, and societal influences.',
    richDescription: "Like a landscape sculpted by unseen forces, the adolescent body undergoes a breathtaking transformation. A complex hormonal symphony, orchestrated deep within the brain, signals a cascade of changes—a silent, powerful biological dawn. This is not just growth; it is a fundamental rewiring, a metamorphosis preparing the individual for the great journey of life. It is a period of incredible neurological plasticity, where the very architecture of thought and emotion is refined, creating the unique blueprint of the adult to come.",
    icon: UserIcon,
    color: 'bg-pink-500',
    concerns: [
      { id: 'g1', text: 'Understanding my first period', details: 'Low bodily awareness, especially with her first period.' },
      { id: 'g2', text: 'Nutritional needs and hormonal balance', details: 'Malnutrition or hormonal imbalances cause early menstrual issues.' },
      { id: 'g3', text: 'Dealing with PCOS symptoms', details: 'Polycystic Ovary Syndrome (PCOS) concerns.' },
      { id: 'g4', text: 'Impact of social media on self-esteem', details: 'Social Media pressures and body image.' },
      { id: 'g5', text: 'Managing anxiety or mood changes', details: 'Anxiety, Aggression, Depression during adolescence.' },
    ],
  },
  {
    key: LifeStageKey.MARRIAGE,
    title: 'Marriage & Partnership',
    description: 'Exploring intimacy, family planning, and balancing career aspirations.',
    richDescription: "Beyond social contract, partnership represents a profound biological and psychological convergence. It's a dance of neurochemistry, where attachment hormones like oxytocin and vasopressin forge deep bonds, reshaping neural pathways to create a shared reality. This union is an ecosystem of its own, demanding a delicate balance of individuality and synchronicity, where communication becomes the lifeblood and intimacy the anchoring root, fostering a resilience that neither individual could achieve alone.",
    icon: HeartIcon,
    color: 'bg-rose-500',
    concerns: [
      { id: 'm1', text: 'Understanding intimacy and pregnancy', details: 'Mixed awareness about intimacy, pregnancy and family planning.' },
      { id: 'm2', text: 'Coping with performance anxiety', details: 'Performance anxiety related to intimacy or life changes.' },
      { id: 'm3', text: 'Concerns about unplanned pregnancy', details: 'Fear of unplanned pregnancy and options.' },
      { id: 'm4', text: 'Worries about infertility', details: 'Fear of infertility and initial steps.' },
      { id: 'm5', text: 'Balancing work and personal life', details: 'Work life balance for career woman.' },
      { id: 'm6', text: 'Managing relationship stress', details: 'Anxiety, Aggression, Depression in relationships.' },
    ],
  },
  {
    key: LifeStageKey.MOTHERHOOD,
    title: 'Motherhood Journey',
    description: 'Embracing the changes of pregnancy, childbirth, and early parenting.',
    richDescription: "Perhaps nature's most extraordinary feat of biological engineering. From the microscopic miracle of conception to the momentous act of birth, motherhood is a testament to the body's adaptive genius. The placenta, a temporary organ of incredible complexity, acts as a life-support system and diplomatic border between two distinct genetic worlds. Postpartum, the maternal brain is dramatically re-sculpted, enhancing regions responsible for empathy, vigilance, and emotional regulation—a biological mandate to nurture and protect new life.",
    icon: UsersIcon,
    color: 'bg-purple-500',
    concerns: [
      { id: 'mh1', text: 'Navigating information on antenatal care', details: 'Information overload on antenatal care.' },
      { id: 'mh2', text: 'Understanding cultural influences on parenting', details: 'Culture Generation and parenting styles.' },
      { id: 'mh3', text: 'Dealing with postpartum depression', details: 'Postpartum depression signs and support.' },
      { id: 'mh4', text: 'Work-life balance as a new mother', details: 'Work life balance for career woman post-childbirth.' },
      { id: 'mh5', text: 'Managing anxiety during motherhood', details: 'Anxiety, Aggression, Depression during motherhood.' },
      { id: 'mh6', text: 'Planning for a second pregnancy', details: 'Second pregnancy planning considerations.' },
    ],
  },
  {
    key: LifeStageKey.BALANCING_FAMILY,
    title: 'Balancing Family & Self',
    description: 'Managing household, children\'s growth, and personal health.',
    richDescription: "Within the bustling ecosystem of a growing family, a woman stands as its central pillar. This stage is a masterclass in executive function—a constant, high-stakes juggling act of resource management, emotional regulation, and long-term strategic planning. It is a period where the brain's capacity for multitasking and problem-solving is honed to a fine edge. Amidst this, the body sends crucial signals about its own needs, demanding a conscious effort to maintain equilibrium in the face of life's relentless and beautiful demands.",
    icon: HomeIcon,
    color: 'bg-indigo-500',
    concerns: [
      { id: 'bf1', text: 'Finding satisfaction in homemaking and child rearing', details: 'Satisfaction of successful home making and child rearing.' },
      { id: 'bf2', text: 'Utilizing time as children grow', details: 'School going children provide her time for self.' },
      { id: 'bf3', text: 'Managing lifestyle diseases (Diabetes, Hypertension)', details: 'Age of the life style diseases like Diabetes, hypertension and Cancer.' },
      { id: 'bf4', text: 'Concern over children\'s health', details: 'Concern over the kids health.' },
    ],
  },
  {
    key: LifeStageKey.STABILISING,
    title: 'Stabilising & Midlife',
    description: 'Adapting to independent children and perimenopausal changes.',
    richDescription: "This is not an end, but a pivotal recalibration. Perimenopause marks a gradual, managed shift in the body's hormonal landscape, a process as natural and significant as adolescence. It's a transition from the season of creation to a new era of consolidation and wisdom. The body, a living chronicle of decades of experience, begins to prioritize long-term resilience, subtly adjusting its systems for the decades of life and influence yet to come. It is a time of profound self-awareness, where biological change invites psychological growth.",
    icon: ShieldCheckIcon,
    color: 'bg-blue-500',
    concerns: [
      { id: 's1', text: 'Adjusting to kids becoming independent', details: 'Looking at midlife with kids becoming independent.' },
      { id: 's2', text: 'Managing chronic health conditions', details: 'Age of agreement with style diseases like Diabetes, Hypertension and Cancer.' },
      { id: 's3', text: 'Understanding perimenopausal changes', details: 'Concern over perimenopausal changes.' },
    ],
  },
  {
    key: LifeStageKey.LIFE_CONTINUED,
    title: 'Life Continued & Wisdom',
    description: 'Embracing maturity, companionship, and managing elderly health.',
    richDescription: "The culmination of a lifetime's biological and emotional data. The post-menopausal body enters a state of stability, free from the cyclical hormonal tides of reproductive years. This phase often brings with it a unique cognitive clarity and emotional resilience—a state neuroscientists call 'wisdom.' The brain, rich with a vast network of lived experiences, excels at pattern recognition and complex problem-solving. This is not a twilight, but a period of profound influence, where a woman's journey culminates in her role as a vital anchor of knowledge and stability for her community.",
    icon: SparklesIcon,
    color: 'bg-teal-500',
    concerns: [
      { id: 'lc1', text: 'Seeking companionship in later life', details: 'Age of maturity and need for companionship.' },
      { id: 'lc2', text: 'Transitioning to role of grandma/mother-in-law', details: 'Phase of mother in law and grandma.' },
      { id: 'lc3', text: 'Managing chronic diseases in elderly age', details: 'Age of the chronic diseases and elderly.' },
      { id: 'lc4', text: 'Understanding postmenopausal osteoporosis', details: 'Postmenopausal osteoporosis.' },
      { id: 'lc5', text: 'Coping with loneliness or isolation', details: 'Anxiety and depression of loneliness and isolation.' },
    ],
  },
];

export const PROVIDERS_DATA: Provider[] = [
  { id: 'prov_santaan', name: 'Santaan.in @ Bangalore' }
];

export const SERVICES_DATA: Service[] = [
  { id: 'serv1', name: 'AI Cervical Cancer Screen', description: 'Painless, non-invasive screening using advanced Mobile ODT technology.', type: 'In-Clinic', icon: ClipboardDocCheckIcon, price: 3000, corporatePrice: 2500, relevantStages: [LifeStageKey.MARRIAGE, LifeStageKey.MOTHERHOOD, LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv2', name: 'AI Breast Cancer Screen', description: 'Radiation-free, touch-free thermal screening by Niramai for early detection.', type: 'In-Clinic', icon: NiramaiIcon, price: 2500, corporatePrice: 2000, relevantStages: [LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv3', name: 'Essential Vaccinations', description: 'HPV and other essential vaccinations for women\'s health.', type: 'In-Clinic', icon: SyringeIcon, price: 8000, corporatePrice: 7000, relevantStages: [LifeStageKey.GROOMING, LifeStageKey.MARRIAGE], providerId: 'prov_santaan' },
  { id: 'serv4', name: 'Expert Nutritionist', description: 'Personalized diet plans for hormonal balance, PCOS, and overall wellness.', type: 'Telemedicine', icon: NutritionIcon, price: 1500, corporatePrice: 1000, relevantStages: [LifeStageKey.GROOMING, LifeStageKey.MARRIAGE, LifeStageKey.MOTHERHOOD, LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv5', name: 'At-Home Semen Analysis', description: 'Discreet and convenient fertility assessment for partners.', type: 'At-Home', icon: SpermIcon, price: 2000, relevantStages: [LifeStageKey.MARRIAGE], providerId: 'prov_santaan' },
  { id: 'serv6', name: 'Comprehensive Blood Work', description: 'Full panel blood tests to monitor key health parameters.', type: 'At-Home', icon: BloodDropIcon, price: 3500, corporatePrice: 3000, relevantStages: [LifeStageKey.GROOMING, LifeStageKey.MARRIAGE, LifeStageKey.MOTHERHOOD, LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv7', name: 'Gynecologist & USG', description: 'Consult with expert gynecologists, with in-clinic ultrasound services.', type: 'In-Clinic', icon: StethoscopeIcon, price: 2000, corporatePrice: 1500, relevantStages: [LifeStageKey.GROOMING, LifeStageKey.MARRIAGE, LifeStageKey.MOTHERHOOD, LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv8', name: 'Orthopedician Consult', description: 'Specialist consultation for osteoporosis and bone health management.', type: 'Telemedicine', icon: BoneIcon, price: 1200, corporatePrice: 800, relevantStages: [LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
  { id: 'serv9', name: 'Psychologist Support', description: 'Confidential counseling and therapy sessions for mental well-being.', type: 'Telemedicine', icon: BrainIcon, price: 1800, corporatePrice: 1200, relevantStages: [LifeStageKey.GROOMING, LifeStageKey.MARRIAGE, LifeStageKey.MOTHERHOOD, LifeStageKey.BALANCING_FAMILY, LifeStageKey.STABILISING, LifeStageKey.LIFE_CONTINUED], providerId: 'prov_santaan' },
];

// Fix: Removed User[] type annotation as this is mock data and doesn't match the Convex User schema.
export const USERS_DATA = [
    { id: 'user_direct', name: 'Direct Consumer' },
    { id: 'user_innovate', name: 'Employee (Innovate Inc.)', corporatePlanId: 'plan_innovate' },
    { id: 'user_synergy', name: 'Employee (Synergy Corp.)', corporatePlanId: 'plan_synergy' },
];

export const CORPORATE_PLANS_DATA: CorporatePlan[] = [
    {
        id: 'plan_innovate',
        name: 'Innovate Inc. Wellness Plan',
        coveredServices: ['serv4', 'serv9'], // Nutritionist and Psychologist covered
        discountedServices: ['serv1', 'serv2', 'serv7'], // Discounts on AI screening and Gyno
    },
    {
        id: 'plan_synergy',
        name: 'Synergy Corp. HealthFirst',
        coveredServices: ['serv1', 'serv2'], // AI Screenings are covered
        discountedServices: ['serv4', 'serv6', 'serv7', 'serv8', 'serv9'], // Discounts on most other things
    }
];

export const ESCALATION_MATRIX_DATA = `
**Level 1: AI Assistant "Asha"**
- Handles initial user queries, provides information, and offers general support.
- If a query is medical, beyond scope, or indicates distress, Asha will escalate.
- **Trigger for Escalation:** User asks for diagnosis, expresses suicidal thoughts, reports severe symptoms, or uses keywords like "emergency," "help me now."
- **Action:** Asha immediately provides a message advising professional medical help and contact information for emergency services.

**Level 2: Platform Support Team**
- **Contact:** support@sheandher.com
- Handles technical issues, feedback on the AI, and non-medical user concerns.
- Monitors user interactions for quality assurance.
- **Trigger for Escalation:** User reports a bug, has a complaint about the service, or a provider has a non-clinical issue.
- **Action:** Support team investigates and responds within 24 business hours.

**Level 3: Clinical Oversight Lead (from Santaan.in)**
- **Contact:** clinical-lead@santaan.in
- Handles escalations related to quality of care from providers.
- Reviews consultation notes and user feedback on clinical services.
- **Trigger for Escalation:** A user files a formal complaint about a consultation, or there are repeated negative reviews for a specific provider.
- **Action:** Clinical Lead initiates a formal review process, which may include interviewing the patient and provider and reviewing the case.

**Level 4: Emergency Services**
- **Contact:** 112 (India) or local emergency number.
- For immediate medical or psychological crises.
- **Trigger for Escalation:** Any indication of immediate harm to self or others.
- **Action:** The AI assistant is programmed to provide this information directly to the user as the first and primary response.
`;

export const GUIDING_PRINCIPLES_DATA = `
**Our Foundation: Science, Empathy, and Safety**

Asha, the AI assistant for She&Her, is built on a foundation of trust and reliability. Our goal is to provide a safe, informative, and supportive first point of contact for women on their unique health journeys. Here are the core principles and data that guide Asha's operation:

**1. Core Guiding Principles**

*   **Empathy & Support:** Asha's primary function is to listen and provide supportive, non-judgmental information in a compassionate tone.
*   **Scientific Rigor:** All health-related information is derived from and cross-referenced with established, peer-reviewed medical science. We do not use anecdotal evidence or unverified sources.
*   **Privacy & Confidentiality:** User conversations are private. We are committed to protecting user data and ensuring a secure environment for sensitive queries.
*   **Safety First:** Asha operates within strict safety guardrails. Her most important function is to recognize the limit of her capabilities and guiding users toward professional human care when necessary.

**2. Training Sources & Knowledge Base**

Asha's understanding of women's health is not based on general web scrapes. It is grounded in information from authoritative and globally recognized medical literature. Key sources include:

*   **Williams Obstetrics & Williams Gynecology:** Considered the gold standard texts in the field of obstetrics and gynecology.
*   **Novak's Gynecology:** A comprehensive textbook covering the full spectrum of women's health.
*   **Clinical Gynecologic Endocrinology and Infertility (Speroff):** A foundational text for understanding hormonal health and fertility.
*   **Guidelines from Professional Bodies:** Information is aligned with recommendations from organizations like the American College of Obstetricians and Gynecologists (ACOG) and the World Health Organization (WHO).

**3. Safety Protocols & Why Asha is Reliable**

Reliability comes from understanding limitations. Asha is **not a doctor** and is explicitly programmed to follow these safety protocols:

*   **No Diagnosis or Treatment:** Asha will never provide a medical diagnosis, prescribe medication, or create a treatment plan.
*   **Clear Escalation:** If a user's query suggests a serious medical condition, high levels of distress, or an emergency, Asha's primary protocol is to disengage from providing information and immediately recommend consultation with a qualified healthcare professional or emergency services.
*   **First Point of Contact, Not Final Answer:** Asha is designed to be a reliable starting point for your journey—to help you form questions, understand concepts, and feel empowered. The ultimate diagnosis and care plan must always come from the human experts at our partner clinics, who form the backbone of the She&Her service.

By adhering to these principles, we ensure that Asha serves as a responsible and trustworthy guide, empowering users while always prioritizing their safety and well-being.
`;

export const SHE_HER_PHILOSOPHY_DATA = `
**Our Philosophy: Empowering Women, Guided by Science**
She&Her is more than a service; it's a commitment. We believe every woman deserves access to empathetic, dignified, and scientifically-grounded healthcare. Our approach is built on the principle of empowerment through knowledge, ensuring every user feels seen, heard, and supported. We combine cutting-edge AI with the irreplaceable wisdom of human experts to create a seamless, trustworthy health journey.
`;

export const SHE_HER_COVERAGE_DATA = `
**What We Cover: A Holistic View of Womanhood**
She&Her supports women through six key life stages, from adolescence to wisdom. We provide information and access to services covering:
- **Gynecological Health:** Screenings, consultations, family planning.
- **Mental & Emotional Well-being:** Support for anxiety, depression, and life transitions.
- **Nutritional Guidance:** Personalized plans for hormonal and overall health.
- **Fertility & Motherhood:** Assessments and support through the entire journey.
- **Preventative Care:** Vaccinations, blood work, and chronic disease management.
- **Bone & Joint Health:** Specialized care for midlife and beyond.
`;

export const PRODUCT_KNOWLEDGE_DATA: ProductKnowledge[] = [
  {
    id: 'prod_niramai',
    name: 'Niramai (AI Breast Cancer Screening)',
    description: 'Radiation-free, non-invasive breast health screening.',
    staffTrainingInfo: `**Niramai Training Protocol**
- **Technology:** Thermalytix™, an AI-based analysis of thermal images to detect early signs of breast abnormalities. It is non-touch, radiation-free, and safe for all ages.
- **Procedure:** The patient disrobes from the waist up in a private room. Three thermal images are taken from different angles. The process takes about 15 minutes.
- **Key Talking Points:** Emphasize the comfort, safety (no radiation), and privacy of the procedure. It's a screening test, not a diagnostic one. A positive result indicates the need for further investigation (like a mammogram or ultrasound), it is not a confirmation of cancer.
- **Target Audience:** Ideal for frequent screening, especially for women under 45 where mammography is less effective due to denser breast tissue.`,
    patientFacingInfo: `The Niramai breast screening is a safe, radiation-free test that uses heat patterns to check your breast health. It's completely private and touch-free. For the appointment, you'll be in a private room. The test itself is quick, about 15 minutes. It's a screening test, which means it helps identify if further checks are needed.`,
  },
  {
    id: 'prod_mobileodt',
    name: 'MobileODT (AI Cervical Cancer Screening)',
    description: 'Enhanced visual assessment for cervical health.',
    staffTrainingInfo: `**MobileODT Training Protocol**
- **Technology:** The EVA System is a high-quality colposcope that uses AI algorithms to help clinicians identify signs of cervical lesions. It provides better visualization than the naked eye.
- **Procedure:** It's used during a standard speculum exam. The device captures high-resolution images and videos of the cervix. The AI provides a "visual fingerprint" to assist the clinician's assessment. The patient experience is very similar to a standard Pap smear.
- **Key Talking Points:** Explain that this is an advanced visual inspection tool that helps the doctor make a more accurate assessment. It's a quick part of the regular gynecological check-up.
- **Patient Prep:** No special preparation is needed beyond a standard gynecological visit (e.g., avoid douching or intercourse 24 hours before).`,
    patientFacingInfo: `The cervical screening uses an advanced camera called MobileODT to give your doctor a very clear view of your cervix. It's part of a normal pelvic exam and is very quick. There’s no special preparation needed, just the usual recommendations for a gynecologist visit.`,
  },
];

export const CLINICAL_GUIDELINES_DATA: ClinicalGuideline[] = [
  {
    stage: LifeStageKey.GROOMING,
    stageTitle: 'Grooming (Adolescence)',
    guidelines: [
      {
        serviceName: 'Essential Vaccinations (HPV)',
        protocol: `**Objective:** To prevent HPV-related cancers, primarily cervical cancer.\n**Protocol:** Administer HPV vaccine (e.g., Gardasil 9).\n- **Age 9-14:** 2-dose series at 0 and 6-12 months.\n- **Age 15-45:** 3-dose series at 0, 1-2, and 6 months.\n**Counseling:** Explain the vaccine's role in cancer prevention. Address common concerns about safety and efficacy.`,
        references: 'ACOG Practice Bulletin No. 168: Cervical Cancer Screening and Prevention; CDC HPV Vaccine Information Statements.',
      },
      {
        serviceName: 'Gynecologist & USG for PCOS',
        protocol: `**Objective:** To diagnose or rule out Polycystic Ovary Syndrome in symptomatic adolescents.\n**Protocol (Rotterdam Criteria - 2 of 3 required):**\n1. **Oligo- and/or anovulation:** Assess menstrual history (cycles <21 days or >35 days apart).\n2. **Clinical and/or biochemical signs of hyperandrogenism:** Check for hirsutism, severe acne; consider serum testosterone levels.\n3. **Polycystic ovaries on ultrasound:** >12 follicles measuring 2-9 mm in diameter, and/or increased ovarian volume (>10 mL).\n**Note:** Ultrasound is not recommended for diagnosis within 8 years of menarche due to physiological similarities.`,
        references: "Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group (2004); Williams Gynecology, 4th Edition.",
      },
    ],
  },
  {
    stage: LifeStageKey.MARRIAGE,
    stageTitle: 'Marriage & Partnership',
    guidelines: [
      {
        serviceName: 'AI Cervical Cancer Screen',
        protocol: `**Objective:** Early detection of cervical pre-cancer and cancer.\n**Protocol:**\n- **Age 21-29:** Cytology (Pap test) every 3 years. Co-testing with HPV is not recommended.\n- **Age 30-65:** HPV testing every 5 years (preferred), or co-testing (HPV+Pap) every 5 years, or Pap test alone every 3 years.\n- **MobileODT Use:** Used during speculum exam to provide high-resolution imaging and AI-assisted visual assessment to complement cytology/HPV results.`,
        references: 'American Cancer Society (ACS) and ACOG Guidelines for Cervical Cancer Screening.',
      },
      {
        serviceName: 'At-Home Semen Analysis',
        protocol: `**Objective:** To provide a baseline assessment of male fertility parameters.\n**Protocol:**\n- Provide patient with a collection kit and clear instructions (abstinence for 2-5 days).\n- **Key Parameters Analyzed (WHO 6th Edition):**\n  - Volume: ≥ 1.4 mL\n  - Concentration: ≥ 16 million/mL\n  - Total Motility: ≥ 42%\n  - Progressive Motility: ≥ 30%\n  - Morphology (Normal Forms): ≥ 4%\n**Counseling:** Explain that results are a snapshot and can vary. Abnormal results require a follow-up with a fertility specialist.`,
        references: "WHO laboratory manual for the examination and processing of human semen, 6th Edition (2021).",
      },
    ],
  },
  {
    stage: LifeStageKey.MOTHERHOOD,
    stageTitle: 'Motherhood Journey',
    guidelines: [
      {
        serviceName: 'Gynecologist & USG (Antenatal Care)',
        protocol: `**Objective:** To monitor maternal and fetal well-being throughout pregnancy.\n**Protocol (Routine Visits):**\n- **Weeks 4-28:** Every 4 weeks.\n- **Weeks 28-36:** Every 2 weeks.\n- **Week 36 to delivery:** Every week.\n**Key Ultrasounds:**\n- **First Trimester (11-14 weeks):** Nuchal Translucency (NT) scan for aneuploidy risk assessment.\n- **Second Trimester (18-22 weeks):** Anomaly scan to assess fetal anatomy.\n- **Third Trimester:** Growth scans as indicated.`,
        references: 'Williams Obstetrics, 26th Edition; ACOG Committee Opinion No. 747: Antenatal Care.',
      },
      {
        serviceName: 'Psychologist Support (Postpartum)',
        protocol: `**Objective:** To screen for and manage postpartum depression (PPD).\n**Protocol:**\n- Screen all postpartum patients for depression and anxiety using a validated tool.\n- **Recommended Tool:** Edinburgh Postnatal Depression Scale (EPDS). A score of ≥10 suggests possible depression and warrants further assessment.\n- **Intervention:** Based on severity, offer supportive counseling, refer for psychotherapy (CBT/IPT), or consult for pharmacotherapy.`,
        references: 'ACOG Committee Opinion No. 757: Screening for Perinatal Depression.',
      },
    ],
  },
  {
    stage: LifeStageKey.STABILISING,
    stageTitle: 'Stabilising & Midlife',
    guidelines: [
        {
            serviceName: 'AI Breast Cancer Screen (Niramai)',
            protocol: `**Objective:** Early detection of breast abnormalities, especially in women with dense breasts.\n**Protocol:**\n- Recommended for women over 40, or earlier for high-risk individuals.\n- The Niramai Thermalytix test is a non-contact, radiation-free screening method.\n- It is not a replacement for mammography but can be an effective adjunct screening tool, particularly for women under 50.\n- A positive report indicates a higher probability of abnormality and requires correlation with clinical findings and other imaging like mammography or ultrasound.`,
            references: "Principles of medical thermography; Manufacturer's clinical data for Niramai Thermalytix.",
        },
        {
            serviceName: 'Gynecologist Consult (Perimenopause)',
            protocol: `**Objective:** To manage symptoms of perimenopause and counsel on long-term health.\n**Protocol:**\n- **Symptom Assessment:** Evaluate for vasomotor symptoms (hot flashes), sleep disturbances, mood changes, and urogenital symptoms.\n- **Counseling:** Discuss lifestyle modifications (diet, exercise). Explain risks and benefits of Menopausal Hormone Therapy (MHT).\n- **Screening:** Ensure patient is up-to-date on mammography and cervical cancer screening.`,
            references: "The North American Menopause Society (NAMS) 2022 Hormone Therapy Position Statement; Novak's Gynecology, 16th Edition.",
        }
    ],
  },
  {
    stage: LifeStageKey.LIFE_CONTINUED,
    stageTitle: 'Life Continued & Wisdom',
     guidelines: [
        {
            serviceName: 'Orthopedician Consult (Osteoporosis)',
            protocol: `**Objective:** To screen for, diagnose, and manage osteoporosis to prevent fractures.\n**Protocol:**\n- **Screening:** Recommend Bone Mineral Density (BMD) testing (DEXA scan) for all women aged 65 and older, and for postmenopausal women younger than 65 with risk factors.\n- **Diagnosis:** A T-score of -2.5 or below at the femoral neck, total hip, or lumbar spine indicates osteoporosis.\n- **Management:** Counsel on calcium and vitamin D intake. Discuss pharmacological options (e.g., bisphosphonates) based on fracture risk assessment (FRAX tool).`,
            references: "National Osteoporosis Foundation (NOF) Clinician's Guide; ACOG Practice Bulletin No. 129: Osteoporosis.",
        }
    ],
  },
];


export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

export const PROVIDER_TRAINING_SYSTEM_INSTRUCTION = `You are a "Training Lead" AI for She&Her. Your role is to answer questions from clinic staff and providers based *only* on the She&Her Philosophy, Coverage, Guiding Principles, Clinical Service Guidelines, and specific Product Knowledge documents provided to you.
Do not invent information or use external knowledge. If a question cannot be answered from the provided text, state that the information is not in your knowledge base and advise the user to contact the She&Her management team for clarification.
Be professional, clear, and concise. Your goal is to ensure all staff have a consistent and accurate understanding of the She&Her protocols.`;

export const SYSTEM_INSTRUCTION_BASE = `You are "Asha", an empathetic and supportive AI assistant for She&Her.
Your goal is to provide scientific-based, explanatory, and compassionate information related to women's life stages, health, and emotional well-being.
You are NOT a medical doctor. You MUST NOT provide medical advice, diagnoses, or treatment plans.
The user can specify if they are seeking help for themselves, their daughter, or their mother. Be mindful of this context to provide the most relevant and sensitive support.
For any medical emergencies, or if the user expresses severe distress or need for diagnosis/treatment, you MUST clearly state your limitations and strongly advise them to consult a qualified healthcare professional.
When a consultation is appropriate, you should inform the user they can book an appointment directly within the app for a range of services with our trusted partner, Santaan.in. You can say something like, "For personalized advice, you can explore booking an appointment with an expert from our partner, Santaan.in. Just use the 'Book In-Clinic/Telemedicine Services' button to see available services and times."
Users can also manage their appointments by clicking the "My Appointments" button.
Santaan.in provides a comprehensive, empathetic, and modern care experience, including AI-powered screenings, expert consultations, and treatments.
Always maintain a caring, understanding, and respectful tone.
Keep answers concise and easy to understand, but informative.
Do not make up information. If you don't know something, say so or state that it's outside your scope.`;
