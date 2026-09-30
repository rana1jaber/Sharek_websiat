// Shared by the page search near the end of this file: sections whose
// content is JS-driven (only one item's text sits in the DOM at a time —
// e.g. Who We Are tabs, History Timeline dates) push extra searchable
// entries in here as they set themselves up, since the search index is
// built once, after everything else has run.
  const dynamicSearchEntries = [];

// Hero: scrolling down even slightly smoothly snaps straight to the next
// section, instead of scrolling gradually through the full-height hero.
  const heroSection = document.querySelector('.hero');
  if(heroSection && heroSection.nextElementSibling){
    const afterHero = heroSection.nextElementSibling;
    let heroSnapping = false;
    let heroTriggered = false;
    let heroSettleTimer = null;
    window.addEventListener('scroll', ()=>{
      if(heroSnapping) return;
      const y = window.scrollY;
      if(y <= 4){
        heroTriggered = false;
        return;
      }
      if(!heroTriggered && y > 24 && y < heroSection.offsetHeight){
        // Wait a beat and re-check: if the user is mid-flight through a
        // much larger scroll (a fast fling, scrollbar drag, or our own
        // full-page-scroll-to-Resources feature passing through here),
        // scrollY will have moved on by the time this fires, and we
        // correctly skip the snap. Only a scroll that actually settles
        // in this zone triggers it.
        clearTimeout(heroSettleTimer);
        heroSettleTimer = setTimeout(()=>{
          const ySettled = window.scrollY;
          if(!heroTriggered && ySettled > 24 && ySettled < heroSection.offsetHeight){
            heroTriggered = true;
            heroSnapping = true;
            afterHero.scrollIntoView({ behavior:'smooth', block:'start' });
            setTimeout(()=>{ heroSnapping = false; }, 900);
          }
        }, 80);
      }
    }, { passive:true });
  }

// Nav bar: hide on scroll down, show on scroll up (even slightly)
  const topbar = document.querySelector('.topbar');
  if(topbar){
    let lastScrollY = window.scrollY;
    let navTicking = false;
    const HIDE_THRESHOLD = 80; // don't hide until scrolled past this point
    window.addEventListener('scroll', ()=>{
      if(navTicking) return;
      navTicking = true;
      requestAnimationFrame(()=>{
        const current = window.scrollY;
        if(current > lastScrollY && current > HIDE_THRESHOLD){
          topbar.classList.add('nav-hidden');
        } else if(current < lastScrollY){
          topbar.classList.remove('nav-hidden');
        }
        lastScrollY = current <= 0 ? 0 : current;
        navTicking = false;
      });
    }, { passive:true });
  }

// Dynamic greeting based on time of day
  const greetEl = document.getElementById('greetText');
  if(greetEl){
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if(hour < 12) greeting = 'Good morning';
    else if(hour < 18) greeting = 'Good afternoon';
    greetEl.textContent = greeting + ', User';
  }

  // Pause/play toggle for the hero background "video"
  const pauseToggle = document.getElementById('pauseToggle');
  const heroBg = document.getElementById('heroBg');
  const pauseIcon = document.getElementById('pauseIcon');
  const pauseLabel = document.getElementById('pauseLabel');
  if(pauseToggle && heroBg){
    pauseToggle.addEventListener('click', ()=>{
      const isPaused = heroBg.classList.toggle('is-paused');
      pauseIcon.textContent = isPaused ? '▶' : '⏸';
      pauseLabel.textContent = isPaused ? 'Play' : 'Pause';
      pauseToggle.setAttribute('aria-pressed', isPaused);
    });
  }

  // ------------------------------------------------------------------
  // "WHO WE ARE" TABS DATA — this is where you add, remove, or edit a tab
  // ------------------------------------------------------------------
  // Each entry here corresponds — BY POSITION — to one
  // <button class="who-tab" data-index="N"> in the "Who we are" section
  // of index.html. Entry 0 is the button with data-index="0" (Vision),
  // entry 1 is Mission, and so on.
  //
  // Two content shapes are supported:
  //   { title, paragraph }  — a single block of text (used by Vision/Mission)
  //   { title, bullets: [...] } — a bullet list (used by the rest)
  //
  // TO EDIT AN EXISTING TAB: change its title/paragraph/bullets below.
  // No HTML changes needed.
  //
  // TO ADD A NEW TAB:
  //   1. In index.html, find "who-tabs-track" and add a new button at
  //      the end, e.g. <button class="who-tab" type="button"
  //      data-index="8">New Tab Name</button> — give it the next
  //      unused number.
  //   2. Add a matching entry to the END of the array below (so the
  //      array position lines up with the data-index number).
  //
  // TO REMOVE A TAB: delete its <button> from index.html AND its entry
  // here, then renumber every data-index after it (and this array) so
  // the positions still line up with no gaps.
  // ------------------------------------------------------------------
  const WHO_TABS = [
    { title:'Vision', paragraph:'To make Aramco the most secure place to live and work.' },
    { title:'Mission', paragraph:'Sustain company business by protecting our people and assets, using an integrated approach of qualified staff and comprehensive capability.' },
    { title:'People Focus', bullets:[
      'Hire, develop, and retain a highly skilled and motivated workforce to achieve ISO\u2019s vision.',
      'Foster a culture that empowers individuals, encourages collaboration, drives accountability, and rewards high performance.',
      'Develop visible leaders and front-line supervisors to ensure organizational effectiveness.',
      'Establish a best-in-class organization of security-certified professionals.'
    ]},
    { title:'Pursuit of Excellence', bullets:[
      'Reinforce commitment, control, sustainability of operational excellence, and standardization of best practices to become a best-in-class organization.',
      'Be a proactive and adaptive organization, able to respond to business needs.',
      'Transform the security protection business model from a cost center into a value-generating profit center.',
      'Create value through effective cost and capital management, continuous improvement, efficient resource utilization, and increased income.'
    ]},
    { title:'Innovation and Technology', bullets:[
      'Leverage security technologies and existing know-how to achieve efficiency and optimize resources.',
      'Sustain a technological edge by embracing smart solutions and implementing industry best practices.',
      'Encourage creativity and innovation throughout the ISO organization.'
    ]},
    { title:'Customer Experience', bullets:[
      'Continuously improve services to ensure customer satisfaction.',
      'Ensure business continuity by expanding sustainable services.',
      'Invest in two-way communication with customers.'
    ]},
    { title:'Security Posture and Branding', bullets:[
      'Maintain a strong security presence and constant vigilance.',
      'Develop and sustain a security-conscious culture across the company.',
      'Enhance the perception and value of security by promoting ISO services throughout the organization.',
      'Strengthen collaboration with government agencies through strategic partnerships and joint operational efforts.'
    ]},
    { title:'Quest for Safety', bullets:[
      'Control and prevent incidents that affect employee safety, the environment, and operational reliability.',
      'Enhance safety communication and employee engagement to build and sustain a strong safety mindset.',
      'Deploy recognition programs at both the individual and organizational levels to promote a safe working environment.'
    ]}
  ];

  const whoTabsTrack = document.getElementById('whoTabsTrack');
  const whoTabsViewport = document.getElementById('whoTabsViewport');
  const whoTabPanel = document.getElementById('whoTabPanel');
  const whoTabTitle = document.getElementById('whoTabTitle');
  const whoTabParagraph = document.getElementById('whoTabParagraph');
  const whoTabBullets = document.getElementById('whoTabBullets');
  if(whoTabsTrack && whoTabPanel){
    const whoTabBtns = Array.from(whoTabsTrack.querySelectorAll('.who-tab'));
    const whoTabsPrevBtn = document.getElementById('whoTabsPrev');
    const whoTabsNextBtn = document.getElementById('whoTabsNext');

    // Arrows dim themselves out at either end — same behavior as the
    // History Timeline and Announcements carousel arrows, so every
    // "carousel-arrow" on the site acts consistently.
    function updateWhoTabsArrowState(){
      const idx = whoTabBtns.findIndex(b=> b.classList.contains('is-active'));
      if(whoTabsPrevBtn) whoTabsPrevBtn.classList.toggle('is-disabled', idx <= 0);
      if(whoTabsNextBtn) whoTabsNextBtn.classList.toggle('is-disabled', idx === -1 || idx >= whoTabBtns.length - 1);
    }

    // Selecting a tab — by click or by arrow — always goes through this
    // one function, the same pattern used by the History Timeline, so
    // the active tab, the panel content, and the scroll position can
    // never drift out of sync with each other.
    function selectWhoTab(btn){
      const data = WHO_TABS[Number(btn.dataset.index)];
      whoTabPanel.classList.add('is-fading');
      setTimeout(()=>{
        whoTabBtns.forEach(b=> b.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateWhoTabsArrowState();
        if(data){
          whoTabTitle.textContent = data.title;
          if(data.bullets){
            whoTabParagraph.hidden = true;
            whoTabBullets.hidden = false;
            whoTabBullets.innerHTML = data.bullets.map(line=> `<li>${line}</li>`).join('');
          } else {
            whoTabParagraph.hidden = false;
            whoTabBullets.hidden = true;
            whoTabParagraph.textContent = data.paragraph || '';
          }
        }
        whoTabPanel.classList.remove('is-fading');
        if(whoTabsViewport) scrollWithinHorizontally(whoTabsViewport, btn);
      }, 120);
    }

    // ------------------------------------------------------------------
    // "WHO WE ARE" TABS AUTO-ADVANCE TIMING — change the speed here
    // ------------------------------------------------------------------
    // WHO_TABS_AUTO_ADVANCE_INTERVAL: how often it moves to the next tab
    // on its own, in milliseconds (1000 = 1 second). Bigger = slower.
    //
    // WHO_TABS_MANUAL_SELECT_PAUSE: after someone deliberately clicks a
    // tab or an arrow, auto-advance waits this long before resuming —
    // deliberately longer than the interval above, so they get time to
    // actually read the tab they picked. Bigger number = longer pause.
    // ------------------------------------------------------------------
    const WHO_TABS_AUTO_ADVANCE_INTERVAL = 4500;
    const WHO_TABS_MANUAL_SELECT_PAUSE = 7000;
    const whoTabsAutoAdvance = enableSelectionAutoAdvance(whoTabsViewport, whoTabBtns, selectWhoTab, WHO_TABS_AUTO_ADVANCE_INTERVAL);

    whoTabBtns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        selectWhoTab(btn);
        if(whoTabsAutoAdvance) whoTabsAutoAdvance.pauseFor(WHO_TABS_MANUAL_SELECT_PAUSE);
      });
    });
    bindSelectionArrows(
      whoTabsPrevBtn, whoTabsNextBtn, whoTabBtns, selectWhoTab,
      ()=>{ if(whoTabsAutoAdvance) whoTabsAutoAdvance.pauseFor(WHO_TABS_MANUAL_SELECT_PAUSE); }
    );
    updateWhoTabsArrowState();

    // Feed every tab's content into the page search — not just the one
    // currently showing in the panel — since WHO_TABS holds all 8 even
    // though only the active one is in the DOM. Picking a search result
    // switches to that tab first, then highlights the panel.
    WHO_TABS.forEach((tab, i)=>{
      const btn = whoTabBtns[i];
      if(!btn) return;
      const reveal = ()=>{ selectWhoTab(btn); return whoTabPanel; };
      dynamicSearchEntries.push({ section:'Who We Are', text:tab.title, reveal });
      if(tab.paragraph) dynamicSearchEntries.push({ section:'Who We Are', text:tab.paragraph, reveal });
      if(tab.bullets) tab.bullets.forEach(b=> dynamicSearchEntries.push({ section:'Who We Are', text:b, reveal }));
    });
  }

  // This month's question: before -> after transition
  const pollStage = document.getElementById('pollStage');
  const pollMeta = document.getElementById('pollMeta');
  const pollBars = document.querySelectorAll('.bar');

  const pollBarMax = Math.max(...Array.from(pollBars).map(b=> parseFloat(b.dataset.pct)));
  function animateBars(){
    pollBars.forEach(b=>{
      const pct = parseFloat(b.dataset.pct);
      const scaled = (pct / pollBarMax) * 92; // top bar reaches 92% of shell height
      b.style.height = scaled + '%';
    });
  }
  function resetBars(){
    pollBars.forEach(b=> b.style.height = '0%');
  }

  document.querySelectorAll('.poll-opt').forEach(opt=>{
    opt.addEventListener('click', ()=>{
      const answer = opt.dataset.answer;
      document.querySelectorAll('.poll-opt').forEach(o=> o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      pollStage.classList.add('is-answered');
      pollMeta.textContent = '1,284 responses · closes 31 Aug · your answer: ' + answer;
      document.querySelectorAll('.result').forEach(r=>{
        r.classList.toggle('is-selected', r.dataset.answer === answer);
      });
      resetBars();
      requestAnimationFrame(()=> setTimeout(animateBars, 250));
    });
  });

  // Generic helper: wire a pair of prev/next arrow buttons to scroll a container
  // by exactly one item's width (+ gap), and dim an arrow when there's nothing
  // left to scroll to in that direction.
  function bindCarouselArrows(prevBtn, nextBtn, scroller, itemSelector){
    if(!scroller) return;
    function step(){
      const item = scroller.querySelector(itemSelector);
      if(!item) return scroller.clientWidth;
      const cs = getComputedStyle(item.parentElement);
      const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function updateArrowState(){
      // A small tolerance on both ends, not just "<= 0" / ">= max": the
      // browser's native scrollLeft often settles a couple of pixels off
      // from the mathematically exact boundary (sub-pixel layout
      // rounding), so a zero-tolerance check on one side while the other
      // already has slack meant the start edge would never register as
      // "start" and that arrow would stay enabled forever.
      const EDGE_TOLERANCE = 4;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if(prevBtn) prevBtn.classList.toggle('is-disabled', scroller.scrollLeft <= EDGE_TOLERANCE);
      if(nextBtn) nextBtn.classList.toggle('is-disabled', scroller.scrollLeft >= max - EDGE_TOLERANCE);
    }
    if(prevBtn) prevBtn.addEventListener('click', ()=> scroller.scrollBy({left:-step(), behavior:'smooth'}));
    if(nextBtn) nextBtn.addEventListener('click', ()=> scroller.scrollBy({left:step(), behavior:'smooth'}));
    let arrowTicking = false;
    scroller.addEventListener('scroll', ()=>{
      if(arrowTicking) return;
      arrowTicking = true;
      requestAnimationFrame(()=>{ updateArrowState(); arrowTicking = false; });
    }, { passive:true });
    window.addEventListener('resize', updateArrowState);
    updateArrowState();
    return { step, updateArrowState };
  }

  // Generic helper: auto-advance a horizontal scroller item-by-item on a timer,
  // looping back to the start at the end. Pauses while the user is hovering,
  // touching, or dragging it, and resumes shortly after they let go.
  function enableAutoScroll(scroller, itemSelector, interval){
    if(!scroller) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = null;
    let paused = false;
    function step(){
      const item = scroller.querySelector(itemSelector);
      if(!item) return scroller.clientWidth;
      const cs = getComputedStyle(item.parentElement);
      const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
      return item.getBoundingClientRect().width + gap;
    }
    function advance(){
      if(paused) return;
      const max = scroller.scrollWidth - scroller.clientWidth - 1;
      if(max <= 0) return;
      if(scroller.scrollLeft >= max){
        scroller.scrollTo({ left:0, behavior:'smooth' });
      } else {
        scroller.scrollBy({ left:step(), behavior:'smooth' });
      }
    }
    function pause(){ paused = true; }
    function resumeSoon(){ setTimeout(()=>{ paused = false; }, 2500); }
    scroller.addEventListener('mouseenter', pause);
    scroller.addEventListener('mouseleave', resumeSoon);
    scroller.addEventListener('touchstart', pause, { passive:true });
    scroller.addEventListener('touchend', resumeSoon, { passive:true });
    scroller.addEventListener('pointerdown', pause);
    scroller.addEventListener('pointerup', resumeSoon);
    timer = setInterval(advance, interval || 3500);
    return timer;
  }

  // Auto-advance for the History timeline's year selector: unlike the generic
  // helper above (which just scrolls a container), this one calls the same
  // "select" function a click would use — so the active date, the image, the
  // caption, and the scroll position all move together, in sync, every step.
  // It also only runs while the timeline is actually visible on screen, so it
  // can never pull the page back once the user has scrolled elsewhere.
  //
  // Returns { pauseFor(ms) } so callers can request a pause of a specific
  // length (used below to give a longer pause after someone deliberately
  // picks a date, vs. the shorter default pause from just hovering/touching).
  function enableSelectionAutoAdvance(container, buttons, selectFn, interval, hoverPauseMs){
    if(!container || !buttons || !buttons.length) return null;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    let paused = false;
    let inView = false;
    let resumeTimer = null;
    function pause(){ paused = true; }
    // Pausing again while already paused for longer just extends it — e.g.
    // a manual click's longer pause won't get cut short by the pointerup
    // event's shorter hover-pause firing right after it.
    function pauseFor(ms){
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(()=>{ paused = false; }, ms);
    }
    function resumeSoon(){ pauseFor(hoverPauseMs || 2500); }
    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resumeSoon);
    container.addEventListener('touchstart', pause, { passive:true });
    container.addEventListener('touchend', resumeSoon, { passive:true });
    container.addEventListener('pointerdown', pause);
    container.addEventListener('pointerup', resumeSoon);
    if('IntersectionObserver' in window){
      new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{ inView = entry.isIntersecting; });
      }, { threshold:0.4 }).observe(container);
    } else {
      inView = true; // no IntersectionObserver support: fall back to always-on
    }
    setInterval(()=>{
      if(paused || !inView) return;
      const list = Array.from(buttons);
      const current = list.findIndex(b=> b.classList.contains('is-active'));
      const next = list[(current + 1) % list.length];
      selectFn(next);
    }, interval || 3500);
    return { pauseFor };
  }

  // Same idea for a pair of prev/next arrows: move by one selectable item and
  // re-run the shared select function, rather than scrolling blindly.
  // onSelect (optional) fires after each click — used below to give
  // auto-advance a longer pause after someone deliberately clicks an arrow.
  function bindSelectionArrows(prevBtn, nextBtn, buttons, selectFn, onSelect){
    if(!buttons || !buttons.length) return;
    const list = Array.from(buttons);
    function currentIndex(){
      const idx = list.findIndex(b=> b.classList.contains('is-active'));
      return idx === -1 ? 0 : idx;
    }
    if(prevBtn) prevBtn.addEventListener('click', ()=>{
      selectFn(list[(currentIndex() - 1 + list.length) % list.length]);
      if(onSelect) onSelect();
    });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{
      selectFn(list[(currentIndex() + 1) % list.length]);
      if(onSelect) onSelect();
    });
  }

  // History — Design option 2 (Aramco-style timeline): selecting a year
  // updates the large image and caption together, plus rail fill and
  // prev/next arrows for the year strip itself
  const hv2Viewport = document.getElementById('hv2Viewport');
  const hv2RailFill = document.getElementById('hv2RailFill');
  const hv2YearBtns = document.querySelectorAll('.hv2-year-btn');
  const hv2Media = document.getElementById('hv2Media');
  const hv2MediaImg = document.getElementById('hv2MediaImg');
  const hv2MediaYear = document.getElementById('hv2MediaYear');
  const hv2Caption = document.getElementById('hv2Caption');
  // ------------------------------------------------------------------
  // HISTORY TIMELINE DATA — this is where you add, remove, or edit dates
  // ------------------------------------------------------------------
  // Each entry here corresponds — BY POSITION — to one <button
  // class="hv2-year-btn" data-slide="N"> in index.html's History
  // section. Entry 0 in this array is the button with data-slide="0",
  // entry 1 is data-slide="1", and so on. When a year button is
  // clicked (or auto-advance reaches it), this array tells the page
  // which image and caption to show.
  //
  // TO EDIT AN EXISTING DATE: just change its "caption" text below.
  // No HTML changes needed.
  //
  // TO ADD A NEW DATE:
  //   1. In index.html, find the History section's year strip and add
  //      a new button inside the right era's <div class="hv2-era-years">,
  //      e.g. <button class="hv2-year-btn" type="button"
  //      data-slide="24">2027</button> — give it the NEXT unused number.
  //   2. Add a matching entry to the END of the array below (so the
  //      array position lines up with the data-slide number).
  //
  // TO REMOVE A DATE: delete its <button> from index.html AND delete
  // its entry here, then renumber every data-slide after it (and this
  // array) so the positions still line up with no gaps.
  //
  // IMAGES: "image" is a path (relative to index.html) that gets set as
  // the <img id="hv2MediaImg"> element's src — that's why each one
  // starts with "Images/". There are 4 placeholder photos
  // (Images/placeholder-timeline-a.svg through -d.svg) cycled in
  // rotation — that's why you see a/b/c/d repeating below. To use a
  // real photo for one of the four, just overwrite that file (same
  // filename, inside the Images folder) with your own image. If every
  // date needs its own unique photo instead, add more image files to
  // the Images folder and reference their paths here directly.
  // ------------------------------------------------------------------
  const hv2Slides = [
    { image:'Images/placeholder-timeline-a.svg', caption:'Issued the earliest personal identification cards for site employees.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Began capturing fingerprints as part of employee identity records.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Milestone details to be added.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Introduced dedicated security patrols across key sites.' },
    { image:'Images/placeholder-timeline-a.svg', caption:'Adopted fingerprint verification to confirm employee identity at checkpoints.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Installed industrial gates to control access to restricted areas.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Milestone details to be added.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Introduced standardized ID cards for all personnel.' },
    { image:'Images/placeholder-timeline-a.svg', caption:'Founded to protect people, assets and operations from the ground up.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Established a centralized security command post for site-wide monitoring.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Upgraded access badges with tamper-resistant materials.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Extended perimeter fencing across newly developed sites.' },
    { image:'Images/placeholder-timeline-a.svg', caption:'Rolled out a two-way radio dispatch network for patrol teams.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Expanded into a dedicated cross-regional function as operations grew.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Began installing closed-circuit cameras across critical facilities.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Opened a round-the-clock monitoring center for live surveillance.' },
    { image:'Images/placeholder-timeline-a.svg', caption:'Replaced manual sign-in logs with digital access control readers.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Introduced a centralized system for logging and tracking incidents.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Consolidated affiliates under one integrated operating model.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Piloted AI-assisted video analytics for anomaly detection.' },
    { image:'Images/placeholder-timeline-a.svg', caption:'Equipped patrol teams with a mobile app for real-time reporting.' },
    { image:'Images/placeholder-timeline-b.svg', caption:'Introduced biometric access at high-security zones.' },
    { image:'Images/placeholder-timeline-c.svg', caption:'Unified access control, CCTV, and incident systems into one platform.' },
    { image:'Images/placeholder-timeline-d.svg', caption:'Operating across 30 countries with 62 affiliates worldwide.' }
  ];
  if(hv2Media && hv2MediaImg && hv2Caption && hv2Slides.length){
    hv2MediaImg.src = hv2Slides[0].image;
    const initialBtn = document.querySelector('.hv2-year-btn.is-active');
    if(initialBtn && hv2MediaYear) hv2MediaYear.textContent = initialBtn.textContent;
  }
  if(hv2Viewport && hv2RailFill){
    function updateHv2Rail(){
      const max = hv2Viewport.scrollWidth - hv2Viewport.clientWidth;
      const pct = max > 0 ? (hv2Viewport.scrollLeft / max) * 100 : 0;
      hv2RailFill.style.width = pct + '%';
    }
    hv2Viewport.addEventListener('scroll', updateHv2Rail);
    updateHv2Rail();
  }

  // Scrolls only the horizontal carousel itself to center an item — unlike
  // element.scrollIntoView(), this can never move the page's vertical scroll
  // position, so it's safe to call even while the section is off-screen.
  function scrollWithinHorizontally(container, el){
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = (elRect.left + elRect.width / 2) - (containerRect.left + containerRect.width / 2);
    container.scrollBy({ left: delta, behavior:'smooth' });
  }

  // Previous/next arrows disable themselves (dim + stop responding to
  // clicks) once there's genuinely nothing further in that direction —
  // matching the same behavior already used for the Announcements
  // carousel arrows, so both ends of the strip act consistently.
  const hv2PrevBtn = document.getElementById('hv2Prev');
  const hv2NextBtn = document.getElementById('hv2Next');
  function updateHv2ArrowState(){
    const list = Array.from(hv2YearBtns);
    const idx = list.findIndex(b=> b.classList.contains('is-active'));
    if(hv2PrevBtn) hv2PrevBtn.classList.toggle('is-disabled', idx <= 0);
    if(hv2NextBtn) hv2NextBtn.classList.toggle('is-disabled', idx === -1 || idx >= list.length - 1);
  }

  // Selecting a year — by click, by arrow, or by auto-advance — always goes
  // through this one function. To make the change feel like one unified
  // moment rather than four separate updates, we briefly fade the image out,
  // and only once it's faded do we flip the active dot, move the rail,
  // swap the image, and update the caption — all in the same instant —
  // before fading back in. This keeps everything perfectly synchronized.
  function selectHv2Year(btn){
    const slide = hv2Slides[Number(btn.dataset.slide)];
    if(hv2Media) hv2Media.classList.add('is-fading');
    setTimeout(()=>{
      hv2YearBtns.forEach(b=> b.classList.remove('is-active'));
      btn.classList.add('is-active');
      updateHv2ArrowState();
      if(slide && hv2Media && hv2MediaImg && hv2Caption){
        hv2MediaImg.src = slide.image;
        if(hv2MediaYear) hv2MediaYear.textContent = btn.textContent;
        hv2Caption.textContent = slide.caption;
        requestAnimationFrame(()=> hv2Media.classList.remove('is-fading'));
      }
      if(hv2Viewport) scrollWithinHorizontally(hv2Viewport, btn);
    }, 120);
  }
  updateHv2ArrowState();
  // ------------------------------------------------------------------
  // HISTORY TIMELINE AUTO-ADVANCE TIMING — change the speed here
  // ------------------------------------------------------------------
  // TIMELINE_AUTO_ADVANCE_INTERVAL: how often it moves to the next date
  // on its own, in milliseconds (1000 = 1 second). Bigger number = slower.
  //
  // TIMELINE_MANUAL_SELECT_PAUSE: after someone deliberately clicks a
  // date or an arrow, auto-advance waits this long before resuming —
  // deliberately longer than the interval above, so they get time to
  // actually read the date they picked instead of it immediately moving
  // on. Also bigger number = longer pause.
  // ------------------------------------------------------------------
  const TIMELINE_AUTO_ADVANCE_INTERVAL = 4500;
  const TIMELINE_MANUAL_SELECT_PAUSE = 7000;
  const hv2AutoAdvance = enableSelectionAutoAdvance(hv2Viewport, hv2YearBtns, selectHv2Year, TIMELINE_AUTO_ADVANCE_INTERVAL);

  hv2YearBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectHv2Year(btn);
      if(hv2AutoAdvance) hv2AutoAdvance.pauseFor(TIMELINE_MANUAL_SELECT_PAUSE);
    });
  });
  bindSelectionArrows(
    document.getElementById('hv2Prev'),
    document.getElementById('hv2Next'),
    hv2YearBtns,
    selectHv2Year,
    ()=>{ if(hv2AutoAdvance) hv2AutoAdvance.pauseFor(TIMELINE_MANUAL_SELECT_PAUSE); }
  );

  // Feed every date's caption into the page search — not just the one
  // currently showing — since hv2Slides holds all 24 even though only
  // the active one is in the DOM. Picking a search result jumps to that
  // date first, then highlights the caption.
  hv2Slides.forEach((slide, i)=>{
    const btn = hv2YearBtns[i];
    if(!btn || !slide.caption) return;
    dynamicSearchEntries.push({
      section:'History',
      text: btn.textContent + ' — ' + slide.caption,
      reveal: ()=>{ selectHv2Year(btn); return hv2Caption; }
    });
  });

  // History timeline: rail fill follows horizontal scroll (original design)
  const tlOuter = document.getElementById('tlOuter');
  const tlFill = document.getElementById('tlFill');
  function updateRail(){
    const max = tlOuter.scrollWidth - tlOuter.clientWidth;
    const pct = max > 0 ? (tlOuter.scrollLeft / max) * 100 : 0;
    tlFill.style.width = pct + '%';
  }
  if(tlOuter && tlFill){
    tlOuter.addEventListener('scroll', updateRail);
    updateRail();
    enableAutoScroll(tlOuter, '.tl-item', 3500);
  }

  // Flip cards: click/tap or keyboard toggles the flip (hover also works via CSS on devices that support it)
  document.querySelectorAll('.flip-card').forEach(card=>{
    card.addEventListener('click', ()=> card.classList.toggle('is-flipped'));
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        card.classList.toggle('is-flipped');
      }
    });
  });

// Announcements dropdown toggle
  const announceToggle = document.getElementById('announceToggle');
  const announcePanel = document.getElementById('announcePanel');
  const announceClose = document.getElementById('announceClose');
  const announceWrap = document.querySelector('.announce-wrap');
  function closeAnnouncePanel(){
    if(!announcePanel) return;
    announcePanel.classList.remove('is-open');
    if(announceToggle) announceToggle.setAttribute('aria-expanded', 'false');
  }
  if(announceToggle && announcePanel){
    announceToggle.addEventListener('click', ()=>{
      const isOpen = announcePanel.classList.toggle('is-open');
      announceToggle.setAttribute('aria-expanded', isOpen);
    });
  }
  // Explicit close (X) button — always closes, regardless of current state
  if(announceClose){
    announceClose.addEventListener('click', (e)=>{
      e.stopPropagation();
      closeAnnouncePanel();
    });
  }
  // Clicking anywhere outside the announcements bar closes the panel too
  document.addEventListener('click', (e)=>{
    if(!announcePanel || !announcePanel.classList.contains('is-open')) return;
    if(announceWrap && !announceWrap.contains(e.target)){
      closeAnnouncePanel();
    }
  });
  // Escape also closes it, same as other dismissible panels on the site
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && announcePanel && announcePanel.classList.contains('is-open')){
      closeAnnouncePanel();
    }
  });

  // Announcements: horizontal carousel with prev/next arrows
  const announceTrack = document.getElementById('announceTrack');
  const announceDots = document.getElementById('announceDots');
  if(announceTrack){
    bindCarouselArrows(document.getElementById('annPrev'), document.getElementById('annNext'), announceTrack, '.announce-card');
  }

  // Announcements: dots indicator — these previously just sat there
  // statically and never updated. Now: one dot per actual card (rebuilt
  // to match however many cards there are, rather than a hardcoded 3),
  // the active dot follows the carousel as you scroll or drag it, and
  // clicking a dot jumps straight to that card.
  //
  // The math here is proportional (dot N = N/(total-1) of the way
  // through the scrollable range), not "step × index" — because with
  // several cards visible in the viewport at once, the carousel usually
  // can't scroll a full card-width per card before hitting the end, so
  // a fixed step would overshoot and every later dot would just clamp
  // to the same final position.
  if(announceTrack && announceDots){
    function announceMaxScroll(){
      return Math.max(0, announceTrack.scrollWidth - announceTrack.clientWidth);
    }
    function buildAnnounceDots(){
      const cards = announceTrack.querySelectorAll('.announce-card');
      announceDots.innerHTML = '';
      cards.forEach((_, i)=>{
        const dot = document.createElement('span');
        if(i === 0) dot.classList.add('active');
        dot.addEventListener('click', ()=>{
          const max = announceMaxScroll();
          const count = cards.length;
          const target = count > 1 ? (i / (count - 1)) * max : 0;
          announceTrack.scrollTo({ left: target, behavior:'smooth' });
        });
        announceDots.appendChild(dot);
      });
    }
    function updateAnnounceDots(){
      const dots = announceDots.querySelectorAll('span');
      if(!dots.length) return;
      const max = announceMaxScroll();
      const progress = max > 0 ? announceTrack.scrollLeft / max : 0;
      const index = Math.round(progress * (dots.length - 1));
      dots.forEach((dot, i)=> dot.classList.toggle('active', i === index));
    }
    buildAnnounceDots();
    announceTrack.addEventListener('scroll', updateAnnounceDots, { passive:true });
  }

  // Announcements: click a card to open it in a modal with a larger visual.
  // The modal tracks which announcement is showing so prev/next can move
  // between them without closing it.
  const announceModalOverlay = document.getElementById('announceModalOverlay');
  const announceModalVisual = document.getElementById('announceModalVisual');
  const announceModalVisualLink = document.getElementById('announceModalVisualLink');
  const announceModalTitle = document.getElementById('announceModalTitle');
  const announceModalLine = document.getElementById('announceModalLine');
  const announceModalDate = document.getElementById('announceModalDate');
  const announceModalClose = document.getElementById('announceModalClose');
  const announceModalPrev = document.getElementById('announceModalPrev');
  const announceModalNext = document.getElementById('announceModalNext');

  let currentAnnounceIndex = 0;
  function getAnnounceCards(){
    return announceTrack ? Array.from(announceTrack.querySelectorAll('.announce-card')) : [];
  }
  function showAnnounceAt(index){
    const cards = getAnnounceCards();
    if(!cards.length) return;
    currentAnnounceIndex = (index + cards.length) % cards.length;
    const card = cards[currentAnnounceIndex];
    const visualEl = card.querySelector('.announce-visual');
    announceModalVisual.className = 'announce-modal-visual' + (visualEl ? ' visual-' + card.dataset.visual : '');
    announceModalVisual.innerHTML = visualEl ? visualEl.innerHTML : '';
    announceModalTitle.textContent = card.dataset.title || '';
    announceModalLine.textContent = card.dataset.line || '';
    announceModalDate.textContent = card.dataset.date || '';
    announceModalVisualLink.href = card.dataset.link || '#';
    const canNavigate = cards.length > 1;
    if(announceModalPrev) announceModalPrev.hidden = !canNavigate;
    if(announceModalNext) announceModalNext.hidden = !canNavigate;
  }
  function openAnnounceModalAt(index){
    if(!announceModalOverlay) return;
    showAnnounceAt(index);
    announceModalOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeAnnounceModal(){
    if(!announceModalOverlay) return;
    announceModalOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if(announceTrack){
    announceTrack.addEventListener('click', (e)=>{
      const card = e.target.closest('.announce-card');
      if(!card) return;
      openAnnounceModalAt(getAnnounceCards().indexOf(card));
    });
  }
  if(announceModalPrev){
    announceModalPrev.addEventListener('click', (e)=>{
      e.stopPropagation();
      showAnnounceAt(currentAnnounceIndex - 1);
    });
  }
  if(announceModalNext){
    announceModalNext.addEventListener('click', (e)=>{
      e.stopPropagation();
      showAnnounceAt(currentAnnounceIndex + 1);
    });
  }
  if(announceModalClose) announceModalClose.addEventListener('click', closeAnnounceModal);
  if(announceModalOverlay){
    announceModalOverlay.addEventListener('click', (e)=>{
      if(e.target === announceModalOverlay) closeAnnounceModal();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if(!announceModalOverlay || !announceModalOverlay.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeAnnounceModal();
    else if(e.key === 'ArrowLeft') showAnnounceAt(currentAnnounceIndex - 1);
    else if(e.key === 'ArrowRight') showAnnounceAt(currentAnnounceIndex + 1);
  });

  // Dismiss all: empties the announcements bar entirely (not just one item)
  const dismissAllBtn = document.getElementById('dismissAllBtn');
  const announceCarousel = document.getElementById('announceCarousel');
  const announceEmpty = document.getElementById('announceEmpty');
  const announceTag = document.getElementById('announceTag');
  if(dismissAllBtn){
    dismissAllBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(announceTrack) announceTrack.innerHTML = '';
      if(announceCarousel) announceCarousel.hidden = true;
      if(announceDots) announceDots.hidden = true;
      if(announceEmpty) announceEmpty.hidden = false;
      if(announceTag) announceTag.remove();
      dismissAllBtn.remove();
    });
  }

  // Mobile menu toggle (simple show/hide of nav links)
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('nav.links');
  menuBtn.addEventListener('click', ()=>{
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '56px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = '#fff';
    navLinks.style.padding = '16px 6vw';
    navLinks.style.borderBottom = '1px solid var(--line)';
    navLinks.style.borderRadius = '0';
    navLinks.style.gap = '14px';
  });
  // Nav scroll-spy: shadow/highlight the active section link
  const navSections = document.querySelectorAll('section[id], #history');
  const navLinkMap = new Map();
  navLinks.querySelectorAll('a').forEach(a=>{
    const id = a.getAttribute('href').replace('#','');
    navLinkMap.set(id, a);
  });
  if(navSections.length && navLinkMap.size){
    const spyObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const link = navLinkMap.get(entry.target.id);
        if(!link) return;
        if(entry.isIntersecting){
          navLinkMap.forEach(a=> a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },{ rootMargin:'-40% 0px -55% 0px', threshold:0 });
    navSections.forEach(sec=> spyObserver.observe(sec));
  }

  // Map region navigation: filter markers by region, with an "All Regions" reset
  const regionRow = document.getElementById('regionRow');
  if(regionRow){
    const regionButtons = regionRow.querySelectorAll('.region-cell');
    const markers = document.querySelectorAll('.marker');
    regionButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const region = btn.dataset.region;
        regionButtons.forEach(b=> b.classList.remove('is-active'));
        btn.classList.add('is-active');
        markers.forEach(m=>{
          const show = region === 'all' || m.dataset.region === region;
          m.classList.toggle('is-dimmed', !show);
        });
      });
    });
  }

  // Contact us: the message form has no backend on this static site, so
  // submitting it just validates the fields and shows a friendly
  // confirmation in place of the button — no page reload, no email
  // actually sent. To wire this up to a real endpoint later, replace
  // the body of this submit handler with your own fetch()/form action.
  const contactUsForm = document.getElementById('contactUsForm');
  const contactUsStatus = document.getElementById('contactUsStatus');
  if(contactUsForm && contactUsStatus){
    contactUsForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      if(!contactUsForm.checkValidity()){
        contactUsStatus.textContent = 'Please fill in every field before sending.';
        contactUsStatus.classList.add('is-error');
        contactUsStatus.hidden = false;
        return;
      }
      contactUsStatus.classList.remove('is-error');
      contactUsStatus.textContent = 'Thanks — your message has been sent.';
      contactUsStatus.hidden = false;
      contactUsForm.reset();
    });
  }

  // Resources documents: category filter pills + a local search box —
  // both narrow down the same #docGrid, combined together (a document
  // must match the active category AND the search text to show). This
  // search is intentionally scoped to just this section's documents;
  // for searching the whole page, see the header search box instead.
  const docGrid = document.getElementById('docGrid');
  const docEmpty = document.getElementById('docEmpty');
  const filterPills = document.getElementById('filterPills');
  const resSearch = document.getElementById('resSearch');
  if(docGrid){
    const docCards = Array.from(docGrid.querySelectorAll('.doc-card'));
    let activeFilter = 'all';

    function applyDocFilters(){
      const query = resSearch ? resSearch.value.trim().toLowerCase() : '';
      let visible = 0;
      docCards.forEach(card=>{
        const matchesFilter = activeFilter === 'all' || card.dataset.filter === activeFilter;
        const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
        const show = matchesFilter && matchesQuery;
        card.style.display = show ? '' : 'none';
        if(show) visible++;
      });
      if(docEmpty) docEmpty.hidden = visible !== 0;
    }

    if(filterPills){
      filterPills.querySelectorAll('.pill').forEach(pill=>{
        pill.addEventListener('click', ()=>{
          filterPills.querySelectorAll('.pill').forEach(p=> p.classList.remove('is-active'));
          pill.classList.add('is-active');
          activeFilter = pill.dataset.filter;
          applyDocFilters();
        });
      });
    }

    if(resSearch){
      resSearch.addEventListener('input', applyDocFilters);
    }
  }

  // ========================================================================
  // PAGE SEARCH — searches all real text content across the whole page
  // ========================================================================
  // Rather than a hand-maintained list of what's searchable, this reads
  // the page itself: every element tagged with data-search-section="..."
  // (see those attributes throughout index.html) contributes its
  // headings, paragraphs, list items, and other text content. Two
  // sections — "Who We Are" and "History" — are JS-driven (only one
  // tab/date's text sits in the DOM at a time), so their full content
  // is added separately via `dynamicSearchEntries` (see where that's
  // populated, near the Who We Are tabs and History Timeline code above).
  //
  // TO MAKE A NEW SECTION SEARCHABLE: just add data-search-section="Your
  // Section Name" to its wrapping element in index.html — no JS changes
  // needed, as long as its content is plain DOM text (headings,
  // paragraphs, list items, etc.), not something rendered dynamically
  // like Who We Are/History are.
  //
  // TO EXCLUDE an element's text from search results (e.g. it's noisy
  // or purely decorative), add class="search-skip" to it.
  // ------------------------------------------------------------------
  const SEARCH_CONTENT_SELECTOR =
    'h1, h2, h3, p, li, .a-title, .a-line, .doc-pub, .stat-card .lbl, .stat-card .sub, .poll-opt, .card-plain p';

  function normalizeSearchText(s){
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function escapeSearchHtml(s){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Built once, from the page's own content, the first time it's needed.
  let pageSearchIndex = null;
  function buildSearchIndex(){
    const index = [];
    const seen = new Set(); // avoid indexing the exact same text twice within a section
    document.querySelectorAll('[data-search-section]').forEach(section=>{
      const sectionName = section.dataset.searchSection;
      // Skip the Who We Are panel and the History caption/media — their
      // content comes from dynamicSearchEntries instead, covering all
      // entries rather than just whichever one is currently shown.
      section.querySelectorAll(SEARCH_CONTENT_SELECTOR).forEach(el=>{
        if(el.closest('.search-skip')) return;
        if(el.closest('#whoTabPanel') || el.closest('.hv2-media') || el.closest('.hv2-caption-row')) return;
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        if(text.length < 2) return;
        const key = sectionName + '::' + text;
        if(seen.has(key)) return;
        seen.add(key);
        index.push({ section: sectionName, text, reveal: ()=> el });
      });
    });
    return index.concat(dynamicSearchEntries);
  }

  // Finds the match position in `text` (case/whitespace-insensitive) and
  // returns an HTML snippet: a few words of context on each side, with
  // the match itself wrapped in <mark>. Returns null if no match.
  function buildSearchSnippet(rawText, normQuery){
    const text = rawText.replace(/\s+/g, ' ').trim();
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(normQuery);
    if(idx === -1) return null;
    const WORDS_OF_CONTEXT = 6;
    const before = text.slice(0, idx).trim();
    const match = text.slice(idx, idx + normQuery.length);
    const after = text.slice(idx + normQuery.length).trim();
    const beforeWords = before.length ? before.split(' ') : [];
    const afterWords = after.length ? after.split(' ') : [];
    const beforeSnippet = beforeWords.slice(-WORDS_OF_CONTEXT).join(' ');
    const afterSnippet = afterWords.slice(0, WORDS_OF_CONTEXT).join(' ');
    const prefix = beforeWords.length > WORDS_OF_CONTEXT ? '…' : '';
    const suffix = afterWords.length > WORDS_OF_CONTEXT ? '…' : '';
    return {
      isWordStart: idx === 0 || /[\s\-.,;:!?()/]/.test(text[idx - 1]),
      html: (
        (prefix ? prefix + ' ' : '') +
        escapeSearchHtml(beforeSnippet) +
        (beforeSnippet ? ' ' : '') +
        '<mark>' + escapeSearchHtml(match) + '</mark>' +
        (afterSnippet && !/^[,.;:!?]/.test(afterSnippet) ? ' ' : '') +
        escapeSearchHtml(afterSnippet) +
        (suffix ? ' ' + suffix : '')
      ).trim()
    };
  }

  // Case-insensitive, whitespace-tolerant (extra/repeated spaces in the
  // query are collapsed same as the content), capped at a handful of
  // results so the dropdown stays scannable.
  function searchPage(rawQuery){
    const query = normalizeSearchText(rawQuery);
    if(!query) return [];
    if(!pageSearchIndex) pageSearchIndex = buildSearchIndex();
    const wordStartResults = [];
    const midWordResults = [];
    for(const entry of pageSearchIndex){
      const snippet = buildSearchSnippet(entry.text, query);
      if(snippet){
        const result = { section: entry.section, snippetHtml: snippet.html, reveal: entry.reveal };
        (snippet.isWordStart ? wordStartResults : midWordResults).push(result);
      }
      if(wordStartResults.length + midWordResults.length >= 40) break; // don't scan forever
    }
    // Whole-word matches ("Vision") rank above coincidental mid-word ones
    // ("diVISION") — both are shown, but the more relevant ones lead.
    return wordStartResults.concat(midWordResults).slice(0, 8);
  }

  // Scrolls to whatever a search result points to and briefly highlights
  // it. `reveal()` may need to do something first (switch to a Who We
  // Are tab, jump to a History date) before returning the element to
  // scroll to and highlight — that's why it's a function, not just an
  // element reference.
  function goToSearchResult(result){
    const target = result.reveal();
    if(!target) return;
    setTimeout(()=>{
      target.scrollIntoView({ behavior:'smooth', block:'center' });
      target.classList.add('search-target-highlight');
      setTimeout(()=> target.classList.remove('search-target-highlight'), 2300);
    }, 160);
  }

  // Reusable live-search widget: wires up an input + its dropdown so
  // typing shows matching content in real time, with keyboard (arrow
  // keys/Enter/Escape) and click support. Used for both the header
  // search and the bottom-of-page search bar — same behavior, two
  // locations.
  function setupPageSearch(inputEl, suggestEl){
    if(!inputEl || !suggestEl) return;
    let activeIndex = -1;
    let currentResults = [];

    function updateActiveHighlight(){
      suggestEl.querySelectorAll('.search-suggest-item').forEach((el, i)=>{
        el.classList.toggle('is-active', i === activeIndex);
      });
    }
    function closeSuggestions(){
      suggestEl.hidden = true;
      inputEl.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }
    function runSearch(){
      const query = inputEl.value;
      if(!normalizeSearchText(query)){ closeSuggestions(); return; }
      currentResults = searchPage(query);
      activeIndex = -1;
      if(!currentResults.length){
        suggestEl.innerHTML = `<div class="search-suggest-empty">No matches for "${escapeSearchHtml(query.trim())}"</div>`;
      } else {
        suggestEl.innerHTML = currentResults.map((r, i)=>
          `<button type="button" class="search-suggest-item" data-index="${i}" role="option">` +
            `<span class="search-suggest-section">${escapeSearchHtml(r.section)}</span>` +
            `<span class="search-suggest-snippet">${r.snippetHtml}</span>` +
          `</button>`
        ).join('');
      }
      suggestEl.hidden = false;
      inputEl.setAttribute('aria-expanded', 'true');
    }

    inputEl.addEventListener('input', runSearch);
    inputEl.addEventListener('focus', ()=>{ if(inputEl.value.trim()) runSearch(); });
    inputEl.addEventListener('keydown', (e)=>{
      if(suggestEl.hidden) return;
      if(e.key === 'ArrowDown'){
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
        updateActiveHighlight();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateActiveHighlight();
      } else if(e.key === 'Enter'){
        e.preventDefault();
        if(activeIndex >= 0 && currentResults[activeIndex]){
          goToSearchResult(currentResults[activeIndex]);
          closeSuggestions();
          inputEl.blur();
        }
      } else if(e.key === 'Escape'){
        closeSuggestions();
      }
    });
    suggestEl.addEventListener('click', (e)=>{
      const item = e.target.closest('.search-suggest-item');
      if(!item) return;
      const result = currentResults[Number(item.dataset.index)];
      if(result){
        goToSearchResult(result);
        closeSuggestions();
      }
    });
    document.addEventListener('click', (e)=>{
      if(!e.target.closest('.search-wrap')) closeSuggestions();
    });
  }

  // Header search (top nav) is the only page-search box now.
  setupPageSearch(document.getElementById('indexSearchInput'), document.getElementById('searchSuggest'));
