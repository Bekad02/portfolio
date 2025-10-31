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
  const revealEls = Array.from(document.querySelectorAll('.reveal, .card'));
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const order = entry.target.dataset.order || 0;
          entry.target.style.transitionDelay = `${order * 70}ms`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12});
    revealEls.forEach((el,i)=>{ el.dataset.order = i; io.observe(el); });
  } else {
    // fallback: just reveal
    revealEls.forEach((el,i)=>{ el.style.transitionDelay = `${i*70}ms`; el.classList.add('is-visible'); });
  }

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
