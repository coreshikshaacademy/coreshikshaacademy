/* GOV REGISTRATIONS - JS only (no surrounding <script> tag) */
(function(){
  const LS_KEY = 'devnexo_gov_regs_v1';
  const form = document.getElementById('regForm');
  const listEl = document.getElementById('regList');
  const exportBtn = document.getElementById('exportJson');
  const clearBtn = document.getElementById('clearAll');

  const uid = ()=> Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  function load(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e){ return []; } }
  function save(items){ localStorage.setItem(LS_KEY, JSON.stringify(items)); }

  function formatDate(d){ if(!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('en-IN'); }
  function esc(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  function render(){
    if (!listEl) return;
    const items = load();
    listEl.innerHTML = '';
    if(items.length === 0){
      listEl.innerHTML = '<div class="small">Koi registration nahi mila. Upar form se add karein.</div>'; return;
    }
    items.forEach(it=>{
      const wrapper = document.createElement('div');
      wrapper.className = 'reg-item';
      wrapper.innerHTML = `
        <div class="meta">
          <div>
            <div style="font-weight:700">${esc(it.name)}</div>
            <div class="small">${esc(it.authority||'')} • ${it.date?formatDate(it.date):''}</div>
          </div>
          <div class="badge">${esc(it.regNo||'-')}</div>
        </div>
        <div class="actions">
          <button class="btn ghost" data-action="edit" data-id="${it.id}">Edit</button>
          <button class="btn" data-action="delete" data-id="${it.id}">Delete</button>
        </div>
      `;
      listEl.appendChild(wrapper);
    });
  }

  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.orgName.value.trim();
      if(!name){ alert('Name required'); return; }
      const item = {
        id: form.getAttribute('data-edit-id') || uid(),
        name,
        regNo: form.regNo.value.trim(),
        authority: form.authority.value.trim(),
        date: form.regDate.value || '',
        notes: form.notes.value.trim()
      };
      let items = load();
      const editingId = form.getAttribute('data-edit-id');
      if(editingId){
        items = items.map(x => x.id === editingId ? item : x);
        form.removeAttribute('data-edit-id');
        form.querySelector('button[type="submit"]').textContent = 'Add / Save';
      } else {
        items.unshift(item);
      }
      save(items);
      form.reset();
      render();
    });
  }

  if (listEl) {
    listEl.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if(!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if(action === 'delete'){
        if(!confirm('Delete this registration?')) return;
        save(load().filter(x=>x.id!==id));
        render();
      } else if(action === 'edit'){
        const it = load().find(x=>x.id===id);
        if(!it) return;
        form.orgName.value = it.name;
        form.regNo.value = it.regNo || '';
        form.authority.value = it.authority || '';
        form.regDate.value = it.date || '';
        form.notes.value = it.notes || '';
        form.setAttribute('data-edit-id', id);
        form.querySelector('button[type="submit"]').textContent = 'Save Changes';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', function(){
      const items = load();
      const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'government_registrations.json';
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function(){
      if(!confirm('Clear all registrations from local storage? This cannot be undone.')) return;
      localStorage.removeItem(LS_KEY);
      render();
    });
  }

  if (listEl && !localStorage.getItem(LS_KEY)){
    save([
      { id: uid(), name: 'GST Registration', regNo: '27ABCDE1234F1Z5', authority: 'GST Department', date: '2020-06-12', notes: 'Active' },
      { id: uid(), name: 'Udyam / MSME', regNo: 'UDYAM-12345', authority: 'Udyam Registration', date: '2021-03-04', notes: 'Micro' }
    ]);
  }

  if (listEl) {
    render();
  }
})();

// Registration details data (edit with your real info)
const registrations = {
  1: {
    title: "MSME Registration",
    subtitle: "Udyog Aadhaar / MSME",
    img: "img/placeholder1.jpg",
    details: [
      "Registration No: MSME-123456",
      "Issue Date: 15-02-2024",
      "Valid Till: Lifetime / As per certificate",
      "Registered Address: Haldwani, Uttarakhand",
    ],
    note: "Original MSME certificate available on request."
  },
  2: {
    title: "GST / Trust",
    subtitle: "GSTIN & Trust Registration",
    img: "img/placeholder2.jpg",
    details: [
      "GSTIN: 12ABCDE3456F7Z",
      "Trust Reg. No: TR-987654",
      "Issue Date: 01-05-2023",
      "Tax & compliance updated annually"
    ],
    note: "GST returns filed regularly. PAN & GST copies available."
  },
  3: {
    title: "Municipal License",
    subtitle: "Local Municipal / Trade License",
    img: "img/placeholder3.jpg",
    details: [
      "License No: MUNC-2024-321",
      "Issued By: Haldwani Municipality",
      "Issue Date: 10-01-2022",
      "Valid Till: 09-01-2027"
    ],
    note: "License displayed at shop and available on demand."
  }
};

// modal elements
const modal = document.getElementById('regModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalDetails = document.getElementById('modalDetails');
const modalNote = document.getElementById('modalNote');
const modalClose = document.getElementById('modalClose');

// open modal when view buttons clicked
document.querySelectorAll('.btn-view').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    openModal(id);
  });
});

function openModal(id) {
  const data = registrations[id];
  if (!data || !modal) return;
  modalImg.src = data.img;
  modalImg.alt = data.title;
  modalTitle.textContent = data.title;
  modalSubtitle.textContent = data.subtitle;
  modalDetails.innerHTML = ''; // clear
  data.details.forEach(line => {
    const li = document.createElement('li');
    li.textContent = line;
    modalDetails.appendChild(li);
  });
  modalNote.textContent = data.note || '';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

// close modal
if (modal) {
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
}
function closeModal() {
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// OPTIONAL: keyboard escape to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.navigation');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    const reviewsContainer = document.getElementById('google-reviews-container');

    const fetchAndDisplayFeedback = async () => {
        if (!reviewsContainer) return;

        reviewsContainer.innerHTML = '<p class="loading-reviews">Loading feedback...</p>';
        try {
            const response = await fetch('/api/feedback');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const feedbacks = await response.json();
            
            if (feedbacks.length === 0) {
                reviewsContainer.innerHTML = '<p>No feedback submitted yet.</p>';
                return;
            }

            let reviewsHTML = '';
            feedbacks.slice(0, 6).forEach(feedback => { // Show latest 6
                let ratingStars = '';
                for(let i = 0; i < 5; i++){
                    if(i < feedback.rating){
                        ratingStars += '&#9733;'; // filled star
                    } else {
                        ratingStars += '&#9734;'; // empty star
                    }
                }

                reviewsHTML += `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-author-info">
                                <p class="review-author">${feedback.name}</p>
                                <div class="review-rating">${ratingStars}</div>
                            </div>
                        </div>
                        <p class="review-text">"${feedback.message}"</p>
                    </div>
                `;
            });
            reviewsContainer.innerHTML = reviewsHTML;
        } catch (error) {
            console.error("Error fetching feedback for homepage: ", error);
            reviewsContainer.innerHTML = '<p>Could not load feedback at this time.</p>';
        }
    };

    fetchAndDisplayFeedback();
});