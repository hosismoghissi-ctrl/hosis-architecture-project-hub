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
  maya:{name:"Maya Chen",role:"Architectural Coordinator",initials:"MC",photo:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=82"},
  liam:{name:"Liam Brooks",role:"Project Technologist",initials:"LB",photo:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=82"},
  sofia:{name:"Sofia Martinez",role:"Project Designer",initials:"SM",photo:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82"},
  noah:{name:"Noah Williams",role:"Senior Project Manager",initials:"NW",photo:"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=82"},
  amina:{name:"Amina Yusuf",role:"Interior Designer",initials:"AY",photo:"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=82"},
  ethan:{name:"Ethan Park",role:"Contract Administrator",initials:"EP",photo:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=82"},
  chloe:{name:"Chloe Martin",role:"BIM Coordinator",initials:"CM",photo:"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=82"},
  daniel:{name:"Daniel Rossi",role:"Architectural Technologist",initials:"DR",photo:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=82"}
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
  menuOrder:["dashboard","gallery","schedule","meetings","priority"]
};

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
var state=loadState();
var currentView="dashboard";
var currentProjectId=null;
var currentDirectory="clients";
var currentCompanyKey=null;
var activeStage=null;
var adminMemberFilter=null;
var currentFilters={query:"",type:"",status:"",priority:"",user:"",high:false};
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
    date:addDays("2026-08-27",index),time:index%2?"10:30":"14:00",stage:project.scope[0],location:index%2?"Microsoft Teams":"Project Site",
    attendees:"Project team, client and consultants",notes:"Review current deliverables, decisions and outstanding coordination items.",
    actions:task?[{id:uid("action"),title:task[1],assignee:project.lead||"Project Team",due:task[2],priority:task[3],taskId:task[0]}]:[]
  }];
}
function normalizeProject(project,index){
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
  project.deadlines=Array.isArray(project.deadlines)?project.deadlines:[];
  project.tasks=Array.isArray(project.tasks)?project.tasks:[];
  project.meetings=Array.isArray(project.meetings)?project.meetings:defaultMeetings(project,index);
  project.meetings.forEach(function(meeting){
    meeting.id=meeting.id||uid("meeting");meeting.actions=Array.isArray(meeting.actions)?meeting.actions:[];
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
  project.notes=project.notes||"";
  return project;
}
function loadState(){
  var loaded=null;
  try{loaded=JSON.parse(localStorage.getItem(KEY));}catch(e){}
  var next=loaded&&Array.isArray(loaded.projects)?loaded:{role:null,userId:null,projects:clone(INITIAL_PROJECTS)};
  INITIAL_PROJECTS.forEach(function(seed){if(!next.projects.some(function(p){return p.id===seed.id;}))next.projects.push(clone(seed));});
  next.settings=Object.assign(clone(DEFAULT_SETTINGS),next.settings||{});
  next.projects.forEach(normalizeProject);
  return next;
}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];});}
function icon(name,cls){return '<i data-lucide="'+name+'"'+(cls?' class="'+cls+'"':'')+'></i>';}
function refreshIcons(){if(window.lucide) window.lucide.createIcons();}
function initials(name){return String(name||"NA").split(" ").map(function(x){return x.charAt(0)}).slice(0,2).join("").toUpperCase();}
function toast(message){var el=document.getElementById("toast");el.textContent=message;el.classList.add("show");setTimeout(function(){el.classList.remove("show")},2200);}
function formatDate(date){if(!date)return "No date";return new Date(date+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"});}
function allTypes(){return Array.from(new Set(state.projects.map(function(p){return p.type}))).sort();}
function allStatuses(){return Array.from(new Set(state.projects.map(function(p){return p.status}))).sort();}
function visibleProjects(){if(state.role==="admin")return state.projects;return state.projects.filter(function(p){return p.assigned.indexOf(state.userId)>-1});}
function dashboardProjects(){
  if(state.role!=="admin")return visibleProjects();
  return adminMemberFilter?state.projects.filter(function(p){return p.assigned.indexOf(adminMemberFilter)>-1;}):state.projects;
}
function workspaceProjects(){return state.role==="admin"&&adminMemberFilter?dashboardProjects():visibleProjects();}
function priorityClass(value){return String(value||"Medium").toLowerCase();}
function formatCurrency(value){var number=Number(value)||0;return number.toLocaleString("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0});}
function stageLabel(key){return STAGES[key]?STAGES[key].label:key==="admin"?"Project Administration (archived)":key;}
function projectById(id){return state.projects.find(function(p){return p.id===id});}
function stageProgress(project,key){
  return stageCompletion(project,key).percent;
}
function setNav(view){document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});}
function applyWorkspaceSettings(){
  var settings=state.settings||DEFAULT_SETTINGS,brand=document.querySelector(".sidebar-brand span:last-child strong");
  if(brand)brand.textContent=settings.organization.split(" ")[0].toUpperCase();
  document.title=settings.organization.toUpperCase()+" PROJECT HUB";
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
  var isAdmin=state.role==="admin";
  document.querySelectorAll(".admin-only").forEach(function(el){el.classList.toggle("hidden",!isAdmin);});
  var labels={dashboard:isAdmin?"Dashboard":"My Dashboard",gallery:isAdmin?"Projects":"My Projects",schedule:isAdmin?"Project Schedule":"My Schedule",meetings:isAdmin?"Meetings":"My Meetings"};
  Object.keys(labels).forEach(function(view){var el=document.querySelector('.nav-item[data-view="'+view+'"] span');if(el)el.textContent=labels[view];});
  document.getElementById("sidebarUserName").textContent=user.name;
  document.getElementById("sidebarRole").textContent=user.role;
  document.getElementById("sidebarInitials").textContent=user.initials;
  var photo=document.getElementById("sidebarPhoto");
  photo.hidden=!user.photo;photo.src=user.photo||"";photo.alt=user.photo?user.name:"";
  applyWorkspaceSettings();applyMenuOrder();
}
function launch(role,userId){
  state.role=role;state.userId=role==="admin"?null:userId;saveState();
  document.getElementById("intro").classList.add("hidden");document.dispatchEvent(new Event("hosis:intro:closed"));document.getElementById("app").classList.remove("hidden");
  adminMemberFilter=null;
  var user=role==="admin"?{name:"Hosis Admin",role:"Administrator",initials:"HA",photo:""}:USERS[userId];
  applyRoleNavigation(user);
  document.getElementById("priorityCount").textContent=visibleProjects().filter(function(p){return p.priority==="High"}).length;
  currentView="dashboard";render();
}
function render(){
  if(currentView==="project")renderProject(currentProjectId);
  else if(currentView==="gallery"||currentView==="priority")renderGallery();
  else if(currentView==="schedule")renderSchedulePage();
  else if(currentView==="meetings")renderMeetingsPage();
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
  var projects=state.projects.filter(function(p){return p.assigned.indexOf(userId)>-1;}),tasks=[];
  projects.forEach(function(p){p.tasks.forEach(function(t){tasks.push(t);});});
  var today=isoDate(new Date()),week=addDays(today,7);
  return {projects:projects,open:tasks.filter(function(t){return !t[4];}).length,overdue:tasks.filter(function(t){return !t[4]&&t[2]<today;}).length,dueWeek:tasks.filter(function(t){return !t[4]&&t[2]>=today&&t[2]<=week;}).length};
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
  var projects=dashboardProjects();
  var high=projects.filter(function(p){return p.priority==="High"}).length;
  var allTasks=[];projects.forEach(function(p){p.tasks.forEach(function(t){allTasks.push(t);});});
  var today=isoDate(new Date()),week=addDays(today,7);
  var open=allTasks.filter(function(t){return !t[4]}).length;
  var overdue=allTasks.filter(function(t){return !t[4]&&t[2]<today;}).length;
  var dueWeek=allTasks.filter(function(t){return !t[4]&&t[2]>=today&&t[2]<=week;}).length;
  var focus=state.role==="admin"&&adminMemberFilter?USERS[adminMemberFilter]:state.role==="user"?USERS[state.userId]:null;
  setHeading(focus?"Members / "+focus.name:"Portfolio / Overview",focus?focus.name+" · Project Workspace":state.settings.workspaceTitle);
  var stageCounts={};Object.keys(STAGES).forEach(function(k){stageCounts[k]=projects.filter(function(p){return p.scope.indexOf(k)>-1}).length});
  var html='<section class="hero-strip dashboard-hero" style="--dashboard-image:url(\''+esc(state.settings.dashboardImage)+'\')"><div class="hero-copy"><div class="eyebrow">'+esc(focus?"MEMBER PROJECT WORKSPACE":state.settings.organization.toUpperCase())+'</div><h2>'+esc(focus?focus.name:state.settings.dashboardHeading)+'</h2><p>'+esc(focus?"Every assigned project, task, meeting and deadline in one focused view.":state.settings.dashboardSummary)+'</p></div><div class="hero-actions"><button class="ghost-button" data-go-gallery>'+icon("panels-top-left")+'Open Projects</button><button class="ghost-button" data-go-meetings>'+icon("calendar-clock")+'Meetings</button>'+(state.role==="admin"&&!focus?'<button class="ghost-button" data-edit-workspace>'+icon("pencil")+'Edit header</button>':'')+(adminMemberFilter?'<button class="ghost-button" data-member-filter="">'+icon("users")+'Company View</button>':'')+'</div></section>'+
    renderMemberSwitcher()+
    '<section class="stat-grid role-stat-grid">'+statCard("building-2",projects.length,focus?"Assigned Projects":"Active Projects")+statCard("list-checks",open,"Open Tasks")+statCard("calendar-days",dueWeek,"Due This Week")+statCard("clock-alert",overdue,"Overdue Tasks")+(state.role==="admin"&&!focus?statCard("flame",high,"High-Priority Projects"):"")+'</section>'+
    '<div class="dashboard-grid">'+renderDashboardTasks(projects)+'<section class="panel"><div class="panel-head"><h3>Projects by Stage</h3><button data-go-gallery>Filter</button></div><div class="stage-bars">'+Object.keys(STAGES).map(function(k){var pct=projects.length?Math.round(stageCounts[k]/projects.length*100):0;return '<div><div class="stage-bar-head"><span>'+icon(STAGES[k].icon)+' '+esc(STAGES[k].label)+'</span><b>'+stageCounts[k]+'</b></div><div class="stage-track"><div class="stage-fill stage-'+k+'" style="width:'+pct+'%"></div></div></div>'}).join("")+'</div></section></div>'+
    '<div class="section-title dashboard-project-title"><div><span class="section-kicker">'+esc(focus?"ASSIGNED PORTFOLIO":"ACTIVE PORTFOLIO")+'</span><h2>'+esc(focus?focus.name+"’s Projects":"Projects")+'</h2><p>'+projects.length+' projects in this workspace.</p></div><button class="secondary-button" data-go-gallery>View all projects</button></div><section class="project-grid dashboard-projects">'+projects.map(projectCard).join("")+'</section>'+
    '<section class="panel timeline-preview dashboard-schedule"><div class="panel-head"><div><h3>Project Schedule</h3><small>Stage dates and overlaps across all visible projects</small></div><button data-go-schedule>Open full timeline</button></div>'+renderTimeline(projects,true)+'</section>'+
    '';
  document.getElementById("content").innerHTML=html;bindDashboardTasks();bindMemberFilters();bindCommon();
  var editWorkspace=document.querySelector("[data-edit-workspace]");if(editWorkspace)editWorkspace.addEventListener("click",function(){openEditor(null,"settings",-1,null);});
}

function renderSettingsPage(){
  setHeading("Admin / Workspace","Header & Branding");
  var s=state.settings;
  var labels={dashboard:"Dashboard",gallery:"Projects",schedule:"Project Schedule",meetings:"Meetings",priority:"High Priority"};
  document.getElementById("content").innerHTML='<div class="section-title"><div><span class="section-kicker">ADMIN CONTROL</span><h2>Header & Branding</h2><p>Edit the dashboard header, organization name and image shown to every member.</p></div><button class="primary-button" data-edit-workspace>'+icon("pencil")+' Edit workspace header</button></div><section class="brand-preview dashboard-hero" style="--dashboard-image:url(\''+esc(s.dashboardImage)+'\')"><div class="hero-copy"><div class="eyebrow">'+esc(s.organization.toUpperCase())+'</div><h2>'+esc(s.dashboardHeading)+'</h2><p>'+esc(s.dashboardSummary)+'</p></div></section><section class="panel settings-note"><h3>Admin-controlled content</h3><p>Project cover images remain editable from each project’s <b>Edit Project</b> control. Member photos and organization-level branding are kept separate.</p><div class="drag-instruction">'+icon("grip-vertical")+' Drag the primary sidebar items, or use the buttons below. Both methods save the same menu order.</div><div class="menu-order-list">'+s.menuOrder.map(function(key,index){return '<div><span>'+icon("grip-vertical")+esc(labels[key])+'</span><div><button data-move-menu="'+key+'" data-direction="-1" aria-label="Move '+esc(labels[key])+' up" '+(index===0?'disabled':'')+'>'+icon("arrow-up")+'</button><button data-move-menu="'+key+'" data-direction="1" aria-label="Move '+esc(labels[key])+' down" '+(index===s.menuOrder.length-1?'disabled':'')+'>'+icon("arrow-down")+'</button></div></div>';}).join("")+'</div></section>';
  document.querySelector("[data-edit-workspace]").addEventListener("click",function(){openEditor(null,"settings",-1,null);});
  document.querySelectorAll("[data-move-menu]").forEach(function(button){button.addEventListener("click",function(){moveMenuItem(button.dataset.moveMenu,Number(button.dataset.direction));});});refreshIcons();
}
var showCompletedTasks=false;
function renderDashboardTasks(projects){
  var rank={High:0,Medium:1,Low:2},tasks=[];
  projects.forEach(function(p){p.tasks.forEach(function(t){tasks.push({project:p,task:t});});});
  tasks.sort(function(a,b){return (rank[a.task[3]]==null?3:rank[a.task[3]])-(rank[b.task[3]]==null?3:rank[b.task[3]])||(a.task[2]||"9999").localeCompare(b.task[2]||"9999")||a.task[1].localeCompare(b.task[1]);});
  var open=tasks.filter(function(x){return !x.task[4];}),done=tasks.filter(function(x){return x.task[4];});
  function row(x){var p=x.project,t=x.task;return '<div class="task-row dashboard-task'+(t[4]?' done':'')+'" data-priority="'+esc(t[3])+'"><button class="task-check" data-dashboard-task="'+esc(t[0])+'" data-task-project="'+esc(p.id)+'" aria-label="'+esc((t[4]?'Reopen ':'Complete ')+t[1])+'" aria-pressed="'+!!t[4]+'">'+(t[4]?icon('check'):'')+'</button><div class="dashboard-task-copy"><strong>'+esc(t[1])+'</strong><button class="task-project-link" data-project="'+esc(p.id)+'">'+esc(p.number+' · '+p.name)+'</button><small>Due '+esc(formatDate(t[2]))+'</small></div><span class="pill '+priorityClass(t[3])+'">'+esc(t[3])+'</span></div>';}
  return '<section class="panel dashboard-tasks" aria-labelledby="dashboardTasksTitle"><div class="panel-head"><div><h3 id="dashboardTasksTitle">Project Tasks</h3><small>'+open.length+' open · High, Medium, Low · Earliest due first</small></div>'+icon('list-checks')+'</div><div class="task-list open-task-list">'+(open.length?open.map(row).join(''):'<p class="directory-empty">All caught up. No open tasks in your visible projects.</p>')+'</div>'+(done.length?'<details class="completed-tasks"'+(showCompletedTasks?' open':'')+'><summary>Completed tasks ('+done.length+')</summary><div class="task-list">'+done.map(row).join('')+'</div></details>':'')+'</section>';
}
function bindDashboardTasks(){
  var completed=document.querySelector('.completed-tasks');
  if(completed)completed.addEventListener('toggle',function(){showCompletedTasks=completed.open;});
  document.querySelectorAll('[data-dashboard-task]').forEach(function(b){b.addEventListener('click',function(){
    var p=visibleProjects().find(function(x){return x.id===b.dataset.taskProject;});
    var task=p&&p.tasks.find(function(t){return t[0]===b.dataset.dashboardTask;});
    if(!task)return;
    task[4]=!task[4];if(task[4])showCompletedTasks=true;saveState();renderDashboard();refreshIcons();
    var next=Array.from(document.querySelectorAll('[data-dashboard-task]')).find(function(el){return el.dataset.taskProject===p.id&&el.dataset.dashboardTask===task[0];});
    if(next)next.focus({preventScroll:true});
    toast(task[4]?'Task marked complete':'Task reopened');
  });});
}

function meetingActionState(project,action){var task=project.tasks.find(function(t){return t[0]===action.taskId;});return task||[action.taskId,action.title,action.due,action.priority,false];}
function meetingActionRow(project,action,index,meetingIndex){
  var task=meetingActionState(project,action);
  return '<div class="meeting-action'+(task[4]?' complete':'')+'"><span class="meeting-action-check">'+(task[4]?icon("check"):icon("circle"))+'</span><div><strong>'+esc(task[1])+'</strong><small>'+esc(action.assignee||"Unassigned")+' · Due '+formatDate(task[2])+'</small></div><span class="pill '+priorityClass(task[3])+'">'+esc(task[3])+'</span>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","meetingActions",index,'data-meeting-index="'+meetingIndex+'"')+deleteButton("meetingActions",index,'data-meeting-index="'+meetingIndex+'"')+'</div>':'')+'</div>';
}
function renderProjectMeetings(project){
  var meetings=project.meetings.slice().sort(function(a,b){return (b.date+b.time).localeCompare(a.date+a.time);});
  return '<section class="panel project-meetings"><div class="panel-head"><div><h3>Meetings</h3><small>Dated minutes, decisions and action items linked to Project Tasks</small></div>'+(state.role==="admin"?'<button data-add="meetings">'+icon("plus")+' Add meeting</button>':'<span class="count-chip">'+meetings.length+' meetings</span>')+'</div><div class="meeting-list">'+(meetings.length?meetings.map(function(meeting){var originalIndex=project.meetings.indexOf(meeting);return '<article class="meeting-card"><div class="meeting-date"><b>'+esc(new Date(meeting.date+"T12:00:00").toLocaleDateString("en-CA",{day:"2-digit"}))+'</b><span>'+esc(new Date(meeting.date+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}))+'</span></div><div class="meeting-body"><div class="meeting-card-head"><div><span class="section-kicker">'+esc(stageLabel(meeting.stage))+' · '+esc(meeting.time||"Time TBD")+'</span><h4>'+esc(meeting.title)+'</h4><p>'+icon("map-pin")+esc(meeting.location||"Location TBD")+' · '+esc(meeting.attendees||"Attendees not added")+'</p></div>'+(state.role==="admin"?'<div class="row-actions">'+adminButton("Edit","meetings",originalIndex)+deleteButton("meetings",originalIndex)+'</div>':'')+'</div>'+(meeting.notes?'<p class="meeting-notes">'+esc(meeting.notes)+'</p>':'')+'<div class="meeting-actions-head"><strong>Action Items</strong>'+(state.role==="admin"?'<button class="tiny-action action-add" data-add="meetingActions" data-index="-1" data-meeting-index="'+originalIndex+'">'+icon("list-plus")+'Add task from meeting</button>':'')+'</div><div class="meeting-actions">'+(meeting.actions.length?meeting.actions.map(function(action,index){return meetingActionRow(project,action,index,originalIndex);}).join(""):'<p class="inline-empty">No action items recorded.</p>')+'</div></div></article>';}).join(""):'<p class="directory-empty">No meetings have been added to this project.</p>')+'</div></section>';
}
function renderMeetingsPage(){
  var projects=state.role==="admin"&&adminMemberFilter?dashboardProjects():visibleProjects(),rows=[];
  projects.forEach(function(project){project.meetings.forEach(function(meeting){rows.push({project:project,meeting:meeting});});});
  rows.sort(function(a,b){return (b.meeting.date+b.meeting.time).localeCompare(a.meeting.date+a.meeting.time);});
  setHeading("Workspace / Meetings",state.role==="admin"?"Project Meetings":"My Meetings");
  var html='<div class="section-title meetings-title"><div><span class="section-kicker">COORDINATION RECORD</span><h2>'+(state.role==="admin"?"Project Meetings":"My Meetings")+'</h2><p>Meeting dates, project context and action items. Add or edit a meeting inside its project.</p></div><span class="directory-count">'+rows.length+' meetings</span></div><section class="meeting-overview-grid">'+(rows.length?rows.map(function(row){var m=row.meeting,p=row.project;return '<article class="meeting-overview-card"><div class="meeting-date"><b>'+esc(new Date(m.date+"T12:00:00").toLocaleDateString("en-CA",{day:"2-digit"}))+'</b><span>'+esc(new Date(m.date+"T12:00:00").toLocaleDateString("en-CA",{month:"short"}))+'</span></div><div><span class="section-kicker">'+esc(p.number)+' · '+esc(m.time||"Time TBD")+'</span><h3>'+esc(m.title)+'</h3><p>'+esc(p.name)+'</p><div class="meeting-overview-meta"><span>'+icon("map-pin")+esc(m.location||"Location TBD")+'</span><span>'+icon("list-checks")+m.actions.length+' actions</span></div><button class="task-project-link" data-project="'+esc(p.id)+'">Open project '+icon("arrow-up-right")+'</button></div></article>';}).join(""):'<div class="panel directory-empty"><h3>No meetings yet</h3><p>Add the first meeting from a project page.</p></div>')+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();
}
function renderMembersPage(){
  setHeading("Workspace / Members","Members & Workload");
  var html='<div class="section-title members-title"><div><span class="section-kicker">TEAM WORKSPACES</span><h2>Members</h2><p>Open a member workspace to review every assigned project, task, deadline and meeting.</p></div><button class="secondary-button" data-member-filter="">'+icon("building-2")+'Company Dashboard</button></div><section class="members-page-grid">'+Object.keys(USERS).map(function(id){var user=USERS[id],stats=memberStats(id);return '<article class="member-profile-card"><img src="'+esc(user.photo)+'" alt="'+esc(user.name)+'"><div><span class="section-kicker">'+esc(user.role)+'</span><h3>'+esc(user.name)+'</h3><div class="member-metrics"><span><b>'+stats.projects.length+'</b>Projects</span><span><b>'+stats.open+'</b>Open Tasks</span><span><b>'+stats.dueWeek+'</b>Due This Week</span><span><b>'+stats.overdue+'</b>Overdue</span></div><button class="primary-button" data-member-filter="'+id+'">Open '+esc(user.name.split(" ")[0])+"’s workspace"+icon("arrow-right")+'</button></div></article>';}).join("")+'</section>';
  document.getElementById("content").innerHTML=html;bindMemberFilters();refreshIcons();
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
function directoryCompanies(type){
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
  var record=group.records.find(function(r){return /^https:\/\//i.test(r.company.logo||'');});
  return '<div class="company-logo"><span>'+esc(initials(group.name))+'</span>'+(record?'<img src="'+esc(record.company.logo)+'" alt="'+esc(group.name)+' logo" loading="lazy" referrerpolicy="no-referrer">':'')+'</div>';
}
function directoryRoles(group){return Array.from(new Set(group.records.map(function(r){return r.company.category;}))).join(' · ');}
function renderDirectory(){
  var config=DIRECTORIES[currentDirectory],groups=directoryCompanies(currentDirectory);
  setHeading('Project Directory / '+config.title,config.title);
  var html='<div class="section-title directory-title"><div><div class="eyebrow dark">PROJECT DIRECTORY</div><h2>'+config.title+'</h2><p>'+esc(config.description)+'</p></div><span class="directory-count">'+groups.length+' '+(groups.length===1?'company':'companies')+'</span></div>';
  html+=groups.length?'<section class="directory-grid">'+groups.map(function(group){
    return '<article class="directory-card"><div class="company-heading">'+directoryLogo(group)+'<div class="contact-copy"><small>'+esc(directoryRoles(group))+'</small><h3>'+esc(group.name)+'</h3></div></div><div class="directory-projects"><small>ASSIGNED PROJECTS · '+group.projects.length+'</small>'+group.projects.map(function(p){return '<button data-project="'+esc(p.id)+'"><span>'+esc(p.number)+'</span>'+esc(p.name)+icon('arrow-up-right')+'</button>';}).join('')+'</div><button class="directory-open" data-company="'+esc(group.key)+'">View company & contacts '+icon('arrow-right')+'</button></article>';
  }).join('')+'</section>':'<section class="panel directory-empty"><h3>No '+config.title.toLowerCase()+' yet</h3><p>Companies added to your visible projects appear here automatically.</p></section>';
  document.getElementById('content').innerHTML=html;bindDirectory();bindCommon();
}
function renderCompanyProfile(){
  var config=DIRECTORIES[currentDirectory],group=directoryCompanies(currentDirectory).find(function(g){return g.key===currentCompanyKey;});
  if(!group){currentView=currentDirectory;renderDirectory();return;}
  setHeading('Project Directory / '+config.title,group.name);
  var html='<button class="directory-back" data-directory-back>'+icon('arrow-left')+'Back to '+config.title+'</button><section class="panel company-profile-header"><div class="company-heading">'+directoryLogo(group)+'<div><div class="eyebrow dark">'+esc(directoryRoles(group))+'</div><h2>'+esc(group.name)+'</h2><p>'+group.projects.length+' related '+(group.projects.length===1?'project':'projects')+' in your workspace</p></div></div></section><section class="panel company-contact-panel"><div class="panel-head"><div><h3>Contact Information</h3><small>Project-specific records are kept separate so contact differences are preserved.</small></div></div><div class="company-grid">'+group.records.map(function(record){var c=record.company,p=record.project;return '<article class="company-card"><div class="contact-copy"><small>'+esc(c.category)+'</small><h4>'+esc(c.contact||'Contact person not added')+'</h4></div>'+contactLinks(c)+'<div class="company-footer"><button class="task-project-link" data-project="'+esc(p.id)+'">'+esc(p.number+' · '+p.name)+' '+icon('arrow-up-right')+'</button></div></article>';}).join('')+'</div><p class="directory-note">Contact details can be updated in each project’s Project Companies section by an admin.</p></section><div class="section-title"><div><h2>Related Projects</h2><p>Open a project to see its scope, tasks and schedule.</p></div></div><section class="project-grid">'+group.projects.map(projectCard).join('')+'</section>';
  document.getElementById('content').innerHTML=html;bindDirectory();bindCommon();
}
function bindDirectory(){
  document.querySelectorAll('[data-company]').forEach(function(b){b.addEventListener('click',function(){currentCompanyKey=b.dataset.company;currentView='company';currentProjectId=null;render();window.scrollTo(0,0);});});
  document.querySelectorAll('[data-directory-back]').forEach(function(b){b.addEventListener('click',function(){currentView=currentDirectory;currentCompanyKey=null;render();window.scrollTo(0,0);});});
  document.querySelectorAll('.company-logo img').forEach(function(img){img.addEventListener('error',function(){img.remove();});});
}

function projectCard(p){
  return '<button class="project-card" data-project="'+p.id+'"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy"><span class="card-top"><span class="card-tags"><span class="pill">'+esc(p.status)+'</span><span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+'</span></span><span class="card-arrow">'+icon("arrow-up-right")+'</span></span><span class="card-bottom"><small>'+esc(p.number+" · "+p.type)+'</small><h3>'+esc(p.name)+'</h3><p>'+icon("map-pin")+' '+esc(p.address)+'</p><span class="card-meta"><span>'+p.scope.length+' active stages</span><span>'+p.assigned.map(function(u){return esc(USERS[u].name.split(" ")[0])}).join(" · ")+'</span></span></span></button>';
}
function filterProject(p){
  var q=currentFilters.query.toLowerCase().trim();
  var matches=!q||(p.name+" "+p.number+" "+p.type+" "+p.address).toLowerCase().indexOf(q)>-1;
  return matches&&(!currentFilters.type||p.type===currentFilters.type)&&(!currentFilters.status||p.status===currentFilters.status)&&(!currentFilters.priority||p.priority===currentFilters.priority)&&(!currentFilters.user||p.assigned.indexOf(currentFilters.user)>-1)&&(!currentFilters.high||p.priority==="High");
}
function renderGallery(){
  var projects=workspaceProjects().filter(filterProject),member=state.role==="admin"&&adminMemberFilter?USERS[adminMemberFilter]:null;
  setHeading(member?"Members / "+member.name:"Portfolio / Projects",currentView==="priority"?"High-Priority Projects":member?member.name+" · Projects":state.role==="user"?"My Projects":"Projects");
  var userOptions=Object.keys(USERS).map(function(k){return '<option value="'+k+'"'+(currentFilters.user===k?" selected":"")+'>'+esc(USERS[k].name)+'</option>'}).join("");
  var html='<div class="section-title"><div><h2>'+(currentView==="priority"?"Priority Focus":"Architecture Portfolio")+'</h2><p>'+projects.length+' fictional projects match the current view.</p></div></div>'+
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
  bindProjectCards();
}

function timelineBounds(projects){
  var dates=[];projects.forEach(function(p){p.schedule.forEach(function(s){dates.push(new Date(s.start+"T12:00:00"),new Date(s.end+"T12:00:00"))})});
  if(!dates.length)return {start:new Date(),end:new Date()};
  var start=new Date(Math.min.apply(null,dates)),end=new Date(Math.max.apply(null,dates));start.setDate(start.getDate()-10);end.setDate(end.getDate()+10);return {start:start,end:end};
}
function timelinePosition(date,bounds){return Math.max(0,Math.min(100,(new Date(date+"T12:00:00")-bounds.start)/(bounds.end-bounds.start)*100));}
function monthMarkers(bounds){
  var items=[],cursor=new Date(bounds.start.getFullYear(),bounds.start.getMonth(),1);if(cursor<bounds.start)cursor.setMonth(cursor.getMonth()+1);
  while(cursor<=bounds.end){items.push({label:cursor.toLocaleDateString("en-CA",{month:"short",year:"2-digit"}),left:(cursor-bounds.start)/(bounds.end-bounds.start)*100});cursor.setMonth(cursor.getMonth()+1)}
  return items;
}
var suppressScheduleClickUntil=0,timelineProjectDrag=null;
function shiftProjectSchedule(project,days){project.schedule.forEach(function(item){item.start=addDays(item.start,days);item.end=addDays(item.end,days);});}
function moveProjectBefore(projectId,targetId){
  if(projectId===targetId)return;var from=state.projects.findIndex(function(p){return p.id===projectId;}),to=state.projects.findIndex(function(p){return p.id===targetId;});if(from<0||to<0)return;
  var item=state.projects.splice(from,1)[0];to=state.projects.findIndex(function(p){return p.id===targetId;});state.projects.splice(to,0,item);saveState();
}
function renderTimeline(projects,compact){
  var bounds=timelineBounds(projects),months=monthMarkers(bounds);
  var head='<div class="timeline-head"><div class="timeline-label">PROJECT / STAGE</div><div class="timeline-months">'+months.map(function(m){return '<span style="left:'+m.left+'%">'+esc(m.label)+'</span>'}).join("")+'</div></div>';
  var rows=projects.map(function(p){
    var schedule=compact?p.schedule.slice(0,4):p.schedule;
    var bars=schedule.map(function(s,i){var originalIndex=p.schedule.indexOf(s),left=timelinePosition(s.start,bounds),right=timelinePosition(s.end,bounds),width=Math.max(2,right-left);return '<button class="timeline-bar stage-'+s.stage+(state.role==="admin"&&!compact?' schedule-draggable':'')+'" data-project="'+p.id+'" data-schedule-item="'+originalIndex+'" '+(state.role==="admin"&&!compact?'draggable="true"':'')+' title="'+esc(stageLabel(s.stage)+" · "+formatDate(s.start)+" to "+formatDate(s.end)+(state.role==="admin"&&!compact?" · Drag to change dates":""))+'" style="left:'+left+'%;width:'+width+'%;top:'+(i*25+7)+'px"><span>'+icon(STAGES[s.stage].icon)+esc(stageLabel(s.stage))+'</span></button>'}).join("");
    var tools=state.role==="admin"&&!compact?'<div class="timeline-row-tools"><button class="timeline-drag-handle" draggable="true" data-project-reorder="'+p.id+'" aria-label="Drag to reorder '+esc(p.name)+'">'+icon("grip-vertical")+'</button><button data-shift-project="'+p.id+'" data-days="-7" aria-label="Move '+esc(p.name)+' one week earlier">−7d</button><button data-shift-project="'+p.id+'" data-days="7" aria-label="Move '+esc(p.name)+' one week later">+7d</button></div>':'';
    return '<div class="timeline-row" data-timeline-row="'+p.id+'" style="--lanes:'+schedule.length+'"><div class="timeline-project-wrap"><button class="timeline-project" data-project="'+p.id+'"><strong>'+esc(p.number)+'</strong><small>'+esc(p.name)+'</small></button>'+tools+'</div><div class="timeline-lane">'+months.map(function(m){return '<i style="left:'+m.left+'%"></i>'}).join("")+bars+'</div></div>';
  }).join("");
  return '<div class="timeline-scroll"><div class="timeline-canvas">'+head+rows+'<div class="timeline-legend">'+Object.keys(STAGES).map(function(k){return '<span><i class="stage-'+k+'"></i>'+esc(STAGES[k].label)+'</span>'}).join("")+'</div></div></div>';
}
function bindTimelineInteractions(projects){
  if(state.role!=="admin")return;var bounds=timelineBounds(projects),totalDays=Math.max(1,Math.round((bounds.end-bounds.start)/86400000));
  document.querySelectorAll("[data-project-reorder]").forEach(function(handle){handle.addEventListener("dragstart",function(e){timelineProjectDrag=handle.dataset.projectReorder;e.dataTransfer.effectAllowed="move";handle.closest(".timeline-row").classList.add("dragging");});handle.addEventListener("dragend",function(){var row=handle.closest(".timeline-row");if(row)row.classList.remove("dragging");timelineProjectDrag=null;});});
  document.querySelectorAll("[data-timeline-row]").forEach(function(row){row.addEventListener("dragover",function(e){if(timelineProjectDrag)e.preventDefault();});row.addEventListener("drop",function(e){if(!timelineProjectDrag)return;e.preventDefault();moveProjectBefore(timelineProjectDrag,row.dataset.timelineRow);timelineProjectDrag=null;suppressScheduleClickUntil=Date.now()+300;renderSchedulePage();toast("Project order saved");});});
  document.querySelectorAll("[data-shift-project]").forEach(function(button){button.addEventListener("click",function(e){e.stopPropagation();var p=projectById(button.dataset.shiftProject);shiftProjectSchedule(p,Number(button.dataset.days));saveState();renderSchedulePage();toast("Project schedule shifted "+Math.abs(Number(button.dataset.days))+" days");});});
  document.querySelectorAll("[data-schedule-item][draggable=true]").forEach(function(bar){var startX=0,laneWidth=1;bar.addEventListener("dragstart",function(e){startX=e.clientX;laneWidth=bar.closest(".timeline-lane").getBoundingClientRect().width;e.dataTransfer.effectAllowed="move";bar.classList.add("dragging");});bar.addEventListener("dragend",function(e){bar.classList.remove("dragging");var days=Math.round((e.clientX-startX)/laneWidth*totalDays);if(!days)return;var p=projectById(bar.dataset.project),item=p.schedule[Number(bar.dataset.scheduleItem)];item.start=addDays(item.start,days);item.end=addDays(item.end,days);saveState();suppressScheduleClickUntil=Date.now()+300;renderSchedulePage();toast(stageLabel(item.stage)+" shifted "+Math.abs(days)+" days");});});
}
function renderSchedulePage(){
  var projects=workspaceProjects(),member=state.role==="admin"&&adminMemberFilter?USERS[adminMemberFilter]:null;setHeading(member?"Members / "+member.name:"Portfolio / Schedule",member?member.name+" · Schedule":state.role==="user"?"My Project Schedule":"Project Schedule & Timeline");
  var html='<div class="section-title schedule-title"><div><div class="eyebrow dark">PORTFOLIO PLANNING</div><h2>Project Schedule</h2><p>Compare dated stages, see current position and identify overlapping work.</p></div><span class="schedule-count">'+projects.length+' active projects</span></div><section class="panel schedule-panel"><div class="timeline-guide">'+icon("info")+' Each colour is a project stage. Horizontal alignment shows work happening at the same time.</div>'+renderTimeline(projects,false)+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();bindTimelineInteractions(projects);
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
function renderProject(id){
  var p=projectById(id);
  if(!p||visibleProjects().indexOf(p)===-1){currentView="gallery";renderGallery();return}
  if(!activeStage||p.scope.indexOf(activeStage)===-1) activeStage=p.scope[0];
  setHeading("Portfolio / "+p.number,p.name);
  var scope=p.scope.map(function(k){return '<button class="stage-chip stage-'+k+(activeStage===k?' active':'')+'" aria-pressed="'+(activeStage===k)+'" aria-controls="stageContent" data-stage="'+k+'"><span class="scope-icon">'+icon(STAGES[k].icon)+'</span><strong>'+esc(STAGES[k].label)+'</strong><small>'+stageProgress(p,k)+'% complete</small></button>'}).join("");
  var tasks=p.tasks.map(function(t,i){return '<div class="task-row'+(t[4]?" done":"")+'"><button class="task-check" data-task="'+t[0]+'" aria-label="'+esc((t[4]?"Reopen ":"Complete ")+t[1])+'" aria-pressed="'+t[4]+'">'+(t[4]?icon("check"):"")+'</button><div><strong>'+esc(t[1])+'</strong><small>'+esc(t[3]+" priority · Due "+formatDate(t[2]))+'</small></div><span class="pill '+priorityClass(t[3])+'">'+esc(t[3])+'</span><div class="row-actions">'+adminButton("Edit","tasks",i)+deleteButton("tasks",i)+'</div></div>'}).join("");
  var adminControls=state.role==="admin"?'<select id="statusSelect" class="admin-select" aria-label="Change project status">'+allStatuses().concat(["Complete","On Hold"]).filter(function(v,i,a){return a.indexOf(v)===i}).map(function(v){return '<option'+(v===p.status?" selected":"")+'>'+esc(v)+'</option>'}).join("")+'</select><select id="prioritySelect" class="admin-select" aria-label="Change priority">'+["High","Medium","Low"].map(function(v){return '<option'+(v===p.priority?" selected":"")+'>'+v+' Priority</option>'}).join("")+'</select>':"";
  var html=
    '<section class="project-hero"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'"><div class="project-hero-top"><button class="back-button" data-go-gallery>'+icon("arrow-left")+'Projects</button><div class="card-tags"><span class="pill">'+esc(p.status)+'</span><span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+' Priority</span></div></div><div class="project-hero-main"><div><div class="eyebrow">'+esc(p.number+" · "+p.type)+'</div><h1>'+esc(p.name)+'</h1><p>'+icon("map-pin")+' '+esc(p.address)+' &nbsp; · &nbsp; '+esc(p.area)+'</p></div><div class="project-hero-actions">'+adminControls+(state.role==="admin"?'<button class="ghost-button" data-edit="project" data-index="-1">'+icon("square-pen")+'Edit Project</button><button class="ghost-button" id="editScope">'+icon("sliders-horizontal")+'Edit Scope</button>':'')+'<button class="ghost-button" onclick="window.print()">'+icon("printer")+'Print / PDF</button></div></div></section>'+
    '<div class="project-layout"><div class="detail-stack">'+
      '<section class="panel"><div class="panel-head"><h3>Project Overview</h3>'+(state.role==="admin"?'<button data-edit="project" data-index="-1">'+icon("pencil")+' Edit overview</button>':'<span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+'</span>')+'</div><p class="overview-summary">'+esc(p.summary)+'</p><div class="overview-grid">'+
      [["Project Number",p.number],["Project Type",p.type],["Project Area",p.area],["Client",p.client],["Owner",p.owner],["General Contractor",p.contractor],["Address",p.address],["Current Status",p.status],["Priority",p.priority]].map(function(x){return '<div class="info-cell"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>'}).join("")+
      '</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Scope</h3>'+(state.role==="admin"?'<button id="editScopeInline">Edit stages</button>':'')+'</div><div class="scope-stage-list">'+scope+'</div><div id="stageContent" class="stage-content">'+renderStageContent(p,activeStage)+'</div></section>'+
      renderProjectMeetings(p)+
      '<section class="panel"><div class="panel-head"><div><h3>Project Schedule</h3><small>Dated stages show sequence and overlap</small></div>'+(state.role==="admin"?'<button data-add="schedule">'+icon("plus")+' Add schedule item</button>':'')+'</div>'+renderProjectSchedule(p)+'</section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Team</h3>'+(state.role==="admin"?'<button data-add="team">'+icon("user-plus")+' Add team member</button>':'<span class="pill">'+p.assigned.length+' assigned users</span>')+'</div><div class="team-grid">'+p.team.map(teamCard).join("")+'</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Companies</h3>'+(state.role==="admin"?'<button data-add="companies">'+icon("building-2")+' Add company</button>':'<span>'+p.companies.length+' companies</span>')+'</div><div class="company-grid">'+p.companies.map(companyCard).join("")+'</div></section>'+
    '</div><aside class="detail-stack">'+
      '<section class="panel notes-box"><div class="panel-head"><h3>Project Notes</h3>'+icon("sticky-note")+'</div><textarea id="projectNotes" aria-label="Project Notes" '+(state.role==="admin"?'':'readonly ')+'placeholder="Add project notes…">'+esc(p.notes)+'</textarea><small class="save-hint">'+(state.role==="admin"?'Saved automatically in this browser.':'Read-only for assigned users.')+'</small></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Tasks</h3>'+(state.role==="admin"?'<button data-add="tasks">'+icon("plus")+' Add task</button>':'<span class="pill high">'+p.tasks.filter(function(t){return !t[4]}).length+' open</span>')+'</div><div class="task-list">'+tasks+'</div></section>'+
    '</aside></div>';
  document.getElementById("content").innerHTML=html;
  document.querySelectorAll("[data-stage]").forEach(function(b){b.addEventListener("click",function(){activeStage=b.dataset.stage;renderProject(p.id);document.querySelector('[data-stage="'+activeStage+'"]').focus({preventScroll:true})})});
  document.querySelectorAll("[data-task]").forEach(function(b){b.addEventListener("click",function(){var task=p.tasks.find(function(t){return t[0]===b.dataset.task});task[4]=!task[4];saveState();renderProject(p.id);toast(task[4]?"Task marked complete":"Task reopened")})});
  if(state.role==="admin")document.getElementById("projectNotes").addEventListener("input",function(e){p.notes=e.target.value;saveState();document.querySelector('.notes-box .save-hint').textContent="All changes saved in this browser.";});
  if(state.role==="admin"){
    document.getElementById("statusSelect").addEventListener("change",function(e){p.status=e.target.value;saveState();renderProject(p.id);toast("Project status updated")});
    document.getElementById("prioritySelect").addEventListener("change",function(e){p.priority=e.target.value.split(" ")[0];saveState();document.getElementById("priorityCount").textContent=visibleProjects().filter(function(x){return x.priority==="High"}).length;renderProject(p.id);toast("Project priority updated")});
    document.getElementById("editScope").addEventListener("click",function(){openScope(p.id)});
    document.getElementById("editScopeInline").addEventListener("click",function(){openScope(p.id)});
    document.querySelectorAll("[data-shift-schedule]").forEach(function(button){button.addEventListener("click",function(){var item=p.schedule[Number(button.dataset.shiftSchedule)],days=Number(button.dataset.days);item.start=addDays(item.start,days);item.end=addDays(item.end,days);saveState();renderProject(p.id);toast(stageLabel(item.stage)+" shifted "+Math.abs(days)+" days");});});
    bindAdminEditor(p);
  }
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
  if(kind==="settings")return {title:"Edit Workspace Header",description:"These values control the shared dashboard header. Use a secure HTTPS image URL.",fields:[
    {name:"organization",label:"Organization Name",value:state.settings.organization},{name:"workspaceTitle",label:"Top Header Title",value:state.settings.workspaceTitle,wide:true},{name:"dashboardHeading",label:"Dashboard Heading",value:state.settings.dashboardHeading,wide:true},{name:"dashboardSummary",label:"Dashboard Summary",type:"textarea",value:state.settings.dashboardSummary,wide:true},{name:"dashboardImage",label:"Header Image URL",type:"url",value:state.settings.dashboardImage,wide:true}
  ],validate:function(v){return /^https:\/\/\S+$/i.test(v.dashboardImage)?"":"Use an HTTPS image URL for the header.";},save:function(v){Object.assign(state.settings,v);applyWorkspaceSettings();}};
  function stageChoices(){return project.scope.map(function(k){return [k,stageLabel(k)]});}
  if(kind==="project")return {title:"Edit Project Information",description:"Update overview, access and the project image.",fields:[
    {name:"number",label:"Project Number",value:project.number},{name:"name",label:"Project Name",value:project.name},{name:"address",label:"Address",value:project.address},{name:"type",label:"Project Type",value:project.type},{name:"area",label:"Project Area",value:project.area},{name:"client",label:"Client",value:project.client},{name:"owner",label:"Owner",value:project.owner},{name:"contractor",label:"General Contractor",value:project.contractor},{name:"status",label:"Current Status",value:project.status},{name:"priority",label:"Priority",type:"select",options:[["High","High"],["Medium","Medium"],["Low","Low"]],value:project.priority},{name:"image",label:"Project Image URL",value:project.image,wide:true},{name:"summary",label:"Project Scope Summary",type:"textarea",value:project.summary,wide:true},{name:"assigned",label:"Assigned Users",type:"checks",options:Object.keys(USERS).map(function(k){return [k,USERS[k].name]}),value:project.assigned,wide:true}
  ],save:function(v){Object.keys(v).forEach(function(k){project[k]=v[k]})}};
  if(kind==="team"){
    item=creating?{id:uid("team"),role:"Consultant",name:""}:project.team[index];
    return {title:creating?"Add Team Member":"Edit Team Member",fields:[{name:"role",label:"Role / Discipline",value:item.role},{name:"name",label:"Name / Company",value:item.name},{name:"email",label:"Email",type:"email",value:item.email||"",required:false},{name:"phone",label:"Phone",type:"tel",value:item.phone||"",required:false}],save:function(v){Object.assign(item,v);if(creating)project.team.push(item)}};
  }
  if(kind==="companies"){
    item=creating?{id:uid("company"),category:"Consultant",name:"",contact:"",email:"",phone:"",logo:""}:project.companies[index];
    return {title:creating?"Add Project Company":"Edit Project Company",description:"Client, contractor and consultant details. Contact fields and logo are optional; use an HTTPS logo image URL.",fields:[{name:"category",label:"Company Role / Discipline",value:item.category},{name:"name",label:"Company Name",value:item.name},{name:"contact",label:"Contact Person",value:item.contact,required:false},{name:"email",label:"Email",type:"email",value:item.email,required:false},{name:"phone",label:"Phone",type:"tel",value:item.phone,required:false},{name:"logo",label:"Logo Image URL",type:"url",value:item.logo,required:false}],validate:function(v){return !v.logo||/^https:\/\/\S+$/i.test(v.logo)?"":"Use an HTTPS image URL for the logo.";},save:function(v){Object.assign(item,v);if(creating)project.companies.push(item);}};
  }
  if(kind==="schedule"){
    item=creating?{id:uid("sch"),stage:project.scope[0],start:"2026-09-01",end:"2026-10-01",status:"Not Started"}:project.schedule[index];
    return {title:creating?"Add Schedule Item":"Edit Schedule Item",description:"Stage bars can overlap when work happens at the same time.",fields:[{name:"stage",label:"Project Stage",type:"select",options:stageChoices(),value:item.stage},{name:"start",label:"Start Date",type:"date",value:item.start},{name:"end",label:"End Date",type:"date",value:item.end},{name:"status",label:"Status",type:"select",options:[["Not Started","Not Started"],["Ongoing","Ongoing"],["Complete","Complete"],["On Hold","On Hold"]],value:item.status}],validate:function(v){return v.end>=v.start?"":"End date must be on or after the start date."},save:function(v){Object.assign(item,v);if(creating)project.schedule.push(item);sortSchedule(project)}};
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
    item=creating?{id:uid("meeting"),title:"Project Coordination Meeting",date:"2026-09-08",time:"10:00",stage:project.scope[0],location:"Microsoft Teams",attendees:"",notes:"",actions:[]}:project.meetings[index];
    return {title:creating?"Add Project Meeting":"Edit Project Meeting",description:"Record the meeting date, participants and decisions. Action items are added separately and become Project Tasks.",fields:[{name:"title",label:"Meeting Title",value:item.title,wide:true},{name:"date",label:"Meeting Date",type:"date",value:item.date},{name:"time",label:"Time",type:"time",value:item.time||""},{name:"stage",label:"Related Stage",type:"select",options:stageChoices(),value:item.stage},{name:"location",label:"Location / Link",value:item.location||"",required:false},{name:"attendees",label:"Attendees",value:item.attendees||"",wide:true,required:false},{name:"notes",label:"Minutes / Decisions",type:"textarea",value:item.notes||"",wide:true}],save:function(v){Object.assign(item,v);if(creating)project.meetings.push(item);}};
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
  return '<label class="'+cls+'"><span>'+esc(field.label)+'</span><input name="'+field.name+'" type="'+(field.type||'text')+'" value="'+esc(field.value)+'"'+(field.required===false?'':' required')+'></label>';
}
function openEditor(project,kind,index,stageKey){
  if(state.role!=="admin")return;var cfg=editorConfig(project,kind,index,stageKey);if(!cfg)return;
  editContext={project:project,kind:kind,index:index,stageKey:stageKey,config:cfg};
  document.getElementById("editModalTitle").textContent=cfg.title;document.getElementById("editModalDescription").textContent=cfg.description||"Changes are saved locally in this browser.";
  document.getElementById("editFields").innerHTML=cfg.fields.map(fieldHtml).join("");document.getElementById("editModal").classList.remove("hidden");refreshIcons();
}
function closeEditor(){document.getElementById("editModal").classList.add("hidden");editContext=null;}
function saveEditor(form){
  if(!editContext)return;var data=new FormData(form),values={};
  editContext.config.fields.forEach(function(f){if(f.type==="checks")values[f.name]=data.getAll(f.name);else if(f.type==="checkbox")values[f.name]=data.has(f.name);else values[f.name]=data.get(f.name)});
  var error=editContext.config.validate?editContext.config.validate(values):"";if(error){toast(error);return}
  editContext.config.save(values);saveState();var project=editContext.project,kind=editContext.kind;closeEditor();if(project)renderProject(project.id);else if(kind==="settings")renderSettingsPage();toast("Changes saved");
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
  bindProjectCards();
}
function setupEvents(){
  document.querySelectorAll("[data-role]").forEach(function(b){b.addEventListener("click",function(){launch("admin")})});
  document.getElementById("continueUser").addEventListener("click",function(){launch("user",document.getElementById("welcomeUser").value)});
  document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.addEventListener("click",function(){if(Date.now()<suppressMenuClickUntil)return;currentView=b.dataset.view;currentProjectId=null;if(currentView==="priority"){currentFilters.high=true}else if(currentView==="gallery"){currentFilters.high=false}render();document.getElementById("sidebar").classList.remove("open")})});
  document.getElementById("menuToggle").addEventListener("click",function(){document.getElementById("sidebar").classList.toggle("open")});
  document.getElementById("openAiNav").addEventListener("click",openAi);document.getElementById("openAiTop").addEventListener("click",openAi);
  document.getElementById("closeAi").addEventListener("click",closeAi);document.getElementById("drawerBackdrop").addEventListener("click",closeAi);
  document.querySelectorAll("[data-ai-action]").forEach(function(b){b.addEventListener("click",function(){sendAi(b.dataset.aiAction,b.textContent.trim())})});
  document.getElementById("aiForm").addEventListener("submit",function(e){e.preventDefault();var input=document.getElementById("aiInput");if(!input.value.trim())return;sendAi("custom",input.value.trim());input.value=""});
  document.getElementById("globalSearch").addEventListener("input",function(e){currentFilters.query=e.target.value;currentView="gallery";currentProjectId=null;render()});
  document.getElementById("switchRole").addEventListener("click",function(){document.getElementById("app").classList.add("hidden");document.getElementById("intro").classList.remove("hidden");document.dispatchEvent(new Event("hosis:intro:replay"));document.getElementById("sidebar").classList.remove("open");document.getElementById("welcomeTitle").focus();refreshIcons()});
  document.getElementById("resetDemo").addEventListener("click",function(){if(confirm("Reset all prototype edits saved in this browser?")){state={role:state.role,userId:state.userId,projects:clone(INITIAL_PROJECTS),settings:clone(DEFAULT_SETTINGS)};state.projects.forEach(normalizeProject);saveState();applyWorkspaceSettings();applyMenuOrder();currentProjectId=null;currentView="dashboard";render();toast("Prototype data reset")}});
  document.querySelectorAll("[data-close-modal]").forEach(function(b){b.addEventListener("click",closeScope)});
  document.querySelectorAll("[data-close-edit]").forEach(function(b){b.addEventListener("click",closeEditor)});
  document.getElementById("editForm").addEventListener("submit",function(e){e.preventDefault();saveEditor(e.currentTarget)});
  document.getElementById("saveScope").addEventListener("click",saveScope);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeAi();closeScope();closeEditor()}});
}

setupEvents();
refreshIcons();
startIntro();
})();
