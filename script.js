const pages = {
  login: document.getElementById('login-page'),
  signup: document.getElementById('signup-page'),
  menu: document.getElementById('menu-page'),
  quiz: document.getElementById('quiz-page'),
  result: document.getElementById('result-page')
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

let currentUser = null;
let currentSet = [];
let currentIndex = 0;
let correctCount = 0;
const KKM = 75;

// Data huruf (Hiragana dan Katakana)
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

// --- Helper ---
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

// --- User System ---
function getUsers(){
  return JSON.parse(localStorage.getItem('users')||'{}');
}
function saveUsers(obj){
  localStorage.setItem('users',JSON.stringify(obj));
}
function saveUser(username, password){
  const users=getUsers();
  if(users[username]) return false;
  users[username]={password,score:0};
  saveUsers(users);
  return true;
}
function loginUser(username,password){
  const users=getUsers();
  if(users[username] && users[username].password===password){
    currentUser=username;
    localStorage.setItem('currentUser',username);
    return true;
  }
  return false;
}
function logout(){
  localStorage.removeItem('currentUser');
  currentUser=null;
  showPage(pages.login);
}
function checkLoggedIn(){
  const saved=localStorage.getItem('currentUser');
  if(saved){
    currentUser=saved;
    usernameDisplay.textContent=currentUser;
    updateLeaderboard();
    showPage(pages.menu);
  } else showPage(pages.login);
}

// --- Leaderboard ---
function updateLeaderboard(){
  const users=getUsers();
  const sorted=Object.entries(users)
    .sort((a,b)=>b[1].score - a[1].score);
  leaderboardList.innerHTML=sorted.map(([name,data],i)=>
    `<div class="rank-entry"><span>${i+1}. ${name}</span><span>${data.score}</span></div>`
  ).join('');
  userCountText.textContent=`Total pengguna terdaftar: ${sorted.length}`;
}

// --- Quiz Logic ---
function start(set){
  currentSet=JSON.parse(JSON.stringify(set));
  shuffle(currentSet);
  currentIndex=0;correctCount=0;
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
  // Update leaderboard
  const users=getUsers();
  if(users[currentUser]){
    users[currentUser].score=Math.max(users[currentUser].score,score);
    saveUsers(users);
  }
  updateLeaderboard();
}

// --- Event Listeners ---
btnToSignup.onclick=()=>showPage(pages.signup);
btnToLogin.onclick=()=>showPage(pages.login);
btnSignup.onclick=()=>{
  const u=document.getElementById('signup-username').value.trim();
  const p=document.getElementById('signup-password').value.trim();
  if(!u||!p){signupMsg.textContent='Isi semua kolom!';return;}
  if(saveUser(u,p)){signupMsg.textContent='Akun berhasil dibuat!';}
  else signupMsg.textContent='Nama pengguna sudah ada.';
};
btnLogin.onclick=()=>{
  const u=document.getElementById('login-username').value.trim();
  const p=document.getElementById('login-password').value.trim();
  if(loginUser(u,p)){
    usernameDisplay.textContent=u;
    updateLeaderboard();
    showPage(pages.menu);
  } else loginMsg.textContent='Nama pengguna atau sandi salah.';
};
btnLogout.onclick=()=>logout();
btnH.onclick=()=>start(hiragana);
btnK.onclick=()=>start(katakana);
btnBackMenu.onclick=()=>showPage(pages.menu);
btnRetry.onclick=()=>start(currentSet);
btnMenu.onclick=()=>showPage(pages.menu);

checkLoggedIn();
