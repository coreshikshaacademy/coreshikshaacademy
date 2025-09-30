/* script.js
   Enhancements for the career page:
   - Adds a filter / search bar (auto-populates role/location options)
   - Client-side job filtering (search, role, location, type)
   - "Save job" (localStorage) and "Apply" buttons injected into each job card
   - Accessible modal that focuses the application form and pre-fills role
   - Adds copy-to-clipboard for job details
   - Form validation and mailto fallback (constructs email and opens mail client)
   - Lightweight, dependency-free, keyboard accessible
*/

(function () {
  'use strict';

  // Helpers
  const q = (sel, ctx = document) => ctx.querySelector(sel);
  const qAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const createEl = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.startsWith('aria-')) el.setAttribute(k, attrs[k]);
      else if (k === 'html') el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    for (const c of children) el.appendChild(c);
    return el;
  };

  // Wait until DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const openPositionsSection = q('#open-positions');
    const jobs = qAll('.job', openPositionsSection);
    if (!openPositionsSection || jobs.length === 0) return;

    // --- Build filter bar (search, role select, location select, clear) ---
    const filterBar = createEl('div', { class: 'cx-filterbar', role: 'region', 'aria-label': 'Job filters', style: 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;' });

    // Search input
    const searchInput = createEl('input', {
      class: 'cx-search',
      type: 'search',
      placeholder: 'Search roles, responsibilities, skills...', 
      'aria-label': 'Search jobs',
      style: 'flex:1;min-width:200px;padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);'
    });

    // Role select
    const roleSelect = createEl('select', { class: 'cx-role', 'aria-label': 'Filter by role', style: 'padding:8px;border-radius:8px;' });
    roleSelect.appendChild(createEl('option', { value: '', text: 'All roles' }));

    // Location select
    const locSelect = createEl('select', { class: 'cx-loc', 'aria-label': 'Filter by location', style: 'padding:8px;border-radius:8px;' });
    locSelect.appendChild(createEl('option', { value: '', text: 'All locations' }));

    // Type select (Full-time/Part-time)
    const typeSelect = createEl('select', { class: 'cx-type', 'aria-label': 'Filter by job type', style: 'padding:8px;border-radius:8px;' });
    typeSelect.appendChild(createEl('option', { value: '', text: 'All types' }));
    typeSelect.appendChild(createEl('option', { value: 'Full-time', text: 'Full-time' }));
    typeSelect.appendChild(createEl('option', { value: 'Part-time', text: 'Part-time' }));
    typeSelect.appendChild(createEl('option', { value: 'Contract', text: 'Contract' }));

    // Clear button
    const clearBtn = createEl('button', { class: 'cx-clear', type: 'button', text: 'Clear filters', style: 'padding:8px 12px;border-radius:8px;background:transparent;border:1px solid rgba(0,0,0,0.08);cursor:pointer;' });

    filterBar.appendChild(searchInput);
    filterBar.appendChild(roleSelect);
    filterBar.appendChild(locSelect);
    filterBar.appendChild(typeSelect);
    filterBar.appendChild(clearBtn);

    // Insert filter bar at the top of open positions section
    openPositionsSection.insertBefore(filterBar, openPositionsSection.firstChild);

    // --- Extract unique roles & locations from job cards to populate selects ---
    const rolesSet = new Set();
    const locSet = new Set();

    jobs.forEach(job => {
      const titleEl = q('.job-title', job);
      if (titleEl) rolesSet.add(titleEl.textContent.trim());

      const meta = q('.job-meta', job);
      if (meta) {
        // meta has string like "Location: Remote / Office (City)  |  Type: Full-time"
        const text = meta.textContent || '';
        const locMatch = text.match(/Location:\s*([^|]+)/i);
        if (locMatch) locSet.add(locMatch[1].trim());
        const typeMatch = text.match(/Type:\s*([^\n\r|]+)/i);
        if (typeMatch) {
          const t = typeMatch[1].trim();
          // If there is a concrete type in HTML, ensure it's available in type select
          if (![...typeSelect.options].some(o => o.value === t)) {
            typeSelect.appendChild(createEl('option', { value: t, text: t }));
          }
        }
      }
    });

    // Populate role select
    Array.from(rolesSet).sort().forEach(r => roleSelect.appendChild(createEl('option', { value: r, text: r })));
    Array.from(locSet).sort().forEach(l => locSelect.appendChild(createEl('option', { value: l, text: l })));

    // --- Inject action buttons into each job card: Save, Apply, Copy ---
    jobs.forEach(job => {
      const actions = createEl('div', { class: 'cx-actions', style: 'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;' });

      const saveBtn = createEl('button', { type: 'button', class: 'cx-save', text: 'Save job', 'aria-pressed': 'false', title: 'Save job for later' });
      const applyBtn = createEl('button', { type: 'button', class: 'cx-apply', text: 'Apply', title: 'Apply for this job' });
      const copyBtn = createEl('button', { type: 'button', class: 'cx-copy', text: 'Copy details', title: 'Copy job details to clipboard' });

      // Minimal styling hooks so page CSS can style them if wanted
      saveBtn.style.padding = applyBtn.style.padding = copyBtn.style.padding = '8px 10px';
      saveBtn.style.borderRadius = applyBtn.style.borderRadius = copyBtn.style.borderRadius = '8px';
      saveBtn.style.cursor = applyBtn.style.cursor = copyBtn.style.cursor = 'pointer';

      actions.appendChild(applyBtn);
      actions.appendChild(saveBtn);
      actions.appendChild(copyBtn);

      // Append to job card (end)
      job.appendChild(actions);

      // Setup button behaviors
      setupSaveButton(saveBtn, job);
      setupApplyButton(applyBtn, job);
      setupCopyButton(copyBtn, job);
      makeCollapsible(job);
    });

    // --- Filtering logic ---
    function matchesFilter(job, searchTerm, role, loc, type) {
      const text = (job.textContent || '').toLowerCase();
      const title = (q('.job-title', job)?.textContent || '').toLowerCase();
      const meta = (q('.job-meta', job)?.textContent || '').toLowerCase();
      const search = (searchTerm || '').trim().toLowerCase();

      if (search) {
        if (!text.includes(search) && !title.includes(search)) return false;
      }
      if (role) {
        const jobTitle = (q('.job-title', job)?.textContent || '').trim();
        if (jobTitle !== role) return false;
      }
      if (loc) {
        if (!meta.includes(loc.toLowerCase())) return false;
      }
      if (type) {
        if (!meta.includes(type.toLowerCase())) return false;
      }
      return true;
    }

    function runFilter() {
      const s = searchInput.value;
      const r = roleSelect.value;
      const l = locSelect.value;
      const t = typeSelect.value;

      let visibleCount = 0;
      jobs.forEach(job => {
        if (matchesFilter(job, s, r, l, t)) {
          job.style.display = '';
          visibleCount++;
        } else {
          job.style.display = 'none';
        }
      });

      // If none found, show friendly message
      let emptyMsg = q('.cx-empty', openPositionsSection);
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = createEl('p', { class: 'cx-empty', text: 'No jobs match your filters. Try clearing filters.' , style:'color:var(--muted);margin-top:10px;'});
          openPositionsSection.appendChild(emptyMsg);
        }
      } else {
        if (emptyMsg) emptyMsg.remove();
      }
    }

    // Events for filters
    [searchInput, roleSelect, locSelect, typeSelect].forEach(inp => inp.addEventListener('input', runFilter));
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      roleSelect.value = '';
      locSelect.value = '';
      typeSelect.value = '';
      runFilter();
      searchInput.focus();
    });

    // --- Saved jobs (localStorage) utility ---
    const SAVED_KEY = 'cx_saved_jobs_v1';
    function getSaved() {
      try {
        return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      } catch {
        return [];
      }
    }
    function setSaved(arr) {
      localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    }

    // Sync saved button state on load
    function setupSaveButton(btn, job) {
      const id = job.id || job.getAttribute('data-job-id') || job.querySelector('.job-title')?.textContent?.trim() || Math.random().toString(36).slice(2,9);
      btn.dataset.jobId = id;

      function refresh() {
        const saved = getSaved();
        const isSaved = saved.includes(id);
        btn.textContent = isSaved ? 'Saved' : 'Save job';
        btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
      }
      refresh();

      btn.addEventListener('click', () => {
        const saved = getSaved();
        const idx = saved.indexOf(id);
        if (idx >= 0) {
          saved.splice(idx, 1);
        } else {
          saved.push(id);
        }
        setSaved(saved);
        refresh();
      });
    }

    // --- Apply modal & behaviour ---
    // We'll create a lightweight modal that focuses the form already present on page.
    const form = q('#apply-form');
    if (form) {
      // Create modal backdrop + container
      const modalBackdrop = createEl('div', { class: 'cx-modal-backdrop', 'aria-hidden': 'true', style: 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:none;align-items:center;justify-content:center;z-index:1200;padding:20px;' });
      const modal = createEl('div', { class: 'cx-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Apply for job', style: 'max-width:720px;width:100%;background:var(--surface);padding:18px;border-radius:12px;overflow:auto;max-height:90vh;' });

      // Create a shallow clone of the form to avoid moving original (keeps page form intact)
      const formClone = form.cloneNode(true);
      formClone.id = 'apply-form-modal';
      // Add a cancel button
      const cancelBtn = createEl('button', { type: 'button', class: 'cx-cancel', text: 'Cancel', title: 'Close form' });
      cancelBtn.style.marginLeft = '10px';
      cancelBtn.style.padding = '8px 12px';
      cancelBtn.style.borderRadius = '8px';
      cancelBtn.style.cursor = 'pointer';

      const modalHeading = createEl('h3', { text: 'Apply — Please complete the form' });
      modal.appendChild(modalHeading);
      modal.appendChild(formClone);
      modal.appendChild(cancelBtn);
      modalBackdrop.appendChild(modal);
      document.body.appendChild(modalBackdrop);

      // Accessibility helpers: remember last focused element
      let lastFocused = null;

      function openModal(prefill = {}) {
        lastFocused = document.activeElement;
        // Prefill role if provided
        const roleSelectInForm = q('#applicant-role', formClone) || q('select[name="role"]', formClone);
        const nameInput = q('#applicant-name', formClone) || q('input[name="name"]', formClone);
        const emailInput = q('#applicant-email', formClone) || q('input[name="email"]', formClone);
        const msgInput = q('#applicant-message', formClone) || q('textarea[name="message"]', formClone);
        const cvInput = q('#applicant-cv', formClone) || q('input[name="cv"]', formClone);

        if (roleSelectInForm && prefill.role) {
          // try to set existing option, otherwise add
          let opt = Array.from(roleSelectInForm.options).find(o => o.value === prefill.role);
          if (!opt) {
            opt = createEl('option', { value: prefill.role, text: prefill.role });
            roleSelectInForm.appendChild(opt);
          }
          roleSelectInForm.value = prefill.role;
        }
        if (nameInput && prefill.name) nameInput.value = prefill.name;
        if (emailInput && prefill.email) emailInput.value = prefill.email;
        if (msgInput && prefill.message) msgInput.value = prefill.message;
        if (cvInput && prefill.cv) cvInput.value = prefill.cv;

        modalBackdrop.style.display = 'flex';
        modalBackdrop.setAttribute('aria-hidden', 'false');
        // Focus first input
        const firstInput = formClone.querySelector('input, textarea, select, button');
        if (firstInput) firstInput.focus();

        // Trap focus
        document.addEventListener('focus', trapFocus, true);
      }

      function closeModal() {
        modalBackdrop.style.display = 'none';
        modalBackdrop.setAttribute('aria-hidden', 'true');
        document.removeEventListener('focus', trapFocus, true);
        if (lastFocused) lastFocused.focus();
      }

      function trapFocus(e) {
        if (!modal.contains(e.target)) {
          e.stopPropagation();
          modal.focus();
        }
      }

      cancelBtn.addEventListener('click', closeModal);
      modalBackdrop.addEventListener('click', (ev) => {
        if (ev.target === modalBackdrop) closeModal();
      });

      const handleFormSubmit = async (event) => {
          event.preventDefault();
          const currentForm = event.target;
          const submitButton = currentForm.querySelector('button[type="submit"]');

          // Basic validation
          const nameVal = (currentForm.name?.value || '').trim();
          const emailVal = (currentForm.email?.value || '').trim();
          const roleVal = (currentForm.role?.value || '').trim();
          const msgVal = (currentForm.message?.value || '').trim();
          const resumeFile = currentForm.resume?.files[0];

          if (!nameVal || !emailVal || !roleVal || !msgVal || !resumeFile) {
              alert('Please fill all required fields and upload a resume.');
              return;
          }
          
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
          }

          const formData = new FormData(currentForm);

          try {
                            const response = await fetch('api/apply_career.php', {
                  method: 'POST',
                  body: formData,
              });

              const result = await response.json();

              if (response.ok) {
                  alert(result.msg || 'Application submitted successfully!');
                  currentForm.reset();
                  if (currentForm.id === 'apply-form-modal') {
                      closeModal();
                  }
              } else {
                  alert(result.msg || 'An error occurred while submitting the application.');
              }

          } catch (error) {
              console.error('Application submission error:', error);
              alert('A network error occurred. Please ensure the backend server is running.');
          } finally {
              if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Send application';
              }
          }
      };

      // Attach handler to both the main page form and the one in the modal
      form.addEventListener('submit', handleFormSubmit);
      formClone.addEventListener('submit', handleFormSubmit);

      // Expose openModal for apply buttons
      window.__cxOpenApplyModal = openModal;
    } // end if form

    // Setup apply button behavior
    function setupApplyButton(btn, job) {
      btn.addEventListener('click', () => {
        // Attempt to prefill role from job card
        const role = q('.job-title', job)?.textContent?.trim();
        const msg = `Applying for the role of ${role}.`;
        const prefill = { role, message: msg };
        if (window.__cxOpenApplyModal) {
          window.__cxOpenApplyModal(prefill);
        } else {
          // if no modal (no form), open mailto directly using job details
          const meta = q('.job-meta', job)?.textContent?.trim() || '';
          const body = encodeURIComponent(`Role: ${role}\n\n${meta}\n\nRegards,\n[Your Name]`);
          const mailto = `mailto:hr@yourcompany.example?subject=${encodeURIComponent('Application — ' + role)}&body=${body}`;
          window.location.href = mailto;
        }
      });
    }

    // Copy to clipboard for job details
    function setupCopyButton(btn, job) {
      btn.addEventListener('click', async () => {
        const title = q('.job-title', job)?.textContent?.trim() || '';
        const meta = q('.job-meta', job)?.textContent?.trim() || '';
        const desc = Array.from(qAll('h4,ul,ol,p', job))
          .map(el => el.textContent.trim())
          .filter(Boolean)
          .join('\n\n');

        const text = `${title}\n\n${meta}\n\n${desc}`;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy details'), 1400);
        } catch (e) {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            btn.textContent = 'Copied!';
            setTimeout(() => (btn.textContent = 'Copy details'), 1400);
          } catch {
            alert('Unable to copy — your browser blocked clipboard access. Please copy manually.');
          }
          ta.remove();
        }
      });
    }

    // Make job sections collapsible (click job title to toggle)
    function makeCollapsible(job) {
      const header = q('.job-title', job);
      if (!header) return;
      header.setAttribute('tabindex', '0');
      header.style.cursor = 'pointer';
      const contentChildren = Array.from(job.children).filter(c => !c.classList.contains('job-title') && !c.classList.contains('cx-actions'));
      const contentWrapper = createEl('div', { class: 'cx-job-content' });
      contentWrapper.style.transition = 'max-height 240ms ease, opacity 200ms ease';
      // move content children into wrapper
      contentChildren.forEach(c => contentWrapper.appendChild(c));
      job.appendChild(contentWrapper);

      // initial expanded
      contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
      contentWrapper.style.opacity = '1';

      function toggle() {
        const isOpen = contentWrapper.style.maxHeight && contentWrapper.style.maxHeight !== '0px';
        if (isOpen) {
          contentWrapper.style.maxHeight = '0px';
          contentWrapper.style.opacity = '0';
          header.setAttribute('aria-expanded', 'false');
        } else {
          contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
          contentWrapper.style.opacity = '1';
          header.setAttribute('aria-expanded', 'true');
        }
      }
      header.addEventListener('click', toggle);
      header.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
      // set ARIA
      header.setAttribute('role', 'button');
      header.setAttribute('aria-expanded', 'true');
    }

    // Initial filter run
    runFilter();

    // Small UX: keyboard shortcut "/" to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
      }
    });

    // Expose a small API for debugging or future extension
    window.cxCareer = {
      runFilter,
      getSaved,
      setSaved,
    };
  }); // DOMContentLoaded
})();