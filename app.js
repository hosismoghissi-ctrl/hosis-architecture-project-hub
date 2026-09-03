(function(){
"use strict";

var STAGES={
  survey:{label:"Site Survey",icon:"scan-line",description:"Existing conditions, site measurements and survey records"},
  design:{label:"Design",icon:"pen-tool",description:"Design development, revisions and approvals"},
  permit:{label:"Permit",icon:"badge-check",description:"Applications, comments and revisions"},
  tender:{label:"Tender",icon:"gavel",description:"Bidding, analysis and award"},
  construction:{label:"Construction Administration",icon:"hard-hat",description:"IFC, RFIs, submittals and changes"},
  closeout:{label:"Closeout",icon:"archive",description:"Completion, records and archive"}
};

var STAGE_ITEMS={
  design:[
    ["Design Tasks","18 of 24 complete","Ongoing","list-checks"],
    ["Client Comments","Round 03 consolidated","Reviewed","message-square-text"],
    ["Design Revisions","Revision 04 active","Ongoing","refresh-cw"],
    ["Drawing Packages","DD 90% package","Issued","files"],
    ["Consultant Coordination","M/E/S coordination","Ongoing","users-round"],
    ["Design Approvals","Client approval gate","Pending","stamp"]
  ],
  admin:[
    ["Meeting Minutes","Minutes 01–08","Current","notebook-tabs"],
    ["Project Schedule","Baseline v03","Updated","calendar-range"],
    ["Contact List","14 project contacts","Current","contact-round"],
    ["Action Items","7 open actions","Ongoing","circle-check-big"],
    ["Client Correspondence","12 logged threads","Current","mail"],
    ["Consultant Coordination","Weekly coordination","Ongoing","network"]
  ],
  permit:[
    ["Permit Application","Application record","Submitted","clipboard-check"],
    ["Required Forms","7 of 7 received","Complete","file-check-2"],
    ["Submitted Drawings","Permit set P2","Submitted","scroll-text"],
    ["City Comments","Cycle 01 comments","Received","message-circle-warning"],
    ["Response Log","5 responses prepared","Ongoing","list-tree"],
    ["Permit Status","Municipal review","Under Review","landmark"],
    ["Permit Fees","Demo fee record","Paid","badge-dollar-sign"],
    ["Revision Submissions","Revision 01","Pending","file-clock"],
    ["Permit Issued Date","Not issued","Pending","calendar-check"]
  ],
  tender:[
    ["Tender Documents","Package T1","Issued","package-open"],
    ["Addenda","Addendum 01–02","Issued","file-plus-2"],
    ["Bidders List","4 invited bidders","Active","users"],
    ["Bid Questions","9 logged questions","Closed","messages-square"],
    ["Post-Tender Clarifications","3 clarifications","Ongoing","search-check"],
    ["Tender Analysis","Comparison v02","Draft","chart-no-axes-combined"],
    ["Letter of Recommendation","Draft LOR","Pending","file-signature"],
    ["Letter of Intent","Not issued","Pending","send"],
    ["Contract","CCDC draft","Pending","handshake"],
    ["Unsuccessful Notifications","Not issued","Pending","mail-x"]
  ],
  construction:[
    ["Issued for Construction Drawings","IFC Package 01","Issued","file-badge"],
    ["Site Reviews","Site reviews 01–06","Ongoing","hard-hat"],
    ["Field Reports","FR-01 to FR-06","Current","clipboard-list"],
    ["RFIs","12 total · 3 open","Ongoing","circle-help"],
    ["Site Instructions","SI-01 to SI-04","Ongoing","clipboard-pen-line"],
    ["Change Notices","CN-01 to CN-05","Ongoing","file-warning"],
    ["Change Orders","CO-01 approved","Current","badge-dollar-sign"],
    ["Contractor Proposed Changes","2 open CPCs","Review","repeat-2"],
    ["Shop Drawings","21 total · 4 open","Ongoing","layers-3"],
    ["Submittals","16 total · 2 open","Ongoing","inbox"],
    ["Deficiency List","14 open items","Ongoing","list-x"],
    ["Construction Revisions","Revision 03","Issued","file-pen-line"]
  ],
  closeout:[
    ["Final Deficiency Review","Scheduled","Upcoming","scan-search"],
    ["Occupancy Documents","3 of 5 received","Ongoing","building-2"],
    ["Record Drawings","Consultant records","Pending","map"],
    ["As-Built Drawings","Contractor markups","Pending","ruler"],
    ["O&M Manuals","Draft manual","Review","book-open-check"],
    ["Warranty Documents","Warranty register","Ongoing","shield-check"],
    ["Consultant Closeout Letters","1 of 3 received","Ongoing","mails"],
    ["Final Completion","Not achieved","Pending","circle-check-big"],
    ["Project Archive","Archive checklist","Pending","archive"]
  ]
};

var WORKFLOW_STATUSES=["Not started","In progress","Complete","N/A"];
var DESIGN_MILESTONES=[
  ["Concept / schematic design",false], ["Cover page & drawing index",false],
  ["Site plan",true], ["Building code matrix",false], ["Existing floor plan",false],
  ["Existing reflected ceiling plan (RCP)",false], ["Demolition plan",false],
  ["Proposed floor plan",false], ["Proposed reflected ceiling plan (RCP)",false],
  ["Finish plan & finish schedule",false], ["Enlarged / partial plans",true],
  ["Door schedule & hardware",false], ["Interior elevations",true],
  ["Detail / SD drawings",false], ["Consultant backgrounds coordinated",false]
];
STAGE_ITEMS.survey=[
  ["Site visit scheduled","Confirm access, date and survey team","Not started","calendar-days"],
  ["Existing drawings collected","Record available background information","Not started","files"],
  ["Site measurements","Verify dimensions and ceiling heights","Not started","ruler"],
  ["Photographic record","Document spaces, finishes and services","Not started","camera"],
  ["Existing conditions plan","Prepare measured survey drawings","Not started","scan-line"],
  ["Services & equipment survey","Coordinate consultant observations","Not started","network"],
  ["Access & site constraints","Record access limitations and site observations","Not started","clipboard-list"],
  ["Survey report & review","Review findings before design starts","Not started","file-check-2"]
];
function workflowStatus(status){
  if(WORKFLOW_STATUSES.indexOf(status)>-1)return status;
  if(/^(complete|completed|issued|paid|closed|approved)$/i.test(status||""))return "Complete";
  if(/^(pending|upcoming|not started|draft)$/i.test(status||""))return "Not started";
  return "In progress";
}
function defaultMilestones(key){
  if(key==="design")return DESIGN_MILESTONES.map(function(x){return {id:uid("rec"),title:x[0],detail:"",status:"Not started",icon:"drafting-compass",date:"",optional:x[1]};});
  return (STAGE_ITEMS[key]||[]).map(function(x){return {id:uid("rec"),title:x[0],detail:x[1],status:workflowStatus(x[2]),icon:x[3],date:"",optional:false};});
}
function stageCompletion(project,key){
  var items=(project.stageItems[key]||[]).filter(function(x){return workflowStatus(x.status)!=="N/A";});
  var complete=items.filter(function(x){return workflowStatus(x.status)==="Complete";}).length;
  return {complete:complete,total:items.length,percent:items.length?Math.round(complete/items.length*100):0};
}

var USERS={
  maya:{name:"Maya Chen",role:"Architectural Coordinator",email:"maya@hosis.demo",initials:"MC",photo:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=84",welcome:"Keep every drawing, decision and deadline moving."},
  liam:{name:"Liam Brooks",role:"Project Technologist",email:"liam@hosis.demo",initials:"LB",photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=84",welcome:"Your coordinated project workload, in one place."},
  sofia:{name:"Sofia Martinez",role:"Project Designer",email:"sofia@hosis.demo",initials:"SM",photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1800&q=84",welcome:"Design priorities and permit deadlines, clearly organized."},
  noah:{name:"Noah Williams",role:"Senior Project Manager",email:"noah@hosis.demo",initials:"NW",photo:"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1800&q=84",welcome:"Lead the team with a clear view of every commitment."},
  amina:{name:"Amina Yusuf",role:"Interior Designer",email:"amina@hosis.demo",initials:"AY",photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=84",welcome:"Your active interiors work and next decisions."},
  ethan:{name:"Ethan Park",role:"Contract Administrator",email:"ethan@hosis.demo",initials:"EP",photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1800&q=84",welcome:"Construction actions, meetings and deadlines at a glance."},
  chloe:{name:"Chloe Martin",role:"BIM Coordinator",email:"chloe@hosis.demo",initials:"CM",photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1800&q=84",welcome:"Coordinate models, teams and upcoming deliverables."},
  daniel:{name:"Daniel Rossi",role:"Architectural Technologist",email:"daniel@hosis.demo",initials:"DR",photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=82",banner:"https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1800&q=84",welcome:"A focused view of the projects that need you next."}
};

var PERMIT_DISCIPLINES={
  architectural:{label:"Architectural",icon:"drafting-compass",prefix:"A"},
  mechanical:{label:"Mechanical",icon:"fan",prefix:"M"},
  electrical:{label:"Electrical",icon:"zap",prefix:"E"},
  structural:{label:"Structural",icon:"columns-3",prefix:"S"}
};
var DEFAULT_SETTINGS={
  organization:"Hosis Architecture",
  workspaceTitle:"Project Delivery & Coordination",
  dashboardHeading:"Project intelligence, clearly delivered.",
  dashboardSummary:"Company-wide project delivery, team workload and coordination.",
  dashboardImage:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=84",
  menuOrder:["dashboard","gallery","schedule","tasks"]
};
var DEFAULT_WORKSPACE={
  id:"hosis-architecture",
  companyHeader:{
    name:"Hosis Architecture",
    logo:"",
    banner:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=84",
    welcome:"Project intelligence, clearly delivered.",
    summary:"Company-wide project delivery, team workload and coordination.",
    accent:"#607be8"
  },
  permissions:{memberCanEditPhoto:true,memberCanEditBanner:true},
  general:{workspaceTitle:"Project Delivery & Coordination",timezone:"America/Toronto",dateFormat:"MMM D, YYYY"}
};

var DEFAULT_PROJECT_TYPES=[
  {name:"Commercial",subtypes:["Retail Store","Restaurant","Office","Shopping Centre","Showroom"]},
  {name:"Residential",subtypes:["Single Family","Townhouse","Cottage","Condominium","Apartment","Multi-Family"]},
  {name:"Retail",subtypes:[]},{name:"Office",subtypes:[]},{name:"Institutional",subtypes:[]},
  {name:"Healthcare",subtypes:["Clinic","Dental Clinic","Medical Office"]},{name:"Hospitality",subtypes:["Hotel","Restaurant"]},
  {name:"Industrial",subtypes:[]},{name:"Mixed Use",subtypes:[]},{name:"Educational",subtypes:["School","Learning Centre"]},
  {name:"Financial",subtypes:["Bank Branch","Credit Union","Financial Office"]},{name:"Government",subtypes:[]},
  {name:"Recreational",subtypes:[]},{name:"Other",subtypes:[]}
];
var EXPENSE_TYPES=["Permit Fee","Permit Revision Fee","Site Visit","Taxi / Uber","Mileage / Gas","Parking","Meal","Flight","Hotel","Printing","Courier","Consultant Fee","Miscellaneous"];
var PAYMENT_METHODS=["Company Card","Personal Card","Cash","Bank Transfer","Cheque","Other"];
var MEETING_CATEGORIES=["Internal Meeting","Client Meeting","Consultant Meeting","Site Meeting","Weekly Meeting"];

var CONSTRUCTION_REGISTERS={
  specifications:{label:"Specifications",icon:"book-open-text",prefix:"SPEC",description:"Project manual, specification sections and revisions"},
  ifc:{label:"IFC Drawings",icon:"file-badge",prefix:"IFC",description:"Issued-for-construction drawing packages"},
  siteReviews:{label:"Site Reviews",icon:"hard-hat",prefix:"SR",description:"Scheduled visits and site observations"},
  fieldReports:{label:"Field Reports",icon:"clipboard-list",prefix:"FR",description:"Architectural field review reports"},
  rfis:{label:"RFIs",icon:"circle-help",prefix:"RFI",description:"Requests for information and responses"},
  siteInstructions:{label:"Site Instructions",icon:"clipboard-pen-line",prefix:"SI",description:"Instructions issued during construction"},
  changeNotices:{label:"Change Notices",icon:"file-warning",prefix:"CN",description:"Pricing notices and proposed scope changes"},
  changeOrders:{label:"Change Orders",icon:"badge-dollar-sign",prefix:"CO",description:"Approved contract changes"},
  cpcs:{label:"Contractor Proposed Changes",icon:"repeat-2",prefix:"CPC",description:"Contractor-originated change proposals"},
  shopDrawings:{label:"Shop Drawings",icon:"layers-3",prefix:"SD",description:"Fabrication and installation submittals"},
  submittals:{label:"Submittals",icon:"inbox",prefix:"SUB",description:"Product data, samples and technical submissions"},
  deficiencies:{label:"Deficiency List",icon:"list-x",prefix:"DEF",description:"Outstanding site and completion items"}
};
var TENDER_REGISTERS={
  addenda:{label:"Addenda",icon:"file-plus-2",prefix:"ADD",description:"Issued tender revisions and clarifications"},
  questions:{label:"Tender RFIs",icon:"messages-square",prefix:"TRFI",description:"Formal bidder questions, responses and distribution record"},
  clarifications:{label:"Post-Tender Clarifications",icon:"search-check",prefix:"PTC",description:"Scope and price clarifications after closing"}
};

var INITIAL_PROJECTS=[
  {
    id:"hap-2601",number:"HAP-2601",name:"Charles Studio Workplace",address:"88 Charles Street, Toronto",type:"Office Interior",area:"18,400 sf",
    client:"Northline Workplace Group",clientPM:"Elena Ward",owner:"Crescent Urban Holdings",ownerRep:"Theo Bennett",
    architectPM:"Adrian Cole",lead:"Maya Chen",mechanical:"Aeroform Mechanical Studio",electrical:"Voltline Electrical Partners",
    structural:"FrameLab Structures",contractor:"Keystone Buildworks",status:"Construction",priority:"High",
    scope:["design","admin","permit","tender","construction","closeout"],assigned:["maya","liam"],
    summary:"A flexible two-floor workplace with adaptable meeting suites, wellness rooms and a material library.",
    image:"https://images.unsplash.com/photo-1737474707380-5ef35770d8a7?auto=format&fit=crop&w=1800&q=86",
    deadlines:[["IFC Revision 02","2026-09-03","construction"],["Site Review 07","2026-09-08","construction"],["Client Sign-off","2026-09-18","design"]],
    tasks:[["t101","Issue coordinated IFC drawing set","2026-09-03","High",false],["t102","Close mechanical ceiling comments","2026-09-01","High",false],["t103","Upload site review photographs","2026-08-31","Medium",true]],
    activity:[["IFC coordination meeting completed","2 hours ago","construction"],["Client comments added to Revision 04","Yesterday","design"],["Permit record marked issued","3 days ago","permit"]],
    documents:[["IFC Architectural Package 01","construction","PDF · 18.4 MB"],["Permit Issued Drawing Set","permit","PDF · 12.7 MB"],["Weekly Meeting Minutes 08","admin","PDF · 1.2 MB"]],
    notes:"Confirm final millwork coordination before IFC Revision 02."
  },
  {
    id:"hap-2602",number:"HAP-2602",name:"Aster Row Flagship",address:"214 Meridian Avenue, Toronto",type:"Retail Fit-Out",area:"3,250 sf",
    client:"Aster Row Retail Inc.",clientPM:"Nora Ellis",owner:"Linden Arc Properties",ownerRep:"Marcus Vale",
    architectPM:"Adrian Cole",lead:"Sofia Martinez",mechanical:"Northbeam Building Systems",electrical:"Circuit Atelier",
    structural:"Not Required",contractor:"To Be Determined",status:"Permit Review",priority:"High",
    scope:["permit"],assigned:["sofia"],
    summary:"Permit-only delivery for a fictional premium fashion flagship with new fitting rooms and storefront modifications.",
    image:"https://www.nabihafaraa.com/wp-content/uploads/2024/08/01-1-scaled.jpg",
    deadlines:[["City Response Due","2026-09-05","permit"],["Revision 01 Submission","2026-09-10","permit"]],
    tasks:[["t201","Prepare response to municipal comments","2026-09-05","High",false],["t202","Collect signed owner authorization","2026-09-02","High",false],["t203","Confirm permit fee payment","2026-08-28","Medium",true]],
    activity:[["City comments received","Today","permit"],["Required forms uploaded","2 days ago","permit"]],
    documents:[["Permit Submission P1","permit","PDF · 9.6 MB"],["Municipal Comment Letter 01","permit","PDF · 620 KB"]],
    notes:"Prototype record — all companies and contacts are fictional."
  },
  {
    id:"hap-2603",number:"HAP-2603",name:"Lumina Health Clinic",address:"37 Alderline Road, North York",type:"Healthcare Clinic",area:"7,800 sf",
    client:"Lumina Health Collective",clientPM:"Priya Nolan",owner:"Alto Grove Real Estate",ownerRep:"Wes Carter",
    architectPM:"Camille Rhodes",lead:"Maya Chen",mechanical:"Verva Mechanical Lab",electrical:"Signal North Engineering",
    structural:"Axis Grove Structures",contractor:"Not in Scope",status:"Design Development",priority:"Medium",
    scope:["design","permit"],assigned:["maya","sofia"],
    summary:"A calm outpatient clinic concept with universal treatment rooms, staff support and patient-focused wayfinding.",
    image:"https://cdn.imweb.me/upload/S20240614659c261e44a21/2c388a14438a6.png",
    deadlines:[["90% Design Package","2026-09-12","design"],["Permit Submission","2026-09-24","permit"]],
    tasks:[["t301","Coordinate imaging room requirements","2026-09-04","High",false],["t302","Update barrier-free washroom details","2026-09-08","Medium",false],["t303","Issue client comment matrix","2026-08-27","Medium",true]],
    activity:[["Design revision 03 issued","Yesterday","design"],["Electrical comments received","3 days ago","design"]],
    documents:[["Design Development Package 03","design","PDF · 14.1 MB"],["Client Comment Matrix","design","XLSX · 88 KB"]],
    notes:"Review equipment clearances before permit package begins."
  },
  {
    id:"hap-2604",number:"HAP-2604",name:"Ember & Oak Dining Room",address:"16 Foundry Lane, Toronto",type:"Restaurant",area:"4,600 sf",
    client:"Ember Table Hospitality",clientPM:"Jonah Park",owner:"Foundry Lane Ventures",ownerRep:"Amara Stone",
    architectPM:"Camille Rhodes",lead:"Liam Brooks",mechanical:"BreezeWorks Consulting",electrical:"Lumen Circuit Studio",
    structural:"FrameLab Structures",contractor:"Stonebridge Constructors",status:"Construction",priority:"High",
    scope:["permit","construction"],assigned:["liam"],
    summary:"Permit and construction administration for a fictional 110-seat restaurant with an open kitchen and cocktail lounge.",
    image:"https://img.delicious.com.au/SzFrVRKR/del/2019/11/find-your-favourites-119451-2.jpg",
    deadlines:[["RFI Response Batch","2026-09-02","construction"],["Site Review 05","2026-09-06","construction"]],
    tasks:[["t401","Respond to kitchen exhaust RFI","2026-09-02","High",false],["t402","Review custom bar shop drawings","2026-09-03","High",false],["t403","Issue field report 04","2026-08-29","Medium",true]],
    activity:[["Shop drawing SD-14 returned","4 hours ago","construction"],["Site instruction SI-03 issued","Yesterday","construction"]],
    documents:[["Issued for Construction Package","construction","PDF · 22.8 MB"],["Field Report 04","construction","PDF · 3.1 MB"]],
    notes:"Track long-lead lighting and kitchen equipment coordination."
  },
  {
    id:"hap-2605",number:"HAP-2605",name:"Harbourstone Residences",address:"402 Harbourstone Crescent, Etobicoke",type:"Multi-Residential",area:"96,000 sf",
    client:"Harbourstone Living",clientPM:"Leila Monroe",owner:"Harbourstone Development Co.",ownerRep:"Owen Hart",
    architectPM:"Adrian Cole",lead:"Maya Chen",mechanical:"Aeroform Mechanical Studio",electrical:"Gridline Energy Design",
    structural:"Monolith Structural Atelier",contractor:"CivicForm Construction",status:"Tender",priority:"Medium",
    scope:["tender","construction"],assigned:["maya"],
    summary:"Tender and construction administration for an eight-storey fictional rental community with 84 suites.",
    image:"https://hellowynd.com/cdn/shop/articles/Multi-Family_Housing.jpg?v=1697829735",
    deadlines:[["Tender Closing","2026-09-11","tender"],["Tender Analysis","2026-09-15","tender"]],
    tasks:[["t501","Issue Addendum 02","2026-09-04","High",false],["t502","Answer bidder questions batch 03","2026-09-05","Medium",false],["t503","Update bidders list","2026-08-30","Low",true]],
    activity:[["Four bidders confirmed","Today","tender"],["Addendum 01 issued","2 days ago","tender"]],
    documents:[["Tender Package T1","tender","PDF · 41.2 MB"],["Addendum 01","tender","PDF · 2.3 MB"]],
    notes:"Do not release separate prices before tender closing."
  },
  {
    id:"hap-2606",number:"HAP-2606",name:"Atlas Works Campus",address:"75 Alloy Drive, Vaughan",type:"Warehouse and Office",area:"42,500 sf",
    client:"Atlas Fulfillment Labs",clientPM:"Ethan Ray",owner:"Alloy Industrial Partners",ownerRep:"June Holloway",
    architectPM:"Camille Rhodes",lead:"Liam Brooks",mechanical:"Northbeam Building Systems",electrical:"Signal North Engineering",
    structural:"Axis Grove Structures",contractor:"Not in Scope",status:"Closeout Planning",priority:"Low",
    scope:["design","admin","closeout"],assigned:["liam","sofia"],
    summary:"A fictional warehouse and workplace campus with high-bay storage, training rooms and a daylight-focused office wing.",
    image:"https://images.squarespace-cdn.com/content/v1/5a838704cd39c35f1403ff48/1519618866792-IPX6PN6RXBX2GYFWXR5Z/Proofs_BOLE_0021.jpg?format=1500w",
    deadlines:[["Record Drawing Review","2026-09-19","closeout"],["O&M Manual Review","2026-09-25","closeout"]],
    tasks:[["t601","Compile consultant closeout letters","2026-09-16","Medium",false],["t602","Review record drawing markups","2026-09-19","Medium",false],["t603","Archive design meeting minutes","2026-08-20","Low",true]],
    activity:[["Closeout checklist created","Yesterday","closeout"],["Final design archive prepared","1 week ago","design"]],
    documents:[["Design Archive Index","design","PDF · 640 KB"],["Closeout Checklist","closeout","XLSX · 104 KB"]],
    notes:"Scope excludes Permit, Tender and Construction Administration."
  }
];

INITIAL_PROJECTS=INITIAL_PROJECTS.concat([
  {
    id:"hap-2607",number:"HAP-2607",name:"Cedar House Renewal",address:"24 Cedarvale Avenue, Toronto",type:"Residential Renovation",area:"5,900 sf",
    client:"Cedarvale Private Residence",clientPM:"Mila Hart",owner:"Private Owner",ownerRep:"Mila Hart",architectPM:"Noah Williams",lead:"Daniel Rossi",mechanical:"Airwise Engineering",electrical:"North Circuit Consulting",structural:"FrameLab Structures",contractor:"Oakridge Contracting",status:"Design Development",priority:"Medium",scope:["survey","design","permit"],assigned:["noah","daniel","chloe"],summary:"A whole-home renovation and rear addition with a new stair, daylight strategy and coordinated permit package.",image:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=86",deadlines:[["Client Design Review","2026-09-09","design"],["Permit Submission","2026-09-30","permit"]],tasks:[["t701","Resolve stair and headroom study","2026-09-06","High",false],["t702","Coordinate structural opening","2026-09-12","Medium",false]],activity:[["Site survey verified","Yesterday","survey"]],documents:[["Existing Conditions Set","survey","PDF · 8.1 MB"]],notes:"Confirm zoning review before permit submission."
  },
  {
    id:"hap-2608",number:"HAP-2608",name:"Union Market Hall",address:"310 Front Street West, Toronto",type:"Food Hall",area:"22,600 sf",
    client:"Union Market Collective",clientPM:"Grace Kim",owner:"Metro Centre Properties",ownerRep:"Leo Grant",architectPM:"Noah Williams",lead:"Amina Yusuf",mechanical:"Verva Mechanical Lab",electrical:"Voltline Electrical Partners",structural:"Axis Grove Structures",contractor:"CivicForm Construction",status:"Tender",priority:"High",scope:["design","permit","tender"],assigned:["noah","amina","ethan"],summary:"A multi-vendor food hall with shared seating, coordinated kitchen exhaust and a staged tender strategy.",image:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=86",deadlines:[["Addendum 01","2026-09-07","tender"],["Tender Closing","2026-09-18","tender"]],tasks:[["t801","Issue bidder RFI responses","2026-09-07","High",false],["t802","Confirm food-service equipment matrix","2026-09-10","High",false]],activity:[["Tender issued to five bidders","Today","tender"]],documents:[["Tender Package T1","tender","PDF · 36.4 MB"]],notes:"Separate prices required for exhaust upgrades and landlord work."
  },
  {
    id:"hap-2609",number:"HAP-2609",name:"Northpoint Learning Centre",address:"180 Finch Avenue West, North York",type:"Education",area:"14,200 sf",
    client:"Northpoint Learning Foundation",clientPM:"Sarah Nolan",owner:"Northpoint Foundation",ownerRep:"Eli Warren",architectPM:"Camille Rhodes",lead:"Chloe Martin",mechanical:"Aeroform Mechanical Studio",electrical:"Signal North Engineering",structural:"Monolith Structural Atelier",contractor:"Stonebridge Constructors",status:"Permit Review",priority:"High",scope:["survey","design","permit"],assigned:["chloe","sofia","daniel"],summary:"A learning centre conversion with classrooms, therapy rooms and an accessibility-focused permit submission.",image:"https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=86",deadlines:[["Permit Comment Response","2026-09-08","permit"]],tasks:[["t901","Complete permit response matrix","2026-09-08","High",false],["t902","Revise fire separation details","2026-09-05","High",false]],activity:[["Permit comments cycle 01 received","Today","permit"]],documents:[["Permit Submission P1","permit","PDF · 17.2 MB"]],notes:"Track each discipline response separately."
  },
  {
    id:"hap-2610",number:"HAP-2610",name:"Orchard Dental Studio",address:"600 Queen Street East, Toronto",type:"Dental Clinic",area:"4,100 sf",
    client:"Orchard Dental Group",clientPM:"Dr. Mira Patel",owner:"Riverside Retail Trust",ownerRep:"Ben Flores",architectPM:"Adrian Cole",lead:"Amina Yusuf",mechanical:"Northbeam Building Systems",electrical:"Circuit Atelier",structural:"Not Required",contractor:"Keystone Buildworks",status:"Construction",priority:"Medium",scope:["design","permit","construction"],assigned:["amina","ethan","liam"],summary:"A contemporary dental clinic with eight operatories, sterilization, imaging and coordinated clinical millwork.",image:"https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1800&q=86",deadlines:[["Millwork Shop Drawing","2026-09-04","construction"],["Site Review 03","2026-09-11","construction"]],tasks:[["t1001","Review clinical millwork shop drawings","2026-09-04","High",false],["t1002","Respond to imaging room RFI","2026-09-06","Medium",false]],activity:[["Field report 02 issued","Yesterday","construction"]],documents:[["IFC Package 01","construction","PDF · 19.8 MB"]],notes:"Coordinate equipment rough-ins before wall close-up."
  },
  {
    id:"hap-2611",number:"HAP-2611",name:"Ravel Hotel Lobby",address:"12 Wellington Street East, Toronto",type:"Hospitality",area:"9,700 sf",
    client:"Ravel Hospitality",clientPM:"Olivia Chen",owner:"Wellington Hotel Partners",ownerRep:"Mark Doyle",architectPM:"Noah Williams",lead:"Sofia Martinez",mechanical:"BreezeWorks Consulting",electrical:"Lumen Circuit Studio",structural:"FrameLab Structures",contractor:"To Be Determined",status:"Concept Design",priority:"Low",scope:["survey","design"],assigned:["noah","sofia","maya"],summary:"Lobby, bar and guest-arrival renewal with heritage-sensitive finishes and phased construction planning.",image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=86",deadlines:[["Concept Presentation","2026-09-16","design"]],tasks:[["t1101","Prepare lobby finish options","2026-09-12","Medium",false],["t1102","Complete heritage photo survey","2026-09-06","Low",false]],activity:[["Existing conditions model started","2 days ago","survey"]],documents:[["Site Survey Photo Log","survey","PDF · 24.5 MB"]],notes:"Maintain hotel operations during all future phases."
  },
  {
    id:"hap-2612",number:"HAP-2612",name:"Vector Lab Expansion",address:"90 Innovation Drive, Mississauga",type:"Laboratory",area:"31,500 sf",
    client:"Vector Biomedical",clientPM:"Amir Haddad",owner:"Innovation Campus REIT",ownerRep:"Rachel Stone",architectPM:"Camille Rhodes",lead:"Daniel Rossi",mechanical:"Precision Air Systems",electrical:"Gridline Energy Design",structural:"Axis Grove Structures",contractor:"CivicForm Construction",status:"Construction",priority:"High",scope:["design","permit","tender","construction","closeout"],assigned:["daniel","ethan","chloe","maya"],summary:"A phased laboratory expansion with controlled environments, utility coordination and active construction administration.",image:"https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1800&q=86",deadlines:[["RFI Batch 06","2026-09-03","construction"],["Commissioning Review","2026-09-22","closeout"]],tasks:[["t1201","Respond to lab gas RFI","2026-09-03","High",false],["t1202","Review cleanroom submittal","2026-09-05","High",false],["t1203","Update commissioning action list","2026-09-10","Medium",false]],activity:[["Site instruction SI-08 issued","Today","construction"]],documents:[["IFC Revision 05","construction","PDF · 44.7 MB"]],notes:"Critical schedule: coordinate all shutdowns with the client."
  }
]);

var KEY="hosisHubPrototypeV1";
var INITIAL_MEMBERS=clone(USERS);
var state=loadState();
USERS=state.members;
var currentView="dashboard";
var currentProjectId=null;
var currentDirectory="clients";
var currentCompanyKey=null;
var activeStage=null;
var adminMemberFilter=null;
var currentFilters={query:"",type:"",status:"",priority:"",user:"",high:false};
var currentProjectLifecycle="Active";
var accountingFilters={project:"",client:"",member:"",type:"",dateFrom:"",dateTo:"",payment:"",reimbursement:""};
var scopeEditingId=null;
var editContext=null;

function clone(value){return JSON.parse(JSON.stringify(value));}
function uid(prefix){return prefix+"-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function isoDate(date){return date.toISOString().slice(0,10);}
function addDays(date,days){var d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return isoDate(d);}
function defaultSchedule(project,index){
  var base=addDays("2026-01-12",index*12);
  var ranges={design:[0,96],survey:[-14,0],permit:[66,144],tender:[126,184],construction:[166,326],closeout:[306,355]};
  return project.scope.map(function(key){var r=ranges[key];return {id:uid("sch"),stage:key,start:addDays(base,r[0]),end:addDays(base,r[1]),status:r[1]<230?"Complete":"Ongoing"};});
}
function sortSchedule(project){
  var order=Object.keys(STAGES);
  project.schedule.sort(function(a,b){return order.indexOf(a.stage)-order.indexOf(b.stage);});
}
function registerRecord(prefix,number,title,status,date,due,responsible,cost){
  return {id:uid("record"),number:prefix+"-"+String(number).padStart(2,"0"),title:title,status:status||"Open",date:date||"2026-08-25",due:due||"",responsible:responsible||"Project Team",cost:cost||"",description:""};
}
function defaultConstructionRegisters(project){
  var records={};Object.keys(CONSTRUCTION_REGISTERS).forEach(function(key){records[key]=[];});
  records.specifications=[registerRecord("SPEC",1,"Project manual and architectural specifications","Issued","2026-07-18","","Architect")];
  records.ifc=[registerRecord("IFC",1,"Issued for Construction drawing package","Issued","2026-08-01","","Architect")];
  records.siteReviews=[registerRecord("SR",1,"Framing and above-ceiling review","Complete","2026-08-21","","Maya Chen")];
  records.fieldReports=[registerRecord("FR",1,"Field report — framing progress","Issued","2026-08-22","","Maya Chen")];
  records.rfis=[registerRecord("RFI",1,"Ceiling coordination at reception","Open","2026-08-26","2026-09-03","Mechanical Consultant"),registerRecord("RFI",2,"Millwork backing requirements","Closed","2026-08-20","2026-08-27","Architect")];
  records.siteInstructions=[registerRecord("SI",1,"Relocate wall-mounted device","Issued","2026-08-24","","Architect")];
  records.changeNotices=[registerRecord("CN",1,"Revised feature lighting scope","Pricing","2026-08-27","2026-09-05","General Contractor","$4,850")];
  records.changeOrders=[registerRecord("CO",1,"Approved reception millwork revision","Approved","2026-08-18","","Owner","$3,200")];
  records.cpcs=[];
  records.shopDrawings=[registerRecord("SD",1,"Custom millwork shop drawings","Revise & Resubmit","2026-08-23","2026-09-02","Millwork Subcontractor")];
  records.submittals=[registerRecord("SUB",1,"Acoustic ceiling product data","Reviewed","2026-08-19","","Architect")];
  records.deficiencies=[registerRecord("DEF",1,"Touch-up paint at corridor door frames","Open","2026-08-29","2026-09-08","General Contractor")];
  return records;
}
function defaultTenderData(project){
  return {
    phase:"Tender",
    invitationDate:"2026-08-18",
    issueDate:"2026-08-18",
    closingDate:"2026-09-11",
    closingTime:"14:00",
    siteWalkthrough:"2026-08-25",
    bidValidityDays:60,
    estimate:275000,
    bidders:[
      {id:uid("bidder"),name:"Keystone Buildworks",contact:"Jordan Lee",baseBid:286400,separatePrices:"SP-01 Lighting: $8,400; SP-02 Flooring: $12,600",alternatePrices:"ALT-01 Weekend work: +$6,200",cashAllowances:18000,unitPrices:"UP-01 GWB repair: $95/m²",scheduleWeeks:14,bond:"Included",taxIncluded:false,status:"Submitted",winner:false,notes:"Complete bid."},
      {id:uid("bidder"),name:"Stonebridge Constructors",contact:"Avery Singh",baseBid:279850,separatePrices:"SP-01 Lighting: $7,950; SP-02 Flooring: $11,900",alternatePrices:"ALT-01 Weekend work: +$5,800",cashAllowances:18000,unitPrices:"UP-01 GWB repair: $91/m²",scheduleWeeks:13,bond:"Included",taxIncluded:false,status:"Recommended",winner:true,notes:"Lowest compliant bid."},
      {id:uid("bidder"),name:"CivicForm Construction",contact:"Morgan Bell",baseBid:292100,separatePrices:"SP-01 Lighting: $8,700; SP-02 Flooring: $12,250",alternatePrices:"ALT-01 Weekend work: +$7,100",cashAllowances:18000,unitPrices:"UP-01 GWB repair: $98/m²",scheduleWeeks:15,bond:"Pending",taxIncluded:false,status:"Clarification",winner:false,notes:"Clarification required."}
    ],
    registers:{
      addenda:[registerRecord("ADD",1,"Tender Addendum 01","Issued","2026-08-28","","Architect")],
      questions:[registerRecord("TRFI",1,"Confirm after-hours working requirements","Answered","2026-08-25","2026-08-27","Architect")],
      clarifications:[registerRecord("PTC",1,"Confirm exclusions and construction duration","Open","2026-09-12","2026-09-14","Recommended Bidder")]
    }
  };
}
function permitDrawing(prefix,revision,title,status,date){
  return {id:uid("drawing"),number:prefix+"-P"+String(revision).padStart(2,"0"),title:title,revision:"P"+String(revision).padStart(2,"0"),status:status||"Submitted",date:date||"2026-08-18",notes:""};
}
function permitComment(number,discipline,comment,response,status,responseDate){
  return {id:uid("comment"),number:number,discipline:discipline,comment:comment,response:response||"",status:status||"Open",responseDate:responseDate||""};
}
function defaultPermitData(project){
  return {
    applicationNumber:"BP-2026-01482",authority:"City of Toronto",status:"Under Review",submissionDate:"2026-08-18",issuedDate:"",
    drawings:{
      architectural:[permitDrawing("A",1,"Architectural permit drawing set","Submitted","2026-08-18")],
      mechanical:[permitDrawing("M",1,"Mechanical permit drawing set","Submitted","2026-08-18")],
      electrical:[permitDrawing("E",1,"Electrical permit drawing set","Submitted","2026-08-18")],
      structural:[permitDrawing("S",1,"Structural permit drawing set","Pending","2026-08-18")]
    },
    cycles:[
      {id:uid("cycle"),number:"Cycle 01",receivedDate:"2026-08-28",responseDue:"2026-09-08",resubmittedDate:"",status:"Response in Progress",comments:[
        permitComment("A-01","architectural","Clarify barrier-free path of travel and door clearances.","Drawing A2.01 revised and response note added.","Responded","2026-09-02"),
        permitComment("M-01","mechanical","Provide exhaust and make-up air information for the service area.","Mechanical consultant response pending.","Open",""),
        permitComment("E-01","electrical","Confirm emergency lighting coverage at the exit route.","Electrical drawing E1.02 revised.","Responded","2026-09-03")
      ]}
    ]
  };
}
function defaultMeetings(project,index){
  var task=project.tasks&&project.tasks[0];
  return [{
    id:uid("meeting"),title:index%2?"Client & Consultant Coordination":"Weekly Project Coordination",
    category:index%2?"Client Meeting":"Weekly Meeting",
    date:addDays("2026-08-27",index),time:index%2?"10:30":"14:00",stage:project.scope[0],location:index%2?"Microsoft Teams":"Project Site",
    attendees:"Project team, client and consultants",notes:"Review current deliverables, decisions and outstanding coordination items.",
    actions:task?[{id:uid("action"),title:task[1],assignee:project.lead||"Project Team",due:task[2],priority:task[3],taskId:task[0]}]:[]
  }];
}
function defaultExpenses(project,index){
  var members=project.assigned||[],paidBy=members[index%Math.max(1,members.length)]||members[0]||"admin";
  var examples=[
    ["Site Visit","Construction site review travel",86.40,"2026-08-28","Parkway Parking","PK-0828","Personal Card","Paid","Pending"],
    ["Permit Fee","Municipal permit application fee",1240,"2026-08-18","City of Toronto","BP-2026-01482","Company Card","Paid","Not Required"],
    ["Printing","Permit drawing set printing",214.75,"2026-08-17","Metro Reprographics","MR-2481","Company Card","Paid","Not Required"],
    ["Taxi / Uber","Site meeting transportation",42.65,"2026-08-26","Uber","UB-826","Personal Card","Paid","Reimbursed"],
    ["Courier","Tender addendum courier",58,"2026-08-29","City Express","CE-441","Company Card","Paid","Not Required"]
  ],e=examples[index%examples.length];
  return [{id:uid("expense"),workspaceId:project.workspaceId,projectId:project.id,type:e[0],description:e[1],amount:e[2],date:e[3],paidBy:paidBy,invoiceNumber:e[5],vendor:e[4],paymentMethod:e[6],receipt:"",notes:"Hosis demo expense record.",paymentStatus:e[7],reimbursementStatus:e[8],createdBy:paidBy}];
}
function normalizeProject(project,index){
  project.workspaceId=project.workspaceId||DEFAULT_WORKSPACE.id;
  project.lifecycle=project.lifecycle==="Archived"?"Archived":"Active";
  project.typeCategory=project.typeCategory||inferProjectCategory(project.type);
  project.typeSubtype=project.typeSubtype||project.type||"";
  // Keep legacy administration records; they must not become survey evidence.
  if(project.scope.indexOf("admin")>-1){
    project.legacyAdministration=project.legacyAdministration||{stageItems:clone((project.stageItems||{}).admin||STAGE_ITEMS.admin),schedule:clone((project.schedule||[]).filter(function(s){return s.stage==="admin";}))};
    project.scope=project.scope.map(function(k){return k==="admin"?"survey":k;}).filter(function(k,i,a){return a.indexOf(k)===i;});
    if(Array.isArray(project.schedule))project.schedule=project.schedule.filter(function(s){return s.stage!=="admin";});
  }
  project.scope.sort(function(a,b){return Object.keys(STAGES).indexOf(a)-Object.keys(STAGES).indexOf(b);});
  project.assigned=Array.isArray(project.assigned)?project.assigned:[];
  project.team=Array.isArray(project.team)?project.team:[
    {id:uid("team"),role:"Client Project Manager",name:project.clientPM||"Not Assigned"},
    {id:uid("team"),role:"Owner Representative",name:project.ownerRep||"Not Assigned"},
    {id:uid("team"),role:"Architectural Project Manager",name:project.architectPM||"Not Assigned"},
    {id:uid("team"),role:"Project Lead",name:project.lead||"Not Assigned"},
    {id:uid("team"),role:"Mechanical Consultant",name:project.mechanical||"Not Assigned"},
    {id:uid("team"),role:"Electrical Consultant",name:project.electrical||"Not Assigned"},
    {id:uid("team"),role:"Structural Consultant",name:project.structural||"Not Assigned"},
    {id:uid("team"),role:"General Contractor",name:project.contractor||"Not Assigned"}
  ];
  project.schedule=Array.isArray(project.schedule)&&project.schedule.length?project.schedule:defaultSchedule(project,index);
  if(project.scope.indexOf("survey")>-1&&!project.schedule.some(function(s){return s.stage==="survey";})){
    project.schedule.unshift(defaultSchedule({scope:["survey"]},index)[0]);
  }
  sortSchedule(project);
  project.stageItems=project.stageItems||{};
  project.scope.forEach(function(key){
    if(!Array.isArray(project.stageItems[key]))project.stageItems[key]=defaultMilestones(key);
    if(!project.workflowVersion&&key==="design"){
      var existing=project.stageItems[key];
      var missing=defaultMilestones(key).filter(function(x){return !existing.some(function(y){return y.title===x.title;});});
      project.stageItems[key]=missing.concat(existing);
    }
    project.stageItems[key].forEach(function(x){if(WORKFLOW_STATUSES.indexOf(x.status)===-1)x.previousStatus=x.status;x.status=workflowStatus(x.status);});
  });
  project.workflowVersion=1;
  project.team.forEach(function(m){m.email=m.email||"";m.phone=m.phone||"";});
  if(!Array.isArray(project.companies))project.companies=[
    ["Client",project.client,project.clientPM], ["General Contractor",project.contractor,""],
    ["Mechanical Consultant",project.mechanical,""], ["Electrical Consultant",project.electrical,""],
    ["Structural Consultant",project.structural,""]
  ].filter(function(x){return x[1]&&!/^(Not Required|Not in Scope|To Be Determined)$/i.test(x[1]);}).map(function(x){return {id:uid("company"),category:x[0],name:x[1],contact:x[2]||"",email:"",phone:"",logo:""};});
  project.team.forEach(function(item){item.workspaceId=item.workspaceId||project.workspaceId;});
  project.companies.forEach(function(item){item.workspaceId=item.workspaceId||project.workspaceId;});
  project.schedule.forEach(function(item){item.workspaceId=item.workspaceId||project.workspaceId;});
  project.deadlines=Array.isArray(project.deadlines)?project.deadlines:[];
  project.tasks=Array.isArray(project.tasks)?project.tasks:[];
  project.meetings=Array.isArray(project.meetings)?project.meetings:defaultMeetings(project,index);
  project.meetings.forEach(function(meeting){
    meeting.id=meeting.id||uid("meeting");meeting.workspaceId=meeting.workspaceId||project.workspaceId;meeting.category=MEETING_CATEGORIES.indexOf(meeting.category)>-1?meeting.category:(/site/i.test(meeting.location||meeting.title)?"Site Meeting":/client/i.test(meeting.title)?"Client Meeting":"Weekly Meeting");meeting.actions=Array.isArray(meeting.actions)?meeting.actions:[];
    meeting.actions.forEach(function(action){
      var linked=action.taskId&&project.tasks.find(function(task){return task[0]===action.taskId;});
      if(!linked){action.taskId=action.taskId||uid("task");linked=[action.taskId,action.title||"Meeting action",action.due||meeting.date,action.priority||"Medium",false,{meetingId:meeting.id}];project.tasks.push(linked);}
      action.title=linked[1];action.due=linked[2];action.priority=linked[3];
    });
  });
  project.constructionRegisters=project.constructionRegisters||defaultConstructionRegisters(project);
  Object.keys(CONSTRUCTION_REGISTERS).forEach(function(key){if(!Array.isArray(project.constructionRegisters[key]))project.constructionRegisters[key]=[];});
  project.tenderData=project.tenderData||defaultTenderData(project);
  project.tenderData.bidders=Array.isArray(project.tenderData.bidders)?project.tenderData.bidders:[];
  project.tenderData.bidders.forEach(function(b){b.alternatePrices=b.alternatePrices||"";b.cashAllowances=Number(b.cashAllowances)||0;b.unitPrices=b.unitPrices||"";b.scheduleWeeks=Number(b.scheduleWeeks)||0;b.bond=b.bond||"Not recorded";b.taxIncluded=!!b.taxIncluded;});
  project.tenderData.registers=project.tenderData.registers||{};
  Object.keys(TENDER_REGISTERS).forEach(function(key){if(!Array.isArray(project.tenderData.registers[key]))project.tenderData.registers[key]=[];});
  project.permitData=project.permitData||defaultPermitData(project);
  project.permitData.drawings=project.permitData.drawings||{};
  Object.keys(PERMIT_DISCIPLINES).forEach(function(key){if(!Array.isArray(project.permitData.drawings[key]))project.permitData.drawings[key]=[];});
  project.permitData.cycles=Array.isArray(project.permitData.cycles)?project.permitData.cycles:[];
  project.permitData.cycles.forEach(function(cycle){cycle.comments=Array.isArray(cycle.comments)?cycle.comments:[];});
  project.activity=Array.isArray(project.activity)?project.activity:[];
  project.documents=Array.isArray(project.documents)?project.documents:[];
  project.expenses=Array.isArray(project.expenses)?project.expenses:defaultExpenses(project,index);
  project.expenses.forEach(function(expense){expense.id=expense.id||uid("expense");expense.workspaceId=expense.workspaceId||project.workspaceId;expense.projectId=project.id;expense.amount=Number(expense.amount)||0;expense.paymentStatus=expense.paymentStatus||"Paid";expense.reimbursementStatus=expense.reimbursementStatus||"Pending";expense.createdBy=expense.createdBy||expense.paidBy||"admin";});
  project.notes=project.notes||"";
  return project;
}
function loadState(){
  var loaded=null;
  try{loaded=JSON.parse(localStorage.getItem(KEY));}catch(e){}
  var next=loaded&&Array.isArray(loaded.projects)?loaded:{role:null,userId:null,projects:clone(INITIAL_PROJECTS)};
  INITIAL_PROJECTS.forEach(function(seed){if(!next.projects.some(function(p){return p.id===seed.id;}))next.projects.push(clone(seed));});
  next.settings=Object.assign(clone(DEFAULT_SETTINGS),next.settings||{});
  next.settings.menuOrder=(next.settings.menuOrder||[]).filter(function(key){return ["dashboard","gallery","schedule","tasks"].indexOf(key)>-1;});
  DEFAULT_SETTINGS.menuOrder.forEach(function(key){if(next.settings.menuOrder.indexOf(key)<0)next.settings.menuOrder.push(key);});
  next.workspace=next.workspace||clone(DEFAULT_WORKSPACE);
  next.workspace.companyHeader=Object.assign(clone(DEFAULT_WORKSPACE.companyHeader),next.workspace.companyHeader||{},
    {name:(next.workspace.companyHeader&&next.workspace.companyHeader.name)||next.settings.organization||DEFAULT_WORKSPACE.companyHeader.name,
     banner:(next.workspace.companyHeader&&next.workspace.companyHeader.banner)||next.settings.dashboardImage||DEFAULT_WORKSPACE.companyHeader.banner,
     welcome:(next.workspace.companyHeader&&next.workspace.companyHeader.welcome)||next.settings.dashboardHeading||DEFAULT_WORKSPACE.companyHeader.welcome,
     summary:(next.workspace.companyHeader&&next.workspace.companyHeader.summary)||next.settings.dashboardSummary||DEFAULT_WORKSPACE.companyHeader.summary});
  next.workspace.permissions=Object.assign(clone(DEFAULT_WORKSPACE.permissions),next.workspace.permissions||{});
  next.workspace.general=Object.assign(clone(DEFAULT_WORKSPACE.general),next.workspace.general||{},
    {workspaceTitle:(next.workspace.general&&next.workspace.general.workspaceTitle)||next.settings.workspaceTitle||DEFAULT_WORKSPACE.general.workspaceTitle});
  next.workspaces=Array.isArray(next.workspaces)?next.workspaces:[];
  var workspaceRecord=next.workspaces.find(function(workspace){return workspace.id===next.workspace.id;});
  if(!workspaceRecord){workspaceRecord={id:next.workspace.id};next.workspaces.push(workspaceRecord);}
  Object.assign(workspaceRecord,{name:next.workspace.companyHeader.name,logo:next.workspace.companyHeader.logo||"",accent:next.workspace.companyHeader.accent||DEFAULT_WORKSPACE.companyHeader.accent});
  next.members=Object.assign(clone(INITIAL_MEMBERS),next.members||{});
  Object.keys(next.members).forEach(function(id){
    var member=next.members[id],seed=INITIAL_MEMBERS[id]||{};
    member.name=member.name||seed.name||"Team Member";member.role=member.role||seed.role||"Project Team";member.email=member.email||seed.email||"";
    member.photo=member.photo||seed.photo||"";member.banner=member.banner||seed.banner||DEFAULT_WORKSPACE.companyHeader.banner;member.welcome=member.welcome||seed.welcome||"Your project workload, clearly organized.";member.initials=initials(member.name);member.workspaceId=member.workspaceId||next.workspace.id;
  });
  next.activeWorkspaceId=next.activeWorkspaceId||next.workspace.id;
  next.projectTypes=Array.isArray(next.projectTypes)&&next.projectTypes.length?next.projectTypes:clone(DEFAULT_PROJECT_TYPES);
  next.projectTypes.forEach(function(type){type.workspaceId=type.workspaceId||next.workspace.id;type.subtypes=Array.isArray(type.subtypes)?type.subtypes:[];});
  next.ui=next.ui||{};next.ui.scheduleScale=next.ui.scheduleScale||"Month";next.ui.projectSections=next.ui.projectSections||{};
  next.projects.forEach(normalizeProject);
  normalizeClientRegistry(next);
  next.dataSchemaVersion=4;
  return next;
}
function clientKey(name){return String(name||"").trim().replace(/\s+/g," ").toLowerCase();}
function clientIdFor(name){return "client-"+clientKey(name).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function normalizeClientRegistry(target){
  var existing=Array.isArray(target.clients)?target.clients:[],byName=new Map();existing.forEach(function(client){client.workspaceId=client.workspaceId||target.workspace.id;client.contacts=Array.isArray(client.contacts)?client.contacts:[];byName.set(clientKey(client.name),client);});
  target.projects.forEach(function(project){var key=clientKey(project.client),client=byName.get(key),record=project.companies.find(function(company){return companyDirectoryType(company)==="clients";});if(!client){client={id:clientIdFor(project.client),workspaceId:project.workspaceId,name:project.client,logo:record&&record.logo||"",contacts:[],email:record&&record.email||"",phone:record&&record.phone||"",address:record&&record.address||project.address||""};existing.push(client);byName.set(key,client);}project.clientId=client.id;if(record){if(client.logo)record.logo=client.logo;else if(record.logo)client.logo=record.logo;var contactName=record.contact||project.clientPM||"";if(contactName&&!client.contacts.some(function(contact){return clientKey(contact.name)===clientKey(contactName);})){client.contacts.push({id:uid("contact"),name:contactName,title:"Client Project Manager",email:record.email||"",phone:record.phone||""});}if(!client.email&&record.email)client.email=record.email;if(!client.phone&&record.phone)client.phone=record.phone;}});
  target.clients=existing;
}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];});}
function icon(name,cls){return '<i data-lucide="'+name+'"'+(cls?' class="'+cls+'"':'')+'></i>';}
function refreshIcons(){if(window.lucide) window.lucide.createIcons();}
function initials(name){return String(name||"NA").split(" ").map(function(x){return x.charAt(0)}).slice(0,2).join("").toUpperCase();}
function toast(message){var el=document.getElementById("toast");el.textContent=message;el.classList.add("show");setTimeout(function(){el.classList.remove("show")},2200);}
function formatDate(date){if(!date)return "No date";return new Date(date+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"});}
function inferProjectCategory(type){
  var value=String(type||"").toLowerCase();
  var match=DEFAULT_PROJECT_TYPES.find(function(group){return value.indexOf(group.name.toLowerCase())>-1||group.subtypes.some(function(subtype){return value.indexOf(subtype.toLowerCase())>-1;});});
  if(match)return match.name;
  if(/clinic|dental|medical|health/.test(value))return "Healthcare";
  if(/school|learning|education/.test(value))return "Educational";
  if(/residen|apartment|condo|townhouse|cottage/.test(value))return "Residential";
  if(/office|workplace/.test(value))return "Office";
  if(/retail|store|showroom/.test(value))return "Retail";
  return "Other";
}
function allTypes(){return Array.from(new Set(state.projects.map(function(p){return p.type}))).sort();}
function allStatuses(){return Array.from(new Set(state.projects.map(function(p){return p.status}))).sort();}
function allWorkspaceProjects(){return state.projects.filter(function(p){return p.workspaceId===state.activeWorkspaceId;});}
function visibleProjects(includeArchived){var projects=allWorkspaceProjects().filter(function(p){return state.role==="admin"||p.assigned.indexOf(state.userId)>-1;});return includeArchived?projects:projects.filter(function(p){return p.lifecycle!=="Archived";});}
function dashboardProjects(){
  if(state.role!=="admin")return visibleProjects();
  return adminMemberFilter?visibleProjects().filter(function(p){return p.assigned.indexOf(adminMemberFilter)>-1;}):visibleProjects();
}
function workspaceProjects(){return state.role==="admin"&&adminMemberFilter?dashboardProjects():visibleProjects();}
function priorityClass(value){return String(value||"Medium").toLowerCase();}
function formatCurrency(value){var number=Number(value)||0;return number.toLocaleString("en-CA",{style:"currency",currency:"CAD",minimumFractionDigits:2,maximumFractionDigits:2});}
function stageLabel(key){return STAGES[key]?STAGES[key].label:key==="admin"?"Project Administration (archived)":key;}
function projectById(id){return allWorkspaceProjects().find(function(p){return p.id===id});}
function stageProgress(project,key){
  return stageCompletion(project,key).percent;
}
var NAVIGATION_BY_ROLE={
  admin:[
    {label:"",items:[["dashboard","Dashboard","layout-dashboard"],["gallery","Projects","panels-top-left"],["schedule","Schedule","gantt-chart-square"],["tasks","Tasks","list-checks"]]},
    {label:"TEAM",items:[["members","Members","users"]]},
    {label:"CONTACTS",items:[["clients","Clients","briefcase-business"],["consultants","Consultants","users-round"],["contractors","Contractors","hard-hat"]]},
    {label:"FINANCE",items:[["accounting","Accounting","landmark"]]},
    {label:"DOCUMENTS",items:[["files","Files","folder-open"]]},
    {label:"SYSTEM",items:[["settings","Admin Settings","settings-2"]]}
  ],
  user:[
    {label:"",items:[["dashboard","Dashboard","layout-dashboard"],["gallery","My Projects","panels-top-left"],["tasks","My Tasks","list-checks"],["schedule","Schedule","gantt-chart-square"],["meetings","Meetings","calendar-clock"],["expenses","Expenses","receipt-text"],["files","Files","folder-open"]]}
  ]
};
var ACCESS_BY_ROLE={admin:["dashboard","gallery","project","schedule","tasks","members","clients","consultants","contractors","company","accounting","files","settings"],user:["dashboard","gallery","project","tasks","schedule","meetings","expenses","files"]};
function canAccessView(view){return (ACCESS_BY_ROLE[state.role]||[]).indexOf(view)>-1;}
function setNav(view){document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});}
function applyWorkspaceSettings(){
  var company=state.workspace.companyHeader,brand=document.querySelector(".sidebar-brand span:last-child strong"),brandMark=document.querySelector(".brand-mark");
  if(brand)brand.textContent=company.name.split(" ")[0].toUpperCase();
  if(brandMark)brandMark.innerHTML=company.logo?'<img src="'+esc(company.logo)+'" alt="">':icon("box");
  document.documentElement.style.setProperty("--workspace-accent",company.accent||DEFAULT_WORKSPACE.companyHeader.accent);
  document.title=company.name.toUpperCase()+" PROJECT HUB";
}
var menuDragKey=null,suppressMenuClickUntil=0;
function applyMenuOrder(){
  var nav=document.querySelector('.main-nav[aria-label="Primary"]');if(!nav)return;
  var order=state.settings.menuOrder||DEFAULT_SETTINGS.menuOrder;
  order.forEach(function(key){var item=nav.querySelector('[data-menu-key="'+key+'"]');if(item)nav.appendChild(item);});
  nav.querySelectorAll("[data-menu-key]").forEach(function(item){
    item.draggable=state.role==="admin";item.classList.toggle("menu-draggable",state.role==="admin");
    if(item.dataset.dragBound)return;item.dataset.dragBound="1";
    item.addEventListener("dragstart",function(e){if(state.role!=="admin")return;e.dataTransfer.effectAllowed="move";menuDragKey=item.dataset.menuKey;item.classList.add("dragging");});
    item.addEventListener("dragover",function(e){if(menuDragKey){e.preventDefault();e.dataTransfer.dropEffect="move";}});
    item.addEventListener("drop",function(e){e.preventDefault();if(!menuDragKey||menuDragKey===item.dataset.menuKey)return;var list=state.settings.menuOrder.slice(),from=list.indexOf(menuDragKey),to=list.indexOf(item.dataset.menuKey);list.splice(from,1);list.splice(to,0,menuDragKey);state.settings.menuOrder=list;saveState();suppressMenuClickUntil=Date.now()+300;applyMenuOrder();toast("Menu order saved");});
    item.addEventListener("dragend",function(){item.classList.remove("dragging");menuDragKey=null;});
  });
}
function bindNavigationEvents(){
  document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.addEventListener("click",function(){
    if(Date.now()<suppressMenuClickUntil||!canAccessView(b.dataset.view))return;
    currentView=b.dataset.view;currentProjectId=null;currentFilters.high=false;render();document.getElementById("sidebar").classList.remove("open");
  });});
}
function renderRoleNavigation(){
  var sections=NAVIGATION_BY_ROLE[state.role]||[],html=sections.map(function(section,index){
    var primary=index===0,items=section.items.slice();
    if(primary&&state.role==="admin")items.sort(function(a,b){return state.settings.menuOrder.indexOf(a[0])-state.settings.menuOrder.indexOf(b[0]);});
    return (section.label?'<div class="sidebar-section-label">'+section.label+'</div>':'')+'<nav class="main-nav" aria-label="'+(primary?'Primary':section.label)+'">'+items.map(function(item){return '<button class="nav-item" data-view="'+item[0]+'"'+(primary&&state.role==="admin"?' data-menu-key="'+item[0]+'"':'')+'>'+icon(item[2])+'<span>'+item[1]+'</span></button>';}).join("")+'</nav>';
  }).join("");
  document.getElementById("roleNavigation").innerHTML=html;bindNavigationEvents();applyMenuOrder();setNav(currentView);
}
function moveMenuItem(key,direction){
  var list=state.settings.menuOrder.slice(),from=list.indexOf(key),to=from+direction;if(from<0||to<0||to>=list.length)return;
  list.splice(from,1);list.splice(to,0,key);state.settings.menuOrder=list;saveState();applyMenuOrder();renderSettingsPage();toast("Menu order saved");
}

function startIntro(){
  document.addEventListener("hosis:intro:enter",function(){
    document.getElementById("welcomeTitle").focus({preventScroll:true});
  });
}
function applyRoleNavigation(user){
  renderRoleNavigation();
  document.getElementById("sidebarUserName").textContent=user.name;
  document.getElementById("sidebarRole").textContent=user.role;
  document.getElementById("sidebarInitials").textContent=user.initials;
  var photo=document.getElementById("sidebarPhoto");
  photo.hidden=!user.photo;photo.src=user.photo||"";photo.alt=user.photo?user.name:"";
  applyWorkspaceSettings();
}
function launch(role,userId){
  state.role=role;state.userId=role==="admin"?null:userId;saveState();
  document.getElementById("intro").classList.add("hidden");document.dispatchEvent(new Event("hosis:intro:closed"));document.getElementById("app").classList.remove("hidden");
  adminMemberFilter=null;
  var user=role==="admin"?{name:"Hosis Admin",role:"Administrator",initials:"HA",photo:""}:USERS[userId];
  applyRoleNavigation(user);
  currentView="dashboard";render();
}
function render(){
  if(!canAccessView(currentView)){currentView="dashboard";currentProjectId=null;}
  if(currentView==="project")renderProject(currentProjectId);
  else if(currentView==="gallery")renderGallery();
  else if(currentView==="schedule")renderSchedulePage();
  else if(currentView==="meetings")renderMeetingsPage();
  else if(currentView==="tasks")renderTasksPage();
  else if(currentView==="files")renderFilesPage();
  else if(currentView==="accounting")renderAccountingPage();
  else if(currentView==="expenses")renderExpensesPage();
  else if(currentView==="members"&&state.role==="admin")renderMembersPage();
  else if(currentView==="settings"&&state.role==="admin")renderSettingsPage();
  else if(DIRECTORIES[currentView]){currentDirectory=currentView;renderDirectory();}
  else if(currentView==="company")renderCompanyProfile();
  else renderDashboard();
  setNav(currentView==="project"?"gallery":currentView==="company"?currentDirectory:currentView);refreshIcons();document.getElementById("content").focus({preventScroll:true});
}
function setHeading(breadcrumb,title){document.getElementById("breadcrumb").textContent=breadcrumb;document.getElementById("pageTitle").textContent=title;}
function statCard(iconName,value,label){return '<div class="stat-card"><span class="stat-icon">'+icon(iconName)+'</span><strong>'+value+'</strong><small>'+esc(label)+'</small></div>';}
function memberStats(userId){
  var projects=allWorkspaceProjects().filter(function(p){return p.lifecycle!=="Archived"&&p.assigned.indexOf(userId)>-1;}),tasks=[];
  projects.forEach(function(p){p.tasks.forEach(function(t){tasks.push(t);});});
  var today=isoDate(new Date()),week=addDays(today,7);
  var deadlines=[];projects.forEach(function(p){p.deadlines.forEach(function(d){deadlines.push({project:p,title:d[0],date:d[1],stage:d[2]});});});deadlines.sort(function(a,b){return a.date.localeCompare(b.date);});
  return {projects:projects,open:tasks.filter(function(t){return !t[4];}).length,overdue:tasks.filter(function(t){return !t[4]&&t[2]<today;}).length,dueWeek:tasks.filter(function(t){return !t[4]&&t[2]>=today&&t[2]<=week;}).length,deadlines:deadlines,upcoming:deadlines.filter(function(d){return d.date>=today;})[0]||null};
}
function memberCard(userId,selected){
  var user=USERS[userId],stats=memberStats(userId);
  return '<button class="member-card'+(selected?' selected':'')+'" data-member-filter="'+userId+'" aria-pressed="'+selected+'"><span class="member-photo"><img src="'+esc(user.photo)+'" alt="'+esc(user.name)+'"></span><span class="member-card-copy"><strong>'+esc(user.name)+'</strong><small>'+esc(user.role)+'</small><span><b>'+stats.projects.length+'</b> projects <b>'+stats.open+'</b> open tasks</span></span>'+icon("arrow-up-right")+'</button>';
}
function renderMemberSwitcher(){
  if(state.role!=="admin")return '<section class="member-focus member-self"><span class="member-photo"><img src="'+esc(USERS[state.userId].photo)+'" alt=""></span><div><span class="section-kicker">MEMBER WORKSPACE</span><h2>'+esc(USERS[state.userId].name)+'</h2><p>'+esc(USERS[state.userId].role)+' · Only your assigned projects and tasks are visible.</p></div></section>';
  return '<section class="members-strip" aria-labelledby="membersStripTitle"><div class="members-strip-head"><div><span class="section-kicker">TEAM WORKSPACES</span><h2 id="membersStripTitle">Members</h2><p>Select a person to see only their assigned projects, tasks and deadlines.</p></div><button class="member-all'+(!adminMemberFilter?' selected':'')+'" data-member-filter="" aria-pressed="'+(!adminMemberFilter)+'">'+icon("building-2")+'Company View</button></div><div class="member-grid">'+Object.keys(USERS).map(function(id){return memberCard(id,adminMemberFilter===id);}).join("")+'</div></section>';
}
function bindMemberFilters(){document.querySelectorAll("[data-member-filter]").forEach(function(button){button.addEventListener("click",function(){adminMemberFilter=button.dataset.memberFilter||null;currentFilters.user="";currentFilters.high=false;currentView="dashboard";render();window.scrollTo(0,0);});});}
function renderDashboard(){
  var focusId=state.role==="admin"?adminMemberFilter:state.userId;
  if(focusId){renderMemberWorkspace(focusId);return;}
  var projects=dashboardProjects();
  var high=projects.filter(function(p){return p.priority==="High"}).length;
  var allTasks=[];projects.forEach(function(p){p.tasks.forEach(function(t){allTasks.push(t);});});
  var today=isoDate(new Date()),week=addDays(today,7);
  var open=allTasks.filter(function(t){return !t[4]}).length;
  var overdue=allTasks.filter(function(t){return !t[4]&&t[2]<today;}).length;
  var dueWeek=allTasks.filter(function(t){return !t[4]&&t[2]>=today&&t[2]<=week;}).length;
  var company=state.workspace.companyHeader;
  setHeading("Portfolio / Overview",state.workspace.general.workspaceTitle);
  var stageCounts={};Object.keys(STAGES).forEach(function(k){stageCounts[k]=projects.filter(function(p){return p.scope.indexOf(k)>-1}).length});
  var html='<section class="hero-strip dashboard-hero company-dashboard-header" style="--dashboard-image:url(\''+esc(company.banner)+'\')"><div class="company-hero-logo">'+(company.logo?'<img src="'+esc(company.logo)+'" alt="'+esc(company.name)+' logo">':icon("building-2"))+'</div><div class="hero-copy"><div class="eyebrow">'+esc(company.name.toUpperCase())+'</div><h2>'+esc(company.welcome)+'</h2><p>'+esc(company.summary)+'</p></div><div class="hero-actions"><button class="ghost-button" data-go-gallery>'+icon("panels-top-left")+'Open Projects</button><button class="ghost-button" data-edit-workspace>'+icon("settings-2")+'Admin Settings</button></div></section>'+
    '<section class="stat-grid role-stat-grid">'+statCard("building-2",projects.length,"Active Projects")+statCard("list-checks",open,"Open Tasks")+statCard("calendar-days",dueWeek,"Due This Week")+statCard("clock-alert",overdue,"Overdue Tasks")+statCard("flame",high,"High-Priority Projects")+'</section>'+
    renderTeamOverview()+
    '<div class="dashboard-grid">'+renderDashboardTasks(projects)+'<section class="panel"><div class="panel-head"><h3>Projects by Stage</h3><button data-go-gallery>Filter</button></div><div class="stage-bars">'+Object.keys(STAGES).map(function(k){var pct=projects.length?Math.round(stageCounts[k]/projects.length*100):0;return '<div><div class="stage-bar-head"><span>'+icon(STAGES[k].icon)+' '+esc(STAGES[k].label)+'</span><b>'+stageCounts[k]+'</b></div><div class="stage-track"><div class="stage-fill stage-'+k+'" style="width:'+pct+'%"></div></div></div>'}).join("")+'</div></section></div>'+
    '<div class="section-title dashboard-project-title"><div><span class="section-kicker">ACTIVE PORTFOLIO</span><h2>Projects</h2><p>'+projects.length+' projects in this workspace.</p></div><button class="secondary-button" data-go-gallery>View all projects</button></div><section class="project-grid dashboard-projects">'+projects.map(projectCard).join("")+'</section>'+
    '<section class="panel timeline-preview dashboard-schedule"><div class="panel-head"><div><h3>Project Schedule</h3><small>Stage dates and overlaps across all visible projects</small></div><button data-go-schedule>Open full timeline</button></div>'+renderTimeline(projects,true)+'</section>'+
    '';
  document.getElementById("content").innerHTML=html;bindDashboardTasks();bindMemberFilters();bindCommon();
  var editWorkspace=document.querySelector("[data-edit-workspace]");if(editWorkspace)editWorkspace.addEventListener("click",function(){openEditor(null,"settings",-1,null);});
}

function renderTeamOverview(){
  return '<section class="panel team-overview"><div class="panel-head"><div><span class="section-kicker">TEAM OVERVIEW</span><h3>Workload across the studio</h3><small>Select a member to open their complete workspace.</small></div><button data-open-members>Manage members</button></div><div class="team-overview-head"><span>Member</span><span>Active Projects</span><span>Open Tasks</span><span>Overdue Tasks</span><span>Upcoming Deadline</span></div><div class="team-overview-list">'+Object.keys(USERS).map(function(id){var user=USERS[id],stats=memberStats(id);return '<button class="team-overview-row" data-member-filter="'+id+'"><span class="team-person"><span class="member-photo"><img src="'+esc(user.photo)+'" alt=""></span><span><strong>'+esc(user.name)+'</strong><small>'+esc(user.role)+'</small></span></span><b>'+stats.projects.length+'</b><b>'+stats.open+'</b><b class="'+(stats.overdue?'metric-alert':'')+'">'+stats.overdue+'</b><span class="team-deadline">'+(stats.upcoming?'<strong>'+formatDate(stats.upcoming.date)+'</strong><small>'+esc(stats.upcoming.project.number+' · '+stats.upcoming.title)+'</small>':'<small>No upcoming deadline</small>')+'</span></button>';}).join("")+'</div></section>';
}
function renderMemberWorkspace(userId){
  var member=USERS[userId];if(!member){adminMemberFilter=null;renderDashboard();return;}
  var stats=memberStats(userId),projects=stats.projects,meetings=[],activity=[];
  projects.forEach(function(p){p.meetings.forEach(function(m){meetings.push({project:p,meeting:m});});p.activity.forEach(function(a){activity.push({project:p,item:a});});});
  meetings.sort(function(a,b){return (b.meeting.date+b.meeting.time).localeCompare(a.meeting.date+a.meeting.time);});
  setHeading(state.role==="admin"?"Members / "+member.name:"My Workspace",member.name+" · Personal Workspace");
  var canSelfEdit=state.role==="user"&&(state.workspace.permissions.memberCanEditPhoto||state.workspace.permissions.memberCanEditBanner);
  var html='<section class="member-personal-header" style="--member-banner:url(\''+esc(member.banner)+'\')"><div class="member-header-profile"><span class="member-header-photo"><img src="'+esc(member.photo)+'" alt="'+esc(member.name)+'"></span><div><span class="section-kicker">MEMBER WORKSPACE</span><h2>Welcome, '+esc(member.name.split(" ")[0])+'</h2><strong>'+esc(member.name)+'</strong><p>'+esc(member.role)+' · '+esc(member.welcome)+'</p></div></div><div class="hero-actions">'+(state.role==="admin"?'<button class="ghost-button" data-edit-member="'+userId+'">'+icon("pencil")+'Edit profile</button><button class="ghost-button" data-member-filter="">'+icon("building-2")+'Company View</button>':canSelfEdit?'<button class="ghost-button" data-edit-self>'+icon("image")+'Edit my images</button>':'')+'</div></section>'+
    '<section class="stat-grid role-stat-grid">'+statCard("building-2",projects.length,"My Projects")+statCard("list-checks",stats.open,"Open Tasks")+statCard("calendar-days",stats.dueWeek,"Due This Week")+statCard("clock-alert",stats.overdue,"Overdue Tasks")+'</section>'+
    '<div class="member-primary-section"><div class="section-title compact"><div><span class="section-kicker">PRIMARY WORKLOAD</span><h2>My Tasks Across All Projects</h2><p>Every open commitment from all assigned projects, ordered by priority and due date.</p></div></div>'+renderDashboardTasks(projects,"My Tasks Across All Projects")+'</div>'+
    '<div class="member-workspace-grid">'+renderMemberDeadlines(stats.deadlines)+renderMemberMeetings(meetings)+renderMemberActivity(activity)+'</div>'+
    '<div class="section-title dashboard-project-title"><div><span class="section-kicker">ASSIGNED PORTFOLIO</span><h2>My Projects</h2><p>'+projects.length+' projects assigned to '+esc(member.name)+'.</p></div><button class="secondary-button" data-go-gallery>View all</button></div><section class="project-grid dashboard-projects">'+projects.map(projectCard).join("")+'</section>'+
    '<section class="panel timeline-preview dashboard-schedule"><div class="panel-head"><div><h3>My Schedule</h3><small>Stage dates across all assigned projects</small></div><button data-go-schedule>Open full schedule</button></div>'+renderTimeline(projects,true)+'</section>';
  document.getElementById("content").innerHTML=html;bindDashboardTasks();bindMemberFilters();bindCommon();
  document.querySelectorAll("[data-edit-member]").forEach(function(b){b.addEventListener("click",function(){openEditor(null,"memberProfile",-1,b.dataset.editMember);});});
  var self=document.querySelector("[data-edit-self]");if(self)self.addEventListener("click",function(){openEditor(null,"memberSelf",-1,userId);});
}
function renderMemberDeadlines(deadlines){
  var today=isoDate(new Date()),upcoming=deadlines.filter(function(d){return d.date>=today;}).sort(function(a,b){return a.date.localeCompare(b.date);}).slice(0,6);
  return '<section class="panel member-summary-panel"><div class="panel-head"><div><h3>My Deadlines</h3><small>Upcoming dates across assigned projects</small></div>'+icon("calendar-days")+'</div><div class="summary-list">'+(upcoming.length?upcoming.map(function(d){return '<button data-project="'+d.project.id+'"><span><strong>'+esc(d.title)+'</strong><small>'+esc(d.project.number+' · '+d.project.name)+'</small></span><time>'+formatDate(d.date)+'</time></button>';}).join(""):'<p class="inline-empty">No deadlines recorded.</p>')+'</div></section>';
}
function renderMemberMeetings(rows){
  return '<section class="panel member-summary-panel"><div class="panel-head"><div><h3>My Meetings</h3><small>Recent and upcoming project coordination</small></div>'+icon("calendar-clock")+'</div><div class="summary-list">'+(rows.length?rows.slice(0,6).map(function(row){return '<button data-project="'+row.project.id+'"><span><strong>'+esc(row.meeting.title)+'</strong><small>'+esc((row.meeting.category||"Weekly Meeting")+' · '+row.project.number+' · '+row.meeting.location)+'</small></span><time>'+formatDate(row.meeting.date)+'</time></button>';}).join(""):'<p class="inline-empty">No meetings recorded.</p>')+'</div></section>';
}
function renderMemberActivity(rows){
  return '<section class="panel member-summary-panel"><div class="panel-head"><div><h3>My Recent Activity</h3><small>Latest updates from assigned projects</small></div>'+icon("activity")+'</div><div class="summary-list activity-summary">'+(rows.length?rows.slice(0,6).map(function(row){return '<button data-project="'+row.project.id+'"><span><strong>'+esc(row.item[0])+'</strong><small>'+esc(row.project.number+' · '+stageLabel(row.item[2]))+'</small></span><time>'+esc(row.item[1])+'</time></button>';}).join(""):'<p class="inline-empty">No recent activity.</p>')+'</div></section>';
}

function renderProjectTypeSettings(){
  return '<section id="projectTypeSettings" class="settings-section"><div class="settings-section-head"><div><span class="settings-icon">'+icon("shapes")+'</span><div><h3>Project Types & Subtypes</h3><p>Broad categories stay consistent while admins can add workspace-specific subtypes.</p></div></div><button class="primary-button" data-add-project-type>'+icon("plus")+'Add category or subtype</button></div><div class="project-type-grid">'+state.projectTypes.map(function(group){return '<article><div><strong>'+esc(group.name)+'</strong><small>'+group.subtypes.length+' subtypes</small></div><div class="type-chip-list">'+(group.subtypes.length?group.subtypes.map(function(subtype){return '<span>'+esc(subtype)+'</span>';}).join(""):'<em>No subtypes yet</em>')+'</div></article>';}).join("")+'</div></section>';
}
function renderSettingsPage(){
  setHeading("System / Admin Settings","Admin Settings");
  var company=state.workspace.companyHeader,s=state.settings,labels={dashboard:"Dashboard",gallery:"Projects",schedule:"Schedule",tasks:"Tasks"};
  var workspaceClients=state.clients.filter(function(client){return client.workspaceId===state.activeWorkspaceId;});
  var companyRecords=[];allWorkspaceProjects().forEach(function(project){project.companies.forEach(function(record,index){if(companyDirectoryType(record)!=="clients"&&record.name&&!companyRecords.some(function(x){return x.record.name===record.name;}))companyRecords.push({project:project,record:record,index:index});});});
  document.getElementById("content").innerHTML='<div class="section-title settings-title"><div><span class="section-kicker">SYSTEM</span><h2>Admin Settings</h2><p>One central place for workspace identity, member profiles and general permissions. Structured for additional settings later.</p></div></div>'+
    '<nav class="settings-index" aria-label="Settings sections"><a href="#companySettings">'+icon("building-2")+'Company</a><a href="#memberSettings">'+icon("users")+'Members</a><a href="#logoSettings">'+icon("badge")+'Company Logos</a><a href="#projectTypeSettings">'+icon("shapes")+'Project Types</a><a href="#generalSettings">'+icon("sliders-horizontal")+'General</a></nav>'+
    '<section id="companySettings" class="settings-section"><div class="settings-section-head"><div><span class="settings-icon">'+icon("building-2")+'</span><div><h3>Company Header & Branding</h3><p>Admin-only workspace identity. This never changes a member’s personal header.</p></div></div><button class="primary-button" data-edit-workspace>'+icon("pencil")+'Edit company branding</button></div><div class="brand-preview dashboard-hero" style="--dashboard-image:url(\''+esc(company.banner)+'\')"><div class="company-hero-logo">'+(company.logo?'<img src="'+esc(company.logo)+'" alt="">':icon("building-2"))+'</div><div class="hero-copy"><div class="eyebrow">'+esc(company.name.toUpperCase())+'</div><h2>'+esc(company.welcome)+'</h2><p>'+esc(company.summary)+'</p></div></div></section>'+
    '<section id="memberSettings" class="settings-section"><div class="settings-section-head"><div><span class="settings-icon">'+icon("users")+'</span><div><h3>Member Profiles & Personal Headers</h3><p>Edit profile images, personal banners, names, job titles and welcome text.</p></div></div></div><div class="settings-member-grid">'+Object.keys(USERS).map(function(id){var m=USERS[id];return '<article class="settings-member-card"><img src="'+esc(m.photo)+'" alt=""><div><strong>'+esc(m.name)+'</strong><small>'+esc(m.role)+'</small><span>'+esc(m.email)+'</span></div><button data-edit-member="'+id+'" aria-label="Edit '+esc(m.name)+'">'+icon("pencil")+'Edit</button></article>';}).join("")+'</div></section>'+
    '<section id="logoSettings" class="settings-section"><div class="settings-section-head"><div><span class="settings-icon">'+icon("badge")+'</span><div><h3>Client & Company Logos</h3><p>Reusable brand records stay scoped to this workspace and flow into client cards and project pages.</p></div></div></div><div class="company-logo-settings">'+workspaceClients.map(function(client){return '<article><div class="company-logo">'+(client.logo?'<img src="'+esc(client.logo)+'" alt="">':'<span>'+esc(initials(client.name))+'</span>')+'</div><span><strong>'+esc(client.name)+'</strong><small>Client · '+allWorkspaceProjects().filter(function(project){return project.clientId===client.id;}).length+' projects</small></span><button data-client-logo="'+client.id+'" aria-label="Edit '+esc(client.name)+' profile and logo">'+icon("image")+'Profile</button></article>';}).join("")+companyRecords.slice(0,12).map(function(x){return '<article><div class="company-logo">'+(x.record.logo?'<img src="'+esc(x.record.logo)+'" alt="">':'<span>'+esc(initials(x.record.name))+'</span>')+'</div><span><strong>'+esc(x.record.name)+'</strong><small>'+esc(x.record.category+' · '+x.project.number)+'</small></span><button data-company-logo="'+x.project.id+'" data-company-index="'+x.index+'" aria-label="Edit '+esc(x.record.name)+' logo">'+icon("image")+'Logo</button></article>';}).join("")+'</div></section>'+
    renderProjectTypeSettings()+
    '<section id="generalSettings" class="settings-section"><div class="settings-section-head"><div><span class="settings-icon">'+icon("sliders-horizontal")+'</span><div><h3>General Workspace Settings</h3><p>Workspace-level permissions and navigation layout. Members cannot change these controls.</p></div></div><button class="secondary-button" data-edit-general>'+icon("settings-2")+'Edit general settings</button></div><div class="settings-permissions"><span><b>Member profile image editing</b><small>'+(state.workspace.permissions.memberCanEditPhoto?'Allowed':'Admin only')+'</small></span><span><b>Member banner editing</b><small>'+(state.workspace.permissions.memberCanEditBanner?'Allowed':'Admin only')+'</small></span><span><b>Workspace ID</b><small>'+esc(state.workspace.id)+'</small></span></div><div class="drag-instruction">'+icon("grip-vertical")+' Admin can reorder the primary navigation. Member navigation remains role-controlled.</div><div class="menu-order-list">'+s.menuOrder.map(function(key,index){return '<div><span>'+icon("grip-vertical")+esc(labels[key])+'</span><div><button data-move-menu="'+key+'" data-direction="-1" aria-label="Move '+esc(labels[key])+' up" '+(index===0?'disabled':'')+'>'+icon("arrow-up")+'</button><button data-move-menu="'+key+'" data-direction="1" aria-label="Move '+esc(labels[key])+' down" '+(index===s.menuOrder.length-1?'disabled':'')+'>'+icon("arrow-down")+'</button></div></div>';}).join("")+'</div><div class="settings-danger"><div><strong>Reset demo workspace</strong><small>Restore the original Hosis projects, members and workspace settings.</small></div><button class="secondary-button" data-reset-demo>'+icon("rotate-ccw")+'Reset demo data</button></div></section>';
  document.querySelector("[data-edit-workspace]").addEventListener("click",function(){openEditor(null,"settings",-1,null);});
  document.querySelectorAll("[data-edit-member]").forEach(function(button){button.addEventListener("click",function(){openEditor(null,"memberProfile",-1,button.dataset.editMember);});});
  document.querySelectorAll("[data-company-logo]").forEach(function(button){button.addEventListener("click",function(){openEditor(projectById(button.dataset.companyLogo),"companyLogo",Number(button.dataset.companyIndex),null);});});
  document.querySelectorAll("[data-client-logo]").forEach(function(button){button.addEventListener("click",function(){openEditor(null,"clientProfile",-1,button.dataset.clientLogo);});});
  document.querySelector("[data-edit-general]").addEventListener("click",function(){openEditor(null,"workspaceGeneral",-1,null);});
  document.querySelector("[data-add-project-type]").addEventListener("click",function(){openEditor(null,"projectType",-1,null);});
  document.querySelector("[data-reset-demo]").addEventListener("click",resetDemoData);
  document.querySelectorAll("[data-move-menu]").forEach(function(button){button.addEventListener("click",function(){moveMenuItem(button.dataset.moveMenu,Number(button.dataset.direction));});});refreshIcons();
}
var showCompletedTasks=false;
function renderDashboardTasks(projects,title){
  var rank={High:0,Medium:1,Low:2},tasks=[];
  projects.forEach(function(p){p.tasks.forEach(function(t){tasks.push({project:p,task:t});});});
  tasks.sort(function(a,b){return (rank[a.task[3]]==null?3:rank[a.task[3]])-(rank[b.task[3]]==null?3:rank[b.task[3]])||(a.task[2]||"9999").localeCompare(b.task[2]||"9999")||a.task[1].localeCompare(b.task[1]);});
  var open=tasks.filter(function(x){return !x.task[4];}),done=tasks.filter(function(x){return x.task[4];});
  function row(x){var p=x.project,t=x.task;return '<div class="task-row dashboard-task'+(t[4]?' done':'')+'" data-priority="'+esc(t[3])+'"><button class="task-check" data-dashboard-task="'+esc(t[0])+'" data-task-project="'+esc(p.id)+'" aria-label="'+esc((t[4]?'Reopen ':'Complete ')+t[1])+'" aria-pressed="'+!!t[4]+'">'+(t[4]?icon('check'):'')+'</button><div class="dashboard-task-copy"><strong>'+esc(t[1])+'</strong><button class="task-project-link" data-project="'+esc(p.id)+'">'+esc(p.number+' · '+p.name)+'</button><small>Due '+esc(formatDate(t[2]))+'</small></div><span class="pill '+priorityClass(t[3])+'">'+esc(t[3])+'</span></div>';}
  return '<section class="panel dashboard-tasks" aria-labelledby="dashboardTasksTitle"><div class="panel-head"><div><h3 id="dashboardTasksTitle">'+esc(title||"Project Tasks")+'</h3><small>'+open.length+' open · High, Medium, Low · Earliest due first</small></div>'+icon('list-checks')+'</div><div class="task-list open-task-list">'+(open.length?open.map(row).join(''):'<p class="directory-empty">All caught up. No open tasks in your visible projects.</p>')+'</div>'+(done.length?'<details class="completed-tasks"'+(showCompletedTasks?' open':'')+'><summary>Completed tasks ('+done.length+')</summary><div class="task-list">'+done.map(row).join('')+'</div></details>':'')+'</section>';
}
function bindDashboardTasks(){
  var completed=document.querySelector('.completed-tasks');
  if(completed)completed.addEventListener('toggle',function(){showCompletedTasks=completed.open;});
  document.querySelectorAll('[data-dashboard-task]').forEach(function(b){b.addEventListener('click',function(){
    var p=visibleProjects().find(function(x){return x.id===b.dataset.taskProject;});
    var task=p&&p.tasks.find(function(t){return t[0]===b.dataset.dashboardTask;});
    if(!task)return;
    task[4]=!task[4];if(task[4])showCompletedTasks=true;saveState();render();refreshIcons();
    var next=Array.from(document.querySelectorAll('[data-dashboard-task]')).find(function(el){return el.dataset.taskProject===p.id&&el.dataset.dashboardTask===task[0];});
    if(next)next.focus({preventScroll:true});
    toast(task[4]?'Task marked complete':'Task reopened');
  });});
}

function renderTasksPage(){
  var projects=workspaceProjects(),member=state.role==="user"?USERS[state.userId]:null;
  setHeading(state.role==="admin"?"Portfolio / Tasks":"My Workspace / Tasks",state.role==="admin"?"Tasks":"My Tasks");
  document.getElementById("content").innerHTML='<div class="section-title"><div><span class="section-kicker">'+(member?'PERSONAL WORKLOAD':'PORTFOLIO WORKLOAD')+'</span><h2>'+(member?'My Tasks Across All Projects':'Tasks Across All Projects')+'</h2><p>One prioritized list across '+projects.length+' visible projects.</p></div></div>'+renderDashboardTasks(projects,member?'My Tasks Across All Projects':'Portfolio Tasks');
  bindDashboardTasks();bindCommon();
}
function renderFilesPage(){
  var projects=workspaceProjects(),rows=[];projects.forEach(function(project){project.documents.forEach(function(document){rows.push({project:project,document:document});});});
  setHeading(state.role==="admin"?"Documents / Files":"My Workspace / Files",state.role==="admin"?"Files":"My Files");
  document.getElementById("content").innerHTML='<div class="section-title"><div><span class="section-kicker">DOCUMENTS</span><h2>'+(state.role==="admin"?'Workspace Files':'My Files')+'</h2><p>Documents aggregated from every '+(state.role==="admin"?'workspace':'assigned')+' project.</p></div><span class="directory-count">'+rows.length+' files</span></div><section class="panel files-register"><div class="files-register-head"><span>Document</span><span>Project</span><span>Stage</span><span>Type / Size</span></div>'+(rows.length?rows.map(function(row){return '<button class="files-register-row" data-project="'+row.project.id+'"><span>'+icon("file-text")+'<strong>'+esc(row.document[0])+'</strong></span><span>'+esc(row.project.number+' · '+row.project.name)+'</span><span>'+esc(stageLabel(row.document[1]))+'</span><span>'+esc(row.document[2])+icon("arrow-up-right")+'</span></button>';}).join(""):'<p class="directory-empty">No files are available in the visible projects.</p>')+'</section>';
  bindCommon();
}
function allExpenseRows(){var rows=[];allWorkspaceProjects().forEach(function(project){project.expenses.forEach(function(expense,index){rows.push({project:project,expense:expense,index:index});});});return rows;}
function filterExpenseRow(row){var e=row.expense,p=row.project;return (!accountingFilters.project||p.id===accountingFilters.project)&&(!accountingFilters.client||p.client===accountingFilters.client)&&(!accountingFilters.member||e.paidBy===accountingFilters.member)&&(!accountingFilters.type||e.type===accountingFilters.type)&&(!accountingFilters.dateFrom||e.date>=accountingFilters.dateFrom)&&(!accountingFilters.dateTo||e.date<=accountingFilters.dateTo)&&(!accountingFilters.payment||e.paymentStatus===accountingFilters.payment)&&(!accountingFilters.reimbursement||e.reimbursementStatus===accountingFilters.reimbursement);}
function expenseOption(value,label,current){return '<option value="'+esc(value)+'"'+(value===current?' selected':'')+'>'+esc(label)+'</option>';}
function renderAccountingPage(){
  var all=allExpenseRows(),rows=all.filter(filterExpenseRow).sort(function(a,b){return b.expense.date.localeCompare(a.expense.date);}),clients=Array.from(new Set(allWorkspaceProjects().map(function(p){return p.client;}))).sort();
  setHeading("Finance / Accounting","Accounting");
  var filters='<section class="accounting-filters"><label>Project<select data-accounting-filter="project"><option value="">All projects</option>'+allWorkspaceProjects().map(function(p){return expenseOption(p.id,p.number+' · '+p.name,accountingFilters.project);}).join("")+'</select></label><label>Client<select data-accounting-filter="client"><option value="">All clients</option>'+clients.map(function(client){return expenseOption(client,client,accountingFilters.client);}).join("")+'</select></label><label>Member<select data-accounting-filter="member"><option value="">All members</option>'+Object.keys(USERS).map(function(id){return expenseOption(id,USERS[id].name,accountingFilters.member);}).join("")+'</select></label><label>Expense Type<select data-accounting-filter="type"><option value="">All types</option>'+EXPENSE_TYPES.map(function(type){return expenseOption(type,type,accountingFilters.type);}).join("")+'</select></label><label>Date From<input type="date" data-accounting-filter="dateFrom" value="'+esc(accountingFilters.dateFrom)+'"></label><label>Date To<input type="date" data-accounting-filter="dateTo" value="'+esc(accountingFilters.dateTo)+'"></label><label>Payment Status<select data-accounting-filter="payment"><option value="">All payment states</option>'+["Paid","Pending","Cancelled"].map(function(status){return expenseOption(status,status,accountingFilters.payment);}).join("")+'</select></label><label>Reimbursement<select data-accounting-filter="reimbursement"><option value="">All reimbursement states</option>'+["Pending","Reimbursed","Not Required","Rejected"].map(function(status){return expenseOption(status,status,accountingFilters.reimbursement);}).join("")+'</select></label><button data-clear-accounting>'+icon("rotate-ccw")+'Clear filters</button></section>';
  var table='<section class="panel accounting-register"><div class="accounting-table-wrap"><table class="accounting-table"><thead><tr><th>Date</th><th>Project / Client</th><th>Member</th><th>Expense Type</th><th>Vendor / Receipt</th><th>Amount</th><th>Payment</th><th>Reimbursement</th><th></th></tr></thead><tbody>'+(rows.length?rows.map(function(row){var e=row.expense,p=row.project;return '<tr><td>'+formatDate(e.date)+'</td><td><button data-project="'+p.id+'"><strong>'+esc(p.number+' · '+p.name)+'</strong><small>'+esc(p.client)+'</small></button></td><td>'+esc(expenseMemberName(e.paidBy))+'</td><td><strong>'+esc(e.type)+'</strong><small>'+esc(e.description)+'</small></td><td>'+esc(e.vendor||"—")+'<small>'+esc(e.invoiceNumber||"No number")+'</small></td><td><b>'+formatCurrency(e.amount)+'</b></td><td><span class="payment-status">'+esc(e.paymentStatus)+'</span></td><td><span class="reimbursement-status '+esc(e.reimbursementStatus.toLowerCase().replace(/\s+/g,"-"))+'">'+esc(e.reimbursementStatus)+'</span></td><td><button class="icon-button micro" data-accounting-edit="'+p.id+'" data-expense-index="'+row.index+'" aria-label="Edit expense">'+icon("pencil")+'</button></td></tr>';}).join(""):'<tr><td colspan="9" class="table-empty">No expenses match these filters.</td></tr>')+'</tbody></table></div></section>';
  document.getElementById("content").innerHTML='<div class="section-title"><div><span class="section-kicker">COMPANY FINANCE</span><h2>Admin Accounting</h2><p>Every workspace expense from active and archived projects, with one source of truth.</p></div><span class="directory-count">'+rows.length+' of '+all.length+' expenses</span></div>'+renderExpenseMetrics(rows.map(function(row){return row.expense;}),false)+filters+table;
  document.querySelectorAll('[data-accounting-filter]').forEach(function(field){field.addEventListener("change",function(){accountingFilters[field.dataset.accountingFilter]=field.value;renderAccountingPage();});});
  document.querySelector('[data-clear-accounting]').addEventListener("click",function(){Object.keys(accountingFilters).forEach(function(key){accountingFilters[key]="";});renderAccountingPage();});
  document.querySelectorAll('[data-accounting-edit]').forEach(function(button){button.addEventListener("click",function(){openEditor(projectById(button.dataset.accountingEdit),"expenses",Number(button.dataset.expenseIndex),null);});});bindCommon();
}
function renderExpensesPage(){
  var member=USERS[state.userId],projects=visibleProjects(true),rows=[];projects.forEach(function(project){project.expenses.forEach(function(expense,index){if(expense.paidBy===state.userId||expense.createdBy===state.userId)rows.push({project:project,expense:expense,index:index});});});rows.sort(function(a,b){return b.expense.date.localeCompare(a.expense.date);});
  setHeading("My Workspace / Expenses","My Expenses");
  document.getElementById("content").innerHTML='<div class="section-title"><div><span class="section-kicker">PERSONAL EXPENSES</span><h2>'+esc(member.name)+' · Expenses</h2><p>Submit an expense once; it appears here, in the project and in Admin Accounting.</p></div><button class="primary-button" data-add-member-expense>'+icon("plus")+'Submit Expense</button></div>'+renderExpenseMetrics(rows.map(function(row){return row.expense;}),true)+'<section class="panel member-expense-list">'+(rows.length?rows.map(function(row){var e=row.expense,p=row.project;return '<button data-project="'+p.id+'"><span class="expense-type-icon">'+icon("receipt-text")+'</span><span><strong>'+esc(e.description)+'</strong><small>'+esc(p.number+' · '+p.name+' · '+e.type)+'</small></span><time>'+formatDate(e.date)+'</time><b>'+formatCurrency(e.amount)+'</b><span class="reimbursement-status '+esc(e.reimbursementStatus.toLowerCase().replace(/\s+/g,"-"))+'">'+esc(e.reimbursementStatus)+'</span></button>';}).join(""):'<div class="table-empty">No expenses submitted yet.</div>')+'</section>';
  document.querySelector('[data-add-member-expense]').addEventListener("click",function(){openEditor(null,"memberExpense",-1,null);});bindCommon();
}

function meetingCategoryClass(category){return "meeting-type-"+String(category||"Weekly Meeting").toLowerCase().replace(/[^a-z]+/g,"-").replace(/^-|-$/g,"");}
function meetingCategoryBadge(meeting){return '<span class="meeting-category '+meetingCategoryClass(meeting.category)+'">'+esc(meeting.category||"Weekly Meeting")+'</span>';}
function meetingActionState(project,action){var task=project.tasks.find(function(t){return t[0]===action.taskId;});return task||[action.taskId,action.title,action.due,action.priority,false];}
function meetingActionRow(project,action,index,meetingIndex){
  var task=meetingActionState(project,action);
  return '<div class="meeting-action'+(task[4]?' complete':'')+'"><span class="meeting-action-check">'+(task[4]?icon("check"):icon("circle"))+'</span><div><strong>'+esc(task[1])+'</strong><small>'+esc(action.assignee||"Unassigned")+' · Due '+formatDate(task[2])+'</small></div><span class="pill '+priorityClass(task[3])+'">'+esc(task[3])+'</span>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","meetingActions",index,'data-meeting-index="'+meetingIndex+'"')+deleteButton("meetingActions",index,'data-meeting-index="'+meetingIndex+'"')+'</div>':'')+'</div>';
}
function renderProjectMeetings(project){
  var meetings=project.meetings.slice().sort(function(a,b){return (b.date+b.time).localeCompare(a.date+a.time);});
  return '<section class="panel project-meetings"><div class="panel-head"><div><h3>Meetings</h3><small>Dated minutes, decisions and action items linked to Project Tasks</small></div>'+(state.role==="admin"?'<button data-add="meetings">'+icon("plus")+' Add meeting</button>':'<span class="count-chip">'+meetings.length+' meetings</span>')+'</div><div class="meeting-list">'+(meetings.length?meetings.map(function(meeting){var originalIndex=project.meetings.indexOf(meeting);return '<article class="meeting-card"><div class="meeting-date"><b>'+esc(new Date(meeting.date+"T12:00:00").toLocaleDateString("en-CA",{day:"2-digit"}))+'</b><span>'+esc(new Date(meeting.date+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}))+'</span></div><div class="meeting-body"><div class="meeting-card-head"><div><div class="meeting-labels">'+meetingCategoryBadge(meeting)+'<span class="section-kicker">'+esc(stageLabel(meeting.stage))+' · '+esc(meeting.time||"Time TBD")+'</span></div><h4>'+esc(meeting.title)+'</h4><p>'+icon("map-pin")+esc(meeting.location||"Location TBD")+' · '+esc(meeting.attendees||"Attendees not added")+'</p></div>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","meetings",originalIndex)+deleteButton("meetings",originalIndex)+'</div>':'')+'</div>'+(meeting.notes?'<p class="meeting-notes">'+esc(meeting.notes)+'</p>':'')+'<div class="meeting-actions-head"><strong>Action Items</strong>'+(state.role==="admin"?'<button class="tiny-action action-add" data-add="meetingActions" data-index="-1" data-meeting-index="'+originalIndex+'">'+icon("list-plus")+'Add task from meeting</button>':'')+'</div><div class="meeting-actions">'+(meeting.actions.length?meeting.actions.map(function(action,index){return meetingActionRow(project,action,index,originalIndex);}).join(""):'<p class="inline-empty">No action items recorded.</p>')+'</div></div></article>';}).join(""):'<p class="directory-empty">No meetings have been added to this project.</p>')+'</div></section>';
}
function renderMeetingsPage(){
  var projects=state.role==="admin"&&adminMemberFilter?dashboardProjects():visibleProjects(),rows=[];
  projects.forEach(function(project){project.meetings.forEach(function(meeting){rows.push({project:project,meeting:meeting});});});
  rows.sort(function(a,b){return (b.meeting.date+b.meeting.time).localeCompare(a.meeting.date+a.meeting.time);});
  setHeading("Workspace / Meetings",state.role==="admin"?"Project Meetings":"My Meetings");
  var html='<div class="section-title meetings-title"><div><span class="section-kicker">COORDINATION RECORD</span><h2>'+(state.role==="admin"?"Project Meetings":"My Meetings")+'</h2><p>Meeting dates, project context and action items. Add or edit a meeting inside its project.</p></div><span class="directory-count">'+rows.length+' meetings</span></div><section class="meeting-overview-grid">'+(rows.length?rows.map(function(row){var m=row.meeting,p=row.project;return '<article class="meeting-overview-card"><div class="meeting-date"><b>'+esc(new Date(m.date+"T12:00:00").toLocaleDateString("en-CA",{day:"2-digit"}))+'</b><span>'+esc(new Date(m.date+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}))+'</span></div><div><div class="meeting-labels">'+meetingCategoryBadge(m)+'<span class="section-kicker">'+esc(p.number)+' · '+esc(m.time||"Time TBD")+'</span></div><h3>'+esc(m.title)+'</h3><p>'+esc(p.name)+'</p><div class="meeting-overview-meta"><span>'+icon("map-pin")+esc(m.location||"Location TBD")+'</span><span>'+icon("list-checks")+m.actions.length+' actions</span></div><button class="task-project-link" data-project="'+esc(p.id)+'">Open project '+icon("arrow-up-right")+'</button></div></article>';}).join(""):'<div class="panel directory-empty"><h3>No meetings yet</h3><p>Add the first meeting from a project page.</p></div>')+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();
}
function renderMembersPage(){
  setHeading("Team / Members","Members & Workload");
  var html='<div class="section-title members-title"><div><span class="section-kicker">TEAM MANAGEMENT</span><h2>Members</h2><p>Review capacity and open a personal workspace with all assigned projects, tasks, meetings and deadlines.</p></div><span class="directory-count">'+Object.keys(USERS).length+' active members</span></div><section class="panel members-management"><div class="members-table-head"><span>Member</span><span>Active Projects</span><span>Open Tasks</span><span>Overdue</span><span>Upcoming Deadline</span><span></span></div>'+Object.keys(USERS).map(function(id){var user=USERS[id],stats=memberStats(id);return '<article class="members-table-row"><button class="member-identity" data-member-filter="'+id+'"><img src="'+esc(user.photo)+'" alt=""><span><strong>'+esc(user.name)+'</strong><small>'+esc(user.role)+'</small><em>'+esc(user.email)+'</em></span></button><b>'+stats.projects.length+'</b><b>'+stats.open+'</b><b class="'+(stats.overdue?'metric-alert':'')+'">'+stats.overdue+'</b><span class="upcoming-deadline">'+(stats.upcoming?'<strong>'+esc(stats.upcoming.title)+'</strong><small>'+formatDate(stats.upcoming.date)+' · '+esc(stats.upcoming.project.number)+'</small>':'<small>No upcoming deadline</small>')+'</span><span class="member-row-actions"><button data-edit-member="'+id+'" aria-label="Edit '+esc(user.name)+'">'+icon("pencil")+'</button><button data-member-filter="'+id+'" aria-label="Open '+esc(user.name)+' workspace">'+icon("arrow-right")+'</button></span></article>';}).join("")+'</section>';
  document.getElementById("content").innerHTML=html;bindMemberFilters();document.querySelectorAll("[data-edit-member]").forEach(function(button){button.addEventListener("click",function(){openEditor(null,"memberProfile",-1,button.dataset.editMember);});});refreshIcons();
}

var DIRECTORIES={
  clients:{title:'Clients',singular:'Client',icon:'briefcase-business',description:'Client organizations and the projects you deliver for them.'},
  consultants:{title:'Consultants',singular:'Consultant',icon:'users-round',description:'Consultant teams, disciplines and their project assignments.'},
  contractors:{title:'Contractors',singular:'Contractor',icon:'hard-hat',description:'Construction partners and the projects they are working on.'}
};
function companyDirectoryType(company){
  var role=String(company.category||'').toLowerCase();
  if(/contractor/.test(role))return 'contractors';
  if(/client/.test(role))return 'clients';
  if(/consultant|mechanical|electrical|structural/.test(role))return 'consultants';
  return null;
}
function clientByProject(project){return state.clients.find(function(client){return client.id===project.clientId;})||state.clients.find(function(client){return clientKey(client.name)===clientKey(project.client);})||null;}
function directoryCompanies(type){
  if(type==="clients")return state.clients.filter(function(client){return client.workspaceId===state.activeWorkspaceId;}).map(function(client){var projects=allWorkspaceProjects().filter(function(project){return project.clientId===client.id;}),records=[];projects.forEach(function(project){var company=project.companies.find(function(item){return companyDirectoryType(item)==="clients";});records.push({company:company||{category:"Client",name:client.name,contact:client.contacts[0]&&client.contacts[0].name||"",email:client.email,phone:client.phone,logo:client.logo},project:project});});return {key:clientKey(client.name),name:client.name,logo:client.logo,client:client,records:records,projects:projects};}).sort(function(a,b){return a.name.localeCompare(b.name);});
  var groups=new Map();
  visibleProjects().forEach(function(p){p.companies.forEach(function(c){
    if(companyDirectoryType(c)!==type||!String(c.name||'').trim()||/^(not required|not in scope|to be determined|not assigned)$/i.test(c.name.trim()))return;
    var key=c.name.trim().replace(/\s+/g,' ').toLowerCase();
    if(!groups.has(key))groups.set(key,{key:key,name:c.name,records:[],projects:[]});
    var group=groups.get(key);group.records.push({company:c,project:p});
    if(!group.projects.some(function(x){return x.id===p.id;}))group.projects.push(p);
  });});
  return Array.from(groups.values()).sort(function(a,b){return a.name.localeCompare(b.name);});
}
function directoryLogo(group){
  var record=group.records.find(function(r){return /^https:\/\//i.test(r.company.logo||'');}),logo=group.logo||record&&record.company.logo||"";
  return '<div class="company-logo"><span>'+esc(initials(group.name))+'</span>'+(logo?'<img src="'+esc(logo)+'" alt="'+esc(group.name)+' logo" loading="lazy" referrerpolicy="no-referrer">':'')+'</div>';
}
function directoryRoles(group){return group.client?'Client':Array.from(new Set(group.records.map(function(r){return r.company.category;}))).join(' · ');}
function renderDirectory(){
  var config=DIRECTORIES[currentDirectory],groups=directoryCompanies(currentDirectory);
  setHeading('Project Directory / '+config.title,config.title);
  var html='<div class="section-title directory-title"><div><div class="eyebrow dark">PROJECT DIRECTORY</div><h2>'+config.title+'</h2><p>'+esc(config.description)+'</p></div><span class="directory-count">'+groups.length+' '+(groups.length===1?'company':'companies')+'</span></div>';
  html+=groups.length?'<section class="directory-grid">'+groups.map(function(group){
    var active=group.projects.filter(function(p){return p.lifecycle!=="Archived";}).length,archived=group.projects.length-active;return '<article class="directory-card"><div class="company-heading">'+directoryLogo(group)+'<div class="contact-copy"><small>'+esc(directoryRoles(group))+'</small><h3>'+esc(group.name)+'</h3></div></div>'+(group.client?'<div class="client-card-metrics"><span><b>'+group.projects.length+'</b>Total</span><span><b>'+active+'</b>Active</span><span><b>'+archived+'</b>Archived</span></div>':'')+'<div class="directory-projects"><small>ASSIGNED PROJECTS · '+group.projects.length+'</small>'+group.projects.slice(0,4).map(function(p){return '<button data-project="'+esc(p.id)+'"><span>'+esc(p.number)+'</span>'+esc(p.name)+icon('arrow-up-right')+'</button>';}).join('')+'</div><button class="directory-open" data-company="'+esc(group.key)+'">View company & contacts '+icon('arrow-right')+'</button></article>';
  }).join('')+'</section>':'<section class="panel directory-empty"><h3>No '+config.title.toLowerCase()+' yet</h3><p>Companies added to your visible projects appear here automatically.</p></section>';
  document.getElementById('content').innerHTML=html;bindDirectory();bindCommon();
}
function renderCompanyProfile(){
  var config=DIRECTORIES[currentDirectory],group=directoryCompanies(currentDirectory).find(function(g){return g.key===currentCompanyKey;});
  if(!group){currentView=currentDirectory;renderDirectory();return;}
  setHeading('Project Directory / '+config.title,group.name);
  var active=group.projects.filter(function(p){return p.lifecycle!=="Archived";}).length,archived=group.projects.length-active,client=group.client;
  var contacts=client?client.contacts:group.records.map(function(record){return {name:record.company.contact,title:record.company.category,email:record.company.email,phone:record.company.phone};});
  var html='<button class="directory-back" data-directory-back>'+icon('arrow-left')+'Back to '+config.title+'</button><section class="panel company-profile-header"><div class="company-heading">'+directoryLogo(group)+'<div><div class="eyebrow dark">'+esc(directoryRoles(group))+'</div><h2>'+esc(group.name)+'</h2><p>'+group.projects.length+' related '+(group.projects.length===1?'project':'projects')+' in this workspace</p></div></div>'+(client&&state.role==="admin"?'<button class="primary-button" data-edit-client="'+client.id+'">'+icon("pencil")+'Edit Client Profile</button>':'')+'</section>'+(client?'<section class="client-profile-metrics"><span><small>Total Projects</small><b>'+group.projects.length+'</b></span><span><small>Active Projects</small><b>'+active+'</b></span><span><small>Archived Projects</small><b>'+archived+'</b></span></section><section class="panel client-company-details"><div><span>'+icon("mail")+'</span><small>Email</small><strong>'+esc(client.email||"Not added")+'</strong></div><div><span>'+icon("phone")+'</span><small>Phone</small><strong>'+esc(client.phone||"Not added")+'</strong></div><div><span>'+icon("map-pin")+'</span><small>Address</small><strong>'+esc(client.address||"Not added")+'</strong></div></section>':'')+'<section class="panel company-contact-panel"><div class="panel-head"><div><h3>Contacts</h3><small>Primary people and project-specific client records.</small></div></div><div class="company-grid">'+(contacts.length?contacts.map(function(contact){return '<article class="company-card"><div class="contact-copy"><small>'+esc(contact.title||"Contact")+'</small><h4>'+esc(contact.name||'Contact person not added')+'</h4></div>'+contactLinks(contact)+'</article>';}).join(''):'<p class="inline-empty">No contacts have been added.</p>')+'</div></section><div class="section-title"><div><h2>All Client Projects</h2><p>'+active+' active · '+archived+' archived. Open any project to view its complete record.</p></div></div><section class="project-grid">'+group.projects.map(projectCard).join('')+'</section>';
  document.getElementById('content').innerHTML=html;bindDirectory();bindCommon();
  var editClient=document.querySelector('[data-edit-client]');if(editClient)editClient.addEventListener("click",function(){openEditor(null,"clientProfile",-1,editClient.dataset.editClient);});
}
function bindDirectory(){
  document.querySelectorAll('[data-company]').forEach(function(b){b.addEventListener('click',function(){currentCompanyKey=b.dataset.company;currentView='company';currentProjectId=null;render();window.scrollTo(0,0);});});
  document.querySelectorAll('[data-directory-back]').forEach(function(b){b.addEventListener('click',function(){currentView=currentDirectory;currentCompanyKey=null;render();window.scrollTo(0,0);});});
  document.querySelectorAll('.company-logo img').forEach(function(img){img.addEventListener('error',function(){img.remove();});});
}

function projectClientBrand(project,context){var client=clientByProject(project);if(!client)return "";return '<span class="project-client-brand '+esc(context||"")+'"><span class="project-client-mark">'+(client.logo?'<img src="'+esc(client.logo)+'" alt="">':'<b>'+esc(initials(client.name))+'</b>')+'</span><span><small>Client</small><strong>'+esc(client.name)+'</strong></span></span>';}
function projectCard(p){
  return '<button class="project-card'+(p.lifecycle==="Archived"?' archived':'')+'" data-project="'+p.id+'"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy"><span class="card-top"><span class="card-tags"><span class="pill">'+esc(p.status)+'</span>'+(p.lifecycle==="Archived"?'<span class="pill archived-pill">Archived</span>':'<span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+'</span>')+'</span><span class="card-arrow">'+icon("arrow-up-right")+'</span></span><span class="card-bottom"><small>'+esc(p.number+" · "+p.typeCategory+(p.typeSubtype?' / '+p.typeSubtype:''))+'</small><h3>'+esc(p.name)+'</h3><p>'+icon("map-pin")+' '+esc(p.address)+'</p>'+projectClientBrand(p,"card-client")+'<span class="card-meta"><span>'+p.scope.length+' project stages</span><span>'+p.assigned.map(function(u){return USERS[u]?esc(USERS[u].name.split(" ")[0]):""}).filter(Boolean).join(" · ")+'</span></span></span></button>';
}
function filterProject(p){
  var q=currentFilters.query.toLowerCase().trim();
  var matches=!q||(p.name+" "+p.number+" "+p.type+" "+p.address).toLowerCase().indexOf(q)>-1;
  return matches&&(!currentFilters.type||p.type===currentFilters.type)&&(!currentFilters.status||p.status===currentFilters.status)&&(!currentFilters.priority||p.priority===currentFilters.priority)&&(!currentFilters.user||p.assigned.indexOf(currentFilters.user)>-1)&&(!currentFilters.high||p.priority==="High");
}
function renderGallery(){
  var base=state.role==="admin"?visibleProjects(true):workspaceProjects(),projects=base.filter(function(p){return p.lifecycle===currentProjectLifecycle;}).filter(filterProject),member=state.role==="admin"&&adminMemberFilter?USERS[adminMemberFilter]:null;
  if(member)projects=projects.filter(function(p){return p.assigned.indexOf(adminMemberFilter)>-1;});
  var activeCount=base.filter(function(p){return p.lifecycle!=="Archived";}).length,archivedCount=base.filter(function(p){return p.lifecycle==="Archived";}).length;
  setHeading(member?"Members / "+member.name:"Portfolio / Projects",currentView==="priority"?"High-Priority Projects":member?member.name+" · Projects":state.role==="user"?"My Projects":"Projects");
  var userOptions=Object.keys(USERS).map(function(k){return '<option value="'+k+'"'+(currentFilters.user===k?" selected":"")+'>'+esc(USERS[k].name)+'</option>'}).join("");
  var html='<div class="section-title"><div><span class="section-kicker">PROJECT LIFECYCLE</span><h2>'+(currentProjectLifecycle==="Archived"?"Archived Projects":state.role==="user"?"My Active Projects":"Active Projects")+'</h2><p>'+projects.length+' projects match the current view. Archiving preserves every record.</p></div></div>'+
    '<div class="lifecycle-tabs" role="tablist" aria-label="Project lifecycle"><button role="tab" data-lifecycle-tab="Active" aria-selected="'+(currentProjectLifecycle==="Active")+'" class="'+(currentProjectLifecycle==="Active"?'active':'')+'">Active Projects <b>'+activeCount+'</b></button>'+(state.role==="admin"?'<button role="tab" data-lifecycle-tab="Archived" aria-selected="'+(currentProjectLifecycle==="Archived")+'" class="'+(currentProjectLifecycle==="Archived"?'active':'')+'">Archived Projects <b>'+archivedCount+'</b></button>':'')+'</div>'+
    '<section class="filter-bar"><label class="filter-field">'+icon("search")+'<input id="gallerySearch" placeholder="Search project name or number" value="'+esc(currentFilters.query)+'"></label>'+
    '<label class="filter-field">'+icon("building-2")+'<select data-filter="type"><option value="">All project types</option>'+allTypes().map(function(t){return '<option'+(currentFilters.type===t?" selected":"")+'>'+esc(t)+'</option>'}).join("")+'</select></label>'+
    '<label class="filter-field">'+icon("activity")+'<select data-filter="status"><option value="">All statuses</option>'+allStatuses().map(function(t){return '<option'+(currentFilters.status===t?" selected":"")+'>'+esc(t)+'</option>'}).join("")+'</select></label>'+
    '<label class="filter-field">'+icon("flag")+'<select data-filter="priority"><option value="">All priorities</option>'+["High","Medium","Low"].map(function(t){return '<option'+(currentFilters.priority===t?" selected":"")+'>'+t+'</option>'}).join("")+'</select></label>'+
    (state.role==="admin"&&!adminMemberFilter?'<label class="filter-field">'+icon("user-round")+'<select data-filter="user"><option value="">All assigned users</option>'+userOptions+'</select></label>':'')+
    '<button id="highToggle" class="filter-toggle'+(currentFilters.high?" active":"")+'">'+icon("flame")+' High Priority</button></section>'+
    (projects.length?'<section class="project-grid">'+projects.map(projectCard).join("")+'</section>':'<div class="empty-state">'+icon("search-x")+'<h3>No projects found</h3><p>Adjust the filters to see more projects.</p></div>');
  document.getElementById("content").innerHTML=html;
  document.getElementById("gallerySearch").addEventListener("input",function(e){currentFilters.query=e.target.value;renderGallery()});
  document.querySelectorAll("[data-filter]").forEach(function(el){el.addEventListener("change",function(){currentFilters[el.dataset.filter]=el.value;renderGallery()})});
  document.getElementById("highToggle").addEventListener("click",function(){currentFilters.high=!currentFilters.high;renderGallery()});
  document.querySelectorAll("[data-lifecycle-tab]").forEach(function(button){button.addEventListener("click",function(){currentProjectLifecycle=button.dataset.lifecycleTab;currentFilters.high=false;renderGallery();});});
  bindProjectCards();
}

function timelineBounds(projects){
  var dates=[];projects.forEach(function(p){p.schedule.forEach(function(s){dates.push(new Date(s.start+"T12:00:00"),new Date(s.end+"T12:00:00"))})});
  if(!dates.length)return {start:new Date(),end:new Date()};
  var start=new Date(Math.min.apply(null,dates)),end=new Date(Math.max.apply(null,dates));start.setDate(start.getDate()-10);end.setDate(end.getDate()+10);return {start:start,end:end};
}
function timelinePosition(date,bounds){return Math.max(0,Math.min(100,(new Date(date+"T12:00:00")-bounds.start)/(bounds.end-bounds.start)*100));}
function timelineMarkers(bounds,scale){
  var items=[],cursor=new Date(bounds.start),step=1,options={month:"short",year:"2-digit"};
  if(scale==="Month"){cursor=new Date(bounds.start.getFullYear(),bounds.start.getMonth(),1);if(cursor<bounds.start)cursor.setMonth(cursor.getMonth()+1);}
  else if(scale==="Week"){step=7;options={month:"short",day:"numeric"};cursor.setDate(cursor.getDate()+(7-cursor.getDay())%7);}
  else {step=7;options={month:"short",day:"numeric"};}
  while(cursor<=bounds.end){items.push({label:cursor.toLocaleDateString("en-CA",options),left:(cursor-bounds.start)/(bounds.end-bounds.start)*100});if(scale==="Month")cursor.setMonth(cursor.getMonth()+1);else cursor.setDate(cursor.getDate()+step);}
  return items;
}
function monthMarkers(bounds){return timelineMarkers(bounds,"Month");}
function memberAvatars(project){return '<span class="timeline-avatars">'+project.assigned.slice(0,4).map(function(id){var user=USERS[id];return user?'<img src="'+esc(user.photo)+'" alt="'+esc(user.name)+'" title="'+esc(user.name)+'">':'';}).join("")+(project.assigned.length>4?'<b>+'+(project.assigned.length-4)+'</b>':'')+'</span>';}
var suppressScheduleClickUntil=0,timelineProjectDrag=null,timelineResizeDrag=null;
function shiftProjectSchedule(project,days){project.schedule.forEach(function(item){item.start=addDays(item.start,days);item.end=addDays(item.end,days);});}
function moveProjectBefore(projectId,targetId){
  if(projectId===targetId)return;var from=state.projects.findIndex(function(p){return p.id===projectId;}),to=state.projects.findIndex(function(p){return p.id===targetId;});if(from<0||to<0)return;
  var item=state.projects.splice(from,1)[0];to=state.projects.findIndex(function(p){return p.id===targetId;});state.projects.splice(to,0,item);saveState();
}
function renderTimeline(projects,compact){
  var bounds=timelineBounds(projects),scale=compact?"Month":state.ui.scheduleScale,markers=timelineMarkers(bounds,scale),today=timelinePosition(isoDate(new Date()),bounds),todayVisible=new Date()>=bounds.start&&new Date()<=bounds.end,canvasWidth=scale==="Day"?2400:scale==="Week"?1500:980;
  var head='<div class="timeline-head"><div class="timeline-label">PROJECT / STAGE</div><div class="timeline-months">'+markers.map(function(m){return '<span style="left:'+m.left+'%">'+esc(m.label)+'</span>'}).join("")+(todayVisible?'<i class="timeline-today-label" style="left:'+today+'%">TODAY</i>':'')+'</div></div>';
  var rows=projects.map(function(p){
    var schedule=compact?p.schedule.slice(0,4):p.schedule;
    var bars=schedule.map(function(s,i){var originalIndex=p.schedule.indexOf(s),left=timelinePosition(s.start,bounds),right=timelinePosition(s.end,bounds),width=Math.max(2.4,right-left),top=i*36+9;return '<button class="timeline-bar stage-'+s.stage+(state.role==="admin"&&!compact?' schedule-draggable':'')+'" data-project="'+p.id+'" data-schedule-item="'+originalIndex+'" '+(state.role==="admin"&&!compact?'draggable="true"':'')+' title="'+esc(stageLabel(s.stage)+" · "+formatDate(s.start)+" to "+formatDate(s.end)+(state.role==="admin"&&!compact?" · Drag to move":""))+'" style="left:'+left+'%;width:'+width+'%;top:'+top+'px"><span>'+icon(STAGES[s.stage].icon)+esc(stageLabel(s.stage))+'<small>'+esc(s.start+' → '+s.end)+'</small></span></button>'+(state.role==="admin"&&!compact?'<button class="timeline-resize-handle start" draggable="true" data-resize-stage="'+originalIndex+'" data-resize-edge="start" data-stage-project="'+p.id+'" style="left:'+left+'%;top:'+top+'px" aria-label="Move '+esc(stageLabel(s.stage))+' start one day earlier" title="Drag to resize start; click for one day earlier"></button><button class="timeline-resize-handle end" draggable="true" data-resize-stage="'+originalIndex+'" data-resize-edge="end" data-stage-project="'+p.id+'" style="left:'+right+'%;top:'+top+'px" aria-label="Extend '+esc(stageLabel(s.stage))+' end one day" title="Drag to resize end; click to extend one day"></button>':'');}).join("");
    var deadlineMarkers=p.deadlines.map(function(d){var left=timelinePosition(d[1],bounds);return '<button class="timeline-deadline" data-project="'+p.id+'" style="left:'+left+'%" title="'+esc(d[0]+' · '+formatDate(d[1]))+'"><span></span><b>'+esc(d[0])+'</b></button>';}).join("");
    var milestoneMarkers=[];Object.keys(p.stageItems).forEach(function(key){p.stageItems[key].forEach(function(item){if(item.date)milestoneMarkers.push('<i class="timeline-milestone stage-'+key+'" style="left:'+timelinePosition(item.date,bounds)+'%" title="'+esc(item.title+' · '+formatDate(item.date))+'"></i>');});});
    var tools=state.role==="admin"&&!compact?'<div class="timeline-row-tools"><button class="timeline-drag-handle" draggable="true" data-project-reorder="'+p.id+'" aria-label="Drag to reorder '+esc(p.name)+'">'+icon("grip-vertical")+'</button><button data-shift-project="'+p.id+'" data-days="-7" aria-label="Move '+esc(p.name)+' one week earlier">−7d</button><button data-shift-project="'+p.id+'" data-days="7" aria-label="Move '+esc(p.name)+' one week later">+7d</button></div>':'';
    return '<div class="timeline-row" data-timeline-row="'+p.id+'" style="--lanes:'+schedule.length+'"><div class="timeline-project-wrap"><button class="timeline-project" data-project="'+p.id+'"><span><strong>'+esc(p.number)+'</strong><small>'+esc(p.name)+'</small></span>'+memberAvatars(p)+'</button>'+tools+'</div><div class="timeline-lane">'+markers.map(function(m){return '<i class="timeline-gridline" style="left:'+m.left+'%"></i>'}).join("")+(todayVisible?'<i class="timeline-today" style="left:'+today+'%"></i>':'')+deadlineMarkers+milestoneMarkers.join("")+bars+'</div></div>';
  }).join("");
  return '<div class="timeline-scroll"><div class="timeline-canvas" style="min-width:'+canvasWidth+'px">'+head+rows+'<div class="timeline-legend">'+Object.keys(STAGES).map(function(k){return '<span><i class="stage-'+k+'"></i>'+esc(STAGES[k].label)+'</span>'}).join("")+'<span class="legend-deadline"><i></i>Deadline</span><span class="legend-milestone"><i></i>Milestone</span></div></div></div>';
}
function bindTimelineInteractions(projects){
  if(state.role!=="admin")return;var bounds=timelineBounds(projects),totalDays=Math.max(1,Math.round((bounds.end-bounds.start)/86400000));
  document.querySelectorAll("[data-project-reorder]").forEach(function(handle){handle.addEventListener("dragstart",function(e){timelineProjectDrag=handle.dataset.projectReorder;e.dataTransfer.effectAllowed="move";handle.closest(".timeline-row").classList.add("dragging");});handle.addEventListener("dragend",function(){var row=handle.closest(".timeline-row");if(row)row.classList.remove("dragging");timelineProjectDrag=null;});});
  document.querySelectorAll("[data-timeline-row]").forEach(function(row){row.addEventListener("dragover",function(e){if(timelineProjectDrag)e.preventDefault();});row.addEventListener("drop",function(e){if(!timelineProjectDrag)return;e.preventDefault();moveProjectBefore(timelineProjectDrag,row.dataset.timelineRow);timelineProjectDrag=null;suppressScheduleClickUntil=Date.now()+300;renderSchedulePage();toast("Project order saved");});});
  document.querySelectorAll("[data-shift-project]").forEach(function(button){button.addEventListener("click",function(e){e.stopPropagation();var p=projectById(button.dataset.shiftProject);shiftProjectSchedule(p,Number(button.dataset.days));saveState();renderSchedulePage();toast("Project schedule shifted "+Math.abs(Number(button.dataset.days))+" days");});});
  document.querySelectorAll("[data-schedule-item][draggable=true]").forEach(function(bar){var startX=0,laneWidth=1;bar.addEventListener("dragstart",function(e){startX=e.clientX;laneWidth=bar.closest(".timeline-lane").getBoundingClientRect().width;e.dataTransfer.effectAllowed="move";bar.classList.add("dragging");});bar.addEventListener("dragend",function(e){bar.classList.remove("dragging");var days=Math.round((e.clientX-startX)/laneWidth*totalDays);if(!days)return;var p=projectById(bar.dataset.project),item=p.schedule[Number(bar.dataset.scheduleItem)];item.start=addDays(item.start,days);item.end=addDays(item.end,days);saveState();suppressScheduleClickUntil=Date.now()+300;renderSchedulePage();toast(stageLabel(item.stage)+" shifted "+Math.abs(days)+" days");});});
  document.querySelectorAll("[data-resize-stage]").forEach(function(handle){var startX=0,laneWidth=1,dragged=false;handle.addEventListener("click",function(e){e.stopPropagation();if(dragged){dragged=false;return;}var p=projectById(handle.dataset.stageProject),item=p.schedule[Number(handle.dataset.resizeStage)];if(handle.dataset.resizeEdge==="start")item.start=addDays(item.start,-1);else item.end=addDays(item.end,1);saveState();renderSchedulePage();toast("Stage duration updated");});handle.addEventListener("dragstart",function(e){e.stopPropagation();startX=e.clientX;laneWidth=handle.closest(".timeline-lane").getBoundingClientRect().width;timelineResizeDrag=handle;dragged=false;e.dataTransfer.effectAllowed="move";});handle.addEventListener("dragend",function(e){e.stopPropagation();var days=Math.round((e.clientX-startX)/laneWidth*totalDays);timelineResizeDrag=null;if(!days)return;dragged=true;var p=projectById(handle.dataset.stageProject),item=p.schedule[Number(handle.dataset.resizeStage)],edge=handle.dataset.resizeEdge,next=edge==="start"?addDays(item.start,days):addDays(item.end,days);if(edge==="start"&&next>item.end||edge==="end"&&next<item.start){toast("A stage must end on or after its start date");return;}item[edge]=next;saveState();suppressScheduleClickUntil=Date.now()+300;renderSchedulePage();toast("Stage duration resized "+Math.abs(days)+" days");});});
}
function renderSchedulePage(){
  var projects=workspaceProjects(),member=state.role==="admin"&&adminMemberFilter?USERS[adminMemberFilter]:null;setHeading(member?"Members / "+member.name:"Portfolio / Schedule",member?member.name+" · Schedule":state.role==="user"?"My Project Schedule":"Project Schedule & Timeline");
  var html='<div class="section-title schedule-title"><div><div class="eyebrow dark">PORTFOLIO PLANNING</div><h2>Project Schedule</h2><p>Move stages, resize durations, review milestones and compare delivery pressure across the active portfolio.</p></div><span class="schedule-count">'+projects.length+' active projects</span></div><section class="panel schedule-panel"><div class="schedule-toolbar"><div class="timeline-guide">'+icon("info")+' Drag a stage to move it. Drag either edge to resize; keyboard-friendly ±7 day project controls remain available.</div><div class="schedule-scale" role="group" aria-label="Timeline scale">'+["Day","Week","Month"].map(function(scale){return '<button data-schedule-scale="'+scale+'" class="'+(state.ui.scheduleScale===scale?'active':'')+'" aria-pressed="'+(state.ui.scheduleScale===scale)+'">'+scale+'</button>';}).join("")+'</div></div>'+renderTimeline(projects,false)+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();bindTimelineInteractions(projects);
  document.querySelectorAll("[data-schedule-scale]").forEach(function(button){button.addEventListener("click",function(){state.ui.scheduleScale=button.dataset.scheduleScale;saveState();renderSchedulePage();});});
}
function adminButton(label,kind,index,extra){return state.role==="admin"?'<button class="tiny-action" aria-label="'+esc(label+' '+(kind==="stageItems"?'milestone':kind==='companies'?'company':kind)+' record')+'" data-edit="'+kind+'" data-index="'+index+'" '+(extra||"")+'>'+icon("pencil")+'<span>'+label+'</span></button>':"";}
function deleteButton(kind,index,extra){return state.role==="admin"?'<button class="icon-button micro danger" data-delete="'+kind+'" data-index="'+index+'" '+(extra||"")+' aria-label="Delete">'+icon("trash-2")+'</button>':"";}
function contactLinks(item){
  var email=String(item.email||"").trim(),phone=String(item.phone||"").trim();
  return '<div class="contact-links">'+(email?'<a href="mailto:'+esc(encodeURIComponent(email))+'">'+icon("mail")+esc(email)+'</a>':'<span>'+icon("mail")+'Email not added</span>')+(phone?'<a href="tel:'+esc(phone.replace(/[^+\d]/g,""))+'">'+icon("phone")+esc(phone)+'</a>':'<span>'+icon("phone")+'Phone not added</span>')+'</div>';
}
function teamCard(member,index){return '<div class="team-card"><span class="avatar">'+esc(initials(member.name))+'</span><div class="contact-copy"><small>'+esc(member.role)+'</small><strong>'+esc(member.name)+'</strong>'+contactLinks(member)+'</div><div class="row-actions">'+adminButton("Edit","team",index)+deleteButton("team",index)+'</div></div>';}
function companyCard(company,index){
  var logo=/^https:\/\//i.test(company.logo||"")?company.logo:"";
  return '<article class="company-card"><div class="company-heading"><div class="company-logo"><span>'+esc(initials(company.name))+'</span>'+(logo?'<img src="'+esc(logo)+'" alt="'+esc(company.name)+' logo" loading="lazy" referrerpolicy="no-referrer">':'')+'</div><div class="contact-copy"><small>'+esc(company.category)+'</small><h4>'+esc(company.name)+'</h4></div></div>'+(company.contact?'<p class="company-contact">'+esc(company.contact)+'</p>':'')+contactLinks(company)+'<div class="company-footer"><small>'+(logo?'Company logo':'Logo placeholder')+'</small><div class="row-actions">'+adminButton("Edit","companies",index)+deleteButton("companies",index)+'</div></div></article>';
}
function expenseMemberName(id){return USERS[id]?USERS[id].name:id==="admin"?"Hosis Admin":"Not assigned";}
function expenseTotals(expenses){return expenses.reduce(function(total,expense){total.total+=Number(expense.amount)||0;if(expense.reimbursementStatus==="Reimbursed")total.reimbursed+=Number(expense.amount)||0;if(expense.reimbursementStatus==="Pending")total.pending+=Number(expense.amount)||0;return total;},{total:0,reimbursed:0,pending:0});}
function renderExpenseMetrics(expenses,personal){var totals=expenseTotals(expenses);return '<div class="expense-metrics"><span><small>'+(personal?'Total Paid':'Project Expense Total')+'</small><b>'+formatCurrency(totals.total)+'</b></span><span><small>Reimbursed</small><b>'+formatCurrency(totals.reimbursed)+'</b></span><span><small>Pending Reimbursement</small><b>'+formatCurrency(totals.pending)+'</b></span></div>';}
function renderProjectAccounting(project){
  var expenses=project.expenses.slice().sort(function(a,b){return b.date.localeCompare(a.date);});
  return renderExpenseMetrics(expenses,false)+'<div class="expense-table-wrap"><table class="expense-table"><thead><tr><th>Date</th><th>Expense</th><th>Paid By</th><th>Vendor / Receipt</th><th>Amount</th><th>Reimbursement</th><th></th></tr></thead><tbody>'+(expenses.length?expenses.map(function(expense){var index=project.expenses.indexOf(expense);return '<tr><td>'+formatDate(expense.date)+'</td><td><strong>'+esc(expense.type)+'</strong><small>'+esc(expense.description)+'</small></td><td>'+esc(expenseMemberName(expense.paidBy))+'<small>'+esc(expense.paymentMethod)+'</small></td><td>'+esc(expense.vendor||"—")+'<small>'+esc(expense.invoiceNumber||"No receipt number")+'</small></td><td><b>'+formatCurrency(expense.amount)+'</b><small>'+esc(expense.paymentStatus)+'</small></td><td><span class="reimbursement-status '+esc(expense.reimbursementStatus.toLowerCase().replace(/\s+/g,"-"))+'">'+esc(expense.reimbursementStatus)+'</span></td><td>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","expenses",index)+deleteButton("expenses",index)+'</div>':'')+'</td></tr>';}).join(""):'<tr><td colspan="7" class="table-empty">No expenses submitted for this project.</td></tr>')+'</tbody></table></div>';
}
var PROJECT_SECTION_KEYS=["overview","workflow","meetings","schedule","team","companies","documents","accounting","activity","tasks","notes"];
function sectionIsOpen(project,key){
  var stored=state.ui.projectSections[project.id]||{};
  return stored[key]!==false;
}
function projectAccordion(project,key,title,subtitle,iconName,body,action){
  var open=sectionIsOpen(project,key),panelId="project-section-"+project.id+"-"+key;
  return '<section class="panel project-accordion'+(open?' open':'')+'" data-project-section="'+key+'"><div class="project-section-head"><button class="project-section-toggle" data-toggle-project-section="'+key+'" aria-expanded="'+open+'" aria-controls="'+panelId+'"><span class="project-section-icon">'+icon(iconName)+'</span><span><h3>'+esc(title)+'</h3>'+(subtitle?'<small>'+esc(subtitle)+'</small>':'')+'</span>'+icon("chevron-down")+'</button>'+(action||'')+'</div><div class="project-section-body" id="'+panelId+'"'+(open?'':' hidden')+'>'+body+'</div></section>';
}
function renderProject(id){
  var p=projectById(id);
  if(!p||(state.role==="admin"?visibleProjects(true):visibleProjects()).indexOf(p)===-1){currentView="gallery";renderGallery();return}
  if(!activeStage||p.scope.indexOf(activeStage)===-1) activeStage=p.scope[0];
  setHeading("Portfolio / "+p.number,p.name);
  var scope=p.scope.map(function(k){return '<button class="stage-chip stage-'+k+(activeStage===k?' active':'')+'" aria-pressed="'+(activeStage===k)+'" aria-controls="stageContent" data-stage="'+k+'"><span class="scope-icon">'+icon(STAGES[k].icon)+'</span><strong>'+esc(STAGES[k].label)+'</strong><small>'+stageProgress(p,k)+'% complete</small></button>'}).join("");
  var tasks=p.tasks.map(function(t,i){return '<div class="task-row'+(t[4]?" done":"")+'"><button class="task-check" data-task="'+t[0]+'" aria-label="'+esc((t[4]?"Reopen ":"Complete ")+t[1])+'" aria-pressed="'+t[4]+'">'+(t[4]?icon("check"):"")+'</button><div><strong>'+esc(t[1])+'</strong><small>'+esc(t[3]+" priority · Due "+formatDate(t[2]))+'</small></div><span class="pill '+priorityClass(t[3])+'">'+esc(t[3])+'</span><div class="row-actions">'+adminButton("Edit","tasks",i)+deleteButton("tasks",i)+'</div></div>'}).join("");
  var adminControls=state.role==="admin"?'<select id="statusSelect" class="admin-select" aria-label="Change project status">'+allStatuses().concat(["Complete","On Hold"]).filter(function(v,i,a){return a.indexOf(v)===i}).map(function(v){return '<option'+(v===p.status?" selected":"")+'>'+esc(v)+'</option>'}).join("")+'</select><select id="prioritySelect" class="admin-select" aria-label="Change priority">'+["High","Medium","Low"].map(function(v){return '<option'+(v===p.priority?" selected":"")+'>'+v+' Priority</option>'}).join("")+'</select>':"";
  var overviewBody='<p class="overview-summary">'+esc(p.summary)+'</p><div class="overview-grid">'+[["Project Number",p.number],["Project Type",p.typeCategory+(p.typeSubtype?' / '+p.typeSubtype:'')],["Project Area",p.area],["Client",p.client],["Owner",p.owner],["General Contractor",p.contractor],["Address",p.address],["Current Status",p.status],["Lifecycle",p.lifecycle],["Priority",p.priority]].map(function(x){return '<div class="info-cell"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>'}).join("")+'</div>';
  var workflowBody='<div class="scope-stage-list">'+scope+'</div><div id="stageContent" class="stage-content">'+renderStageContent(p,activeStage)+'</div>';
  var teamBody='<div class="team-grid">'+p.team.map(teamCard).join("")+'</div>';
  var companiesBody='<div class="company-grid">'+p.companies.map(companyCard).join("")+'</div>';
  var documentsBody='<div class="compact-register">'+(p.documents.length?p.documents.map(function(d,i){return '<article><span>'+icon("file-text")+'</span><div><strong>'+esc(d[0])+'</strong><small>'+esc(stageLabel(d[1])+' · '+d[2])+'</small></div><div class="row-actions">'+adminButton("Edit","documents",i)+deleteButton("documents",i)+'</div></article>';}).join(""):'<p class="inline-empty">No project documents yet.</p>')+'</div>';
  var activityBody='<div class="compact-register">'+(p.activity.length?p.activity.map(function(a,i){return '<article><span>'+icon("activity")+'</span><div><strong>'+esc(a[0])+'</strong><small>'+esc(a[1]+' · '+stageLabel(a[2]))+'</small></div><div class="row-actions">'+adminButton("Edit","activity",i)+deleteButton("activity",i)+'</div></article>';}).join(""):'<p class="inline-empty">No project activity yet.</p>')+'</div>';
  var taskBody='<div class="task-list">'+tasks+'</div>';
  var accountingBody=renderProjectAccounting(p);
  var notesBody='<textarea id="projectNotes" aria-label="Project Notes" '+(state.role==="admin"?'':'readonly ')+'placeholder="Add project notes…">'+esc(p.notes)+'</textarea><small class="save-hint">'+(state.role==="admin"?'Saved automatically in this browser.':'Read-only for assigned users.')+'</small>';
  var html=
    '<section class="project-hero'+(p.lifecycle==="Archived"?' archived-project':'')+'"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'"><div class="project-hero-top"><button class="back-button" data-go-gallery>'+icon("arrow-left")+'Projects</button><div class="card-tags"><span class="pill">'+esc(p.status)+'</span><span class="pill '+(p.lifecycle==="Archived"?'archived-pill':priorityClass(p.priority))+'">'+esc(p.lifecycle==="Archived"?'Archived':p.priority+' Priority')+'</span></div></div><div class="project-hero-main"><div><div class="eyebrow">'+esc(p.number+" · "+p.typeCategory+(p.typeSubtype?' / '+p.typeSubtype:''))+'</div><h1>'+esc(p.name)+'</h1><p>'+icon("map-pin")+' '+esc(p.address)+' &nbsp; · &nbsp; '+esc(p.area)+'</p>'+projectClientBrand(p,"hero-client")+'</div><div class="project-hero-actions">'+adminControls+(state.role==="admin"?'<button class="ghost-button" data-project-lifecycle="'+(p.lifecycle==="Archived"?'Active':'Archived')+'">'+icon(p.lifecycle==="Archived"?"archive-restore":"archive")+(p.lifecycle==="Archived"?'Restore Project':'Archive Project')+'</button><button class="ghost-button" data-edit="project" data-index="-1">'+icon("square-pen")+'Edit Project</button><button class="ghost-button" id="editScope">'+icon("sliders-horizontal")+'Edit Scope</button>':'')+'<button class="ghost-button" onclick="window.print()">'+icon("printer")+'Print / PDF</button></div></div></section>'+
    '<div class="project-section-toolbar"><div><span class="section-kicker">PROJECT WORKSPACE</span><strong>Sections</strong></div><div><button data-project-sections="expand">'+icon("unfold-vertical")+'Expand All</button><button data-project-sections="collapse">'+icon("fold-vertical")+'Collapse All</button></div></div>'+
    '<div class="project-layout"><div class="detail-stack">'+
      projectAccordion(p,"overview","Project Overview","Core project identity and current delivery status","layout-dashboard",overviewBody,state.role==="admin"?'<button class="section-action" data-edit="project" data-index="-1">'+icon("pencil")+'Edit</button>':'')+
      projectAccordion(p,"workflow","Project Delivery","Scope, permit, tender and construction administration","workflow",workflowBody,state.role==="admin"?'<button class="section-action" id="editScopeInline">Edit stages</button>':'')+
      projectAccordion(p,"meetings","Project Meetings","Minutes, decisions and task-linked action items","calendar-clock",renderProjectMeetings(p))+
      projectAccordion(p,"schedule","Project Schedule","Stage dates, milestones and project deadlines","gantt-chart-square",renderProjectSchedule(p),state.role==="admin"?'<button class="section-action" data-add="schedule">'+icon("plus")+'Add schedule item</button>':'')+
      projectAccordion(p,"team","Project Team",p.assigned.length+' assigned workspace members',"users",teamBody,state.role==="admin"?'<button class="section-action" data-add="team">'+icon("user-plus")+'Add</button>':'')+
      projectAccordion(p,"companies","Project Companies",p.companies.length+' client, consultant and contractor records',"building-2",companiesBody,state.role==="admin"?'<button class="section-action" data-add="companies">'+icon("plus")+'Add company</button>':'')+
      projectAccordion(p,"documents","Documents",p.documents.length+' project files',"files",documentsBody,state.role==="admin"?'<button class="section-action" data-add="documents">'+icon("plus")+'Add</button>':'')+
      projectAccordion(p,"accounting","Accounting & Expenses",p.expenses.length+' expense records',"receipt-text",accountingBody,'<button class="section-action" data-add="expenses">'+icon("plus")+'Add expense</button>')+
      projectAccordion(p,"activity","Activity","Project history and recorded updates","activity",activityBody,state.role==="admin"?'<button class="section-action" data-add="activity">'+icon("plus")+'Add</button>':'')+
    '</div><aside class="detail-stack">'+
      projectAccordion(p,"notes","Project Notes","Workspace notes saved with this project","sticky-note",notesBody)+
      projectAccordion(p,"tasks","Project Tasks",p.tasks.filter(function(t){return !t[4]}).length+' open tasks',"list-checks",taskBody,state.role==="admin"?'<button class="section-action" data-add="tasks">Add task</button>':'')+
    '</aside></div>';
  document.getElementById("content").innerHTML=html;
  document.querySelectorAll("[data-stage]").forEach(function(b){b.addEventListener("click",function(){activeStage=b.dataset.stage;renderProject(p.id);document.querySelector('[data-stage="'+activeStage+'"]').focus({preventScroll:true})})});
  document.querySelectorAll("[data-toggle-project-section]").forEach(function(button){button.addEventListener("click",function(){var map=state.ui.projectSections[p.id]||{};map[button.dataset.toggleProjectSection]=!sectionIsOpen(p,button.dataset.toggleProjectSection);state.ui.projectSections[p.id]=map;saveState();renderProject(p.id);var next=document.querySelector('[data-toggle-project-section="'+button.dataset.toggleProjectSection+'"]');if(next)next.focus({preventScroll:true});});});
  document.querySelectorAll("[data-project-sections]").forEach(function(button){button.addEventListener("click",function(){var open=button.dataset.projectSections==="expand",map=state.ui.projectSections[p.id]||{};PROJECT_SECTION_KEYS.forEach(function(key){map[key]=open;});state.ui.projectSections[p.id]=map;saveState();renderProject(p.id);});});
  document.querySelectorAll("[data-task]").forEach(function(b){b.addEventListener("click",function(){var task=p.tasks.find(function(t){return t[0]===b.dataset.task});task[4]=!task[4];saveState();renderProject(p.id);toast(task[4]?"Task marked complete":"Task reopened")})});
  var notesField=document.getElementById("projectNotes");if(state.role==="admin"&&notesField)notesField.addEventListener("input",function(e){p.notes=e.target.value;saveState();var hint=document.querySelector('[data-project-section="notes"] .save-hint');if(hint)hint.textContent="All changes saved in this browser.";});
  if(state.role==="admin"){
    document.querySelector("[data-project-lifecycle]").addEventListener("click",function(buttonEvent){var next=buttonEvent.currentTarget.dataset.projectLifecycle;if(!confirm((next==="Archived"?"Archive":"Restore")+" this project? No records will be deleted."))return;p.lifecycle=next;saveState();currentProjectLifecycle=next;renderProject(p.id);toast(next==="Archived"?"Project archived — all data preserved":"Project restored to Active Projects");});
    document.getElementById("statusSelect").addEventListener("change",function(e){p.status=e.target.value;saveState();renderProject(p.id);toast("Project status updated")});
    document.getElementById("prioritySelect").addEventListener("change",function(e){p.priority=e.target.value.split(" ")[0];saveState();renderProject(p.id);toast("Project priority updated")});
    document.getElementById("editScope").addEventListener("click",function(){openScope(p.id)});
    document.getElementById("editScopeInline").addEventListener("click",function(){openScope(p.id)});
    document.querySelectorAll("[data-shift-schedule]").forEach(function(button){button.addEventListener("click",function(){var item=p.schedule[Number(button.dataset.shiftSchedule)],days=Number(button.dataset.days);item.start=addDays(item.start,days);item.end=addDays(item.end,days);saveState();renderProject(p.id);toast(stageLabel(item.stage)+" shifted "+Math.abs(days)+" days");});});
    bindAdminEditor(p);
  }
  if(state.role==="user")document.querySelectorAll('[data-add="expenses"]').forEach(function(button){button.addEventListener("click",function(){openEditor(p,"expenses",-1,null);});});
  document.querySelectorAll(".company-logo img").forEach(function(img){img.addEventListener("error",function(){img.remove();});});
  bindCommon();refreshIcons();
}
function renderProjectSchedule(project){
  var bounds=timelineBounds([project]),months=monthMarkers(bounds);
  return '<div class="project-schedule"><div class="project-schedule-head"><span>Stage and dates</span><div>'+months.map(function(m){return '<span style="left:'+m.left+'%">'+esc(m.label)+'</span>'}).join("")+'</div></div>'+project.schedule.map(function(s,i){var left=timelinePosition(s.start,bounds),right=timelinePosition(s.end,bounds);return '<div class="project-schedule-row"><div class="schedule-row-label"><span class="record-icon stage-'+s.stage+'">'+icon(STAGES[s.stage].icon)+'</span><div><strong>'+esc(stageLabel(s.stage))+'</strong><small>'+formatDate(s.start)+' — '+formatDate(s.end)+'</small></div><span class="record-status">'+esc(s.status)+'</span><div class="row-actions">'+(state.role==="admin"?'<button class="icon-button micro" data-shift-schedule="'+i+'" data-days="-7" aria-label="Move '+esc(stageLabel(s.stage))+' one week earlier">'+icon("arrow-left")+'</button><button class="icon-button micro" data-shift-schedule="'+i+'" data-days="7" aria-label="Move '+esc(stageLabel(s.stage))+' one week later">'+icon("arrow-right")+'</button>':'')+adminButton("Edit","schedule",i)+deleteButton("schedule",i)+'</div></div><div class="schedule-row-track">'+months.map(function(m){return '<i style="left:'+m.left+'%"></i>'}).join("")+'<span class="schedule-row-bar stage-'+s.stage+'" style="left:'+left+'%;width:'+Math.max(2,right-left)+'%"></span></div></div>'}).join("")+'</div>';
}
function recordIsOpen(status){return !/^(complete|completed|closed|issued|approved|reviewed|answered|paid)$/i.test(status||"");}
function renderRegisterWorkspace(project,definitions,registers,kind){
  return '<div class="register-grid">'+Object.keys(definitions).map(function(key){var config=definitions[key],items=registers[key]||[],open=items.filter(function(item){return recordIsOpen(item.status);}).length;return '<section class="register-card" data-register-group="'+key+'"><div class="register-head"><span class="record-icon">'+icon(config.icon)+'</span><div><h4>'+esc(config.label)+'</h4><p>'+esc(config.description)+'</p></div><span class="register-count"><b>'+items.length+'</b> total'+(open?' · '+open+' open':'')+'</span></div><div class="register-list">'+(items.length?items.map(function(item,index){return '<article class="register-row"><div class="register-number">'+esc(item.number||config.prefix)+'</div><div class="register-copy"><strong>'+esc(item.title)+'</strong><small>'+formatDate(item.date)+(item.due?' · Due '+formatDate(item.due):'')+(item.responsible?' · '+esc(item.responsible):'')+'</small>'+(item.cost?'<span class="register-cost">'+esc(item.cost)+'</span>':'')+'</div><span class="record-status">'+esc(item.status||"Open")+'</span>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit",kind,index,'data-register-key="'+key+'"')+deleteButton(kind,index,'data-register-key="'+key+'"')+'</div>':'')+'</article>';}).join(""):'<p class="inline-empty">No records yet.</p>')+'</div>'+(state.role==="admin"?'<button class="register-add" data-add="'+kind+'" data-register-key="'+key+'">'+icon("plus")+' Add '+esc(config.prefix)+' record</button>':'')+'</section>';}).join("")+'</div>';
}
function renderConstructionWorkspace(project){
  var total=0,open=0;Object.keys(CONSTRUCTION_REGISTERS).forEach(function(key){var list=project.constructionRegisters[key]||[];total+=list.length;open+=list.filter(function(item){return recordIsOpen(item.status);}).length;});
  return '<div class="stage-workspace-head"><div><span class="section-kicker">CONSTRUCTION CONTROL</span><h3>'+icon("hard-hat")+' Construction Administration</h3><p>Each document type is a live register with its own records, status, dates and responsibility.</p></div><div class="workspace-metrics"><span><b>'+total+'</b>Total Records</span><span><b>'+open+'</b>Open / Pending</span></div></div>'+renderRegisterWorkspace(project,CONSTRUCTION_REGISTERS,project.constructionRegisters,"constructionRegister");
}
function renderPermitWorkspace(project){
  var permit=project.permitData,totalDrawings=0,totalComments=0,openComments=0;
  Object.keys(PERMIT_DISCIPLINES).forEach(function(key){totalDrawings+=(permit.drawings[key]||[]).length;});
  permit.cycles.forEach(function(cycle){totalComments+=cycle.comments.length;openComments+=cycle.comments.filter(function(comment){return !/^(responded|closed|accepted)$/i.test(comment.status);}).length;});
  var drawings='<div class="permit-discipline-grid">'+Object.keys(PERMIT_DISCIPLINES).map(function(key){var config=PERMIT_DISCIPLINES[key],items=permit.drawings[key]||[];return '<section class="permit-discipline" data-permit-discipline="'+key+'"><div class="permit-discipline-head"><span class="record-icon">'+icon(config.icon)+'</span><div><h4>'+esc(config.label)+'</h4><small>'+items.length+' drawing package'+(items.length===1?'':'s')+'</small></div>'+(state.role==="admin"?'<button class="tiny-action" data-add="permitDrawing" data-register-key="'+key+'">'+icon("plus")+'Add</button>':'')+'</div><div class="permit-drawing-list">'+(items.length?items.map(function(item,index){return '<article class="permit-drawing-row"><div><span>'+esc(item.number)+'</span><strong>'+esc(item.title)+'</strong><small>Rev. '+esc(item.revision||"—")+' · '+formatDate(item.date)+'</small></div><span class="record-status">'+esc(item.status)+'</span>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","permitDrawing",index,'data-register-key="'+key+'"')+deleteButton("permitDrawing",index,'data-register-key="'+key+'"')+'</div>':'')+'</article>';}).join(""):'<p class="inline-empty">No '+esc(config.label.toLowerCase())+' package added.</p>')+'</div></section>';}).join("")+'</div>';
  var cycles='<div class="permit-cycle-list">'+(permit.cycles.length?permit.cycles.map(function(cycle,cycleIndex){var responded=cycle.comments.filter(function(comment){return /^(responded|closed|accepted)$/i.test(comment.status);}).length;return '<section class="permit-cycle"><div class="permit-cycle-head"><div><span class="section-kicker">MUNICIPAL REVIEW</span><h4>'+esc(cycle.number)+'</h4><p>Received '+formatDate(cycle.receivedDate)+' · Response due '+formatDate(cycle.responseDue)+(cycle.resubmittedDate?' · Resubmitted '+formatDate(cycle.resubmittedDate):'')+'</p></div><div class="permit-cycle-actions"><span class="record-status">'+esc(cycle.status)+'</span>'+(state.role==="admin"?adminButton("Edit","permitCycle",cycleIndex)+deleteButton("permitCycle",cycleIndex):'')+'</div></div><div class="cycle-progress"><span style="width:'+(cycle.comments.length?Math.round(responded/cycle.comments.length*100):0)+'%"></span></div><div class="permit-comments">'+(cycle.comments.length?cycle.comments.map(function(comment,index){return '<article class="permit-comment"><div class="permit-comment-number"><b>'+esc(comment.number)+'</b><span>'+esc(PERMIT_DISCIPLINES[comment.discipline]?PERMIT_DISCIPLINES[comment.discipline].label:comment.discipline)+'</span></div><div class="permit-comment-copy"><strong>City Comment</strong><p>'+esc(comment.comment)+'</p><strong>Response</strong><p class="permit-response">'+esc(comment.response||"Response not added yet.")+'</p>'+(comment.responseDate?'<small>Responded '+formatDate(comment.responseDate)+'</small>':'')+'</div><div class="permit-comment-state"><span class="record-status">'+esc(comment.status)+'</span>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","permitComment",index,'data-cycle-index="'+cycleIndex+'"')+deleteButton("permitComment",index,'data-cycle-index="'+cycleIndex+'"')+'</div>':'')+'</div></article>';}).join(""):'<p class="inline-empty">No municipal comments recorded in this cycle.</p>')+'</div>'+(state.role==="admin"?'<button class="register-add" data-add="permitComment" data-cycle-index="'+cycleIndex+'">'+icon("message-square-plus")+' Add city comment & response</button>':'')+'</section>';}).join(""):'<p class="workflow-empty">No municipal review cycles have been added.</p>')+'</div>';
  return '<div class="stage-workspace-head"><div><span class="section-kicker">PERMIT CONTROL</span><h3>'+icon("badge-check")+' Permit Submission & Review</h3><p>Discipline drawing packages, submission dates and every municipal comment/response cycle are tracked separately.</p></div>'+(state.role==="admin"?'<button class="secondary-button" data-edit="permitSettings" data-index="-1">'+icon("settings-2")+'Permit details</button>':'')+'</div><section class="permit-metrics"><span><small>Application No.</small><b>'+esc(permit.applicationNumber||"Not added")+'</b><em>'+esc(permit.authority||"Authority not added")+'</em></span><span><small>Permit Submitted</small><b>'+formatDate(permit.submissionDate)+'</b></span><span><small>Permit Issued</small><b>'+formatDate(permit.issuedDate)+'</b></span><span><small>Open Comments</small><b>'+openComments+' / '+totalComments+'</b><em>'+esc(permit.status||"Status not added")+'</em></span></section><div class="permit-section-title"><div><span class="section-kicker">PERMIT DRAWINGS</span><h3>Submitted Drawing Packages</h3></div><span class="count-chip">'+totalDrawings+' packages</span></div>'+drawings+'<div class="permit-section-title"><div><span class="section-kicker">CITY COMMENTS</span><h3>Review Cycles & Response Log</h3></div>'+(state.role==="admin"?'<button data-add="permitCycle">'+icon("plus")+'Add review cycle</button>':'')+'</div>'+cycles;
}
function bidderTotal(bidder){return Number(bidder.baseBid)||0;}
function renderTenderWorkspace(project){
  var tender=project.tenderData,bids=tender.bidders.slice().sort(function(a,b){return bidderTotal(a)-bidderTotal(b);}),winner=bids.find(function(b){return b.winner;});
  return '<div class="stage-workspace-head"><div><span class="section-kicker">TENDER + POST-TENDER</span><h3>'+icon("gavel")+' Tender Management</h3><p>Issue, bidder compliance, prices, clarifications, recommendation and award are kept in one audit-ready workspace.</p></div><div class="tender-phase"><span>Current phase</span><b>'+esc(tender.phase||"Tender")+'</b></div></div>'+
    '<section class="tender-metrics professional"><span><small>Pre-Tender Estimate</small><b>'+formatCurrency(tender.estimate)+'</b></span><span><small>Invitation / Issue</small><b>'+formatDate(tender.invitationDate||tender.issueDate)+'</b></span><span><small>Site Walkthrough</small><b>'+formatDate(tender.siteWalkthrough)+'</b></span><span><small>Tender Closing</small><b>'+formatDate(tender.closingDate)+' · '+esc(tender.closingTime||"Time TBD")+'</b></span><span><small>Bid Validity</small><b>'+esc(tender.bidValidityDays||60)+' days</b></span><span><small>Recommended Bidder</small><b>'+esc(winner?winner.name:"Not selected")+'</b></span></section>'+
    '<section class="bidder-panel"><div class="panel-head"><div><h3>Bidder Comparison</h3><small>Base bid, separate/alternate prices, allowances, unit prices and schedule are compared independently.</small></div>'+(state.role==="admin"?'<div class="tender-actions"><button data-edit="tenderSettings" data-index="-1">'+icon("settings-2")+'Tender setup</button><button data-add="bidders">'+icon("user-plus")+'Add bidder</button></div>':'')+'</div><div class="bid-table-wrap"><table class="bid-table professional"><thead><tr><th>Bidder</th><th>Base Bid</th><th>Separate / Alternate Prices</th><th>Allowances / Unit Prices</th><th>Schedule / Compliance</th><th>Status</th><th></th></tr></thead><tbody>'+bids.map(function(bidder){var index=tender.bidders.indexOf(bidder);return '<tr class="'+(bidder.winner?'winner':'')+'"><td><strong>'+esc(bidder.name)+'</strong><small>'+esc(bidder.contact||"Contact not added")+'</small>'+(bidder.winner?'<span class="winner-badge">'+icon("award")+'Recommended</span>':'')+'</td><td><b>'+formatCurrency(bidder.baseBid)+'</b><small>'+esc(bidder.taxIncluded?"Tax included":"Tax excluded")+'</small></td><td><span class="separate-prices"><b>Separate</b> '+esc(bidder.separatePrices||"None")+'\n<b>Alternates</b> '+esc(bidder.alternatePrices||"None")+'</span></td><td><span class="separate-prices"><b>Cash allowances</b> '+formatCurrency(bidder.cashAllowances)+'\n<b>Unit prices</b> '+esc(bidder.unitPrices||"None")+'</span></td><td><span class="separate-prices"><b>'+esc(bidder.scheduleWeeks||"—")+' weeks</b>\nBond: '+esc(bidder.bond||"Not recorded")+'</span></td><td><span class="record-status">'+esc(bidder.status||"Invited")+'</span></td><td>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","bidders",index)+deleteButton("bidders",index)+'</div>':'')+'</td></tr>';}).join("")+'</tbody></table></div></section>'+
    '<div class="post-tender-head"><span class="section-kicker">CONTROLLED RECORDS</span><h3>Tender RFIs, Addenda & Post-Tender Clarifications</h3><p>A Tender RFI is a bidder’s formal question before closing; each question should keep its issued response and date.</p></div>'+renderRegisterWorkspace(project,TENDER_REGISTERS,tender.registers,"tenderRegister");
}
function renderStageContent(project,key){
  if(project.scope.indexOf(key)===-1) return "";
  if(key==="construction")return renderConstructionWorkspace(project);
  if(key==="tender")return renderTenderWorkspace(project);
  if(key==="permit")return renderPermitWorkspace(project);
  var items=project.stageItems[key]||[];
  var completion=stageCompletion(project,key);
  return '<div class="panel-head stage-detail-head"><div><h3>'+icon(STAGES[key].icon)+" "+esc(STAGES[key].label)+'</h3><small>'+esc(STAGES[key].description)+'</small></div><div class="stage-head-actions"><span class="workflow-count" role="status">'+completion.complete+'/'+completion.total+' milestones complete</span></div></div><div class="workflow-progress" role="progressbar" aria-label="'+esc(stageLabel(key))+' completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+completion.percent+'"><span style="width:'+completion.percent+'%"></span></div><div class="stage-records workflow-list">'+items.map(function(x,i){var status=workflowStatus(x.status);return '<div class="stage-record workflow-row" data-record-id="'+x.id+'"><span class="record-icon">'+icon(x.icon||STAGES[key].icon)+'</span><div class="milestone-copy"><strong>'+esc(x.title)+(x.optional?'<span class="optional-tag">Optional</span>':'')+'</strong>'+(x.detail||x.date?'<small>'+esc(x.detail)+(x.date?' · '+formatDate(x.date):'')+'</small>':'')+'</div><div class="milestone-controls"><div class="row-actions">'+adminButton("Edit","stageItems",i,'data-stage-key="'+key+'"')+deleteButton("stageItems",i,'data-stage-key="'+key+'"')+'</div>'+(state.role==="admin"?'<select class="milestone-status" data-status="'+status.toLowerCase().replace(/[^a-z]+/g,"-")+'" data-milestone-status="'+i+'" data-stage-key="'+key+'" aria-label="Status: '+esc(x.title)+'">'+WORKFLOW_STATUSES.map(function(s){return '<option'+(s===status?' selected':'')+'>'+s+'</option>';}).join("")+'</select>':'<span class="milestone-status read-only" data-status="'+status.toLowerCase().replace(/[^a-z]+/g,"-")+'">'+status+'</span>')+'</div></div>';}).join("")+(items.length?'':'<p class="workflow-empty">No milestones yet.</p>')+'</div>'+(state.role==="admin"?'<button class="add-milestone" data-add="stageItems" data-stage-key="'+key+'">'+icon("plus")+' Add custom milestone</button>':'')+'<p class="workflow-help">N/A items are excluded from progress. Optional items count until marked N/A.</p>';
}

function editorConfig(project,kind,index,stageKey){
  var creating=index<0,item;
  if(kind==="settings")return {title:"Edit Company Header & Branding",description:"Admin-only company identity. Member personal headers are stored separately.",fields:[
    {name:"name",label:"Company Name",value:state.workspace.companyHeader.name},{name:"logo",label:"Company Logo URL",type:"url",value:state.workspace.companyHeader.logo,required:false},{name:"welcome",label:"Company Welcome Text",value:state.workspace.companyHeader.welcome,wide:true},{name:"summary",label:"Dashboard Header Summary",type:"textarea",value:state.workspace.companyHeader.summary,wide:true},{name:"banner",label:"Dashboard Banner Image URL",type:"url",value:state.workspace.companyHeader.banner,wide:true},{name:"accent",label:"Brand Accent",type:"color",value:state.workspace.companyHeader.accent}
  ],validate:function(v){return (!v.logo||/^https:\/\/\S+$/i.test(v.logo))&&/^https:\/\/\S+$/i.test(v.banner)?"":"Use secure HTTPS image URLs for the logo and banner.";},save:function(v){Object.assign(state.workspace.companyHeader,v);state.settings.organization=v.name;state.settings.dashboardHeading=v.welcome;state.settings.dashboardSummary=v.summary;state.settings.dashboardImage=v.banner;applyWorkspaceSettings();renderRoleNavigation();}};
  if(kind==="memberProfile"){
    item=USERS[stageKey];if(!item)return null;
    return {title:"Edit "+item.name,description:"Admin can manage this member’s identity and personal header without changing company branding.",fields:[{name:"name",label:"Display Name",value:item.name},{name:"role",label:"Job Title",value:item.role},{name:"email",label:"Email",type:"email",value:item.email},{name:"photo",label:"Profile Image URL",type:"url",value:item.photo,wide:true},{name:"banner",label:"Personal Header Image URL",type:"url",value:item.banner,wide:true},{name:"welcome",label:"Personal Welcome Text",type:"textarea",value:item.welcome,wide:true}],validate:function(v){return /^https:\/\/\S+$/i.test(v.photo)&&/^https:\/\/\S+$/i.test(v.banner)?"":"Use secure HTTPS image URLs for the profile and banner.";},save:function(v){Object.assign(item,v);item.initials=initials(item.name);}};
  }
  if(kind==="memberSelf"){
    item=USERS[stageKey];if(!item||state.userId!==stageKey)return null;
    var selfFields=[];if(state.workspace.permissions.memberCanEditPhoto)selfFields.push({name:"photo",label:"My Profile Image URL",type:"url",value:item.photo,wide:true});if(state.workspace.permissions.memberCanEditBanner)selfFields.push({name:"banner",label:"My Personal Header Image URL",type:"url",value:item.banner,wide:true});
    return {title:"Edit My Header Images",description:"These images belong only to your personal workspace. Company branding remains admin-controlled.",fields:selfFields,validate:function(v){return Object.keys(v).every(function(key){return /^https:\/\/\S+$/i.test(v[key]);})?"":"Use secure HTTPS image URLs.";},save:function(v){Object.assign(item,v);applyRoleNavigation(item);}};
  }
  if(kind==="workspaceGeneral")return {title:"General Workspace Settings",description:"Permissions and workspace-wide defaults. These controls are available to admins only.",fields:[{name:"workspaceTitle",label:"Application Header Title",value:state.workspace.general.workspaceTitle,wide:true},{name:"timezone",label:"Workspace Timezone",value:state.workspace.general.timezone},{name:"dateFormat",label:"Date Format",value:state.workspace.general.dateFormat},{name:"memberCanEditPhoto",label:"Members may edit their own profile image",type:"checkbox",value:state.workspace.permissions.memberCanEditPhoto},{name:"memberCanEditBanner",label:"Members may edit their own personal banner",type:"checkbox",value:state.workspace.permissions.memberCanEditBanner}],save:function(v){state.workspace.general.workspaceTitle=v.workspaceTitle;state.workspace.general.timezone=v.timezone;state.workspace.general.dateFormat=v.dateFormat;state.workspace.permissions.memberCanEditPhoto=v.memberCanEditPhoto;state.workspace.permissions.memberCanEditBanner=v.memberCanEditBanner;state.settings.workspaceTitle=v.workspaceTitle;}};
  if(kind==="projectType")return {title:"Add Project Category or Subtype",description:"Choose an existing category to add a subtype, or enter a new category. This registry belongs to the current workspace.",fields:[{name:"category",label:"Category",value:"",wide:true},{name:"subtype",label:"Optional Subtype",value:"",wide:true,required:false}],validate:function(v){return String(v.category||"").trim()?"":"Category is required.";},save:function(v){var name=String(v.category).trim(),subtype=String(v.subtype||"").trim(),group=state.projectTypes.find(function(type){return type.name.toLowerCase()===name.toLowerCase();});if(!group){group={name:name,subtypes:[],workspaceId:state.activeWorkspaceId};state.projectTypes.push(group);}if(subtype&&!group.subtypes.some(function(item){return item.toLowerCase()===subtype.toLowerCase();}))group.subtypes.push(subtype);state.projectTypes.sort(function(a,b){return a.name.localeCompare(b.name);});}};
  if(kind==="clientProfile"){
    item=state.clients.find(function(client){return client.id===stageKey;});if(!item)return null;
    return {title:"Edit "+item.name,description:"This reusable client profile and logo are shared across client cards, project pages and selectors in this workspace.",fields:[{name:"name",label:"Company Name",value:item.name,wide:true},{name:"logo",label:"Company Logo URL",type:"url",value:item.logo||"",wide:true,required:false},{name:"email",label:"Company Email",type:"email",value:item.email||"",required:false},{name:"phone",label:"Company Phone",type:"tel",value:item.phone||"",required:false},{name:"address",label:"Company Address",value:item.address||"",wide:true,required:false},{name:"contacts",label:"Contacts (Name | Title | Email | Phone)",type:"textarea",value:item.contacts.map(function(contact){return [contact.name,contact.title,contact.email,contact.phone].join(" | ");}).join("\n"),wide:true,required:false}],validate:function(v){return !v.logo||/^https:\/\/\S+$/i.test(v.logo)?"":"Use a secure HTTPS image URL for the client logo.";},save:function(v){var oldName=item.name;item.name=v.name;item.logo=v.logo;item.email=v.email;item.phone=v.phone;item.address=v.address;item.contacts=String(v.contacts||"").split(/\n+/).map(function(line){var parts=line.split("|").map(function(part){return part.trim();});return {id:uid("contact"),name:parts[0]||"",title:parts[1]||"Contact",email:parts[2]||"",phone:parts[3]||""};}).filter(function(contact){return contact.name;});allWorkspaceProjects().filter(function(project){return project.clientId===item.id;}).forEach(function(project){project.client=item.name;project.companies.filter(function(company){return companyDirectoryType(company)==="clients";}).forEach(function(company){company.name=item.name;company.logo=item.logo;if(!company.email)company.email=item.email;if(!company.phone)company.phone=item.phone;});});currentCompanyKey=clientKey(item.name);}};
  }
  if(kind==="companyLogo"){
    item=project&&project.companies[index];if(!item)return null;
    return {title:"Edit "+item.name+" Logo",description:"This logo stays attached to the company record inside "+project.number+".",fields:[{name:"logo",label:"Company Logo URL",type:"url",value:item.logo||"",wide:true,required:false}],validate:function(v){return !v.logo||/^https:\/\/\S+$/i.test(v.logo)?"":"Use a secure HTTPS image URL.";},save:function(v){item.logo=v.logo;var client=state.clients.find(function(record){return record.id===project.clientId&&companyDirectoryType(item)==="clients";});if(client)client.logo=v.logo;}};
  }
  if(kind==="expenses"||kind==="memberExpense"){
    var memberSubmission=kind==="memberExpense",targetProject=memberSubmission?null:project;
    item=memberSubmission||creating?{id:uid("expense"),workspaceId:state.activeWorkspaceId,projectId:targetProject?targetProject.id:"",type:"Site Visit",description:"",amount:0,date:isoDate(new Date()),paidBy:state.role==="user"?state.userId:"admin",invoiceNumber:"",vendor:"",paymentMethod:state.role==="user"?"Personal Card":"Company Card",receipt:"",notes:"",paymentStatus:"Paid",reimbursementStatus:state.role==="user"?"Pending":"Not Required",createdBy:state.role==="user"?state.userId:"admin"}:project.expenses[index];
    var fields=[];
    if(memberSubmission)fields.push({name:"projectId",label:"Related Project",type:"select",options:visibleProjects().map(function(p){return [p.id,p.number+' · '+p.name];}),value:item.projectId||visibleProjects()[0]&&visibleProjects()[0].id});
    fields=fields.concat([{name:"type",label:"Expense Type",type:"select",options:EXPENSE_TYPES.map(function(type){return [type,type];}),value:item.type},{name:"description",label:"Description",value:item.description,wide:true},{name:"amount",label:"Amount (CAD)",type:"number",step:"0.01",value:item.amount},{name:"date",label:"Date",type:"date",value:item.date}]);
    if(state.role==="admin")fields.push({name:"paidBy",label:"Paid By",type:"select",options:[["admin","Hosis Admin"]].concat(Object.keys(USERS).map(function(id){return [id,USERS[id].name];})),value:item.paidBy});
    fields=fields.concat([{name:"invoiceNumber",label:"Invoice / Receipt Number",value:item.invoiceNumber||"",required:false},{name:"vendor",label:"Vendor",value:item.vendor||"",required:false},{name:"paymentMethod",label:"Payment Method",type:"select",options:PAYMENT_METHODS.map(function(method){return [method,method];}),value:item.paymentMethod},{name:"receipt",label:"Receipt Attachment URL",type:"url",value:item.receipt||"",wide:true,required:false},{name:"paymentStatus",label:"Payment Status",type:"select",options:[["Paid","Paid"],["Pending","Pending"],["Cancelled","Cancelled"]],value:item.paymentStatus},{name:"reimbursementStatus",label:"Reimbursement Status",type:"select",options:[["Pending","Pending"],["Reimbursed","Reimbursed"],["Not Required","Not Required"],["Rejected","Rejected"]],value:item.reimbursementStatus},{name:"notes",label:"Notes",type:"textarea",value:item.notes||"",wide:true,required:false}]);
    return {title:(creating||memberSubmission)?"Submit Expense":"Edit Expense",description:"This record is shared by the related project, member Expenses and Admin Accounting.",fields:fields,validate:function(v){if(memberSubmission&&!v.projectId)return "Select a related project.";if(!(Number(v.amount)>0))return "Amount must be greater than zero.";if(v.receipt&&!/^https:\/\/\S+$/i.test(v.receipt))return "Use a secure HTTPS receipt attachment URL.";return "";},save:function(v){var destination=memberSubmission?projectById(v.projectId):project;if(!destination)return;delete v.projectId;v.amount=Number(v.amount)||0;if(state.role==="user")v.paidBy=state.userId;Object.assign(item,v,{workspaceId:state.activeWorkspaceId,projectId:destination.id});if(creating||memberSubmission)destination.expenses.push(item);}};
  }
  function stageChoices(){return project.scope.map(function(k){return [k,stageLabel(k)]});}
  if(kind==="project")return {title:"Edit Project Information",description:"Update overview, access and the project image.",fields:[
    {name:"number",label:"Project Number",value:project.number},{name:"name",label:"Project Name",value:project.name},{name:"address",label:"Address",value:project.address},{name:"typeCategory",label:"Project Type Category",type:"select",options:state.projectTypes.map(function(type){return [type.name,type.name];}),value:project.typeCategory},{name:"typeSubtype",label:"Project Subtype",value:project.typeSubtype||"",required:false},{name:"area",label:"Project Area",value:project.area},{name:"client",label:"Client",value:project.client},{name:"owner",label:"Owner",value:project.owner},{name:"contractor",label:"General Contractor",value:project.contractor},{name:"status",label:"Current Status",value:project.status},{name:"priority",label:"Priority",type:"select",options:[["High","High"],["Medium","Medium"],["Low","Low"]],value:project.priority},{name:"image",label:"Project Image URL",value:project.image,wide:true},{name:"summary",label:"Project Scope Summary",type:"textarea",value:project.summary,wide:true},{name:"assigned",label:"Assigned Users",type:"checks",options:Object.keys(USERS).map(function(k){return [k,USERS[k].name]}),value:project.assigned,wide:true}
  ],save:function(v){Object.keys(v).forEach(function(k){project[k]=v[k]});project.type=project.typeSubtype||project.typeCategory;var group=state.projectTypes.find(function(type){return type.name===project.typeCategory;});if(group&&project.typeSubtype&&group.subtypes.indexOf(project.typeSubtype)<0)group.subtypes.push(project.typeSubtype);var client=state.clients.find(function(item){return item.workspaceId===state.activeWorkspaceId&&clientKey(item.name)===clientKey(project.client);});if(!client){client={id:clientIdFor(project.client),workspaceId:state.activeWorkspaceId,name:project.client,logo:"",contacts:[],email:"",phone:"",address:project.address};state.clients.push(client);}project.clientId=client.id;}};
  if(kind==="team"){
    item=creating?{id:uid("team"),workspaceId:state.activeWorkspaceId,role:"Consultant",name:""}:project.team[index];
    return {title:creating?"Add Team Member":"Edit Team Member",fields:[{name:"role",label:"Role / Discipline",value:item.role},{name:"name",label:"Name / Company",value:item.name},{name:"email",label:"Email",type:"email",value:item.email||"",required:false},{name:"phone",label:"Phone",type:"tel",value:item.phone||"",required:false}],save:function(v){Object.assign(item,v,{workspaceId:state.activeWorkspaceId});if(creating)project.team.push(item)}};
  }
  if(kind==="companies"){
    item=creating?{id:uid("company"),workspaceId:state.activeWorkspaceId,category:"Consultant",name:"",contact:"",email:"",phone:"",logo:""}:project.companies[index];
    return {title:creating?"Add Project Company":"Edit Project Company",description:"Client, contractor and consultant details. Contact fields and logo are optional; use an HTTPS logo image URL.",fields:[{name:"category",label:"Company Role / Discipline",value:item.category},{name:"name",label:"Company Name",value:item.name},{name:"contact",label:"Contact Person",value:item.contact,required:false},{name:"email",label:"Email",type:"email",value:item.email,required:false},{name:"phone",label:"Phone",type:"tel",value:item.phone,required:false},{name:"logo",label:"Logo Image URL",type:"url",value:item.logo,required:false}],validate:function(v){return !v.logo||/^https:\/\/\S+$/i.test(v.logo)?"":"Use an HTTPS image URL for the logo.";},save:function(v){Object.assign(item,v,{workspaceId:state.activeWorkspaceId});if(creating)project.companies.push(item);}};
  }
  if(kind==="schedule"){
    item=creating?{id:uid("sch"),workspaceId:state.activeWorkspaceId,stage:project.scope[0],start:"2026-09-01",end:"2026-10-01",status:"Not Started"}:project.schedule[index];
    return {title:creating?"Add Schedule Item":"Edit Schedule Item",description:"Stage bars can overlap when work happens at the same time.",fields:[{name:"stage",label:"Project Stage",type:"select",options:stageChoices(),value:item.stage},{name:"start",label:"Start Date",type:"date",value:item.start},{name:"end",label:"End Date",type:"date",value:item.end},{name:"status",label:"Status",type:"select",options:[["Not Started","Not Started"],["Ongoing","Ongoing"],["Complete","Complete"],["On Hold","On Hold"]],value:item.status}],validate:function(v){return v.end>=v.start?"":"End date must be on or after the start date."},save:function(v){Object.assign(item,v,{workspaceId:state.activeWorkspaceId});if(creating)project.schedule.push(item);sortSchedule(project)}};
  }
  if(kind==="deadlines"){
    item=creating?["New Deadline","2026-09-15",project.scope[0]]:project.deadlines[index];
    return {title:creating?"Add Deadline":"Edit Deadline",fields:[{name:"title",label:"Deadline",value:item[0]},{name:"date",label:"Due Date",type:"date",value:item[1]},{name:"stage",label:"Stage",type:"select",options:stageChoices(),value:item[2]}],save:function(v){var row=[v.title,v.date,v.stage];if(creating)project.deadlines.push(row);else project.deadlines[index]=row}};
  }
  if(kind==="tasks"){
    item=creating?[uid("task"),"New Project Task","2026-09-15","Medium",false]:project.tasks[index];
    return {title:creating?"Add Project Task":"Edit Project Task",fields:[{name:"title",label:"Task",value:item[1],wide:true},{name:"date",label:"Due Date",type:"date",value:item[2]},{name:"priority",label:"Priority",type:"select",options:[["High","High"],["Medium","Medium"],["Low","Low"]],value:item[3]},{name:"complete",label:"Completed",type:"checkbox",value:item[4]}],save:function(v){var row=[item[0],v.title,v.date,v.priority,v.complete];if(creating)project.tasks.push(row);else project.tasks[index]=row}};
  }
  if(kind==="activity"){
    item=creating?["New project activity","Today",project.scope[0]]:project.activity[index];
    return {title:creating?"Add Activity":"Edit Activity",fields:[{name:"title",label:"Activity",value:item[0],wide:true},{name:"when",label:"When",value:item[1]},{name:"stage",label:"Stage",type:"select",options:stageChoices(),value:item[2]}],save:function(v){var row=[v.title,v.when,v.stage];if(creating)project.activity.unshift(row);else project.activity[index]=row}};
  }
  if(kind==="documents"){
    item=creating?["New Document",project.scope[0],"PDF · Pending upload"]:project.documents[index];
    return {title:creating?"Add Document":"Edit Document",fields:[{name:"title",label:"Document Name",value:item[0],wide:true},{name:"stage",label:"Stage",type:"select",options:stageChoices(),value:item[1]},{name:"meta",label:"File Type / Size",value:item[2]}],save:function(v){var row=[v.title,v.stage,v.meta];if(creating)project.documents.push(row);else project.documents[index]=row}};
  }
  if(kind==="meetings"){
    item=creating?{id:uid("meeting"),workspaceId:state.activeWorkspaceId,title:"Project Coordination Meeting",category:"Weekly Meeting",date:"2026-09-08",time:"10:00",stage:project.scope[0],location:"Microsoft Teams",attendees:"",notes:"",actions:[]}:project.meetings[index];
    return {title:creating?"Add Project Meeting":"Edit Project Meeting",description:"Record the meeting type, date, participants and decisions. Action items are added separately and become Project Tasks.",fields:[{name:"title",label:"Meeting Title",value:item.title,wide:true},{name:"category",label:"Meeting Category",type:"select",options:MEETING_CATEGORIES.map(function(category){return [category,category];}),value:item.category||"Weekly Meeting"},{name:"date",label:"Meeting Date",type:"date",value:item.date},{name:"time",label:"Time",type:"time",value:item.time||""},{name:"stage",label:"Related Stage",type:"select",options:stageChoices(),value:item.stage},{name:"location",label:"Location / Link",value:item.location||"",required:false},{name:"attendees",label:"Attendees",value:item.attendees||"",wide:true,required:false},{name:"notes",label:"Minutes / Decisions",type:"textarea",value:item.notes||"",wide:true}],save:function(v){Object.assign(item,v,{workspaceId:state.activeWorkspaceId});if(creating)project.meetings.push(item);}};
  }
  if(kind==="meetingActions"){
    var meeting=project.meetings[Number(stageKey)],action=creating?{id:uid("action"),title:"",assignee:"",due:meeting.date,priority:"Medium",taskId:uid("task")}:meeting.actions[index];
    var linked=creating?null:project.tasks.find(function(task){return task[0]===action.taskId;});
    return {title:creating?"Add Meeting Action & Project Task":"Edit Meeting Action",description:"This action is synchronized with Project Tasks. Changing its title, due date, priority or completion updates both locations.",fields:[{name:"title",label:"Action / Task",value:linked?linked[1]:action.title,wide:true},{name:"assignee",label:"Assigned To",value:action.assignee||""},{name:"due",label:"Due Date",type:"date",value:linked?linked[2]:action.due},{name:"priority",label:"Priority",type:"select",options:[["High","High"],["Medium","Medium"],["Low","Low"]],value:linked?linked[3]:action.priority},{name:"complete",label:"Completed",type:"checkbox",value:linked?linked[4]:false}],save:function(v){action.title=v.title;action.assignee=v.assignee;action.due=v.due;action.priority=v.priority;var task=project.tasks.find(function(row){return row[0]===action.taskId;});var row=[action.taskId,v.title,v.due,v.priority,v.complete,{meetingId:meeting.id}];if(task)project.tasks[project.tasks.indexOf(task)]=row;else project.tasks.push(row);if(creating)meeting.actions.push(action);}};
  }
  if(kind==="permitSettings"){
    item=project.permitData;
    return {title:"Permit Application Details",description:"Track the submission and issued dates separately. The issued date can remain blank until the permit is released.",fields:[{name:"applicationNumber",label:"Application / Permit Number",value:item.applicationNumber||""},{name:"authority",label:"Municipality / Authority",value:item.authority||""},{name:"status",label:"Permit Status",type:"select",options:[["Not Submitted","Not Submitted"],["Submitted","Submitted"],["Under Review","Under Review"],["Comments Received","Comments Received"],["Resubmitted","Resubmitted"],["Issued","Issued"],["Closed","Closed"]],value:item.status||"Under Review"},{name:"submissionDate",label:"Permit Submitted Date",type:"date",value:item.submissionDate||"",required:false},{name:"issuedDate",label:"Permit Issued Date",type:"date",value:item.issuedDate||"",required:false}],save:function(v){Object.assign(item,v);}};
  }
  if(kind==="permitDrawing"){
    var discipline=stageKey,drawings=project.permitData.drawings[discipline],drawingConfig=PERMIT_DISCIPLINES[discipline];
    item=creating?permitDrawing(drawingConfig.prefix,drawings.length+1,drawingConfig.label+" permit drawing set","Pending",project.permitData.submissionDate):drawings[index];
    return {title:(creating?"Add ":"Edit ")+drawingConfig.label+" Permit Drawings",description:"Each consultant discipline can have multiple submissions or revisions.",fields:[{name:"number",label:"Package Number",value:item.number},{name:"title",label:"Drawing Package Title",value:item.title,wide:true},{name:"revision",label:"Revision",value:item.revision||""},{name:"status",label:"Package Status",type:"select",options:[["Pending","Pending"],["Submitted","Submitted"],["Revised","Revised"],["Accepted","Accepted"],["Superseded","Superseded"]],value:item.status||"Pending"},{name:"date",label:"Submission Date",type:"date",value:item.date||"",required:false},{name:"notes",label:"Notes",type:"textarea",value:item.notes||"",wide:true,required:false}],save:function(v){Object.assign(item,v);if(creating)drawings.push(item);}};
  }
  if(kind==="permitCycle"){
    item=creating?{id:uid("cycle"),number:"Cycle "+String(project.permitData.cycles.length+1).padStart(2,"0"),receivedDate:"2026-09-01",responseDue:"2026-09-15",resubmittedDate:"",status:"Response in Progress",comments:[]}:project.permitData.cycles[index];
    return {title:creating?"Add Municipal Review Cycle":"Edit Municipal Review Cycle",description:"Create a new cycle each time the municipality issues a fresh set of comments.",fields:[{name:"number",label:"Cycle Name / Number",value:item.number},{name:"receivedDate",label:"Comments Received Date",type:"date",value:item.receivedDate||"",required:false},{name:"responseDue",label:"Response Due Date",type:"date",value:item.responseDue||"",required:false},{name:"resubmittedDate",label:"Resubmitted Date",type:"date",value:item.resubmittedDate||"",required:false},{name:"status",label:"Cycle Status",type:"select",options:[["Comments Received","Comments Received"],["Response in Progress","Response in Progress"],["Resubmitted","Resubmitted"],["Accepted","Accepted"],["Closed","Closed"]],value:item.status||"Comments Received"}],save:function(v){Object.assign(item,v);if(creating)project.permitData.cycles.push(item);}};
  }
  if(kind==="permitComment"){
    var cycle=project.permitData.cycles[Number(stageKey)];
    item=creating?permitComment("A-"+String(cycle.comments.length+1).padStart(2,"0"),"architectural","","","Open",""):cycle.comments[index];
    return {title:creating?"Add City Comment & Response":"Edit City Comment & Response",description:"A cycle can contain any number of comments. Keep the city comment and your latest response together.",fields:[{name:"number",label:"Comment Number",value:item.number},{name:"discipline",label:"Discipline",type:"select",options:Object.keys(PERMIT_DISCIPLINES).map(function(key){return [key,PERMIT_DISCIPLINES[key].label];}),value:item.discipline},{name:"status",label:"Response Status",type:"select",options:[["Open","Open"],["In Progress","In Progress"],["Responded","Responded"],["Accepted","Accepted"],["Closed","Closed"]],value:item.status||"Open"},{name:"comment",label:"City Comment / Question",type:"textarea",value:item.comment,wide:true},{name:"response",label:"Architect / Consultant Response",type:"textarea",value:item.response||"",wide:true,required:false},{name:"responseDate",label:"Response Date",type:"date",value:item.responseDate||"",required:false}],save:function(v){Object.assign(item,v);if(creating)cycle.comments.push(item);}};
  }
  if(kind==="constructionRegister"||kind==="tenderRegister"){
    var definitions=kind==="constructionRegister"?CONSTRUCTION_REGISTERS:TENDER_REGISTERS;
    var registers=kind==="constructionRegister"?project.constructionRegisters:project.tenderData.registers;
    var config=definitions[stageKey],list=registers[stageKey];
    item=creating?registerRecord(config.prefix,list.length+1,"New "+config.label.replace(/s$/,""),"Open","2026-09-01","","Project Team",""):list[index];
    return {title:(creating?"Add ":"Edit ")+config.label+" Record",description:"Maintain a separate dated register entry with status, responsibility and cost where applicable.",fields:[{name:"number",label:"Record Number",value:item.number},{name:"title",label:"Title / Subject",value:item.title,wide:true},{name:"status",label:"Status",value:item.status},{name:"date",label:"Date Issued / Received",type:"date",value:item.date},{name:"due",label:"Response / Due Date",type:"date",value:item.due||"",required:false},{name:"responsible",label:"Responsible Party",value:item.responsible||"",required:false},{name:"cost",label:"Cost / Value",value:item.cost||"",required:false},{name:"description",label:"Notes / Description",type:"textarea",value:item.description||"",wide:true,required:false}],save:function(v){Object.assign(item,v);if(creating)list.push(item);}};
  }
  if(kind==="bidders"){
    item=creating?{id:uid("bidder"),name:"",contact:"",baseBid:0,separatePrices:"",alternatePrices:"",cashAllowances:0,unitPrices:"",scheduleWeeks:0,bond:"Not recorded",taxIncluded:false,status:"Invited",winner:false,notes:""}:project.tenderData.bidders[index];
    return {title:creating?"Add Tender Bidder":"Edit Tender Bidder",description:"Keep each price category separate so the recommendation is based on a compliant comparison, not only the lowest base bid.",fields:[{name:"name",label:"Bidder / Contractor",value:item.name,wide:true},{name:"contact",label:"Contact Person",value:item.contact||"",required:false},{name:"baseBid",label:"Base Bid (CAD)",type:"number",value:item.baseBid||0},{name:"cashAllowances",label:"Cash Allowances (CAD)",type:"number",value:item.cashAllowances||0},{name:"separatePrices",label:"Separate Prices",type:"textarea",value:item.separatePrices||"",wide:true,required:false},{name:"alternatePrices",label:"Alternate Prices",type:"textarea",value:item.alternatePrices||"",wide:true,required:false},{name:"unitPrices",label:"Unit Prices",type:"textarea",value:item.unitPrices||"",wide:true,required:false},{name:"scheduleWeeks",label:"Construction Duration (weeks)",type:"number",value:item.scheduleWeeks||0},{name:"bond",label:"Bid Bond / Consent of Surety",value:item.bond||"",required:false},{name:"taxIncluded",label:"Tax included in base bid",type:"checkbox",value:!!item.taxIncluded},{name:"status",label:"Bid Status",type:"select",options:[["Invited","Invited"],["Declined","Declined"],["Submitted","Submitted"],["Late / Non-Compliant","Late / Non-Compliant"],["Clarification","Clarification"],["Recommended","Recommended"],["Unsuccessful","Unsuccessful"],["Awarded","Awarded"]],value:item.status||"Invited"},{name:"winner",label:"Recommended / Winning Bidder",type:"checkbox",value:!!item.winner},{name:"notes",label:"Exclusions / Qualifications / Notes",type:"textarea",value:item.notes||"",wide:true,required:false}],save:function(v){v.baseBid=Number(v.baseBid)||0;v.cashAllowances=Number(v.cashAllowances)||0;v.scheduleWeeks=Number(v.scheduleWeeks)||0;if(v.winner)project.tenderData.bidders.forEach(function(b){b.winner=false;});Object.assign(item,v);if(creating)project.tenderData.bidders.push(item);}};
  }
  if(kind==="tenderSettings"){
    item=project.tenderData;
    return {title:"Tender Setup",description:"Manage Pre-Tender, Tender and Post-Tender dates, controls and estimate.",fields:[{name:"phase",label:"Current Phase",type:"select",options:[["Pre-Tender","Pre-Tender"],["Tender","Tender"],["Post-Tender","Post-Tender"],["Awarded","Awarded"],["Closed","Closed"]],value:item.phase||"Tender"},{name:"invitationDate",label:"Invitation Date",type:"date",value:item.invitationDate||item.issueDate,required:false},{name:"issueDate",label:"Tender Issue Date",type:"date",value:item.issueDate,required:false},{name:"siteWalkthrough",label:"Mandatory Site Walkthrough",type:"date",value:item.siteWalkthrough||"",required:false},{name:"closingDate",label:"Tender Closing Date",type:"date",value:item.closingDate},{name:"closingTime",label:"Tender Closing Time",type:"time",value:item.closingTime||"14:00"},{name:"bidValidityDays",label:"Bid Validity (days)",type:"number",value:item.bidValidityDays||60},{name:"estimate",label:"Pre-Tender Estimate (CAD)",type:"number",value:item.estimate||0}],save:function(v){v.estimate=Number(v.estimate)||0;v.bidValidityDays=Number(v.bidValidityDays)||0;Object.assign(item,v);}};
  }
  if(kind==="stageItems"){
    item=creating?{id:uid("rec"),title:"",detail:"",status:"Not started",icon:STAGES[stageKey].icon,date:"",optional:false}:project.stageItems[stageKey][index];
    return {title:(creating?"Add ":"Edit ")+stageLabel(stageKey)+" Milestone",fields:[{name:"title",label:"Milestone Name",value:item.title,wide:true},{name:"detail",label:"Details / Comment",type:"textarea",value:item.detail,wide:true},{name:"status",label:"Status",type:"select",options:WORKFLOW_STATUSES.map(function(s){return [s,s];}),value:workflowStatus(item.status)},{name:"date",label:"Date",type:"date",value:item.date||"",required:false},{name:"optional",label:"Optional milestone",type:"checkbox",value:!!item.optional}],save:function(v){Object.assign(item,v);if(creating)project.stageItems[stageKey].push(item)}};
  }
  return null;
}
function fieldHtml(field){
  var cls='edit-field'+(field.wide?' wide':'');
  if(field.type==="textarea")return '<label class="'+cls+'"><span>'+esc(field.label)+'</span><textarea name="'+field.name+'">'+esc(field.value)+'</textarea></label>';
  if(field.type==="select")return '<label class="'+cls+'"><span>'+esc(field.label)+'</span><select name="'+field.name+'">'+field.options.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(field.value)?' selected':'')+'>'+esc(o[1])+'</option>'}).join("")+'</select></label>';
  if(field.type==="checks")return '<fieldset class="'+cls+'"><legend>'+esc(field.label)+'</legend><div class="check-grid">'+field.options.map(function(o){return '<label><input type="checkbox" name="'+field.name+'" value="'+esc(o[0])+'"'+(field.value.indexOf(o[0])>-1?' checked':'')+'><span>'+esc(o[1])+'</span></label>'}).join("")+'</div></fieldset>';
  if(field.type==="checkbox")return '<label class="'+cls+' checkbox-field"><input type="checkbox" name="'+field.name+'"'+(field.value?' checked':'')+'><span>'+esc(field.label)+'</span></label>';
  return '<label class="'+cls+'"><span>'+esc(field.label)+'</span><input name="'+field.name+'" type="'+(field.type||'text')+'" value="'+esc(field.value)+'"'+(field.step?' step="'+esc(field.step)+'"':'')+(field.required===false?'':' required')+'></label>';
}
function openEditor(project,kind,index,stageKey){
  var selfEdit=kind==="memberSelf"&&state.role==="user"&&state.userId===stageKey;
  var expenseEdit=state.role==="user"&&(kind==="memberExpense"||(kind==="expenses"&&project&&project.assigned.indexOf(state.userId)>-1&&index<0));
  if(state.role!=="admin"&&!selfEdit&&!expenseEdit)return;var cfg=editorConfig(project,kind,index,stageKey);if(!cfg)return;
  editContext={project:project,kind:kind,index:index,stageKey:stageKey,config:cfg};
  document.querySelector("#editModal .eyebrow").textContent=selfEdit?"PROFILE EDITOR":expenseEdit?"EXPENSE SUBMISSION":"ADMIN EDITOR";
  document.getElementById("editModalTitle").textContent=cfg.title;document.getElementById("editModalDescription").textContent=cfg.description||"Changes are saved locally in this browser.";
  document.getElementById("editFields").innerHTML=cfg.fields.map(fieldHtml).join("");document.getElementById("editModal").classList.remove("hidden");refreshIcons();
}
function closeEditor(){document.getElementById("editModal").classList.add("hidden");editContext=null;}
function saveEditor(form){
  if(!editContext)return;var data=new FormData(form),values={};
  editContext.config.fields.forEach(function(f){if(f.type==="checks")values[f.name]=data.getAll(f.name);else if(f.type==="checkbox")values[f.name]=data.has(f.name);else values[f.name]=data.get(f.name)});
  var error=editContext.config.validate?editContext.config.validate(values):"";if(error){toast(error);return}
  editContext.config.save(values);saveState();var project=editContext.project,kind=editContext.kind;if(kind==="memberProfile")populateWelcomeUsers();closeEditor();if(kind==="companyLogo"||kind==="settings"||kind==="workspaceGeneral"||kind==="projectType")renderSettingsPage();else if(kind==="clientProfile"){if(currentView==="settings")renderSettingsPage();else renderCompanyProfile();}else if(kind==="memberProfile"){if(currentView==="members")renderMembersPage();else if(currentView==="settings")renderSettingsPage();else renderDashboard();}else if(kind==="memberSelf")renderDashboard();else if(kind==="memberExpense")renderExpensesPage();else if(kind==="expenses"&&currentView==="accounting")renderAccountingPage();else if(project)renderProject(project.id);toast("Changes saved");
}
function deleteRecord(project,kind,index,stageKey){
  if(!confirm("Delete this record?"))return;
  if(kind==="stageItems")project.stageItems[stageKey].splice(index,1);
  else if(kind==="meetingActions"){
    var meeting=project.meetings[Number(stageKey)],action=meeting.actions[index];
    project.tasks=project.tasks.filter(function(task){return task[0]!==action.taskId;});meeting.actions.splice(index,1);
  }
  else if(kind==="constructionRegister")project.constructionRegisters[stageKey].splice(index,1);
  else if(kind==="tenderRegister")project.tenderData.registers[stageKey].splice(index,1);
  else if(kind==="bidders")project.tenderData.bidders.splice(index,1);
  else if(kind==="permitDrawing")project.permitData.drawings[stageKey].splice(index,1);
  else if(kind==="permitCycle")project.permitData.cycles.splice(index,1);
  else if(kind==="permitComment")project.permitData.cycles[Number(stageKey)].comments.splice(index,1);
  else project[kind].splice(index,1);
  saveState();renderProject(project.id);toast("Record deleted");
}
function bindAdminEditor(project){
  document.querySelectorAll("[data-milestone-status]").forEach(function(el){el.addEventListener("change",function(){
    var key=el.dataset.stageKey,item=project.stageItems[key][Number(el.dataset.milestoneStatus)];
    if(state.role!=="admin"||WORKFLOW_STATUSES.indexOf(el.value)===-1)return;
    item.status=el.value;saveState();el.dataset.status=el.value.toLowerCase().replace(/[^a-z]+/g,"-");
    var completion=stageCompletion(project,key),progress=document.querySelector(".workflow-progress");
    document.querySelector(".workflow-count").textContent=completion.complete+"/"+completion.total+" milestones complete";
    progress.setAttribute("aria-valuenow",completion.percent);progress.firstElementChild.style.width=completion.percent+"%";
    document.querySelector('[data-stage="'+key+'"] small').textContent=completion.percent+"% complete";
    toast("Milestone status saved");
  });});
  document.querySelectorAll("[data-edit]").forEach(function(b){b.addEventListener("click",function(){openEditor(project,b.dataset.edit,Number(b.dataset.index),b.dataset.stageKey||b.dataset.meetingIndex||b.dataset.registerKey||b.dataset.cycleIndex||null)})});
  document.querySelectorAll("[data-add]").forEach(function(b){b.addEventListener("click",function(){openEditor(project,b.dataset.add,-1,b.dataset.stageKey||b.dataset.meetingIndex||b.dataset.registerKey||b.dataset.cycleIndex||null)})});
  document.querySelectorAll("[data-delete]").forEach(function(b){b.addEventListener("click",function(){deleteRecord(project,b.dataset.delete,Number(b.dataset.index),b.dataset.stageKey||b.dataset.meetingIndex||b.dataset.registerKey||b.dataset.cycleIndex||null)})});
}

function openScope(id){
  if(state.role!=="admin") return;
  var p=projectById(id);scopeEditingId=id;
  document.getElementById("scopeModalTitle").textContent="Edit Scope · "+p.number;
  document.getElementById("scopeOptions").innerHTML=Object.keys(STAGES).map(function(k){return '<label class="scope-option"><input type="checkbox" value="'+k+'"'+(p.scope.indexOf(k)>-1?" checked":"")+'><span>'+icon(STAGES[k].icon)+'</span><span><strong>'+esc(STAGES[k].label)+'</strong><small>'+esc(STAGES[k].description)+'</small></span></label>'}).join("");
  document.getElementById("scopeModal").classList.remove("hidden");refreshIcons();
}
function closeScope(){document.getElementById("scopeModal").classList.add("hidden");scopeEditingId=null}
function saveScope(){
  var selected=Array.from(document.querySelectorAll("#scopeOptions input:checked")).map(function(x){return x.value});
  if(!selected.length){toast("Select at least one project stage");return}
  var p=projectById(scopeEditingId),oldSchedule=p.schedule.slice();p.scope=selected;
  selected.forEach(function(key){
    if(!Array.isArray(p.stageItems[key]))p.stageItems[key]=defaultMilestones(key);
    if(!oldSchedule.some(function(s){return s.stage===key})){var last=oldSchedule[oldSchedule.length-1],start=last?addDays(last.end,-14):"2026-09-01";oldSchedule.push({id:uid("sch"),stage:key,start:start,end:addDays(start,60),status:"Not Started"})}
  });
  p.schedule=oldSchedule.filter(function(s){return selected.indexOf(s.stage)>-1});sortSchedule(p);saveState();activeStage=selected[0];closeScope();renderProject(p.id);toast("Project scope updated");
}

function openAi(){
  var p=currentProjectId?projectById(currentProjectId):null;
  document.getElementById("aiContextProject").textContent=p?p.number+" · "+p.name:"All visible projects";
  document.getElementById("aiDrawer").classList.add("open");document.getElementById("aiDrawer").setAttribute("aria-hidden","false");document.getElementById("drawerBackdrop").classList.remove("hidden");
}
function closeAi(){document.getElementById("aiDrawer").classList.remove("open");document.getElementById("aiDrawer").setAttribute("aria-hidden","true");document.getElementById("drawerBackdrop").classList.add("hidden")}
function aiResponse(action){
  var p=currentProjectId?projectById(currentProjectId):null;
  if(action==="summary") return p?p.number+" is currently in "+p.status+" with "+p.priority.toLowerCase()+" priority. Its active scope includes "+p.scope.map(stageLabel).join(", ")+". "+p.tasks.filter(function(t){return !t[4]}).length+" tasks remain open.":"There are "+visibleProjects().length+" visible projects, including "+visibleProjects().filter(function(x){return x.priority==="High"}).length+" high-priority projects.";
  if(action==="overdue"){var list=(p?[p]:visibleProjects()).reduce(function(a,x){return a.concat(x.tasks.filter(function(t){return t[4]}).map(function(t){return x.number+": "+t[1]}))},[]);return list.length?"Overdue prototype tasks: "+list.join("; ")+".":"No overdue tasks are recorded."}
  if(action==="permit") return p&&p.scope.indexOf("permit")>-1?"Draft follow-up: Please provide an update on the current permit review and confirm whether any additional drawings, forms or fees are required from our team.":"Select a project with Permit in its scope to prepare a permit follow-up.";
  if(action==="consultants") return p?"Outstanding coordination should focus on "+p.mechanical+", "+p.electrical+" and "+p.structural+". Review open high-priority tasks before the next issue.":"Open a project to list its specific consultant team and outstanding items.";
  if(action==="report") return p?"Weekly report prepared for "+p.number+": status "+p.status+", priority "+p.priority+", "+p.scope.length+" active stages, "+p.tasks.filter(function(t){return !t[4]}).length+" open tasks and "+p.deadlines.length+" upcoming deadlines.":"Portfolio report: "+visibleProjects().length+" active projects and "+visibleProjects().reduce(function(n,x){return n+x.tasks.filter(function(t){return !t[4]}).length},0)+" open tasks.";
  return "This prototype assistant is not connected to a backend. Use the quick actions to preview future AI workflows.";
}
function sendAi(action,label){
  var box=document.getElementById("aiConversation");
  box.insertAdjacentHTML("beforeend",'<div class="user-message">'+esc(label)+'</div><div class="assistant-message">'+esc(aiResponse(action))+'</div>');
  box.scrollTop=box.scrollHeight;refreshIcons();
}

function bindProjectCards(){document.querySelectorAll("[data-project]").forEach(function(b){b.addEventListener("click",function(){if(Date.now()<suppressScheduleClickUntil)return;currentProjectId=b.dataset.project;currentView="project";activeStage=null;render()})})}
function bindCommon(){
  document.querySelectorAll("[data-go-gallery]").forEach(function(b){b.addEventListener("click",function(){currentView="gallery";currentProjectId=null;render()})});
  document.querySelectorAll("[data-go-schedule]").forEach(function(b){b.addEventListener("click",function(){currentView="schedule";currentProjectId=null;render()})});
  document.querySelectorAll("[data-go-meetings]").forEach(function(b){b.addEventListener("click",function(){currentView="meetings";currentProjectId=null;render()})});
  document.querySelectorAll("[data-open-ai]").forEach(function(b){b.addEventListener("click",openAi)});
  document.querySelectorAll("[data-open-members]").forEach(function(b){b.addEventListener("click",function(){if(state.role!=="admin")return;currentView="members";render();});});
  bindProjectCards();
}
function resetDemoData(){
  if(!confirm("Reset all prototype edits saved in this browser?"))return;
  state={role:state.role,userId:state.userId,activeWorkspaceId:DEFAULT_WORKSPACE.id,projects:clone(INITIAL_PROJECTS),settings:clone(DEFAULT_SETTINGS),workspace:clone(DEFAULT_WORKSPACE),members:clone(INITIAL_MEMBERS),projectTypes:clone(DEFAULT_PROJECT_TYPES),ui:{scheduleScale:"Month",projectSections:{}}};
  USERS=state.members;state.projects.forEach(normalizeProject);saveState();applyWorkspaceSettings();renderRoleNavigation();currentProjectId=null;adminMemberFilter=null;currentView="dashboard";render();toast("Demo workspace reset");
}
function populateWelcomeUsers(){
  var select=document.getElementById("welcomeUser"),selected=select.value;select.innerHTML=Object.keys(USERS).map(function(id){return '<option value="'+id+'">'+esc(USERS[id].name)+'</option>';}).join("");if(USERS[selected])select.value=selected;
}
function setupEvents(){
  document.querySelectorAll("[data-role]").forEach(function(b){b.addEventListener("click",function(){launch("admin")})});
  document.getElementById("continueUser").addEventListener("click",function(){launch("user",document.getElementById("welcomeUser").value)});
  document.getElementById("menuToggle").addEventListener("click",function(){document.getElementById("sidebar").classList.toggle("open")});
  document.getElementById("openAiTop").addEventListener("click",openAi);
  document.getElementById("closeAi").addEventListener("click",closeAi);document.getElementById("drawerBackdrop").addEventListener("click",closeAi);
  document.querySelectorAll("[data-ai-action]").forEach(function(b){b.addEventListener("click",function(){sendAi(b.dataset.aiAction,b.textContent.trim())})});
  document.getElementById("aiForm").addEventListener("submit",function(e){e.preventDefault();var input=document.getElementById("aiInput");if(!input.value.trim())return;sendAi("custom",input.value.trim());input.value=""});
  document.getElementById("globalSearch").addEventListener("input",function(e){currentFilters.query=e.target.value;currentView="gallery";currentProjectId=null;render()});
  document.getElementById("switchRole").addEventListener("click",function(){populateWelcomeUsers();document.getElementById("app").classList.add("hidden");document.getElementById("intro").classList.remove("hidden");document.dispatchEvent(new Event("hosis:intro:replay"));document.getElementById("sidebar").classList.remove("open");document.getElementById("welcomeTitle").focus();refreshIcons()});
  document.querySelectorAll("[data-close-modal]").forEach(function(b){b.addEventListener("click",closeScope)});
  document.querySelectorAll("[data-close-edit]").forEach(function(b){b.addEventListener("click",closeEditor)});
  document.getElementById("editForm").addEventListener("submit",function(e){e.preventDefault();saveEditor(e.currentTarget)});
  document.getElementById("saveScope").addEventListener("click",saveScope);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeAi();closeScope();closeEditor()}});
}

populateWelcomeUsers();
setupEvents();
refreshIcons();
startIntro();
})();
