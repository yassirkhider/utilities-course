import { v4 as uuidv4 } from 'uuid';
import type {
  Activity,
  ActivityType,
  CourseData,
  DayPlan,
  Quiz,
  QuizQuestion,
  Resource,
  ScheduleRow,
  Topic,
} from '../types';
import { topicSeeds } from './topicContent';

// ---- Days ----
const dayDefs: { id: string; dayNumber: number; title: string; focus: string; description: string; objectives: string; topicSlugs: string[] }[] = [
  {
    id: "day-1",
    dayNumber: 1,
    title: "Day 1 — Utilities & Auxiliary Systems Fundamentals",
    focus: "Breathing Air, Chilled Water & Combustion Air Systems",
    description: "Day 1 introduces the foundational utility and auxiliary systems that keep personnel safe and support fired equipment: the breathing air system used for respiratory protection, the chilled water system supplying process and HVAC cooling, and the combustion air blowers and air preheater that supply and condition combustion air for fired heaters and boilers.",
    objectives: "<ul><li>Explain the purpose, layout and quality requirements of the plant breathing air system.</li><li>Describe chilled water generation, distribution and duty/standby arrangements.</li><li>Explain how combustion air blowers and the air preheater support fired-equipment efficiency and safety.</li><li>Read and trace P&IDs for each Day 1 system and identify duty/standby dependencies.</li></ul>",
    topicSlugs: ["breathing-air-system", "chilled-water-system", "combustion-air-blower-air-preheater"],
  },
  {
    id: "day-2",
    dayNumber: 2,
    title: "Day 2 — Water, Demineralization, Steam & Boiler Systems",
    focus: "Utility Water, Demineralization, Steam & Package Boiler Systems",
    description: "Day 2 follows water all the way from utility/potable supply through demineralization to boiler feedwater, steam generation in the package boiler and waste heat boiler, and back as condensate — including blowdown control along the way.",
    objectives: "<ul><li>Distinguish potable, utility and demineralized water quality requirements and uses.</li><li>Describe the demineralization package process train.</li><li>Explain steam generation, distribution and condensate return.</li><li>Describe package boiler / waste heat boiler operation and blowdown practice.</li><li>Trace the complete water-to-steam-to-condensate cycle on the combined P&ID set.</li></ul>",
    topicSlugs: ["utility-potable-water", "demineralization-package", "steam-condensate-system", "package-boiler-whb-blowdown"],
  },
  {
    id: "day-3",
    dayNumber: 3,
    title: "Day 3 — Gas-Treatment Auxiliary Packages",
    focus: "Lean Solvent Filtration & DGA Reclaiming Systems",
    description: "Day 3 focuses on the auxiliary packages that protect and sustain the amine (DGA) gas-treating system: lean solvent filtration, which removes particulates and hydrocarbon contaminants, and the DGA reclaimer / HP converter, which removes heat-stable salts and degradation products from circulating amine.",
    objectives: "<ul><li>Explain the role of lean solvent filtration in protecting amine system performance.</li><li>Describe DGA reclaiming and the HP converter process.</li><li>Interpret filter differential-pressure trends to distinguish normal fouling from abnormal events.</li><li>Trace the amine circulation loop including reclaiming and filtration slipstreams.</li></ul>",
    topicSlugs: ["lean-solvent-filtration-package", "dga-reclaimer-hp-converter"],
  },
  {
    id: "day-4",
    dayNumber: 4,
    title: "Day 4 — Sour Water, Sulphur Systems & Guided Plant Visit",
    focus: "Sour Water Stripping, Sulphur Handling & Site Walkthrough",
    description: "Day 4 covers the sour water stripper unit and molten sulphur rundown/degassing systems in the classroom, then takes trainees on a guided, escorted walkthrough of the live plant to observe this equipment first-hand under full H2S and permit-to-work controls.",
    objectives: "<ul><li>Explain sour water stripping and H2S removal from process water.</li><li>Describe molten sulphur rundown, degassing and safe handling requirements.</li><li>Demonstrate correct PPE, gas-testing and permit-to-work practice during a guided plant visit.</li><li>Compare field observations against classroom P&IDs and note any discrepancies.</li></ul>",
    topicSlugs: ["sour-water-stripper", "sulphur-rundown-degassing"],
  },
  {
    id: "day-5",
    dayNumber: 5,
    title: "Day 5 — Wastewater & Integrated Operations",
    focus: "Wastewater Systems, Integration & Final Assessment",
    description: "Day 5 completes the water cycle with wastewater collection/transfer and treatment, then ties the full week together with a structured startup/shutdown framework, a structured troubleshooting methodology, an integrated multi-system control-room scenario, and the final assessment.",
    objectives: "<ul><li>Explain wastewater collection, stream segregation and transfer.</li><li>Describe the wastewater treatment process sequence.</li><li>Apply the S.T.A.R.T. readiness framework to startup/shutdown of any utility system.</li><li>Apply the DETECT-CONFIRM-ASSESS-STABILIZE-DIAGNOSE-RECOVER troubleshooting method to a cascading multi-system upset.</li><li>Complete the Final Assessment covering all five training days.</li></ul>",
    topicSlugs: ["wastewater-collection-transfer", "wastewater-treatment"],
  },
];

const dayIdBySlug: Record<string, string> = {};
dayDefs.forEach((d) => d.topicSlugs.forEach((slug) => (dayIdBySlug[slug] = d.id)));

// ---- Topics ----
export const topics: Topic[] = topicSeeds.map((t, idx) => {
  const dayId = dayIdBySlug[t.slug] ?? null;
  const orderInDay = dayDefs.find((d) => d.id === dayId)?.topicSlugs.indexOf(t.slug) ?? idx;
  return {
    id: `topic-${t.slug}`,
    slug: t.slug,
    title: t.title,
    dayId,
    order: orderInDay,
    learningObjectives: t.learningObjectives,
    systemPurpose: t.systemPurpose,
    processOverview: t.processOverview,
    mainEquipment: t.mainEquipment,
    operatingParameters: t.operatingParameters,
    processFlow: t.processFlow,
    instrumentationControls: t.instrumentationControls,
    startupConsiderations: t.startupConsiderations,
    normalOperation: t.normalOperation,
    shutdownConsiderations: t.shutdownConsiderations,
    commonProblems: t.commonProblems,
    troubleshooting: t.troubleshooting,
    safetyConsiderations: t.safetyConsiderations,
    safetyTags: t.safetyTags,
    extendedContentHtml: t.extendedContentHtml,
  };
});

const topicIdBySlug: Record<string, string> = Object.fromEntries(topics.map((t) => [t.slug, t.id]));

// ---- Schedules (real day-by-day timetables from the official course plan) ----
function mkRows(rows: [string, string, string, ScheduleRow['type']][]): ScheduleRow[] {
  return rows.map(([startTime, endTime, title, type], i) => ({ id: uuidv4(), order: i, startTime, endTime, title, type }));
}

const scheduleByDay: Record<string, ScheduleRow[]> = {
  "day-1": mkRows([
    ["08:00", "08:30", "Review / Introduction", "session"],
    ["08:30", "10:00", "Breathing Air System & Chilled Water System", "session"],
    ["10:00", "10:15", "Break", "break"],
    ["10:15", "12:00", "Combustion Air Blowers & Air Preheater", "session"],
    ["12:00", "13:00", "Lunch", "lunch"],
    ["13:00", "14:30", "P&ID Tracing & Utility Dependency Activity", "activity"],
    ["14:30", "14:45", "Break", "break"],
    ["14:45", "16:00", "Combustion-Air Troubleshooting Scenario / Daily Review", "session"],
  ]),
  "day-2": mkRows([
    ["08:00", "08:30", "Review / Introduction", "session"],
    ["08:30", "10:00", "Utility & Potable Water and Demineralization Package", "session"],
    ["10:00", "10:15", "Break", "break"],
    ["10:15", "12:00", "Steam & Condensate System", "session"],
    ["12:00", "13:00", "Lunch", "lunch"],
    ["13:00", "14:30", "Water-to-Steam Cycle P&ID Trace Activity", "activity"],
    ["14:30", "14:45", "Break", "break"],
    ["14:45", "16:00", "Package Boiler, WHB & Blowdown / Daily Review", "session"],
  ]),
  "day-3": mkRows([
    ["08:00", "08:30", "Review / Introduction", "session"],
    ["08:30", "10:00", "Lean Solvent Filtration Package", "session"],
    ["10:00", "10:15", "Break", "break"],
    ["10:15", "12:00", "DGA Reclaimer & HP Converter", "session"],
    ["12:00", "13:00", "Lunch", "lunch"],
    ["13:00", "14:30", "Amine System Flow Trace & Filter ΔP Activity", "activity"],
    ["14:30", "14:45", "Break", "break"],
    ["14:45", "16:00", "Gas-Treatment Dependency Workshop / Daily Review", "session"],
  ]),
  "day-4": mkRows([
    ["08:00", "08:30", "Recap / Pre-Visit Learning Objectives & Safety Briefing", "session"],
    ["08:30", "10:00", "Guided Plant Walkthrough — Sour Water & Sulphur Areas", "activity"],
    ["10:00", "10:15", "Break", "break"],
    ["10:15", "11:15", "Control Room Observation", "session"],
    ["11:15", "12:00", "Return / Initial Observations Debrief", "session"],
    ["12:00", "13:00", "Lunch", "lunch"],
    ["13:00", "14:30", "Sour Water Stripper & Sulphur Rundown/Degassing Technical Session", "session"],
    ["14:30", "14:45", "Break", "break"],
    ["14:45", "16:00", "Observation Worksheet & Post-Visit Debrief / P&ID Comparison", "activity"],
  ]),
  "day-5": mkRows([
    ["08:00", "08:30", "Review / Introduction", "session"],
    ["08:30", "10:00", "Wastewater Collection & Transfer", "session"],
    ["10:00", "10:15", "Break", "break"],
    ["10:15", "12:00", "Wastewater Treatment", "session"],
    ["12:00", "13:00", "Lunch", "lunch"],
    ["13:00", "14:30", "Integrated Utilities Review & Final P&ID Assessment", "activity"],
    ["14:30", "14:45", "Break", "break"],
    ["14:45", "16:00", "Structured Troubleshooting & Final Assessment", "session"],
  ]),
};

export const days: DayPlan[] = dayDefs.map((d) => ({
  id: d.id,
  dayNumber: d.dayNumber,
  title: d.title,
  focus: d.focus,
  description: d.description,
  objectives: d.objectives,
  topicIds: d.topicSlugs.map((s) => topicIdBySlug[s]),
  schedule: scheduleByDay[d.id],
}));

// ---- Activities ----
interface ActivitySeed {
  title: string;
  activityType: ActivityType;
  objective: string;
  duration: number;
  groupSize: string;
  instructions: string;
  instructorNotes: string;
  requiredResources: string;
  expectedAnswer: string;
  slot: 'knowledge-check' | 'pid-process' | 'troubleshooting';
  topicSlug?: string;
}

const activityDefsByDay: Record<string, ActivitySeed[]> = {
  "day-1": [
    {
      title: "PFD/P&ID Reading Fundamentals",
      activityType: "Equipment Identification" as ActivityType,
      objective: "Build confidence reading process flow diagrams and P&ID symbols before tackling full utility system drawings.",
      duration: 20,
      groupSize: "Individual or pairs",
      instructions: "<p>Using a simplified symbol legend and a marked-up P&ID excerpt, identify the equipment types, line types and instrument tags shown.</p>",
      instructorNotes: "Keep pace slow — many trainees have limited prior P&ID exposure. Use the Breathing Air System P&ID as the first example since it is compact and clearly laid out.",
      requiredResources: "Symbol legend handout, Breathing Air System P&ID",
      expectedAnswer: "Correct equipment/instrument identification matching the legend key — see facilitation guide answer key.",
      slot: "knowledge-check",
      topicSlug: "breathing-air-system",
    },
    {
      title: "Utility Dependency & Duty/Standby Tracing",
      activityType: "P&ID Tracing" as ActivityType,
      objective: "Trace duty/standby pump and blower arrangements and identify which downstream users depend on each utility.",
      duration: 30,
      groupSize: "Groups of 3-4",
      instructions: "<p>Using the Chilled Water System and Combustion Air Blower/Air Preheater P&IDs, trace the duty/standby equipment and mark every downstream connection each utility supports.</p>",
      instructorNotes: "Emphasize that loss of a utility with no available standby can impact multiple downstream systems at once — this sets up the Day 5 integration discussion.",
      requiredResources: "Chilled Water System P&ID, Combustion Air Blower & Air Preheater P&ID",
      expectedAnswer: "Correctly marked duty/standby pairs and a complete downstream dependency list matching the reference diagram.",
      slot: "pid-process",
      topicSlug: "chilled-water-system",
    },
    {
      title: "Combustion-Air Low-Flow Scenario",
      activityType: "Troubleshooting Scenario" as ActivityType,
      objective: "Diagnose a simulated low combustion-air flow / high air preheater outlet temperature scenario.",
      duration: 25,
      groupSize: "Groups of 3-4",
      instructions: "<p>Given a scenario card describing a falling FD fan flow reading and a rising air preheater outlet temperature, identify the most likely causes and the checks you would perform, in order.</p>",
      instructorNotes: "Reinforce a logical fault-finding sequence: verify the instrument reading first, then check fan/damper status, then filter differential pressure, then preheater fouling.",
      requiredResources: "Scenario card, Combustion Air Blower & Air Preheater P&ID",
      expectedAnswer: "Verify FD fan running/damper position → check inlet filter DP → check air preheater fouling/leakage → confirm instrumentation is reading correctly.",
      slot: "troubleshooting",
      topicSlug: "combustion-air-blower-air-preheater",
    },
  ],
  "day-2": [
    {
      title: "Water-to-Steam Cycle Knowledge Check",
      activityType: "Quick Quiz" as ActivityType,
      objective: "Reinforce understanding of the path water takes from treatment through demineralization to steam generation and back as condensate.",
      duration: 15,
      groupSize: "Individual",
      instructions: "<p>Complete the short knowledge-check on demineralized water quality requirements and the steam/condensate cycle.</p>",
      instructorNotes: "Use as a quick pulse-check before the main P&ID trace activity.",
      requiredResources: "Knowledge-check worksheet",
      expectedAnswer: "See facilitation guide answer key.",
      slot: "knowledge-check",
      topicSlug: "steam-condensate-system",
    },
    {
      title: "Water-to-Steam Cycle P&ID Trace",
      activityType: "P&ID Tracing" as ActivityType,
      objective: "Trace the complete water-to-steam path: utility/potable water → demineralization → boiler feedwater → package boiler/WHB → steam header → condensate return → blowdown.",
      duration: 35,
      groupSize: "Groups of 3-4",
      instructions: "<p>Using the linked set of P&IDs, trace and highlight the full water-to-steam-to-condensate loop, marking every blowdown takeoff point along the way.</p>",
      instructorNotes: "This is the day's centerpiece activity — allow extra time and circulate to check groups are tracing the correct line, not an adjacent system.",
      requiredResources: "Utility & Potable Water P&ID, Demineralization Package P&ID, Steam & Condensate System P&ID, Package Boiler/WHB/Blowdown P&ID",
      expectedAnswer: "Complete traced loop matching the reference diagram, with blowdown takeoffs correctly marked.",
      slot: "pid-process",
      topicSlug: "package-boiler-whb-blowdown",
    },
    {
      title: "Drum Level Swell/Shrink vs. Real Inventory Change",
      activityType: "Troubleshooting Scenario" as ActivityType,
      objective: "Distinguish a false drum-level indication caused by swell/shrink from a genuine boiler feedwater inventory change.",
      duration: 25,
      groupSize: "Groups of 3-4",
      instructions: "<p>Given a scenario card describing a sudden steam demand increase and the resulting drum level behavior, decide whether this is swell/shrink or a real level change, and what action (if any) should be taken.</p>",
      instructorNotes: "A classic and important boiler-operator judgment call — stress \"do not react to level alone; check firing rate and feedwater flow trend together.\"",
      requiredResources: "Scenario card, boiler drum level trend chart handout",
      expectedAnswer: "Rapid load-change level swing consistent with shrink/swell — confirm using the steam-flow / feedwater-flow trend before adjusting feedwater control.",
      slot: "troubleshooting",
      topicSlug: "package-boiler-whb-blowdown",
    },
  ],
  "day-3": [
    {
      title: "Filter ΔP Trend Exercise",
      activityType: "Troubleshooting Scenario" as ActivityType,
      objective: "Interpret a lean solvent filter differential-pressure trend and decide on the correct operational response.",
      duration: 20,
      groupSize: "Individual or pairs",
      instructions: "<p>Given a DP trend chart, decide whether the pattern indicates normal gradual fouling or an abnormal rapid-fouling event, and state the action you would take.</p>",
      instructorNotes: "Highlight the difference between a slow, near-linear DP rise (normal) and a step or fast rise (upstream problem).",
      requiredResources: "Filter DP trend chart handout",
      expectedAnswer: "Normal fouling = gradual near-linear rise; abnormal = rapid or step rise requiring investigation and likely filter changeover.",
      slot: "knowledge-check",
      topicSlug: "lean-solvent-filtration-package",
    },
    {
      title: "Amine / DGA-HP Converter Flow Trace",
      activityType: "P&ID Tracing" as ActivityType,
      objective: "Trace the lean/rich amine circulation loop together with the DGA reclaimer and HP converter slipstream tie-ins.",
      duration: 30,
      groupSize: "Groups of 3-4",
      instructions: "<p>Trace the full amine loop on the combined P&ID and mark exactly where the reclaiming and filtration slipstreams are drawn from and returned to.</p>",
      instructorNotes: "Slipstream tie-in points are a common point of confusion — check groups carefully before moving on.",
      requiredResources: "Lean Solvent Filtration Package P&ID, DGA Reclaimer & HP Converter P&ID",
      expectedAnswer: "Correctly traced loop with slipstream tie-ins matching the reference diagram.",
      slot: "pid-process",
      topicSlug: "dga-reclaimer-hp-converter",
    },
    {
      title: "Gas-Treatment System Dependency Workshop",
      activityType: "Group Discussion" as ActivityType,
      objective: "Discuss how loss of lean solvent filtration or reclaiming affects downstream amine system performance and gas-treating quality.",
      duration: 25,
      groupSize: "Groups of 4-5",
      instructions: "<p>Using a system-dependency diagram, identify the knock-on effects of degraded filtration or reclaiming on foaming, corrosion and treated-gas quality.</p>",
      instructorNotes: "Connect back to safety — amine foaming and off-spec treated gas both carry operational and safety consequences.",
      requiredResources: "System-dependency diagram",
      expectedAnswer: "Open discussion — assess participation and technical accuracy against the facilitation guide talking points.",
      slot: "troubleshooting",
      topicSlug: "dga-reclaimer-hp-converter",
    },
  ],
  "day-4": [
    {
      title: "Pre-Visit Learning Objectives & Safety Briefing Review",
      activityType: "Group Discussion" as ActivityType,
      objective: "Confirm trainees understand the visit objectives, PPE requirements, and permit-to-work / H2S monitoring rules before entering the plant.",
      duration: 20,
      groupSize: "Whole class",
      instructions: "<p>Instructor-led review of the visit objectives and site safety rules. Every trainee must confirm understanding and ask any questions before departure.</p>",
      instructorNotes: "This briefing is mandatory — do not proceed to the walkthrough until every trainee confirms PPE and personal H2S monitor issue/function check.",
      requiredResources: "Visit safety briefing sheet, personal H2S monitors",
      expectedAnswer: "All trainees can state the visit objectives and the site H2S/permit-to-work rules before departure.",
      slot: "knowledge-check",
      topicSlug: "sour-water-stripper",
    },
    {
      title: "Guided Plant Operations Observation",
      activityType: "Equipment Identification" as ActivityType,
      objective: "Observe and record real sour water stripper and sulphur rundown/degassing equipment, correlating field observations with the P&IDs studied in class.",
      duration: 90,
      groupSize: "Small groups with guide",
      instructions: "<p>During the guided walkthrough, complete the observation worksheet: identify key equipment, instrumentation and safety devices, and note any differences from the classroom P&IDs.</p>",
      instructorNotes: "Coordinate closely with the site guide/supervisor. Trainees must stay within the designated escorted route at all times.",
      requiredResources: "Observation worksheet, Sour Water Stripper P&ID, Sulphur Rundown & Degassing P&ID",
      expectedAnswer: "Completed worksheet with equipment correctly identified and matched to P&ID tags.",
      slot: "pid-process",
      topicSlug: "sulphur-rundown-degassing",
    },
    {
      title: "Post-Visit Debrief & P&ID Comparison",
      activityType: "Group Discussion" as ActivityType,
      objective: "Consolidate field observations by comparing them against the classroom P&IDs and discussing operational insights gained.",
      duration: 30,
      groupSize: "Whole class",
      instructions: "<p>Share your field observations, point out any P&ID discrepancies noted, and discuss operational insights from the visit.</p>",
      instructorNotes: "Log any genuine discrepancies for the training coordinator to review against site documentation control — reinforce the \"Training P&ID — verify against approved plant documentation\" principle.",
      requiredResources: "Completed observation worksheets",
      expectedAnswer: "Open discussion — assess the quality of observations and comparison accuracy.",
      slot: "troubleshooting",
      topicSlug: "sulphur-rundown-degassing",
    },
  ],
  "day-5": [
    {
      title: "Common Startup & Shutdown Philosophy — the S.T.A.R.T. Framework",
      activityType: "Startup Sequencing" as ActivityType,
      objective: "Apply a structured, transferable readiness framework to startup/shutdown of any system covered during the week.",
      duration: 25,
      groupSize: "Groups of 3-4",
      instructions: "<p>Review the S.T.A.R.T. readiness framework, then apply it to a system of the instructor's choosing:</p><ul><li><strong>S — Safety:</strong> area and equipment are safe; hazards and work status are understood.</li><li><strong>T — Tools / Documents:</strong> correct SOP, permits, drawings and communication means are available.</li><li><strong>A — Availability:</strong> required utilities, equipment and standby capacity are available.</li><li><strong>R — Ready / Line-up:</strong> valves, drains, vents, equipment and process path are correctly lined up.</li><li><strong>T — Test Controls &amp; Protection:</strong> controls, alarms, interlocks and protective systems are available as required.</li></ul>",
      instructorNotes: "This framework supports operator thinking and does not replace the approved plant startup/shutdown procedure.",
      requiredResources: "S.T.A.R.T. framework handout",
      expectedAnswer: "Trainees can state each letter of S.T.A.R.T. and give a concrete example check for each, for the assigned system.",
      slot: "knowledge-check",
    },
    {
      title: "Structured Troubleshooting — DETECT, CONFIRM, ASSESS, STABILIZE, DIAGNOSE, RECOVER",
      activityType: "Fault Finding" as ActivityType,
      objective: "Apply the six-step structured troubleshooting method to a developing utility upset.",
      duration: 30,
      groupSize: "Groups of 3-4",
      instructions: "<p>Apply the six-step method to the instructor's sample scenario:</p><ol><li><strong>DETECT</strong> — What changed? Identify the alarm, trend or field observation.</li><li><strong>CONFIRM</strong> — Is the indication genuine? Confirm with an independent indication.</li><li><strong>ASSESS</strong> — What personnel, equipment or process is at risk? Set priorities.</li><li><strong>STABILIZE</strong> — Take safe immediate action to prevent escalation.</li><li><strong>DIAGNOSE</strong> — Identify the most likely cause from available evidence.</li><li><strong>RECOVER</strong> — Restore the system safely to normal operation using approved procedures.</li></ol>",
      instructorNotes: "Emphasize STABILIZE before DIAGNOSE — protect the plant and people first, find the root cause second.",
      requiredResources: "Structured troubleshooting framework handout",
      expectedAnswer: "Trainees correctly sequence the six steps and apply each one to the sample scenario.",
      slot: "pid-process",
    },
    {
      title: "Final Integrated Control-Room Scenario",
      activityType: "Fault Finding" as ActivityType,
      objective: "Apply integrated knowledge of all systems covered during the week to a cascading multi-system upset, working in role as Control Room Operator, Field Operator and Shift Supervisor.",
      duration: 45,
      groupSize: "Groups of 3-4 (assign roles)",
      instructions: "<p>Working through the developing event timeline below, prioritize alarms, identify system relationships, request field verification, protect critical users, stabilize affected systems and propose a safe recovery plan. Teams act as Control Room Operator, Field Operator and Shift Supervisor.</p><table><tbody><tr><th>Time</th><th>Developing Event</th></tr><tr><td>09:15</td><td>Utility-water header pressure begins falling.</td></tr><tr><td>09:18</td><td>Standby pump fails to auto-start.</td></tr><tr><td>09:22</td><td>DM-water storage level begins decreasing.</td></tr><tr><td>09:27</td><td>Package-boiler feedwater make-up becomes unstable.</td></tr><tr><td>09:32</td><td>Steam-header pressure starts falling.</td></tr><tr><td>09:37</td><td>Sour-water stripper reboiler duty decreases.</td></tr></tbody></table>",
      instructorNotes: "This is the capstone activity — allow the full time, and follow immediately with the Final Assessment quiz.",
      requiredResources: "Master utility interconnection diagram, developing-event timeline handout",
      expectedAnswer: "Graded against the facilitation guide answer key — correct identification of the cascading utility-water → DM-water → boiler feedwater → steam → sour water stripper reboiler chain, and a prioritized, safety-first recovery plan.",
      slot: "troubleshooting",
    },
  ],
};

export const activities: Activity[] = Object.entries(activityDefsByDay).flatMap(([dayId, acts]) =>
  acts.map((a, idx) => ({
    id: `activity-${dayId}-${idx}`,
    title: a.title,
    objective: a.objective,
    activityType: a.activityType,
    dayId,
    topicId: a.topicSlug ? topicIdBySlug[a.topicSlug] : null,
    duration: a.duration,
    groupSize: a.groupSize,
    instructions: a.instructions,
    instructorNotes: a.instructorNotes,
    requiredResources: a.requiredResources,
    expectedAnswer: a.expectedAnswer,
    order: idx,
    slot: a.slot,
  }))
);

// ---- Quizzes ----
function q(question: string, options: [string, string, string, string], correctIndex: 0 | 1 | 2 | 3, explanation: string): QuizQuestion {
  return { id: uuidv4(), question, options, correctIndex, explanation };
}

const dailyQuizQuestions: Record<string, QuizQuestion[]> = {
  "day-1": [
    q("What is the primary purpose of the breathing air CO monitor?", ["To measure air humidity", "To detect carbon monoxide contamination before it reaches the user", "To control compressor speed", "To measure air temperature"], 1, "The CO monitor protects personnel by ensuring breathing air quality remains within safe limits before it reaches a connected user."),
    q("What is the main purpose of the chilled water system?", ["To generate steam", "To supply cooling to process coolers and HVAC/instrument loads", "To treat raw water", "To store sulphur"], 1, "Chilled water is circulated to process heat exchangers and HVAC/instrument cooling loads that need temperatures below normal cooling-water supply."),
    q("Why are combustion air blowers and the air preheater important for fired equipment?", ["They only reduce noise", "They supply and pre-heat combustion air to improve efficiency and support safe, complete combustion", "They generate electrical power", "They are used only during shutdown"], 1, "Preheating combustion air recovers waste heat and improves combustion efficiency, while adequate air flow is essential for safe, complete combustion."),
  ],
  "day-2": [
    q("Demineralized water is primarily produced for which use?", ["Drinking water supply", "Fire-fighting water", "Boiler feedwater makeup", "Cooling tower makeup only"], 2, "Demineralization removes dissolved minerals to prevent scale and corrosion in boiler feedwater systems."),
    q("What is the purpose of a steam trap in the condensate system?", ["To increase steam pressure", "To drain condensate while preventing live steam from passing through", "To measure steam flow", "To generate electricity"], 1, "Steam traps discharge condensate and non-condensable gases from steam lines/equipment while blocking the passage of live steam."),
    q("Continuous boiler blowdown is taken from where in the drum?", ["The bottom (mud drum)", "The steam outlet nozzle", "The water surface, where dissolved-solids concentration is highest", "The feedwater inlet"], 2, "Continuous blowdown draws from the surface where dissolved solids concentrate, controlling boiler water TDS."),
  ],
  "day-3": [
    q("What is the main function of the lean solvent filtration package?", ["Heating the amine", "Removing particulates and hydrocarbon contaminants to reduce fouling and foaming", "Increasing amine concentration", "Generating steam"], 1, "Filtration protects downstream trays/packing and reduces foaming tendency by removing solids and hydrocarbons from the circulating amine."),
    q("What does the DGA reclaimer primarily remove from circulating amine?", ["Water only", "Heat-stable salts and degradation products", "Nitrogen", "Steam"], 1, "The reclaimer removes heat-stable salts (HSS) and degradation products that reduce amine acid-gas pickup capacity."),
  ],
  "day-4": [
    q("Why is the Sour Water Stripper Unit considered an H2S-critical system?", ["It produces only clean water with no hazards", "It strips concentrated H2S from sour water, requiring strict gas-testing and permit-to-work controls", "It has no pressure", "It only operates in winter"], 1, "The SWSU handles concentrated H2S removal, making atmospheric monitoring and strict permit-to-work controls essential."),
    q("What is the purpose of the degassing contactor in sulphur handling?", ["To cool the sulphur rapidly", "To remove dissolved/entrained H2S from liquid sulphur before storage/shipment", "To add color to the sulphur", "To increase sulphur pressure"], 1, "Degassing reduces dissolved H2S to safe levels before the sulphur is stored or loaded, preventing H2S release during handling."),
  ],
  "day-5": [
    q("Why must oily, chemical, sanitary and storm water streams be kept segregated in wastewater collection?", ["To save on piping costs", "To prevent cross-contamination and allow each stream to receive the correct treatment", "It is not required", "To allow different pump speeds"], 1, "Segregating waste streams prevents cross-contamination and ensures each stream reaches the treatment process suited to it."),
    q("What is the purpose of an equalization stage at the start of wastewater treatment?", ["To add chlorine", "To balance flow and load variations before downstream treatment", "To generate biogas", "To heat the wastewater"], 1, "Equalization smooths out flow and concentration variability, protecting downstream treatment stages from shock loading."),
    q("In the structured troubleshooting method, what should always happen before DIAGNOSE?", ["RECOVER", "STABILIZE", "Nothing — DIAGNOSE always comes first", "Shift handover"], 1, "STABILIZE (taking safe immediate action to prevent escalation) comes before DIAGNOSE — protect the plant and people first, find the root cause second."),
  ],
};

const initialAssessmentQuestions: QuizQuestion[] = [
  q("What does \"PTW\" stand for in plant operations?", ["Plant Testing Window", "Permit to Work", "Process Training Worksheet", "Pressure Test Warning"], 1, "PTW (Permit to Work) is the formal system authorizing and controlling work activities to manage hazards."),
  q("What is the purpose of LOTO (Lockout-Tagout)?", ["To label equipment for inventory", "To isolate and control hazardous energy sources during maintenance", "To schedule production", "To track training records"], 1, "LOTO ensures hazardous energy sources are isolated and cannot be re-energized while personnel are exposed."),
  q("Which utility system in this course is most directly linked to respiratory protection?", ["Chilled water system", "Breathing air system", "Boiler blowdown", "Wastewater treatment"], 1, "The breathing air system supplies certified air for respiratory protection equipment used in hazardous atmospheres."),
  q("What does a Job Safety Analysis (JSA) primarily identify?", ["Equipment purchase costs", "Step-by-step task hazards and controls", "Shift schedules", "Training certificates"], 1, "A JSA breaks a task into steps and identifies hazards and controls for each step before work begins."),
];

const finalAssessmentQuestions: QuizQuestion[] = [
  ...dailyQuizQuestions['day-1'],
  ...dailyQuizQuestions['day-2'],
  ...dailyQuizQuestions['day-3'],
  ...dailyQuizQuestions['day-4'],
  ...dailyQuizQuestions['day-5'],
].map((question) => ({ ...question, id: uuidv4() }));

export const quizzes: Quiz[] = [
  {
    id: 'quiz-initial-assessment',
    title: 'Initial Assessment — Pre-Course Placement Test',
    kind: 'initial-assessment',
    dayId: null,
    topicId: null,
    questions: initialAssessmentQuestions,
  },
  ...Object.entries(dailyQuizQuestions).map(([dayId, questions]) => ({
    id: `quiz-${dayId}-review`,
    title: `${days.find((d) => d.id === dayId)?.title.split('—')[1]?.trim() ?? dayId} — Daily Review Quiz`,
    kind: 'daily-review' as const,
    dayId,
    topicId: null,
    questions,
  })),
  {
    id: 'quiz-final-assessment',
    title: 'Final Assessment — Full Course Review',
    kind: 'final-assessment',
    dayId: null,
    topicId: null,
    questions: finalAssessmentQuestions,
  },
];
// ---- Resources ----
function placeholderResource(
  title: string,
  resourceType: Resource['resourceType'],
  dayId: string | null,
  topicId: string | null,
  order: number
): Resource {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title,
    description: '',
    fileName: '',
    blobKey: null,
    externalUrl: null,
    mimeType: '',
    size: 0,
    resourceType,
    topicId,
    dayId,
    thumbnail: null,
    order,
    createdAt: now,
    updatedAt: now,
  };
}

function bundledResource(
  title: string,
  resourceType: Resource['resourceType'],
  dayId: string | null,
  topicId: string | null,
  order: number,
  externalUrl: string,
  mimeType: string,
  fileName: string,
  description: string
): Resource {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title,
    description,
    fileName,
    blobKey: null,
    externalUrl,
    mimeType,
    size: 0,
    resourceType,
    topicId,
    dayId,
    thumbnail: null,
    order,
    createdAt: now,
    updatedAt: now,
  };
}

export const resources: Resource[] = topics.flatMap((t, i) => {
  const base = i * 5;
  const list: Resource[] = [];
  switch (t.slug) {
    case "breathing-air-system":
      list.push(bundledResource("Breathing Air System — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/breathing-air-system.jpg", "image/jpeg", "breathing-air-system.jpg", "Official course handout poster for Breathing Air System."));
      list.push(bundledResource("Breathing Air System — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/breathing-air-system.jpg", "image/jpeg", "breathing-air-system.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
    case "chilled-water-system":
      list.push(bundledResource("Chilled Water System — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/chilled-water-system.png", "image/png", "chilled-water-system.png", "Official course handout poster for Chilled Water System."));
      list.push(bundledResource("Chilled Water System — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/chilled-water-system.jpg", "image/jpeg", "chilled-water-system.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
    case "combustion-air-blower-air-preheater":
      list.push(bundledResource("Combustion Air Blowers & Air Preheater — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/combustion-air-blower-air-preheater.jpg", "image/jpeg", "combustion-air-blower-air-preheater.jpg", "Official course handout poster for Combustion Air Blowers & Air Preheater."));
      list.push(bundledResource("Combustion Air Blowers & Air Preheater — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/combustion-air-blower-air-preheater.jpg", "image/jpeg", "combustion-air-blower-air-preheater.jpg", "Training P&ID — verify against approved plant documentation."));
      list.push(bundledResource("Combustion Air Blowers & Air Preheater — Controls P&ID", 'pid', t.dayId, t.id, base + 4, "/media/pids/combustion-air-blower-air-preheater-controls.jpg", "image/jpeg", "combustion-air-blower-air-preheater-controls.jpg", "Training P&ID (controls detail) — verify against approved plant documentation."));
      break;
    case "utility-potable-water":
      list.push(placeholderResource("Utility & Potable Water — Handout Poster", 'handout', t.dayId, t.id, base + 0));
      list.push(bundledResource("Utility & Potable Water — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/utility-potable-water.png", "image/png", "utility-potable-water.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "demineralization-package":
      list.push(bundledResource("Demineralization Package — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/demineralization-package.jpg", "image/jpeg", "demineralization-package.jpg", "Official course handout poster for Demineralization Package."));
      list.push(bundledResource("Demineralization Package — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/demineralization-package.png", "image/png", "demineralization-package.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "steam-condensate-system":
      list.push(bundledResource("Steam & Condensate System — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/steam-condensate-system.jpg", "image/jpeg", "steam-condensate-system.jpg", "Official course handout poster for Steam & Condensate System."));
      list.push(bundledResource("Steam & Condensate System — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/steam-condensate-system.png", "image/png", "steam-condensate-system.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "package-boiler-whb-blowdown":
      list.push(bundledResource("Package Boiler, Waste Heat Boiler & Blowdown — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/package-boiler-whb-blowdown.png", "image/png", "package-boiler-whb-blowdown.png", "Official course handout poster for Package Boiler, Waste Heat Boiler & Blowdown."));
      list.push(bundledResource("Package Boiler, Waste Heat Boiler & Blowdown — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/package-boiler-whb-blowdown.jpg", "image/jpeg", "package-boiler-whb-blowdown.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
    case "lean-solvent-filtration-package":
      list.push(bundledResource("Lean Solvent Filtration Package — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/lean-solvent-filtration-package.jpg", "image/jpeg", "lean-solvent-filtration-package.jpg", "Official course handout poster for Lean Solvent Filtration Package."));
      list.push(bundledResource("Lean Solvent Filtration Package — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/lean-solvent-filtration-package.jpg", "image/jpeg", "lean-solvent-filtration-package.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
    case "dga-reclaimer-hp-converter":
      list.push(placeholderResource("DGA Reclaimer & HP Converter — Handout Poster", 'handout', t.dayId, t.id, base + 0));
      list.push(bundledResource("DGA Reclaimer & HP Converter — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/dga-reclaimer-hp-converter.png", "image/png", "dga-reclaimer-hp-converter.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "sour-water-stripper":
      list.push(placeholderResource("Sour Water Stripper Unit — Handout Poster", 'handout', t.dayId, t.id, base + 0));
      list.push(bundledResource("Sour Water Stripper Unit — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/sour-water-stripper.png", "image/png", "sour-water-stripper.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "sulphur-rundown-degassing":
      list.push(bundledResource("Sulphur Rundown Vessel & Degassing Contactor — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/sulphur-rundown-degassing.jpg", "image/jpeg", "sulphur-rundown-degassing.jpg", "Official course handout poster for Sulphur Rundown Vessel & Degassing Contactor."));
      list.push(bundledResource("Sulphur Rundown Vessel & Degassing Contactor — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/sulphur-rundown-degassing.png", "image/png", "sulphur-rundown-degassing.png", "Training P&ID — verify against approved plant documentation."));
      break;
    case "wastewater-collection-transfer":
      list.push(bundledResource("Wastewater Collection & Transfer — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/wastewater-collection-transfer.jpg", "image/jpeg", "wastewater-collection-transfer.jpg", "Official course handout poster for Wastewater Collection & Transfer."));
      list.push(bundledResource("Wastewater Collection & Transfer — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/wastewater-collection-transfer.jpg", "image/jpeg", "wastewater-collection-transfer.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
    case "wastewater-treatment":
      list.push(bundledResource("Wastewater Treatment — Handout Poster", 'handout', t.dayId, t.id, base + 0, "/media/handouts/wastewater-treatment.jpg", "image/jpeg", "wastewater-treatment.jpg", "Official course handout poster for Wastewater Treatment."));
      list.push(bundledResource("Wastewater Treatment — P&ID", 'pid', t.dayId, t.id, base + 1, "/media/pids/wastewater-treatment.jpg", "image/jpeg", "wastewater-treatment.jpg", "Training P&ID — verify against approved plant documentation."));
      break;
  }
  list.push(placeholderResource(`${t.title} — Activity Worksheet`, 'worksheet', t.dayId, t.id, base + 2));
  list.push(placeholderResource(`${t.title} — Quiz Support Material`, 'quiz-support', t.dayId, t.id, base + 3));
  return list;
});
export const courseSeed: CourseData = {
  course: {
    title: 'Process Utilities & Auxiliary Support Systems Operation',
    subtitle: '5-Day Instructor-Led Technical Training Program',
    duration: '5 Days / 40 Hours',
    description:
      'A Level 1 instructor-led course covering the operation of key utility and auxiliary support systems found across oil & gas process plants — from breathing air, chilled water and combustion air, through water treatment, demineralization, steam and boiler systems, gas-treatment auxiliary packages, sour water and sulphur handling (with a guided plant visit), culminating in wastewater systems and an integrated troubleshooting and assessment day.',
    objectives:
      '<ul><li>Understand the purpose, layout and operating principles of core plant utility and support systems.</li><li>Read and trace P&IDs for each system covered.</li><li>Identify normal operating parameters and common fault conditions.</li><li>Apply the S.T.A.R.T. readiness framework and the DETECT-CONFIRM-ASSESS-STABILIZE-DIAGNOSE-RECOVER troubleshooting method.</li><li>Apply safe operating and troubleshooting practices consistent with site HSE requirements.</li></ul>',
    audience: 'Plant operations trainees, process technicians, and training coordinators at ADNOC Technical Academy.',
    courseImage: null,
    instructorName: 'Yassir',
    instructorTitle: 'Plants Operations Training — ADNOC Technical Academy',
    instructorBio: 'Instructional designer and facilitator specializing in plant operations training, digitization projects and trainee project supervision.',
    footerText: '© ADNOC Technical Academy. Training P&IDs and materials are for instructional use only — always verify against approved plant documentation.',
    location: 'Library SC-02, ADNOC Technical Academy',
    dates: 'Monday 14 – Friday 18 September 2026',
  },
  days,
  topics,
  activities,
  quizzes,
  resources,
  updatedAt: new Date().toISOString(),
};
