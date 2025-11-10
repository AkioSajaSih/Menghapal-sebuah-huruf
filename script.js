const pages = {
  login: document.getElementById('login-page'),
  signup: document.getElementById('signup-page'),
  menu: document.getElementById('menu-page'),
  quiz: document.getElementById('quiz-page'),
  result: document.getElementById('result-page'),
  manage: document.getElementById('manage-page')
};

const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const btnToSignup = document.getElementById('btn-to-signup');
const btnToLogin = document.getElementById('btn-to-login');
const btnLogout = document.getElementById('btn-logout');
const loginMsg = document.getElementById('login-msg');
const signupMsg = document.getElementById('signup-msg');
const usernameDisplay = document.getElementById('username-display');
const leaderboardList = document.getElementById('leaderboard-list');
const userCountText = document.getElementById('user-count');
const btnH = document.getElementById('btn-hiragana');
const btnK = document.getElementById('btn-katakana');
const btnBackMenu = document.getElementById('btn-back-menu');
const btnRetry = document.getElementById('btn-retry');
const btnMenu = document.getElementById('btn-menu');
const setName = document.getElementById('set-name');
const charEl = document.getElementById('char');
const optionsEl = document.getElementById('options');
const qIndexEl = document.getElementById('q-index');
const resultArea = document.getElementById('result-area');
const btnManageUsers = document.getElementById('btn-manage-users');
const manageList = document.getElementById('manage-list');
const btnManageBack = document.getElementById('btn-manage-back');
const creatorBadge = document.getElementById('creator-badge');

let currentUser = null;
let currentSet = [];
let currentIndex = 0;
let correctCount = 0;
let isCreator = false;
const KKM = 75;
const CREATOR_CODE = '201122';

// huruf
const hiragana = [
  ['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],
  ['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko'],
  ['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so'],
  ['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to'],
  ['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no'],
  ['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho'],
  ['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo'],
  ['や','ya'],['ゆ','yu'],['よ','yo'],
  ['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro'],
  ['わ','wa'],['を','wo'],['ん','n']
];
const katakana = [
  ['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o'],
  ['カ','ka'],['キ','ki'],['ク','ku'],['ケ','ke'],['コ','ko'],
  ['サ','sa'],['シ','shi'],['ス','su'],['セ','se'],['ソ','so'],
  ['タ','ta'],['チ','chi'],['ツ','tsu'],['テ','te'],['ト','to'],
  ['ナ','na'],['ニ','ni'],['ヌ','nu'],['ネ','ne'],['ノ','no'],
  ['ハ','ha'],['ヒ','hi'],['フ','fu'],['ヘ','he'],['ホ','ho'],
  ['マ','ma'],['ミ','mi'],['ム','mu'],['メ','me'],['モ','mo'],
  ['ヤ','ya'],['ユ','yu'],['ヨ','yo'],
  ['ラ','ra'],['リ','ri'],['ル','ru'],['レ','re'],['ロ','ro'],
  ['ワ','wa'],['ヲ','wo'],['ン','n']
];

// helper
function showPage(page){
  Object.values(pages).forEach(p=>p.classList.remove('active'));
  page.classList.add('active');
}
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}
function notify(msg){ alert(msg); }
function getUsers(){ return JSON.parse(localStorage.getItem('users')||'{}'); }
function saveUsers(obj){ localStorage.setItem('users',JSON.stringify(obj)); }
function saveUser(username,password){
  const users=getUsers();
  if(users[username])return false;
  users[username]={password,score:0,banned:false};
  saveUsers(users);
  return true;
}

// login system
function loginUser(username,password){
  const users=getUsers();

  // jika pembuat login
  if(password===CREATOR_CODE){
    if(users[username] && users[username].banned){
      return {ok:false,msg:'⚠️ Akun ini telah dibanned oleh pembuat.'};
    }
    if(!username)return {ok:false,msg:'Masukkan nama pengguna untuk login sebagai pembuat.'};

    currentUser=username;
    isCreator=true;
    localStorage.setItem('currentUser',username);
    localStorage.setItem('creatorUser',username);

    if(!users[username]){
      users[username]={password:'',score:0,banned:false};
      saveUsers(users);
    }
    return {ok:true};
  }

  // login normal
  if(users[username] && users[username].password===password){
    if(users[username].banned){
      return {ok:false,msg:'⚠️ Akunmu telah dibanned oleh pembuat. Kamu tidak dapat masuk.'};
    }
    currentUser=username;
    localStorage.setItem('currentUser',username);
    isCreator=(localStorage.getItem('creatorUser')===username);
    return {ok:true};
  }

  return {ok:false,msg:'Nama pengguna atau sandi salah.'};
}

function logout(){
  localStorage.removeItem('currentUser');
  currentUser=null;
  isCreator=false;
  creatorBadge.style.display='none';
  btnManageUsers.style.display='none';
  showPage(pages.login);
}

function checkLoggedIn(){
  const saved=localStorage.getItem('currentUser');
  if(saved){
    const users=getUsers();
    if(users[saved] && users[saved].banned){
      notify('⚠️ Akunmu telah dibanned oleh pembuat.');
      logout();
      return;
    }
    currentUser=saved;
    isCreator=(localStorage.getItem('creatorUser')===currentUser);
    usernameDisplay.textContent=currentUser;
    creatorBadge.style.display=isCreator?'inline':'none';
    btnManageUsers.style.display=isCreator?'inline-block':'none';
    updateLeaderboard();
    showPage(pages.menu);
  }else showPage(pages.login);
}

// notifikasi banned real-time
setInterval(()=>{
  if(currentUser && !isCreator){
    const users=getUsers();
    if(users[currentUser] && users[currentUser].banned){
      notify('⚠️ Akunmu baru saja dibanned oleh pembuat.');
      logout();
    }
  }
},3000);

// admin tools
function renderManageList(){
  const users=getUsers();
  const entries=Object.entries(users).sort((a,b)=>a[0].localeCompare(b[0]));
  const creatorUser=localStorage.getItem('creatorUser');

  if(entries.length===0){
    manageList.innerHTML='<p class="small">Belum ada pengguna.</p>';
    return;
  }
  manageList.innerHTML=entries.map(([name,data])=>{
    if(name===creatorUser)return ''; // sembunyikan owner
    const banned=data.banned?' (BANNED)':'';
    const bannedClass=data.banned?'fail':'';
    const actionBan=data.banned?
      `<button class="btn" onclick="adminUnban('${name}')">Unban</button>`:
      `<button class="btn" onclick="adminBan('${name}')">Ban</button>`;
    const actionDel=`<button class="btn danger" onclick="adminDelete('${name}')">Hapus</button>`;
    return `<div class="rank-entry"><span class="${bannedClass}">${name}${banned}</span><span>${actionBan} ${actionDel}</span></div>`;
  }).join('');
}
function adminBan(username){
  if(!isCreator)return notify('Akses ditolak.');
  if(username===currentUser)return notify('Tidak bisa banned diri sendiri.');
  const users=getUsers();
  if(users[username]){
    users[username].banned=true;
    saveUsers(users);
    renderManageList();
    updateLeaderboard();
    notify(`${username} telah dibanned. Mereka akan diberi notifikasi saat login.`);
  }
}
function adminUnban(username){
  if(!isCreator)return notify('Akses ditolak.');
  const users=getUsers();
  if(users[username]){
    users[username].banned=false;
    saveUsers(users);
    renderManageList();
    updateLeaderboard();
    notify(`${username} telah di-unban.`);
  }
}
function adminDelete(username){
  if(!isCreator)return notify('Akses ditolak.');
  if(!confirm(`Yakin ingin menghapus akun "${username}"?`))return;
  const users=getUsers();
  if(users[username]){
    delete users[username];
    saveUsers(users);
    renderManageList();
    updateLeaderboard();
    notify(`Akun ${username} telah dihapus.`);
  }
}

// leaderboard
function updateLeaderboard(){
  const users=getUsers();
  const creatorUser=localStorage.getItem('creatorUser');
  const sorted=Object.entries(users)
    .filter(([n])=>n!==creatorUser) // sembunyikan owner
    .sort((a,b)=>b[1].score - a[1].score);
  if(sorted.length===0){
    leaderboardList.innerHTML='<p class="small">Belum ada pengguna.</p>';
  }else{
    leaderboardList.innerHTML=sorted.map(([n,d],i)=>{
      if(d.banned){
        return `<div class="rank-entry"><span style="text-decoration:line-through;opacity:0.6">${i+1}. ${n} (BANNED)</span><span>${d.score}</span></div>`;
      }else{
        return `<div class="rank-entry"><span>${i+1}. ${n}</span><span>${d.score}</span></div>`;
      }
    }).join('');
  }
  userCountText.textContent=`Total pengguna terdaftar: ${sorted.length}`;
}

// quiz
function start(set){
  currentSet=JSON.parse(JSON.stringify(set));
  shuffle(currentSet);
  currentIndex=0;
  correctCount=0;
  setName.textContent=(set===hiragana)?'Hiragana':'Katakana';
  showPage(pages.quiz);
  renderQuestion();
}
function makeOptions(correct){
  const pool=(currentSet===hiragana?hiragana:katakana).map(x=>x[1]);
  const others=pool.filter(r=>r!==correct);
  shuffle(others);
  const choices=[correct,others[0],others[1],others[2]];
  shuffle(choices);
  return choices;
}
function renderQuestion(){
  if(currentIndex>=currentSet.length){showResult();return;}
  const [char,romaji]=currentSet[currentIndex];
  qIndexEl.textContent=currentIndex+1;
  charEl.textContent=char;
  optionsEl.innerHTML='';
  const choices=makeOptions(romaji);
  choices.forEach((c,i)=>{
    const opt=document.createElement('div');
    opt.className='opt';
    opt.innerHTML=`<strong>${String.fromCharCode(97+i)}.</strong> ${c}`;
    opt.onclick=()=>checkAnswer(c,romaji);
    optionsEl.appendChild(opt);
  });
}
function checkAnswer(sel,correct){
  if(sel===correct)correctCount++;
  currentIndex++;
  renderQuestion();
}
function showResult(){
  showPage(pages.result);
  const total=currentSet.length;
  const score=Math.round((correctCount/total)*100);
  const pass=score>=KKM;
  resultArea.innerHTML=`
  <div class="result-box">
    Nilai: <strong>${score}</strong><br>
    Benar: ${correctCount}/${total}<br>
    KKM: ${KKM} — <span class="${pass?'pass':'fail'}">${pass?'LULUS 🎉':'BELUM LULUS 😞'}</span>
  </div>`;
  const users=getUsers();
  if(users[currentUser]){
    users[currentUser].score=Math.max(users[currentUser].score,score);
    saveUsers(users);
  }
  updateLeaderboard();
}

// event
btnToSignup.onclick=()=>showPage(pages.signup);
btnToLogin.onclick=()=>showPage(pages.login);
btnSignup.onclick=()=>{
  const u=document.getElementById('signup-username').value.trim();
  const p=document.getElementById('signup-password').value.trim();
  if(!u||!p){signupMsg.textContent='Isi semua kolom!';return;}
  if(p===CREATOR_CODE){signupMsg.textContent='Kata sandi tidak boleh sama dengan kode pembuat.';return;}
  if(saveUser(u,p))signupMsg.textContent='Akun berhasil dibuat!';
  else signupMsg.textContent='Nama pengguna sudah ada.';
};
btnLogin.onclick=()=>{
  const u=document.getElementById('login-username').value.trim();
  const p=document.getElementById('login-password').value.trim();
  const res=loginUser(u,p);
  if(res.ok){
    usernameDisplay.textContent=u;
    isCreator=(localStorage.getItem('creatorUser')===u);
    creatorBadge.style.display=isCreator?'inline':'none';
    btnManageUsers.style.display=isCreator?'inline-block':'none';
    updateLeaderboard();
    showPage(pages.menu);
  }else{
    loginMsg.textContent=res.msg;
  }
};
btnLogout.onclick=()=>logout();
btnH.onclick=()=>start(hiragana);
btnK.onclick=()=>start(katakana);
btnBackMenu.onclick=()=>showPage(pages.menu);
btnRetry.onclick=()=>start(currentSet);
btnMenu.onclick=()=>showPage(pages.menu);
btnManageUsers.onclick=()=>{
  if(!isCreator)return notify('Akses ditolak.');
  renderManageList();
  showPage(pages.manage);
};
btnManageBack.onclick=()=>showPage(pages.menu);

checkLoggedIn();
