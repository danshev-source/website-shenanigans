// cite footprint
const footprint = {
  cookieChoice: null,
  cookieTimeMs: null,
  quizAnswers: [],
  username: null,
  siteStartTime: Date.now()
};

const bannerAppeared = Date.now();

// Passive data 
function populatePassive() {
  const ua = navigator.userAgent;

  // Browser
  let browser = 'Unknown';
  if (ua.includes('Firefox'))       browser = 'Firefox';
  else if (ua.includes('Edg'))       browser = 'Edge';
  else if (ua.includes('Chrome'))    browser = 'Chrome';
  else if (ua.includes('Safari'))    browser = 'Safari';

  // OS
  let os = 'Unknown';
  if (ua.includes('Windows'))        os = 'Windows';
  else if (ua.includes('Mac'))        os = 'macOS';
  else if (ua.includes('Linux'))      os = 'Linux';
  else if (ua.includes('Android'))    os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  document.getElementById('rv-browser').textContent   = browser;
  document.getElementById('rv-os').textContent        = os;
  document.getElementById('rv-screen').textContent    = `${screen.width} × ${screen.height}`;
  document.getElementById('rv-tz').textContent        = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('rv-lang').textContent      = navigator.language;

  // Location via free IP API
  fetch('https://ip-api.com/json/?fields=city,regionName,country')
    .then(r => r.json())
    .then(d => {
      document.getElementById('rv-location').textContent = `${d.city}, ${d.regionName}, ${d.country}`;
      document.getElementById('rv-location').classList.add('flagged');
    })
    .catch(() => {
      document.getElementById('rv-location').textContent = 'Blocked or unvailable';
    });
}

// Update time on site every second
setInterval(() => {
  const secs = Math.floor((Date.now() - footprint.siteStartTime) / 1000);
  const mins = Math.floor(secs / 60);
  const s    = secs % 60;
  const el   = document.getElementById('rv-time');
  if (el) el.textContent = mins > 0 ? `${mins}m ${s}s` : `${s}s`;
}, 1000);

// Cookie
function handleCookie(choice) {
  const elapsed = Date.now() - bannerAppeared;
  footprint.cookieChoice  = choice;
  footprint.cookieTimeMs  = elapsed;
  document.getElementById('cookieBanner').style.display = 'none';

  const el      = document.getElementById('rv-cookie');
  const seconds = (elapsed / 1000).toFixed(1);

  if (choice === 'accepted') {
    el.textContent = `Accepted in ${seconds}s — document is ~97 pages combined`;
    el.classList.add('flagged');
  } else {
    el.textContent = `Declined in ${seconds}s`;
    el.classList.remove('flagged');
  }
}

// quest
const TOTAL_STEPS = 5;

function nextStep(current) {
  // Collect checked values for this step
  const checked = [...document.querySelectorAll(`#step${current} input:checked`)]
    .map(el => el.value);
  footprint.quizAnswers.push(...checked);

  document.getElementById(`step${current}`).classList.add('hidden');
  document.getElementById(`step${current + 1}`).classList.remove('hidden');

  const pct = (current / TOTAL_STEPS) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
}

function finishQuiz() {
  const username = document.getElementById('usernameInput').value.trim();
  footprint.username = username || 'anonymous';

  document.getElementById('progressFill').style.width = '100%';
  document.getElementById(`step5`).classList.add('hidden');

  populateQuizReveal();

  // Scroll to reveal
  setTimeout(() => {
    document.getElementById('reveal').scrollIntoView({ behavior: 'smooth' });
  }, 300);
}

//  QUIZ show
function populateQuizReveal() {
  const container = document.getElementById('quizReveal');
  container.innerHTML = '';

  // Username row
  if (footprint.username && footprint.username !== 'anonymous') {
    addRevealRow(container, 'Username', footprint.username,
      `Cross-platform matching possible — "${footprint.username}" may link accounts across Reddit, Discord, Steam, and more.`, true);
  }

  // Quiz answers
  if (footprint.quizAnswers.length === 0) {
    addRevealRow(container, 'Habits', 'No selections made', '');
    return;
  }

  footprint.quizAnswers.forEach(answer => {
    const note = getNote(answer);
    addRevealRow(container, 'Habit', answer, note, note !== '');
  });
}

function addRevealRow(container, label, value, note, flagged) {
  const row = document.createElement('div');
  row.className = 'reveal-row';
  row.style.flexDirection = 'column';
  row.style.alignItems = 'flex-start';
  row.innerHTML = `
    <span class="reveal-label">${label}</span>
    <span class="reveal-value${flagged ? ' flagged' : ''}">${value}</span>
    ${note ? `<span class="mono text-dim" style="font-size:0.72rem; margin-top:0.2rem;">${note}</span>` : ''}
  `;
  container.appendChild(row);
}

function getNote(answer) {
  const notes = {
    'Google':                   'Search history, location, browsing, email if Gmail.',
    'Facebook / Instagram':     'Social graph, interests, family, political leanings, facial recognition.',
    'TikTok':                   'Watch time per video used to model psychology. Flagged by multiple governments.',
    'Amazon':                   'Purchase history, household makeup, home address, voice data if Echo.',
    'YouTube':                  'Watch history used to profile ideology and mental health risk.',
    'fitness tracker':          'Heart rate, sleep, location, activity — sold to insurers and health companies.',
    'smart speaker':            'Ambient audio. Amazon and Google retain recordings.',
    'loyalty / rewards cards':  'Supermarkets sell purchase history to pharma, insurers, and data brokers.',
    'saved card / tap':         'Purchase metadata builds a detailed lifestyle profile.',
    'PayPal / Apple Pay':       'Transaction history tied to your real identity.',
    'cash when possible':       'Minimal financial data trail. Unusual in 2025.',
    'never reads privacy policies': 'You have consented to things you don\'t know about.',
    'sometimes skims privacy policies': 'Skimming misses binding clauses buried in section 14.',
    'reads privacy policies':   'Rare. Most are written to discourage reading.',
    'none of these':            ''
  };
  return notes[answer] || '';
}

// ── INIT
populatePassive();
