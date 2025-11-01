document.addEventListener('DOMContentLoaded',function(){
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  navToggle && navToggle.addEventListener('click',()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if(primaryNav){
      // toggle using a small classless inline style for mobile
      if(!expanded){
        primaryNav.style.display = 'flex';
        primaryNav.style.flexDirection = 'column';
        primaryNav.style.gap = '10px';
      } else {
        primaryNav.style.display = '';
      }
    }
  });

  // theme toggle (persists in localStorage)
  const themeToggle = document.querySelector('.theme-toggle');
  const applyTheme = (t)=>{
    if(t==='light') document.documentElement.setAttribute('data-theme','light');
    else document.documentElement.removeAttribute('data-theme');
    // update toggle icon and aria-pressed: show sun when light active, moon when dark active
    if(themeToggle){
      const isLightNow = document.documentElement.getAttribute('data-theme') === 'light';
      themeToggle.textContent = isLightNow ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-pressed', String(isLightNow));
      themeToggle.setAttribute('aria-label', isLightNow ? 'Switch to dark theme' : 'Switch to light theme');
    }
  };
  const saved = localStorage.getItem('theme');
  if(saved) {
    applyTheme(saved);
  } else {
    // respect the user's system preference on first load
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
    // Listen for system changes only if user did not pick a preference
    if(window.matchMedia){
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      mq.addEventListener && mq.addEventListener('change', (e)=>{
        // only change when no saved preference
        if(!localStorage.getItem('theme')) applyTheme(e.matches ? 'light' : 'dark');
      });
    }
  }
  themeToggle && themeToggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
    // small spin animation to visually indicate toggle
    try{
      if(themeToggle){
        themeToggle.classList.remove('spin');
        // force reflow to restart animation
        // eslint-disable-next-line no-unused-expressions
        themeToggle.offsetWidth;
        themeToggle.classList.add('spin');
        themeToggle.addEventListener('animationend', ()=>{ themeToggle.classList.remove('spin'); }, {once:true});
      }
    }catch(e){ /* ignore animation errors */ }
  });

  // Smooth anchor scroll (native fallback)
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const href = a.getAttribute('href');
      if(href.length>1){
        const el = document.querySelector(href);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth',block:'start'});
          // close mobile nav
          if(window.innerWidth<720 && primaryNav){ primaryNav.style.display='none'; navToggle.setAttribute('aria-expanded','false'); }
        }
      }
    });
  });

  // Lightbox for projects
  const projects = document.querySelectorAll('.project');
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox && lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox && lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox && lightbox.querySelector('.lightbox-close');

  projects.forEach(p=>{
    p.addEventListener('click',()=>{
      const src = p.dataset.full || p.querySelector('img')?.src;
      const title = p.dataset.title || p.querySelector('img')?.alt || '';
      if(lightbox && lbImg){
        lbImg.src = src;
        lbImg.alt = title;
        lbCaption.textContent = title;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden','false');
      }
    });
  });

  const closeLightbox = ()=>{
    if(lightbox){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden','true');
      if(lbImg) lbImg.src='';
    }
  }
  lbClose && lbClose.addEventListener('click',closeLightbox);
  lightbox && lightbox.addEventListener('click',(e)=>{ if(e.target===lightbox) closeLightbox(); });
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') closeLightbox(); });

  // Simple scroll reveal using IntersectionObserver
  // Ensure common targets have the .reveal class so they start hidden and animate in
  ['.card', '.hero-text', '.service', '.testimonials blockquote', '.visual-card'].forEach(sel=>{
    document.querySelectorAll(sel).forEach(el=>{ if(!el.classList.contains('reveal')) el.classList.add('reveal'); });
  });
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const order = Number(entry.target.dataset.order) || 0;
          const stagger = 120; // ms per item (kept in sync with CSS var --reveal-stagger)
          // use animationDelay so the CSS animation can be staggered precisely
          entry.target.style.animationDelay = `${order * stagger}ms`;
          // alternate a slight horizontal offset so items visibly move from left/right
          const dir = (order % 2 === 0) ? -12 : 12; // px
          entry.target.style.setProperty('--reveal-x', `${dir}px`);
          entry.target.style.setProperty('--reveal-y', `28px`);
          entry.target.style.setProperty('--reveal-time', `900ms`);
          entry.target.classList.add('is-visible');
          // After the entrance animation finishes, add a continuous bounce unless user prefers reduced motion
          if(!supportsReducedMotion){
            entry.target.addEventListener('animationend', function onEnd(e){
              // ensure it's the reveal animation ending (not some other animation)
              if(e.animationName && e.animationName.indexOf('fadeUp') !== -1){
                entry.target.classList.add('bouncy');
              } else {
                // if animationName is empty or different, still add bouncy as a fallback
                entry.target.classList.add('bouncy');
              }
            }, {once:true});
          }
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12});
    revealEls.forEach((el,i)=>{ el.dataset.order = i; io.observe(el); });
  } else {
    // fallback: just reveal with staggered animationDelay
    const fallbackStagger = 120;
    revealEls.forEach((el,i)=>{
      el.style.animationDelay = `${i * fallbackStagger}ms`;
      el.classList.add('is-visible');
      if(!supportsReducedMotion){
        el.addEventListener('animationend', function onEnd(e){
          el.classList.add('bouncy');
        }, {once:true});
      }
    });
  }

  // --- Button ripple micro-interaction ---
  const supportsReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!supportsReducedMotion){
    document.querySelectorAll('.btn').forEach(btn=>{
      // ensure positioned container for absolute ripple
      if(getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.addEventListener('click', (e)=>{
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.6;
        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top - size/2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
  ripple.style.opacity = '0.9';
        ripple.style.pointerEvents = 'none';
        ripple.style.transition = 'transform .6s ease, opacity .6s ease';
        btn.appendChild(ripple);
        requestAnimationFrame(()=>{ ripple.style.transform = 'scale(1)'; ripple.style.opacity = '0'; });
        ripple.addEventListener('transitionend', ()=>{ ripple.remove(); }, {once:true});
      });
    });
  }

  // --- Hero parallax (lightweight) ---
  (function(){
    const hero = document.querySelector('.hero');
    const bgImg = hero && hero.querySelector('.bg-img');
    if(!hero || !bgImg) return;
    if(supportsReducedMotion) return;
    let ticking = false;
    const maxOffset = 40; // px
    function update(){
      ticking = false;
      const rect = hero.getBoundingClientRect();
      // translate proportionally to hero's distance from viewport top
      const translate = Math.round((rect.top) * -0.06);
      const t = Math.max(-maxOffset, Math.min(maxOffset, translate));
      bgImg.style.transform = `translate3d(0, ${t}px, 0)`;
    }
    window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(update); ticking=true; } }, {passive:true});
    window.addEventListener('resize', ()=>{ requestAnimationFrame(update); }, {passive:true});
    update();
  })();

  // --- Lightbox improvements: focus trap & animated open/close ---
  (function(){
    if(!lightbox) return;
    const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusable = ()=>Array.from(lightbox.querySelectorAll(focusableSelector)).filter(el=>!el.hasAttribute('disabled'));
    const trap = (e)=>{
      if(e.key !== 'Tab') return;
      const focusable = getFocusable();
      if(focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0]; const last = focusable[focusable.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    const openHandler = ()=>{ const focusable = getFocusable(); (focusable[0] || lbClose).focus(); document.addEventListener('keydown', trap); };
    const closeHandler = ()=>{ document.removeEventListener('keydown', trap); };
    const obs = new MutationObserver(mutations=>{
      mutations.forEach(m=>{
        if(m.attributeName === 'class'){
          const open = lightbox.classList.contains('open');
          if(open) openHandler(); else closeHandler();
        }
      });
    });
    obs.observe(lightbox, {attributes:true});
  })();

  // Banner parallax removed (static banner preferred)
  // If you want parallax later re-enable a lightweight translate on scroll here.

  // Preloader: fade out once content is ready
  const preloader = document.getElementById('preloader');
  if(preloader){
    // give a minimal delay so users see the shimmer for very fast loads
    setTimeout(()=>{
      preloader.style.transition = 'opacity 420ms ease, visibility 420ms';
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      // remove from flow after transition to avoid accidental focus capture
      setTimeout(()=>{ preloader.remove(); }, 520);
    }, 250);
  }

  // Navbar background: toggle .scrolled when user scrolls down
  const header = document.querySelector('.site-header');
  const setHeaderScrolled = ()=>{
    if(!header) return;
    if(window.scrollY > 24) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  };
  setHeaderScrolled();
  window.addEventListener('scroll', setHeaderScrolled, {passive:true});

  // Card tilt effect (subtle) on mousemove
  const tiltCards = document.querySelectorAll('.card');
  tiltCards.forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y * 4).toFixed(2);
      const ry = (x * -4).toFixed(2);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      card.style.willChange = 'transform';
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform = ''; card.style.willChange = 'auto'; });
  });
});
