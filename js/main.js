(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---- toast ---- */
  let tT;
  const toast = html => {
    const t = $('#toast'); t.innerHTML = html; t.classList.add('show');
    clearTimeout(tT); tT = setTimeout(() => t.classList.remove('show'), 2300);
  };

  /* ---- copy helper ---- */
  const copyText = t => (navigator.clipboard?.writeText
    ? navigator.clipboard.writeText(t)
    : new Promise(r => { const a = document.createElement('textarea'); a.value = t;
        document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); r(); }));

  /* ---- scramble decode ---- */
  const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';
  const scramble = el => {
    const final = el.dataset.text;
    if (RM) { el.textContent = final; return; }
    let shown = 0;
    const iv = setInterval(() => {
      shown += 0.6;
      el.textContent = final.split('').map((ch, i) =>
        ch === ' ' ? ' ' : (i < shown ? ch : GLYPHS[Math.random() * GLYPHS.length | 0])).join('');
      if (shown >= final.length) { el.textContent = final; clearInterval(iv); }
    }, 34);
  };
  scramble($('#name'));
  setTimeout(() => scramble($('#handle')), 400);

  /* ---- Makassar (WITA) clock ---- */
  const clock = $('#clock');
  const tick = () => clock.textContent =
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour12: false });
  tick(); setInterval(tick, 1000);

  /* ---- reveal on scroll ---- */
  const reveals = $$('.reveal');
  reveals.forEach((el, i) => el.style.transitionDelay = (i % 8) * 45 + 'ms');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .1 });
  reveals.forEach(el => io.observe(el));

  /* ---- count-up stats ---- */
  const nums = $$('.num');
  const runNum = el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (RM) { el.textContent = end.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1300;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const nio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { runNum(e.target); nio.unobserve(e.target); }
  }), { threshold: .5 });
  nums.forEach(n => nio.observe(n));

  /* ---- accent switcher ---- */
  $$('.sw').forEach(sw => sw.addEventListener('click', () => {
    document.documentElement.style.setProperty('--acc', sw.dataset.c);
    $$('.sw').forEach(x => x.classList.toggle('on', x === sw));
    toast('Accent tuned <b>·</b> signal updated');
  }));

  /* ---- copy email ---- */
  $('#copyMail').addEventListener('click', async () => {
    await copyText('devwardiman@perakit.com');
    const tag = $('#mailTag'); tag.textContent = 'COPIED ✓';
    toast('Email copied <b>·</b> devwardiman@perakit.com');
    setTimeout(() => tag.textContent = 'COPY', 2200);
  });

  /* ---- share page ---- */
  $('#shareBtn').addEventListener('click', async () => {
    await copyText(location.href);
    toast('Link copied <b>·</b> share portfolio');
  });

  /* ---- newsletter ---- */
  $('#nlForm').addEventListener('submit', e => {
    e.preventDefault();
    const b = $('#nlBtn'); b.textContent = "SENT ✓"; b.style.pointerEvents = 'none';
    $('#nlMail').disabled = true;
    toast('Message sent <b>·</b> Wardiman will respond soon');
  });

  /* ---- cursor spotlight ---- */
  if (!RM && matchMedia('(pointer:fine)').matches) {
    const spot = $('#spot'); let tx = innerWidth/2, ty = 200, x = tx, y = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop(){ x += (tx-x)*.08; y += (ty-y)*.08;
      spot.style.transform = `translate3d(${x-310}px,${y-310}px,0)`;
      requestAnimationFrame(loop); })();
  }

  /* ---- featured card tilt ---- */
  if (!RM && matchMedia('(hover:hover)').matches) {
    $$('.feat').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const rx = -((e.clientY - r.top) / r.height - .5) * 6;
        const ry = ((e.clientX - r.left) / r.width - .5) * 6;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform = '');
    });
  }
})();

