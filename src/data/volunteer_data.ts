import type { 
  SkillItem, 
  VolunteerProfile, 
  OpportunityItem, 
  VolunteerAssignment 
} from "../types.ts";

export const SKILLS_TAXONOMY: SkillItem[] = [
  // Education
  { id: "sk_edu_teach", name: "Primary Teaching", category: "Education" },
  { id: "sk_edu_math", name: "Mathematics Tutoring", category: "Education" },
  { id: "sk_edu_lang", name: "Language Literacy", category: "Education" },
  { id: "sk_edu_ment", name: "Youth Mentorship", category: "Education" },

  // Healthcare
  { id: "sk_health_aid", name: "First Aid & CPR", category: "Healthcare" },
  { id: "sk_health_nurse", name: "Nursing Assistance", category: "Healthcare" },
  { id: "sk_health_camp", name: "Medical Camp Coordination", category: "Healthcare" },
  { id: "sk_health_hyg", name: "Hygiene & Sanitation Training", category: "Healthcare" },

  // Relief & Emergency
  { id: "sk_rel_food", name: "Food Prep & Packaging", category: "Relief" },
  { id: "sk_rel_dist", name: "Relief Supply Distribution", category: "Relief" },
  { id: "sk_rel_shel", name: "Shelter Operations", category: "Relief" },
  { id: "sk_rel_crowd", name: "Crowd & Queue Management", category: "Relief" },

  // Logistics
  { id: "sk_log_inv", name: "Inventory Management", category: "Logistics" },
  { id: "sk_log_fleet", name: "Fleet & Van Dispatch", category: "Logistics" },
  { id: "sk_log_route", name: "Route Planning", category: "Logistics" },

  // IT & Media
  { id: "sk_it_data", name: "Data Entry & Reporting", category: "IT & Media" },
  { id: "sk_it_photo", name: "Field Photography", category: "IT & Media" },
  { id: "sk_it_social", name: "Community Outreach", category: "IT & Media" },

  // Community
  { id: "sk_comm_counsel", name: "Elderly Care & Counseling", category: "Community" },
  { id: "sk_comm_trans", name: "Regional Language Translation", category: "Community" },
];

export const INITIAL_VOLUNTEER_PROFILE: VolunteerProfile = {
  userId: "usr_seva_99812",
  fullName: "Anjali Sharma",
  email: "anjali.s@example.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1997-06-15",
  emergencyContact: {
    name: "Ramesh Sharma",
    phone: "+91 98765 11223",
    relation: "Father"
  },
  address: {
    line1: "42, Shanti Nilayam, 8th Main",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001"
  },
  skills: ["Primary Teaching", "First Aid & CPR", "Food Prep & Packaging", "Crowd & Queue Management"],
  availability: {
    weekdays: ["EVENING"],
    weekends: ["MORNING", "AFTERNOON"]
  },
  identityVerified: true,
  identityDocType: "AADHAAR",
  identityDocName: "Aadhaar_Card_Verified_9812.pdf",
  backgroundCheckStatus: "VERIFIED",
  backgroundCheckNotes: "Local police verification cleared; zero adverse records on file.",
  termsAccepted: true,
  termsAcceptedAt: "2026-08-01T10:00:00.000Z",
  termsSignatureHash: "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  onboardingStage: "COMPLETED",
  totalServiceHours: 42,
  completedEngagementsCount: 8
};

export const INITIAL_OPPORTUNITIES: OpportunityItem[] = [
  {
    opportunityId: "opp_4401",
    title: "Aahara Food Distribution Drive",
    description: "Distributing 1,000 warm, nutritious midday meals to underprivileged school children and urban shelters.",
    category: "RELIEF",
    location: {
      venueName: "Majestic City Railway Shelter",
      city: "Bengaluru"
    },
    requiredSkills: ["Food Prep & Packaging", "Crowd & Queue Management"],
    scheduledDate: "2026-09-12",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    durationHours: 4,
    capacity: 25,
    assignedCount: 19,
    expectedImpact: "Provide 1,000 children and families hot fresh meals and clean hydration.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4402",
    title: "Vidya Primary Math & Science Tutoring",
    description: "Weekend coaching for Grade 6-8 students in government schools preparing for annual assessment exams.",
    category: "EDUCATION",
    location: {
      venueName: "Govt High School, Malleshwaram",
      city: "Bengaluru"
    },
    requiredSkills: ["Primary Teaching", "Mathematics Tutoring"],
    scheduledDate: "2026-09-13",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    durationHours: 3,
    capacity: 12,
    assignedCount: 8,
    expectedImpact: "Improve basic STEM pass rates by 40% across 65 rural students.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4403",
    title: "Vaidya Community Health & Eye Screening",
    description: "Free medical check-up camp, vision screening, and distribution of prescription spectacles for senior citizens.",
    category: "HEALTHCARE",
    location: {
      venueName: "Kengeri Community Hall",
      city: "Bengaluru"
    },
    requiredSkills: ["First Aid & CPR", "Medical Camp Coordination"],
    scheduledDate: "2026-09-19",
    startTime: "08:30 AM",
    endTime: "02:30 PM",
    durationHours: 6,
    capacity: 20,
    assignedCount: 14,
    expectedImpact: "Screen 350 seniors for hypertension and distribute 150 free reading glasses.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4404",
    title: "Rural Tree Planting & Water Basin Digging",
    description: "Planting 500 indigenous saplings and clearing water catchment basins to prevent monsoon topsoil erosion.",
    category: "ENVIRONMENT",
    location: {
      venueName: "Hosakote Watershed Green Belt",
      city: "Bengaluru"
    },
    requiredSkills: ["Relief Supply Distribution", "Crowd & Queue Management"],
    scheduledDate: "2026-09-20",
    startTime: "07:00 AM",
    endTime: "11:00 AM",
    durationHours: 4,
    capacity: 30,
    assignedCount: 30,
    expectedImpact: "Restore 3 acres of degraded watershed green-cover with native trees.",
    status: "FILLED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4405",
    title: "Digital Literacy Workshop for Self-Help Groups",
    description: "Teaching UPI payments, DigiLocker, and online banking safety to women cottage artisans.",
    category: "COMMUNITY",
    location: {
      venueName: "Nelamangala Mahila Mandal",
      city: "Bengaluru"
    },
    requiredSkills: ["Data Entry & Reporting", "Language Literacy"],
    scheduledDate: "2026-09-26",
    startTime: "02:00 PM",
    endTime: "05:00 PM",
    durationHours: 3,
    capacity: 10,
    assignedCount: 4,
    expectedImpact: "Certify 40 women artisans in safe digital payments and government schemes.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4406",
    title: "Draft: Flood Relief Emergency Kit Assembly",
    description: "Bulk packing of emergency rations, water purification drops, and tarpaulin shelters.",
    category: "RELIEF",
    location: {
      venueName: "Central Warehouse, Yeshwanthpur",
      city: "Bengaluru"
    },
    requiredSkills: ["Food Prep & Packaging", "Inventory Management"],
    scheduledDate: "2026-10-02",
    startTime: "09:00 AM",
    endTime: "03:00 PM",
    durationHours: 6,
    capacity: 40,
    assignedCount: 0,
    expectedImpact: "Prepare 2,500 emergency disaster packs for coastal alert zones.",
    status: "DRAFT",
    approvalStatus: "PENDING",
    createdBy: "coord_sanjay"
  },
  {
    opportunityId: "opp_4407",
    title: "Temple Kitchen & Sacred Prasadam Helper",
    description: "Assist temple chefs with chopping fresh vegetables, packing prasadam packets in eco-friendly leaf containers, and guiding senior devotees during weekend annadanam.",
    category: "TEMPLE",
    location: {
      venueName: "Sri Lakshmi Narasimha Swamy Temple, Nelamangala Road",
      city: "Bengaluru Rural"
    },
    requiredSkills: ["Food Prep & Packaging", "Crowd & Queue Management"],
    scheduledDate: "2026-09-27",
    startTime: "07:30 AM",
    endTime: "11:30 AM",
    durationHours: 4,
    capacity: 15,
    assignedCount: 6,
    expectedImpact: "Prepare and distribute 1,500 sacred satvik prasadam meals to visiting devotees.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  },
  {
    opportunityId: "opp_4408",
    title: "Sacred Goshala Cow Care & Fodder Seva",
    description: "Participate in holy Go-Seva by preparing fresh green grass bundles, feeding indigenous Desi cows and calves, cleaning shelter sheds, and preparing natural organic compost.",
    category: "TEMPLE",
    location: {
      venueName: "Dharmasthala Rural Goshala Center",
      city: "Karnataka"
    },
    requiredSkills: ["Relief Supply Distribution", "Inventory Management"],
    scheduledDate: "2026-10-04",
    startTime: "06:30 AM",
    endTime: "09:30 AM",
    durationHours: 3,
    capacity: 12,
    assignedCount: 4,
    expectedImpact: "Nourish 60 indigenous Gir and Sahiwal cows with fresh nutritious green fodder.",
    status: "PUBLISHED",
    approvalStatus: "APPROVED",
    approvedBy: "coord_raghavan",
    createdBy: "coord_raghavan"
  }
];

export const INITIAL_ASSIGNMENTS: VolunteerAssignment[] = [
  {
    assignmentId: "asg_8810",
    opportunityId: "opp_4401",
    volunteerId: "usr_seva_99812",
    opportunityTitle: "Aahara Food Distribution Drive",
    venueName: "Majestic City Railway Shelter",
    scheduledDate: "2026-09-12",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    status: "CONFIRMED",
    assignedAt: "2026-08-25T14:30:00.000Z"
  }
];

/**
 * Pega GenAI Blueprint Deterministic Volunteer Matching Engine
 * Formula:
 * (0.40 * SkillMatch) + (0.20 * AvailabilityMatch) + (0.15 * LocationMatch) +
 * (0.10 * ExperienceScore) + (0.10 * PreferenceScore) + (0.05 * PastHistory)
 */
export function calculatePegaMatchScore(
  volunteer: VolunteerProfile,
  opportunity: OpportunityItem
): { score: number; breakdown: { skills: number; availability: number; location: number }; rationale: string } {
  // 1. Skill Match (40% weight)
  let skillPoints = 0;
  if (opportunity.requiredSkills.length > 0) {
    const matchedSkills = opportunity.requiredSkills.filter(req => 
      volunteer.skills.some(userSkill => userSkill.toLowerCase() === req.toLowerCase())
    );
    skillPoints = (matchedSkills.length / opportunity.requiredSkills.length) * 100;
  } else {
    skillPoints = 80;
  }

  // 2. Availability Match (20% weight)
  // Check if weekend vs weekday
  const dateObj = new Date(opportunity.scheduledDate);
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
  const userSlots = isWeekend ? volunteer.availability.weekends : volunteer.availability.weekdays;
  
  let availabilityPoints = 60; // baseline
  if (userSlots.length > 0) {
    // morning check
    if (opportunity.startTime.includes("AM") && userSlots.includes("MORNING")) {
      availabilityPoints = 100;
    } else if (opportunity.startTime.includes("PM") && (userSlots.includes("AFTERNOON") || userSlots.includes("EVENING"))) {
      availabilityPoints = 100;
    } else {
      availabilityPoints = 75;
    }
  }

  // 3. Location Match (15% weight)
  const isSameCity = volunteer.address.city.toLowerCase() === opportunity.location.city.toLowerCase();
  const locationPoints = isSameCity ? 95 : 40;

  // 4. Experience & Verification (10% weight)
  const experiencePoints = volunteer.identityVerified && volunteer.backgroundCheckStatus === "VERIFIED" ? 100 : 50;

  // 5. Category Preference (10% weight)
  const preferencePoints = volunteer.skills.length > 2 ? 90 : 70;

  // 6. Past History (5% weight)
  const historyPoints = Math.min(100, volunteer.completedEngagementsCount * 12);

  // Total weighted score
  const totalScore = Math.round(
    (skillPoints * 0.40) +
    (availabilityPoints * 0.20) +
    (locationPoints * 0.15) +
    (experiencePoints * 0.10) +
    (preferencePoints * 0.10) +
    (historyPoints * 0.05)
  );

  // Contextual AI-style explanation
  let rationale = "";
  if (totalScore >= 85) {
    rationale = `High compatibility (${totalScore}%): Your verified skills in ${opportunity.requiredSkills.slice(0, 2).join(", ")} and your ${isWeekend ? "weekend" : "weekday"} availability directly align with this initiative in ${opportunity.location.city}.`;
  } else if (totalScore >= 70) {
    rationale = `Moderate match (${totalScore}%): Good location alignment in ${opportunity.location.city}. Skills partially overlap with project needs.`;
  } else {
    rationale = `General match (${totalScore}%): General volunteer opportunity; orientation provided at venue.`;
  }

  return {
    score: Math.min(99, Math.max(45, totalScore)),
    breakdown: {
      skills: Math.round(skillPoints),
      availability: Math.round(availabilityPoints),
      location: Math.round(locationPoints)
    },
    rationale
  };
}
