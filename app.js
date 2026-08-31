(function(){
"use strict";

var STAGES={
  design:{label:"Design",icon:"pen-tool",description:"Design development, revisions and approvals"},
  survey:{label:"Site Survey",icon:"scan-line",description:"Existing conditions, site measurements and survey records"},
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
  maya:{name:"Maya Chen",role:"Architectural Coordinator",initials:"MC"},
  liam:{name:"Liam Brooks",role:"Project Technologist",initials:"LB"},
  sofia:{name:"Sofia Martinez",role:"Project Designer",initials:"SM"}
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

var KEY="hosisHubPrototypeV1";
var state=loadState();
var currentView="dashboard";
var currentProjectId=null;
var activeStage=null;
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
function normalizeProject(project,index){
  // Keep legacy administration records; they must not become survey evidence.
  if(project.scope.indexOf("admin")>-1){
    project.legacyAdministration=project.legacyAdministration||{stageItems:clone((project.stageItems||{}).admin||STAGE_ITEMS.admin),schedule:clone((project.schedule||[]).filter(function(s){return s.stage==="admin";}))};
    project.scope=project.scope.map(function(k){return k==="admin"?"survey":k;}).filter(function(k,i,a){return a.indexOf(k)===i;});
    if(Array.isArray(project.schedule))project.schedule=project.schedule.filter(function(s){return s.stage!=="admin";});
  }
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
  project.activity=Array.isArray(project.activity)?project.activity:[];
  project.documents=Array.isArray(project.documents)?project.documents:[];
  project.notes=project.notes||"";
  return project;
}
function loadState(){
  var loaded=null;
  try{loaded=JSON.parse(localStorage.getItem(KEY));}catch(e){}
  var next=loaded&&Array.isArray(loaded.projects)?loaded:{role:null,userId:null,projects:clone(INITIAL_PROJECTS)};
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
function priorityClass(value){return String(value||"Medium").toLowerCase();}
function stageLabel(key){return STAGES[key]?STAGES[key].label:key==="admin"?"Project Administration (archived)":key;}
function projectById(id){return state.projects.find(function(p){return p.id===id});}
function stageProgress(project,key){
  return stageCompletion(project,key).percent;
}
function setNav(view){document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});}

function startIntro(){
  document.addEventListener("hosis:intro:enter",finishIntro);
  var fallback=document.getElementById("introFallback");
  if(fallback)fallback.addEventListener("click",finishIntro);
}
function finishIntro(){
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  try{sessionStorage.setItem("hosis-cinematic-seen-v1","1")}catch(e){}
  document.dispatchEvent(new Event("hosis:intro:closed"));
  var heading=document.querySelector(".welcome-panel h2");heading.setAttribute("tabindex","-1");heading.focus();refreshIcons();
}
function launch(role,userId){
  state.role=role;state.userId=role==="admin"?null:userId;saveState();
  document.getElementById("welcome").classList.add("hidden");document.getElementById("app").classList.remove("hidden");
  var user=role==="admin"?{name:"Hosis Admin",role:"Administrator",initials:"HA"}:USERS[userId];
  document.getElementById("sidebarUserName").textContent=user.name;document.getElementById("sidebarRole").textContent=user.role;document.getElementById("sidebarAvatar").textContent=user.initials;
  document.getElementById("priorityCount").textContent=visibleProjects().filter(function(p){return p.priority==="High"}).length;
  currentView="dashboard";render();
}
function render(){
  if(currentView==="project")renderProject(currentProjectId);
  else if(currentView==="gallery"||currentView==="priority")renderGallery();
  else if(currentView==="schedule")renderSchedulePage();
  else renderDashboard();
  setNav(currentView==="project"?"gallery":currentView);refreshIcons();document.getElementById("content").focus({preventScroll:true});
}
function setHeading(breadcrumb,title){document.getElementById("breadcrumb").textContent=breadcrumb;document.getElementById("pageTitle").textContent=title;}
function statCard(iconName,value,label){return '<div class="stat-card"><span class="stat-icon">'+icon(iconName)+'</span><strong>'+value+'</strong><small>'+esc(label)+'</small></div>';}
function renderDashboard(){
  var projects=visibleProjects();
  var high=projects.filter(function(p){return p.priority==="High"}).length;
  var permitDeadlines=projects.reduce(function(n,p){return n+p.deadlines.filter(function(d){return d[2]==="permit"}).length},0);
  var tenderDeadlines=projects.reduce(function(n,p){return n+p.deadlines.filter(function(d){return d[2]==="tender"}).length},0);
  var issues=projects.reduce(function(n,p){return n+p.tasks.filter(function(t){return t[3]==="High"&&!t[4]}).length},0);
  var overdue=projects.reduce(function(n,p){return n+p.tasks.filter(function(t){return !t[4]&&new Date(t[2])<new Date()}).length},0);
  setHeading("Portfolio / Overview","Project Delivery & Coordination");
  var recent=[];projects.forEach(function(p){p.activity.forEach(function(a){recent.push({p:p,a:a})})});recent=recent.slice(0,6);
  var stageCounts={};Object.keys(STAGES).forEach(function(k){stageCounts[k]=projects.filter(function(p){return p.scope.indexOf(k)>-1}).length});
  var html='<section class="hero-strip"><div class="hero-copy"><div class="eyebrow">HOSIS ARCHITECTURE</div><h2>Project intelligence,<br>clearly delivered.</h2><p>'+esc(state.role==="admin"?"You are viewing the complete fictional project portfolio.":"You are viewing projects assigned to "+USERS[state.userId].name+".")+'</p></div><div class="hero-actions"><button class="ghost-button" data-go-gallery>'+icon("panels-top-left")+'Explore Projects</button><button class="ghost-button" data-go-schedule>'+icon("gantt-chart-square")+'Open Schedule</button><button class="ghost-button" data-open-ai>'+icon("sparkles")+'Ask Hosis AI</button></div></section>'+
    '<section class="stat-grid">'+statCard("building-2",projects.length,"Total Active Projects")+statCard("flame",high,"High-Priority Projects")+statCard("badge-check",permitDeadlines,"Permit Deadlines")+statCard("gavel",tenderDeadlines,"Tender Deadlines")+statCard("triangle-alert",issues,"Delivery Issues")+statCard("clock-alert",overdue,"Overdue Tasks")+'</section>'+
    '<section class="panel timeline-preview"><div class="panel-head"><div><h3>Portfolio Schedule</h3><small>Stage dates and overlaps across all visible projects</small></div><button data-go-schedule>Open full timeline</button></div>'+renderTimeline(projects,true)+'</section>'+
    '<div class="dashboard-grid"><section class="panel"><div class="panel-head"><h3>Recent Activity</h3><button data-go-gallery>View portfolio</button></div><div class="activity-list">'+recent.map(function(x){var s=STAGES[x.a[2]]||{icon:"folder-kanban"};return '<div class="activity-row"><span class="activity-icon">'+icon(s.icon)+'</span><div><strong>'+esc(x.a[0])+'</strong><small>'+esc(x.p.number+" · "+x.p.name)+'</small></div><time>'+esc(x.a[1])+'</time></div>'}).join("")+'</div></section><section class="panel"><div class="panel-head"><h3>Projects by Stage</h3><button data-go-gallery>Filter</button></div><div class="stage-bars">'+Object.keys(STAGES).map(function(k){var pct=projects.length?Math.round(stageCounts[k]/projects.length*100):0;return '<div><div class="stage-bar-head"><span>'+icon(STAGES[k].icon)+' '+esc(STAGES[k].label)+'</span><b>'+stageCounts[k]+'</b></div><div class="stage-track"><div class="stage-fill stage-'+k+'" style="width:'+pct+'%"></div></div></div>'}).join("")+'</div></section></div>'+
    '<div class="section-title"><div><h2>Featured Projects</h2><p>Visual portfolio of current fictional work.</p></div></div><section class="project-grid">'+projects.slice(0,3).map(projectCard).join("")+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();
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
  var projects=visibleProjects().filter(filterProject);
  setHeading("Portfolio / Project Gallery",currentView==="priority"?"High-Priority Projects":"Project Gallery");
  var userOptions=Object.keys(USERS).map(function(k){return '<option value="'+k+'"'+(currentFilters.user===k?" selected":"")+'>'+esc(USERS[k].name)+'</option>'}).join("");
  var html='<div class="section-title"><div><h2>'+(currentView==="priority"?"Priority Focus":"Architecture Portfolio")+'</h2><p>'+projects.length+' fictional projects match the current view.</p></div></div>'+
    '<section class="filter-bar"><label class="filter-field">'+icon("search")+'<input id="gallerySearch" placeholder="Search project name or number" value="'+esc(currentFilters.query)+'"></label>'+
    '<label class="filter-field">'+icon("building-2")+'<select data-filter="type"><option value="">All project types</option>'+allTypes().map(function(t){return '<option'+(currentFilters.type===t?" selected":"")+'>'+esc(t)+'</option>'}).join("")+'</select></label>'+
    '<label class="filter-field">'+icon("activity")+'<select data-filter="status"><option value="">All statuses</option>'+allStatuses().map(function(t){return '<option'+(currentFilters.status===t?" selected":"")+'>'+esc(t)+'</option>'}).join("")+'</select></label>'+
    '<label class="filter-field">'+icon("flag")+'<select data-filter="priority"><option value="">All priorities</option>'+["High","Medium","Low"].map(function(t){return '<option'+(currentFilters.priority===t?" selected":"")+'>'+t+'</option>'}).join("")+'</select></label>'+
    (state.role==="admin"?'<label class="filter-field">'+icon("user-round")+'<select data-filter="user"><option value="">All assigned users</option>'+userOptions+'</select></label>':'')+
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
function renderTimeline(projects,compact){
  var bounds=timelineBounds(projects),months=monthMarkers(bounds);
  var head='<div class="timeline-head"><div class="timeline-label">PROJECT / STAGE</div><div class="timeline-months">'+months.map(function(m){return '<span style="left:'+m.left+'%">'+esc(m.label)+'</span>'}).join("")+'</div></div>';
  var rows=projects.map(function(p){
    var schedule=compact?p.schedule.slice(0,4):p.schedule;
    var bars=schedule.map(function(s,i){var left=timelinePosition(s.start,bounds),right=timelinePosition(s.end,bounds),width=Math.max(2,right-left);return '<button class="timeline-bar stage-'+s.stage+'" data-project="'+p.id+'" title="'+esc(stageLabel(s.stage)+" · "+formatDate(s.start)+" to "+formatDate(s.end))+'" style="left:'+left+'%;width:'+width+'%;top:'+(i*25+7)+'px"><span>'+icon(STAGES[s.stage].icon)+esc(stageLabel(s.stage))+'</span></button>'}).join("");
    return '<div class="timeline-row" style="--lanes:'+schedule.length+'"><button class="timeline-project" data-project="'+p.id+'"><strong>'+esc(p.number)+'</strong><small>'+esc(p.name)+'</small></button><div class="timeline-lane">'+months.map(function(m){return '<i style="left:'+m.left+'%"></i>'}).join("")+bars+'</div></div>';
  }).join("");
  return '<div class="timeline-scroll"><div class="timeline-canvas">'+head+rows+'<div class="timeline-legend">'+Object.keys(STAGES).map(function(k){return '<span><i class="stage-'+k+'"></i>'+esc(STAGES[k].label)+'</span>'}).join("")+'</div></div></div>';
}
function renderSchedulePage(){
  var projects=visibleProjects();setHeading("Portfolio / Schedule","Project Schedule & Timeline");
  var html='<div class="section-title schedule-title"><div><div class="eyebrow dark">PORTFOLIO PLANNING</div><h2>Project Schedule</h2><p>Compare dated stages, see current position and identify overlapping work.</p></div><span class="schedule-count">'+projects.length+' active projects</span></div><section class="panel schedule-panel"><div class="timeline-guide">'+icon("info")+' Each colour is a project stage. Horizontal alignment shows work happening at the same time.</div>'+renderTimeline(projects,false)+'</section>';
  document.getElementById("content").innerHTML=html;bindCommon();
}
function adminButton(label,kind,index,extra){return state.role==="admin"?'<button class="tiny-action" data-edit="'+kind+'" data-index="'+index+'" '+(extra||"")+'>'+icon("pencil")+'<span>'+label+'</span></button>':"";}
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
    '<section class="project-hero"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'"><div class="project-hero-top"><button class="back-button" data-go-gallery>'+icon("arrow-left")+'Project Gallery</button><div class="card-tags"><span class="pill">'+esc(p.status)+'</span><span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+' Priority</span></div></div><div class="project-hero-main"><div><div class="eyebrow">'+esc(p.number+" · "+p.type)+'</div><h1>'+esc(p.name)+'</h1><p>'+icon("map-pin")+' '+esc(p.address)+' &nbsp; · &nbsp; '+esc(p.area)+'</p></div><div class="project-hero-actions">'+adminControls+(state.role==="admin"?'<button class="ghost-button" data-edit="project" data-index="-1">'+icon("square-pen")+'Edit Project</button><button class="ghost-button" id="editScope">'+icon("sliders-horizontal")+'Edit Scope</button>':'')+'<button class="ghost-button" onclick="window.print()">'+icon("printer")+'Print / PDF</button></div></div></section>'+
    '<div class="project-layout"><div class="detail-stack">'+
      '<section class="panel"><div class="panel-head"><h3>Project Overview</h3>'+(state.role==="admin"?'<button data-edit="project" data-index="-1">'+icon("pencil")+' Edit overview</button>':'<span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+'</span>')+'</div><p class="overview-summary">'+esc(p.summary)+'</p><div class="overview-grid">'+
      [["Project Number",p.number],["Project Type",p.type],["Project Area",p.area],["Client",p.client],["Owner",p.owner],["General Contractor",p.contractor],["Address",p.address],["Current Status",p.status],["Priority",p.priority]].map(function(x){return '<div class="info-cell"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>'}).join("")+
      '</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Scope</h3>'+(state.role==="admin"?'<button id="editScopeInline">Edit stages</button>':'')+'</div><div class="scope-stage-list">'+scope+'</div><div id="stageContent" class="stage-content">'+renderStageContent(p,activeStage)+'</div></section>'+
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
  if(state.role==="admin")document.getElementById("projectNotes").addEventListener("input",function(e){p.notes=e.target.value;saveState();toast("Project notes saved locally")});
  if(state.role==="admin"){
    document.getElementById("statusSelect").addEventListener("change",function(e){p.status=e.target.value;saveState();renderProject(p.id);toast("Project status updated")});
    document.getElementById("prioritySelect").addEventListener("change",function(e){p.priority=e.target.value.split(" ")[0];saveState();document.getElementById("priorityCount").textContent=visibleProjects().filter(function(x){return x.priority==="High"}).length;renderProject(p.id);toast("Project priority updated")});
    document.getElementById("editScope").addEventListener("click",function(){openScope(p.id)});
    document.getElementById("editScopeInline").addEventListener("click",function(){openScope(p.id)});
    bindAdminEditor(p);
  }
  document.querySelectorAll(".company-logo img").forEach(function(img){img.addEventListener("error",function(){img.remove();});});
  bindCommon();refreshIcons();
}
function renderProjectSchedule(project){
  var bounds=timelineBounds([project]),months=monthMarkers(bounds);
  return '<div class="project-schedule"><div class="project-schedule-head"><span>Stage and dates</span><div>'+months.map(function(m){return '<span style="left:'+m.left+'%">'+esc(m.label)+'</span>'}).join("")+'</div></div>'+project.schedule.map(function(s,i){var left=timelinePosition(s.start,bounds),right=timelinePosition(s.end,bounds);return '<div class="project-schedule-row"><div class="schedule-row-label"><span class="record-icon stage-'+s.stage+'">'+icon(STAGES[s.stage].icon)+'</span><div><strong>'+esc(stageLabel(s.stage))+'</strong><small>'+formatDate(s.start)+' — '+formatDate(s.end)+'</small></div><span class="record-status">'+esc(s.status)+'</span><div class="row-actions">'+adminButton("Edit","schedule",i)+deleteButton("schedule",i)+'</div></div><div class="schedule-row-track">'+months.map(function(m){return '<i style="left:'+m.left+'%"></i>'}).join("")+'<span class="schedule-row-bar stage-'+s.stage+'" style="left:'+left+'%;width:'+Math.max(2,right-left)+'%"></span></div></div>'}).join("")+'</div>';
}
function renderStageContent(project,key){
  if(project.scope.indexOf(key)===-1) return "";
  var items=project.stageItems[key]||[];
  var completion=stageCompletion(project,key);
  return '<div class="panel-head stage-detail-head"><div><h3>'+icon(STAGES[key].icon)+" "+esc(STAGES[key].label)+'</h3><small>'+esc(STAGES[key].description)+'</small></div><div class="stage-head-actions"><span class="workflow-count" role="status">'+completion.complete+'/'+completion.total+' milestones complete</span></div></div><div class="workflow-progress" role="progressbar" aria-label="'+esc(stageLabel(key))+' completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+completion.percent+'"><span style="width:'+completion.percent+'%"></span></div><div class="stage-records workflow-list">'+items.map(function(x,i){var status=workflowStatus(x.status);return '<div class="stage-record workflow-row" data-record-id="'+x.id+'"><span class="record-icon">'+icon(x.icon||STAGES[key].icon)+'</span><div class="milestone-copy"><strong>'+esc(x.title)+(x.optional?'<span class="optional-tag">Optional</span>':'')+'</strong>'+(x.detail||x.date?'<small>'+esc(x.detail)+(x.date?' · '+formatDate(x.date):'')+'</small>':'')+'</div><div class="milestone-controls"><div class="row-actions">'+adminButton("Edit","stageItems",i,'data-stage-key="'+key+'"')+deleteButton("stageItems",i,'data-stage-key="'+key+'"')+'</div>'+(state.role==="admin"?'<select class="milestone-status" data-status="'+status.toLowerCase().replace(/[^a-z]+/g,"-")+'" data-milestone-status="'+i+'" data-stage-key="'+key+'" aria-label="Status: '+esc(x.title)+'">'+WORKFLOW_STATUSES.map(function(s){return '<option'+(s===status?' selected':'')+'>'+s+'</option>';}).join("")+'</select>':'<span class="milestone-status read-only" data-status="'+status.toLowerCase().replace(/[^a-z]+/g,"-")+'">'+status+'</span>')+'</div></div>';}).join("")+(items.length?'':'<p class="workflow-empty">No milestones yet.</p>')+'</div>'+(state.role==="admin"?'<button class="add-milestone" data-add="stageItems" data-stage-key="'+key+'">'+icon("plus")+' Add custom milestone</button>':'')+'<p class="workflow-help">N/A items are excluded from progress. Optional items count until marked N/A.</p>';
}

function editorConfig(project,kind,index,stageKey){
  var creating=index<0,item;
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
    return {title:creating?"Add Schedule Item":"Edit Schedule Item",description:"Stage bars can overlap when work happens at the same time.",fields:[{name:"stage",label:"Project Stage",type:"select",options:stageChoices(),value:item.stage},{name:"start",label:"Start Date",type:"date",value:item.start},{name:"end",label:"End Date",type:"date",value:item.end},{name:"status",label:"Status",type:"select",options:[["Not Started","Not Started"],["Ongoing","Ongoing"],["Complete","Complete"],["On Hold","On Hold"]],value:item.status}],validate:function(v){return v.end>=v.start?"":"End date must be on or after the start date."},save:function(v){Object.assign(item,v);if(creating)project.schedule.push(item)}};
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
  editContext.config.save(values);saveState();var id=editContext.project.id;closeEditor();renderProject(id);toast("Changes saved");
}
function deleteRecord(project,kind,index,stageKey){
  if(!confirm("Delete this record?"))return;
  if(kind==="stageItems")project.stageItems[stageKey].splice(index,1);else project[kind].splice(index,1);
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
  document.querySelectorAll("[data-edit]").forEach(function(b){b.addEventListener("click",function(){openEditor(project,b.dataset.edit,Number(b.dataset.index),b.dataset.stageKey||null)})});
  document.querySelectorAll("[data-add]").forEach(function(b){b.addEventListener("click",function(){openEditor(project,b.dataset.add,-1,b.dataset.stageKey||null)})});
  document.querySelectorAll("[data-delete]").forEach(function(b){b.addEventListener("click",function(){deleteRecord(project,b.dataset.delete,Number(b.dataset.index),b.dataset.stageKey||null)})});
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
  p.schedule=oldSchedule.filter(function(s){return selected.indexOf(s.stage)>-1});saveState();activeStage=selected[0];closeScope();renderProject(p.id);toast("Project scope updated");
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

function bindProjectCards(){document.querySelectorAll("[data-project]").forEach(function(b){b.addEventListener("click",function(){currentProjectId=b.dataset.project;currentView="project";activeStage=null;render()})})}
function bindCommon(){
  document.querySelectorAll("[data-go-gallery]").forEach(function(b){b.addEventListener("click",function(){currentView="gallery";currentProjectId=null;render()})});
  document.querySelectorAll("[data-go-schedule]").forEach(function(b){b.addEventListener("click",function(){currentView="schedule";currentProjectId=null;render()})});
  document.querySelectorAll("[data-open-ai]").forEach(function(b){b.addEventListener("click",openAi)});
  bindProjectCards();
}
function setupEvents(){
  document.getElementById("replayCinematic").addEventListener("click",function(){document.getElementById("welcome").classList.add("hidden");document.getElementById("intro").classList.remove("hidden");document.dispatchEvent(new Event("hosis:intro:replay"));});
  document.querySelectorAll("[data-role]").forEach(function(b){b.addEventListener("click",function(){launch("admin")})});
  document.getElementById("continueUser").addEventListener("click",function(){launch("user",document.getElementById("welcomeUser").value)});
  document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.addEventListener("click",function(){currentView=b.dataset.view;currentProjectId=null;if(currentView==="priority"){currentFilters.high=true}else if(currentView==="gallery"){currentFilters.high=false}render();document.getElementById("sidebar").classList.remove("open")})});
  document.getElementById("menuToggle").addEventListener("click",function(){document.getElementById("sidebar").classList.toggle("open")});
  document.getElementById("openAiNav").addEventListener("click",openAi);document.getElementById("openAiTop").addEventListener("click",openAi);
  document.getElementById("closeAi").addEventListener("click",closeAi);document.getElementById("drawerBackdrop").addEventListener("click",closeAi);
  document.querySelectorAll("[data-ai-action]").forEach(function(b){b.addEventListener("click",function(){sendAi(b.dataset.aiAction,b.textContent.trim())})});
  document.getElementById("aiForm").addEventListener("submit",function(e){e.preventDefault();var input=document.getElementById("aiInput");if(!input.value.trim())return;sendAi("custom",input.value.trim());input.value=""});
  document.getElementById("globalSearch").addEventListener("input",function(e){currentFilters.query=e.target.value;currentView="gallery";currentProjectId=null;render()});
  document.getElementById("switchRole").addEventListener("click",function(){document.getElementById("app").classList.add("hidden");document.getElementById("welcome").classList.remove("hidden");document.getElementById("sidebar").classList.remove("open");refreshIcons()});
  document.getElementById("resetDemo").addEventListener("click",function(){if(confirm("Reset all prototype edits saved in this browser?")){state={role:state.role,userId:state.userId,projects:clone(INITIAL_PROJECTS)};state.projects.forEach(normalizeProject);saveState();currentProjectId=null;currentView="dashboard";render();toast("Prototype data reset")}});
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
