(function(){
"use strict";

var STAGES={
  design:{label:"Design",icon:"pen-tool",description:"Design development, revisions and approvals"},
  admin:{label:"Project Administration",icon:"folder-kanban",description:"Meetings, schedules and coordination"},
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
var timers=[];

function clone(value){return JSON.parse(JSON.stringify(value));}
function loadState(){
  try{
    var saved=JSON.parse(localStorage.getItem(KEY));
    if(saved&&Array.isArray(saved.projects)) return saved;
  }catch(e){}
  return {role:null,userId:null,projects:clone(INITIAL_PROJECTS)};
}
function saveState(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(value){
  return String(value==null?"":value).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];});
}
function icon(name,cls){return '<i data-lucide="'+name+'"'+(cls?' class="'+cls+'"':"")+"></i>';}
function refreshIcons(){if(window.lucide) window.lucide.createIcons();}
function initials(name){return name.split(" ").map(function(x){return x.charAt(0)}).slice(0,2).join("").toUpperCase();}
function toast(message){
  var el=document.getElementById("toast");el.textContent=message;el.classList.add("show");
  setTimeout(function(){el.classList.remove("show")},2200);
}
function formatDate(date){
  return new Date(date+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"});
}
function allTypes(){return Array.from(new Set(state.projects.map(function(p){return p.type}))).sort();}
function allStatuses(){return Array.from(new Set(state.projects.map(function(p){return p.status}))).sort();}
function visibleProjects(){
  if(state.role==="admin") return state.projects;
  return state.projects.filter(function(p){return p.assigned.indexOf(state.userId)>-1});
}
function priorityClass(p){return p.toLowerCase();}
function stageLabel(key){return STAGES[key]?STAGES[key].label:key;}
function projectById(id){return state.projects.find(function(p){return p.id===id});}
function stageProgress(project,key){
  var map={design:68,admin:74,permit:62,tender:54,construction:48,closeout:28};
  if(project.status==="Complete") return 100;
  return map[key]||40;
}
function setNav(view){
  document.querySelectorAll(".nav-item[data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===view)});
}

function startIntro(){
  var intro=document.getElementById("intro");
  function step(index,title,subtitle,cls){
    intro.className="intro "+(cls||"");
    document.getElementById("introTitle").textContent=title;
    document.getElementById("introSubtitle").textContent=subtitle;
    document.querySelectorAll(".intro-steps span").forEach(function(s,i){s.classList.toggle("active",i<=index)});
  }
  timers.push(setTimeout(function(){step(1,"Toronto project network","Toronto · Canada","city")},2400));
  timers.push(setTimeout(function(){step(2,"A new point of coordination","88 Charles Street, Toronto","city address")},5000));
  timers.push(setTimeout(function(){step(3,"HOSIS ARCHITECTURE","Project Delivery & Coordination","city address")},7100));
  timers.push(setTimeout(finishIntro,8700));
}
function finishIntro(){
  timers.forEach(clearTimeout);
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("welcome").classList.remove("hidden");
  refreshIcons();
}
function launch(role,userId){
  state.role=role;state.userId=role==="admin"?null:userId;saveState();
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  var user=role==="admin"?{name:"Hosis Admin",role:"Administrator",initials:"HA"}:USERS[userId];
  document.getElementById("sidebarUserName").textContent=user.name;
  document.getElementById("sidebarRole").textContent=user.role;
  document.getElementById("sidebarAvatar").textContent=user.initials;
  document.getElementById("priorityCount").textContent=visibleProjects().filter(function(p){return p.priority==="High"}).length;
  currentView="dashboard";render();
}

function render(){
  if(currentView==="project") renderProject(currentProjectId);
  else if(currentView==="gallery"||currentView==="priority") renderGallery();
  else renderDashboard();
  setNav(currentView==="project"?"gallery":currentView);
  refreshIcons();
  document.getElementById("content").focus({preventScroll:true});
}
function setHeading(breadcrumb,title){
  document.getElementById("breadcrumb").textContent=breadcrumb;
  document.getElementById("pageTitle").textContent=title;
}

function statCard(iconName,value,label){
  return '<div class="stat-card"><span class="stat-icon">'+icon(iconName)+'</span><strong>'+value+'</strong><small>'+esc(label)+'</small></div>';
}
function renderDashboard(){
  var projects=visibleProjects();
  var high=projects.filter(function(p){return p.priority==="High"}).length;
  var permitDeadlines=projects.reduce(function(n,p){return n+p.deadlines.filter(function(d){return d[2]==="permit"}).length},0);
  var tenderDeadlines=projects.reduce(function(n,p){return n+p.deadlines.filter(function(d){return d[2]==="tender"}).length},0);
  var issues=projects.reduce(function(n,p){return n+p.tasks.filter(function(t){return t[3]==="High"&&!t[4]}).length},0);
  var overdue=projects.reduce(function(n,p){return n+p.tasks.filter(function(t){return t[4]}).length},0);
  setHeading("Portfolio / Overview","Project Delivery & Coordination");
  var recent=[];
  projects.forEach(function(p){p.activity.forEach(function(a){recent.push({p:p,a:a})})});
  recent=recent.slice(0,6);
  var stageCounts={};Object.keys(STAGES).forEach(function(k){stageCounts[k]=projects.filter(function(p){return p.scope.indexOf(k)>-1}).length});
  var html=
    '<section class="hero-strip"><div class="hero-copy"><div class="eyebrow">HOSIS ARCHITECTURE</div><h2>Project intelligence,<br>clearly delivered.</h2><p>'+esc(state.role==="admin"?"You are viewing the complete fictional project portfolio.":"You are viewing projects assigned to "+USERS[state.userId].name+".")+'</p></div><div class="hero-actions"><button class="ghost-button" data-go-gallery>'+icon("panels-top-left")+'Explore Projects</button><button class="ghost-button" data-open-ai>'+icon("sparkles")+'Ask Hosis AI</button></div></section>'+
    '<section class="stat-grid">'+statCard("building-2",projects.length,"Total Active Projects")+statCard("flame",high,"High-Priority Projects")+statCard("badge-check",permitDeadlines,"Permit Deadlines")+statCard("gavel",tenderDeadlines,"Tender Deadlines")+statCard("triangle-alert",issues,"Construction / Delivery Issues")+statCard("clock-alert",overdue,"Overdue Tasks")+'</section>'+
    '<div class="dashboard-grid"><section class="panel"><div class="panel-head"><h3>Recent Activity</h3><button data-go-gallery>View portfolio</button></div><div class="activity-list">'+
    recent.map(function(x){return '<div class="activity-row"><span class="activity-icon">'+icon(STAGES[x.a[2]].icon)+'</span><div><strong>'+esc(x.a[0])+'</strong><small>'+esc(x.p.number+" · "+x.p.name)+'</small></div><time>'+esc(x.a[1])+'</time></div>'}).join("")+
    '</div></section><section class="panel"><div class="panel-head"><h3>Projects by Stage</h3><button data-go-gallery>Filter</button></div><div class="stage-bars">'+
    Object.keys(STAGES).map(function(k){var pct=projects.length?Math.round(stageCounts[k]/projects.length*100):0;return '<div><div class="stage-bar-head"><span>'+icon(STAGES[k].icon)+' '+esc(STAGES[k].label)+'</span><b>'+stageCounts[k]+'</b></div><div class="stage-track"><div class="stage-fill" style="width:'+pct+'%"></div></div></div>'}).join("")+
    '</div></section></div>'+
    '<div class="section-title"><div><h2>Featured Projects</h2><p>Visual portfolio of current fictional work.</p></div></div><section class="project-grid">'+projects.slice(0,3).map(projectCard).join("")+'</section>';
  document.getElementById("content").innerHTML=html;
  bindCommon();
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

function teamCard(role,name){
  return '<div class="team-card"><span class="avatar">'+esc(initials(name))+'</span><div><small>'+esc(role)+'</small><strong>'+esc(name)+'</strong></div></div>';
}
function renderProject(id){
  var p=projectById(id);
  if(!p||visibleProjects().indexOf(p)===-1){currentView="gallery";renderGallery();return}
  if(!activeStage||p.scope.indexOf(activeStage)===-1) activeStage=p.scope[0];
  setHeading("Portfolio / "+p.number,p.name);
  var scope=p.scope.map(function(k){return '<span class="stage-chip">'+icon(STAGES[k].icon)+esc(STAGES[k].label)+'</span>'}).join("");
  var tasks=p.tasks.map(function(t){return '<div class="task-row'+(t[4]?" done":"")+'"><button class="task-check" data-task="'+t[0]+'">'+(t[4]?icon("check"):"")+'</button><div><strong>'+esc(t[1])+'</strong><small>'+esc(t[3]+" priority · Due "+formatDate(t[2]))+'</small></div><span class="pill '+priorityClass(t[3])+'">'+esc(t[3])+'</span></div>'}).join("");
  var activities=p.activity.map(function(a){return '<div class="activity-row"><span class="activity-icon">'+icon(STAGES[a[2]].icon)+'</span><div><strong>'+esc(a[0])+'</strong><small>'+esc(stageLabel(a[2]))+'</small></div><time>'+esc(a[1])+'</time></div>'}).join("");
  var deadlines=p.deadlines.map(function(d){return '<div class="deadline-row"><span class="deadline-icon">'+icon(STAGES[d[2]].icon)+'</span><div><strong>'+esc(d[0])+'</strong><small>'+esc(stageLabel(d[2]))+'</small></div><time>'+formatDate(d[1])+'</time></div>'}).join("");
  var docs=p.documents.filter(function(d){return p.scope.indexOf(d[1])>-1}).map(function(d){return '<div class="document-row"><span class="record-icon">'+icon("file-text")+'</span><div><strong>'+esc(d[0])+'</strong><small>'+esc(stageLabel(d[1])+" · "+d[2])+'</small></div><button title="Prototype document">'+icon("external-link")+'</button></div>'}).join("");
  var assigned=p.assigned.map(function(u){return teamCard("Assigned User",USERS[u].name)}).join("");
  var adminControls=state.role==="admin"?'<select id="statusSelect" class="admin-select" aria-label="Change project status">'+allStatuses().concat(["Complete","On Hold"]).filter(function(v,i,a){return a.indexOf(v)===i}).map(function(v){return '<option'+(v===p.status?" selected":"")+'>'+esc(v)+'</option>'}).join("")+'</select><select id="prioritySelect" class="admin-select" aria-label="Change priority">'+["High","Medium","Low"].map(function(v){return '<option'+(v===p.priority?" selected":"")+'>'+v+' Priority</option>'}).join("")+'</select>':"";
  var html=
    '<section class="project-hero"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'"><div class="project-hero-top"><button class="back-button" data-go-gallery>'+icon("arrow-left")+'Project Gallery</button><div class="card-tags"><span class="pill">'+esc(p.status)+'</span><span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+' Priority</span></div></div><div class="project-hero-main"><div><div class="eyebrow">'+esc(p.number+" · "+p.type)+'</div><h1>'+esc(p.name)+'</h1><p>'+icon("map-pin")+' '+esc(p.address)+' &nbsp; · &nbsp; '+esc(p.area)+'</p></div><div class="project-hero-actions">'+adminControls+(state.role==="admin"?'<button class="ghost-button" id="editScope">'+icon("sliders-horizontal")+'Edit Scope</button>':'')+'<button class="ghost-button" onclick="window.print()">'+icon("printer")+'Print / PDF</button></div></div></section>'+
    '<div class="project-layout"><div class="detail-stack">'+
      '<section class="panel"><div class="panel-head"><h3>Project Overview</h3><span class="pill '+priorityClass(p.priority)+'">'+esc(p.priority)+'</span></div><p style="color:var(--muted);font-size:11px;line-height:1.75">'+esc(p.summary)+'</p><div class="overview-grid">'+
      [["Project Number",p.number],["Project Type",p.type],["Project Area",p.area],["Client",p.client],["Owner",p.owner],["General Contractor",p.contractor]].map(function(x){return '<div class="info-cell"><small>'+esc(x[0])+'</small><strong>'+esc(x[1])+'</strong></div>'}).join("")+
      '</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Scope</h3>'+(state.role==="admin"?'<button id="editScopeInline">Edit stages</button>':'')+'</div><div class="scope-stage-list">'+scope+'</div><div class="stage-tabs">'+p.scope.map(function(k){return '<button class="stage-tab'+(activeStage===k?" active":"")+'" data-stage="'+k+'">'+icon(STAGES[k].icon)+esc(STAGES[k].label)+'</button>'}).join("")+'</div><div id="stageContent" class="stage-content">'+renderStageContent(p,activeStage)+'</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Project Team</h3><span class="pill">'+(p.assigned.length)+' assigned users</span></div><div class="team-grid">'+
      teamCard("Client Project Manager",p.clientPM)+teamCard("Owner Representative",p.ownerRep)+teamCard("Architectural Project Manager",p.architectPM)+teamCard("Project Lead",p.lead)+teamCard("Mechanical Consultant",p.mechanical)+teamCard("Electrical Consultant",p.electrical)+teamCard("Structural Consultant",p.structural)+assigned+
      '</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Documents</h3><button>'+p.documents.length+' records</button></div>'+docs+'</section>'+
    '</div><aside class="detail-stack">'+
      '<section class="panel"><div class="panel-head"><h3>Upcoming Deadlines</h3>'+icon("calendar-days")+'</div><div class="deadline-list">'+deadlines+'</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Urgent Tasks</h3><span class="pill high">'+p.tasks.filter(function(t){return !t[4]}).length+' open</span></div><div class="task-list">'+tasks+'</div></section>'+
      '<section class="panel"><div class="panel-head"><h3>Recent Activity</h3>'+icon("activity")+'</div><div class="activity-list">'+activities+'</div></section>'+
      '<section class="panel notes-box"><div class="panel-head"><h3>Project Notes</h3>'+icon("sticky-note")+'</div><textarea id="projectNotes" placeholder="Add project notes…">'+esc(p.notes)+'</textarea></section>'+
    '</aside></div>';
  document.getElementById("content").innerHTML=html;
  document.querySelectorAll("[data-stage]").forEach(function(b){b.addEventListener("click",function(){activeStage=b.dataset.stage;document.getElementById("stageContent").innerHTML=renderStageContent(p,activeStage);document.querySelectorAll("[data-stage]").forEach(function(x){x.classList.toggle("active",x===b)});refreshIcons()})});
  document.querySelectorAll("[data-task]").forEach(function(b){b.addEventListener("click",function(){var task=p.tasks.find(function(t){return t[0]===b.dataset.task});task[4]=!task[4];saveState();renderProject(p.id);toast(task[4]?"Task marked complete":"Task reopened")})});
  document.getElementById("projectNotes").addEventListener("change",function(e){p.notes=e.target.value;saveState();toast("Project notes saved locally")});
  if(state.role==="admin"){
    document.getElementById("statusSelect").addEventListener("change",function(e){p.status=e.target.value;saveState();renderProject(p.id);toast("Project status updated")});
    document.getElementById("prioritySelect").addEventListener("change",function(e){p.priority=e.target.value.split(" ")[0];saveState();document.getElementById("priorityCount").textContent=visibleProjects().filter(function(x){return x.priority==="High"}).length;renderProject(p.id);toast("Project priority updated")});
    document.getElementById("editScope").addEventListener("click",function(){openScope(p.id)});
    document.getElementById("editScopeInline").addEventListener("click",function(){openScope(p.id)});
  }
  bindCommon();
}
function renderStageContent(project,key){
  if(project.scope.indexOf(key)===-1) return "";
  var items=STAGE_ITEMS[key]||[];
  return '<div class="panel-head" style="margin-top:18px"><div><h3>'+icon(STAGES[key].icon)+" "+esc(STAGES[key].label)+'</h3><small style="color:var(--muted);font-size:9px">'+esc(STAGES[key].description)+'</small></div><span class="pill">'+stageProgress(project,key)+'% stage progress</span></div><div class="stage-records">'+items.map(function(x){return '<div class="stage-record"><span class="record-icon">'+icon(x[3])+'</span><div><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+'</small></div><span class="record-status">'+esc(x[2])+'</span></div>'}).join("")+'</div>';
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
  var p=projectById(scopeEditingId);p.scope=selected;saveState();activeStage=selected[0];closeScope();renderProject(p.id);toast("Project scope updated");
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
  document.querySelectorAll("[data-open-ai]").forEach(function(b){b.addEventListener("click",openAi)});
  bindProjectCards();
}
function setupEvents(){
  document.getElementById("skipIntro").addEventListener("click",finishIntro);
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
  document.getElementById("resetDemo").addEventListener("click",function(){if(confirm("Reset all prototype edits saved in this browser?")){state={role:state.role,userId:state.userId,projects:clone(INITIAL_PROJECTS)};saveState();currentProjectId=null;currentView="dashboard";render();toast("Prototype data reset")}}); 
  document.querySelectorAll("[data-close-modal]").forEach(function(b){b.addEventListener("click",closeScope)});
  document.getElementById("saveScope").addEventListener("click",saveScope);
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeAi();closeScope()}});
}

setupEvents();
refreshIcons();
startIntro();
})();