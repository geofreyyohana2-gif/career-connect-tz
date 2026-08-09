/**
 * =============================================================
 * JOBS.JS - Job Board Functionality
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', function() {

    // =============================================================
    // JOB DATA
    // =============================================================
    const jobs = [{
        id: 1,
        title: "HR Business Partner",
        company: "Serengeti Holdings",
        deadline: "2026-08-12T23:59:59",
        description: "Drive people strategy and culture across East Africa. Partner with leadership to align HR with business goals.",
        qualification: "Bachelor's in HR or related. 5+ years in HRBP role.",
        requirement: "Strong communication, employee relations, talent management.",
        applyLink: "https://wa.me/255774554665?text=HR%20Business%20Partner",
        applyType: "whatsapp"
    }, {
        id: 2,
        title: "Account Manager",
        company: "Tanzania Digital Solutions",
        deadline: "2026-08-20T23:59:59",
        description: "Manage key accounts, upsell digital products, and ensure client retention. Work with cross-functional teams.",
        qualification: "3+ years in B2B account management.",
        requirement: "Excellent negotiation, CRM skills (HubSpot), data-driven.",
        applyLink: "https://careers.tzdigital.co.tz/apply/account-manager",
        applyType: "website"
    }, {
        id: 3,
        title: "Financial Analyst",
        company: "NMB Bank · Dar es Salaam",
        deadline: "2026-08-18T23:59:59",
        description: "Analyse financial data, prepare reports, and support budgeting. Work with treasury and investment teams.",
        qualification: "Degree in Finance/Accounting; CFA level 1 preferred.",
        requirement: "Excel modeling, SAP, analytical mindset.",
        applyLink: "https://www.nmbbank.co.tz/careers/financial-analyst",
        applyType: "website"
    }, {
        id: 4,
        title: "IT Support Specialist",
        company: "TechnoBrain Africa",
        deadline: "2026-08-25T23:59:59",
        description: "Provide first and second level support for hardware, software, and network. Maintain IT asset inventory.",
        qualification: "Diploma in IT; 2+ years support experience.",
        requirement: "Windows/Linux, networking, ticketing systems.",
        applyLink: "https://wa.me/255774554665?text=IT%20Support",
        applyType: "whatsapp"
    }, {
        id: 5,
        title: "Mwalimu wa Hesabu (Mathematics Teacher)",
        company: "Zanzibar Education",
        deadline: "2026-09-30T23:59:59",
        description: "📢 MWALIMU WA HESABU ANAHITAJIKA ZANZIBAR! 📚➗\n\nMwalimu wa Hesabu (Mathematics) anahitajika Zanzibar kwa ajili ya kufundisha.\n\n👨‍🏫 Tunatafuta mwalimu mwenye uwezo mzuri wa kufundisha na kueleza Hesabu kwa ufasaha.\n\n📌 Zanzibar",
        qualification: "Cheti cha ualimu au Degree katika Elimu/Hesabu",
        requirement: "Uwezo mzuri wa kufundisha, mawasiliano bora, uzoefu wa kufundisha Hesabu",
        applyLink: "tel:0743567159",
        applyType: "website"
    }, {
        id: 6,
        title: "🎨 Graphic Designer Opportunity",
        company: "Creative Hub Tanzania",
        deadline: "2026-10-15T23:59:59",
        description: "✨ Click Apply for details",
        qualification: " ",
        requirement: " ",
        applyLink: "#",
        applyType: "website"
    }];

    // =============================================================
    // COUNTDOWN HELPER
    // =============================================================
    function getDeadlineStatus(deadlineStr) {
        const now = new Date();
        const deadline = new Date(deadlineStr);
        const diffMs = deadline - now;
        if (diffMs <= 0) return { expired: true, label: "Expired", hours: 0 };
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const days = Math.floor(hours / 24);
        let label = '';
        if (days > 0) label = days + 'd ';
        label += (hours % 24) + 'h ' + mins + 'm left';
        return { expired: false, label: label, hours: hours };
    }

    // =============================================================
    // SHARE FUNCTION
    // =============================================================
    function shareNow(platform, element) {
        const card = element.closest('.job-card');
        if (!card) return;
        const title = card.querySelector('.job-title')?.textContent.trim() || 'Job Opportunity';
        const company = card.querySelector('.company')?.textContent.trim() || '';
        const desc = card.querySelector('.scroll-content p')?.textContent.trim()?.slice(0, 120) || '';

        let shareText = `📢 ${title}`;
        if (company) shareText += `\n🏛️ ${company}`;
        if (desc) shareText += `\n\n${desc}...`;
        shareText += `\n\nApply: ${window.location.href}`;

        const encoded = encodeURIComponent(shareText);
        const url = encodeURIComponent(window.location.href);

        const platforms = {
            facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
            twitter: 'https://twitter.com/intent/tweet?text=' + encoded,
            linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
            whatsapp: 'https://api.whatsapp.com/send?text=' + encoded,
            tiktok: 'https://www.tiktok.com/@/share?url=' + url,
            instagram: 'https://www.instagram.com/share?url=' + url,
        };

        if (platform === 'copy') {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareText).then(() => alert('✅ Copied!')).catch(() => fallbackCopy(shareText));
            } else { fallbackCopy(shareText); }
            return;
        }

        if (platforms[platform]) window.open(platforms[platform], '_blank', 'width=600,height=500');
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy');
            alert('✅ Copied!'); } catch (e) { alert('⚠️ Could not copy.'); }
        document.body.removeChild(ta);
    }

    // =============================================================
    // TOGGLE SHARE DROPDOWN
    // =============================================================
    function toggleShare(btn) {
        const menu = btn.closest('.share-dropdown').querySelector('.share-menu');
        if (menu) {
            document.querySelectorAll('.share-menu.open').forEach(el => el !== menu && el.classList.remove('open'));
            menu.classList.toggle('open');
        }
    }

    // Close share menus when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.share-dropdown')) {
            document.querySelectorAll('.share-menu.open').forEach(el => el.classList.remove('open'));
        }
    });

    // =============================================================
    // RENDER JOBS
    // =============================================================
    function renderJobs(filterText = "") {
        const grid = document.getElementById('jobGrid');
        grid.innerHTML = '';
        const search = filterText.toLowerCase().trim();

        let visibleCount = 0;

        jobs.forEach(function(job) {
            const status = getDeadlineStatus(job.deadline);
            const match = !search ||
                job.title.toLowerCase().includes(search) ||
                job.company.toLowerCase().includes(search) ||
                (job.description && job.description.toLowerCase().includes(search)) ||
                (job.requirement && job.requirement.toLowerCase().includes(search)) ||
                (job.qualification && job.qualification.toLowerCase().includes(search));

            if (!match) {
                const card = document.createElement('div');
                card.className = 'job-card hidden';
                card.dataset.id = job.id;
                grid.appendChild(card);
                return;
            }
            visibleCount++;

            const card = document.createElement('div');
            card.className = 'job-card';
            card.dataset.id = job.id;

            // ─── HEADER ───
            const header = document.createElement('div');
            header.className = 'card-header';
            header.innerHTML = `
                <div>
                    <div class="job-title">${job.title}</div>
                    <span class="company">${job.company}</span>
                </div>
                <span class="deadline-badge ${status.expired ? 'expired' : ''}">${status.expired ? '⏳ Expired' : '⏱️ ' + status.label}</span>
            `;
            card.appendChild(header);

            // ─── SCROLLABLE CONTENT ───
            const hasContent = job.description && job.description.trim() !== "" &&
                job.qualification && job.qualification.trim() !== "" &&
                job.requirement && job.requirement.trim() !== "";

            if (hasContent) {
                const scroll = document.createElement('div');
                scroll.className = 'scroll-content';
                scroll.innerHTML = `
                    <h4>📄 Description</h4>
                    <p>${job.description}</p>
                    <h4>🎓 Qualification</h4>
                    <p>${job.qualification || '—'}</p>
                    <h4>⚙️ Requirement</h4>
                    <ul>${(job.requirement || '').split(',').map(r => `<li>${r.trim()}</li>`).join('')}</ul>
                `;
                card.appendChild(scroll);
            } else {
                const spacer = document.createElement('div');
                spacer.className = 'scroll-content';
                spacer.style.display = 'flex';
                spacer.style.alignItems = 'center';
                spacer.style.justifyContent = 'center';
                spacer.style.minHeight = '80px';
                spacer.style.color = '#b09a8a';
                spacer.style.fontSize = '0.85rem';
                spacer.textContent = '✨ Click Apply for details';
                card.appendChild(spacer);
            }

            // ─── ACTIONS ───
            const actions = document.createElement('div');
            actions.className = 'card-actions';

            // Share
            const shareWrap = document.createElement('div');
            shareWrap.className = 'share-dropdown';
            const shareBtn = document.createElement('button');
            shareBtn.className = 'share-btn';
            shareBtn.innerHTML = '↗️ Share';
            shareBtn.setAttribute('onclick', 'event.stopPropagation();toggleShare(this);');

            const menu = document.createElement('div');
            menu.className = 'share-menu';
            menu.innerHTML = `
                <a onclick="event.stopPropagation();shareNow('facebook', this);">📘 Facebook</a>
                <a onclick="event.stopPropagation();shareNow('twitter', this);">🐦 Twitter</a>
                <a onclick="event.stopPropagation();shareNow('linkedin', this);">🔗 LinkedIn</a>
                <a onclick="event.stopPropagation();shareNow('whatsapp', this);">💬 WhatsApp</a>
                <a onclick="event.stopPropagation();shareNow('tiktok', this);">🎵 TikTok</a>
                <a onclick="event.stopPropagation();shareNow('instagram', this);">📸 Instagram</a>
                <a onclick="event.stopPropagation();shareNow('copy', this);">📋 Copy link</a>
            `;

            shareWrap.appendChild(shareBtn);
            shareWrap.appendChild(menu);
            actions.appendChild(shareWrap);

            // Apply button
            const applyBtn = document.createElement('a');
            applyBtn.className = `apply-btn ${status.expired ? 'disabled' : ''}`;
            applyBtn.href = status.expired ? '#' : job.applyLink;
            applyBtn.target = '_blank';
            applyBtn.textContent = status.expired ? 'Closed' : 'Apply Now';
            applyBtn.setAttribute('onclick', 'event.stopPropagation();');
            if (status.expired) applyBtn.style.cursor = 'default';
            actions.appendChild(applyBtn);

            card.appendChild(actions);
            grid.appendChild(card);
        });

        if (visibleCount === 0 && search) {
            const empty = document.createElement('div');
            empty.className = 'no-result';
            empty.textContent = 'No matching jobs found. Try adjusting your search.';
            grid.appendChild(empty);
        }
    }

    // =============================================================
    // SEARCH
    // =============================================================
    const searchInput = document.getElementById('jobSearch');
    searchInput.addEventListener('input', function(e) {
        renderJobs(e.target.value);
    });

    // =============================================================
    // CARD CLICK TO APPLY
    // =============================================================
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.job-card');
        if (!card) return;
        if (e.target.closest('.apply-btn') || e.target.closest('.share-btn') || e.target.closest('.share-menu') || e.target
            .closest('.share-menu a')) {
            return;
        }
        const link = card.dataset.link;
        if (link && link !== '#') {
            window.open(link, '_blank');
        }
    });

    // =============================================================
    // WHATSAPP POPUP
    // =============================================================
    const popup = document.getElementById('waPopup');
    const toggle = document.getElementById('waToggle');
    const close = document.getElementById('waClose');
    let popupVisible = false;

    setTimeout(function() {
        if (popup) {
            popup.classList.add('show');
            popupVisible = true;
        }
    }, 2000);

    if (toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (popup) {
                popup.classList.toggle('show');
                popupVisible = popup.classList.contains('show');
            }
        });
    }

    if (close) {
        close.addEventListener('click', function(e) {
            e.stopPropagation();
            if (popup) {
                popup.classList.remove('show');
                popupVisible = false;
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (popupVisible && popup && !popup.contains(e.target) && e.target !== toggle) {
            popup.classList.remove('show');
            popupVisible = false;
        }
    });

    // =============================================================
    // COUNTDOWN UPDATES (every 60 seconds)
    // =============================================================
    function updateDeadlines() {
        document.querySelectorAll('.job-card:not(.hidden)').forEach(function(card) {
            const id = parseInt(card.dataset.id);
            const job = jobs.find(j => j.id === id);
            if (!job) return;
            const status = getDeadlineStatus(job.deadline);
            const badge = card.querySelector('.deadline-badge');
            if (badge) {
                badge.textContent = status.expired ? '⏳ Expired' : '⏱️ ' + status.label;
                badge.className = `deadline-badge ${status.expired ? 'expired' : ''}`;
            }
            const applyBtn = card.querySelector('.apply-btn');
            if (applyBtn) {
                if (status.expired) {
                    applyBtn.classList.add('disabled');
                    applyBtn.href = '#';
                    applyBtn.textContent = 'Closed';
                } else {
                    applyBtn.classList.remove('disabled');
                    applyBtn.href = job.applyLink;
                    applyBtn.textContent = 'Apply Now';
                }
            }
        });
    }

    // Initial render
    renderJobs('');

    // Update every 60 seconds
    setInterval(updateDeadlines, 60000);

    // =============================================================
    // Expose functions globally for inline onclick
    // =============================================================
    window.shareNow = shareNow;
    window.toggleShare = toggleShare;

    console.log('✅ Job Board loaded successfully!');
});
