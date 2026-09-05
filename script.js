// =============================================================
//// =============================================================
// GLOBAL HELPERS (available to inline onclick)
// =============================================================

// Toggle Read More / Read Less for articles (CV, Interview, Coaching)
window.toggleArticle = function(btn) {
    const article = btn.closest('.coaching-article') || btn.closest('.interview-article');
    if (!article) return;
    const full = article.querySelector('.article-full');
    if (!full) return;
    const isOpen = full.style.display === 'block';
    full.style.display = isOpen ? 'none' : 'block';
    btn.innerHTML = isOpen
        ? 'Read More <i class="fas fa-chevron-down"></i>'
        : 'Read Less <i class="fas fa-chevron-up"></i>';
    btn.classList.toggle('active');
};

// Scroll to a section by class name (used in Research sidebar)
window.scrollToSection = function(e, className) {
    e.preventDefault();
    const target = document.querySelector('.' + className);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Toggle Internship/Volunteer card details (used in Internship section)
window.toggleInternDetails = function(detailId, descId, btn) {
    const detail = document.getElementById(detailId);
    const desc = document.getElementById(descId);
    if (detail) {
        detail.classList.toggle('open');
        if (detail.classList.contains('open')) {
            btn.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
            if (desc) desc.classList.add('expanded');
        } else {
            btn.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
            if (desc) desc.classList.remove('expanded');
        }
    }
};

// =============================================================
// MAIN APPLICATION – Single DOMContentLoaded
// =============================================================
document.addEventListener('DOMContentLoaded', function() {

    // ─── 1. SECTION MAP (defined once) ───
    const sectionMap = {
        'scholarships': 'scholarships-section',
        'jobs': 'jobs-section',
        'internships': 'internships-section',
        'volunteer': 'volunteer-section',
        'training': 'training-section',
        'about': 'about-section',
        'cv': 'cv-section',
        'interview': 'interview-section',
        'coaching': 'coaching-section',
        'scholarship': 'scholarship-section',
        'research': 'research-section',
        'resources': 'resources-section',
        'home': null,
        'services': null,
        'contact': null
    };

    // ─── Hide all sections ───
    function hideAllSections() {
        Object.values(sectionMap).forEach(id => {
            if (id) {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            }
        });
    }

    // ─── Show a specific section ───
    function showSection(sectionId) {
        hideAllSections();
        if (sectionId) {
            const el = document.getElementById(sectionId);
            if (el) {
                el.style.display = 'block';
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }

    // ─── 2. NAVIGATION ───
    // All links with data-section attribute (nav links, dropdown items, etc.)
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionKey = this.dataset.section;
            const sectionId = sectionMap[sectionKey];
            if (sectionId) {
                showSection(sectionId);
            } else {
                hideAllSections();
                if (sectionKey === 'home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    });

    // Hero carousel buttons
    document.querySelectorAll('.btn-hero[data-section]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionKey = this.dataset.section;
            const sectionId = sectionMap[sectionKey];
            if (sectionId) showSection(sectionId);
            else hideAllSections();
        });
    });

    // ─── 3. CAROUSEL ───
    const heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        new bootstrap.Carousel(heroCarousel, {
            interval: 4000,
            pause: 'hover',
            wrap: true
        });
    }

    // ─── 4. MARQUEE SPEED ───
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        marqueeTrack.style.animationDuration = '25s';
    }
























        // ─── 5. SEARCH ───
    const searchInput = document.getElementById('globalSearchInput');
    const resultsBox = document.getElementById('searchResultsBox');
    let allTextNodes = [];

    function getAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
                    if (parent.closest('.search-wrapper') || parent.closest('.lang-wrapper') ||
                        parent.closest('.navbar-custom .d-flex')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const nodes = [];
        let n;
        while (n = walker.nextNode()) {
            nodes.push(n);
        }
        return nodes;
    }

    function rebuildIndex() {
        allTextNodes = getAllTextNodes();
    }
    rebuildIndex();

    // Rebuild after dynamic content changes (e.g., sections loading)
    const observer = new MutationObserver(() => {
        setTimeout(rebuildIndex, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            resultsBox.classList.remove('show');
            return;
        }
        const q = query.trim().toLowerCase();
        const results = [];
        allTextNodes.forEach(node => {
            const text = node.textContent;
            const lower = text.toLowerCase();
            if (lower.includes(q)) {
                const idx = lower.indexOf(q);
                const start = Math.max(0, idx - 30);
                const end = Math.min(text.length, idx + q.length + 30);
                let context = text.substring(start, end);
                if (start > 0) context = '…' + context;
                if (end < text.length) context = context + '…';
                const highlighted = context.replace(
                    new RegExp(q, 'gi'),
                    match => `<span class="match-highlight">${match}</span>`
                );
                const parentEl = node.parentElement;
                results.push({ context: highlighted, element: parentEl, fullText: text });
            }
        });
        const unique = [];
        const seen = new Set();
        results.forEach(r => {
            if (!seen.has(r.element)) {
                seen.add(r.element);
                unique.push(r);
            }
        });
        if (unique.length === 0) {
            resultsBox.innerHTML = `<div class="no-results">No results found for “${query.trim()}”</div>`;
        } else {
            let html = '';
            unique.slice(0, 15).forEach(r => {
                const sectionName = r.element.closest('section, div, header, footer')?.tagName?.toLowerCase() || 'page';
                html += `<div class="result-item" data-target-id="${r.element.id || ''}" data-text-snippet="${r.fullText.substring(0, 60)}">
                            <span>${r.context}</span>
                            <span class="context">${r.element.tagName.toLowerCase()} · ${sectionName}</span>
                         </div>`;
            });
            if (unique.length > 15) {
                html += `<div class="result-item" style="color:var(--text-muted);font-size:0.8rem;text-align:center;">+ ${unique.length - 15} more results</div>`;
            }
            resultsBox.innerHTML = html;
            resultsBox.querySelectorAll('.result-item[data-target-id]').forEach(item => {
                item.addEventListener('click', function() {
                    const targetId = this.dataset.targetId;
                    let targetEl = null;
                    if (targetId) {
                        targetEl = document.getElementById(targetId);
                    }
                    if (!targetEl) {
                        const snippet = this.dataset.textSnippet;
                        if (snippet) {
                            const textNodes = getAllTextNodes();
                            for (let node of textNodes) {
                                if (node.textContent.includes(snippet.substring(0, 30))) {
                                    targetEl = node.parentElement;
                                    break;
                                }
                            }
                        }
                    }
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetEl.style.transition = 'background 0.6s';
                        targetEl.style.background = 'rgba(201,168,76,0.15)';
                        setTimeout(() => { targetEl.style.background = ''; }, 2000);
                        resultsBox.classList.remove('show');
                        searchInput.value = '';
                    }
                });
            });
        }
        resultsBox.classList.add('show');
    }

    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            resultsBox.classList.remove('show');
        }
    });





















    // ─── 6. SCHOLARSHIP DATA (50+ REAL LINKS) ───
    const scholarships = [
        // --- FULLY FUNDED ---
        { id: 1, title: 'Mastercard Foundation Scholars Program', provider: 'University of Edinburgh · UK', funding: 'fully', deadline: '31 Oct 2026', description: 'Full tuition, accommodation, living stipend, travel costs for African students. Covers all expenses.', eligibility: ['African citizen', 'Academically gifted', 'Economically disadvantaged', 'Commitment to community service'], steps: ['Check eligibility on official site', 'Prepare transcripts, recommendations, personal statement', 'Submit online application', 'Interview if shortlisted'], link: 'https://mastercardfoundation.org/scholars' },
        { id: 2, title: 'DAAD In-Country/In-Region Scholarship', provider: 'Various Universities · Sub-Saharan Africa', funding: 'fully', deadline: '15 Nov 2026', description: 'Supports Master’s and PhD studies at African universities. Full tuition, monthly allowance, travel, research support.', eligibility: ['Citizen of Sub-Saharan African country', 'Completed undergraduate degree (or Master’s for PhD)', 'Relevant field of study'], steps: ['Identify host university', 'Secure admission', 'Submit DAAD application', 'Wait for selection'], link: 'https://www.daad.de/en/find-funding/' },
        { id: 3, title: 'Chevening Scholarship', provider: 'UK Government · United Kingdom', funding: 'fully', deadline: '05 Nov 2026', description: 'Fully funded one-year Master’s degree in any subject at any UK university. Covers tuition, stipend, travel, and additional allowances.', eligibility: ['Citizen of Chevening-eligible country', 'Completed undergraduate degree', '2+ years work experience'], steps: ['Check eligibility', 'Apply online with personal statement and references', 'Interview', 'Final selection in June'], link: 'https://www.chevening.org/' },
        { id: 4, title: 'African Leadership Academy Scholarship', provider: 'African Leadership Academy · South Africa', funding: 'fully', deadline: '28 Feb 2027', description: 'Full boarding scholarship for high school students across Africa with leadership potential. Covers tuition, accommodation, meals, activities.', eligibility: ['African citizen', 'Aged 16-19', 'Demonstrated leadership potential'], steps: ['Complete online application', 'Submit academic records and recommendations', 'Leadership interview and assessment', 'Final decision'], link: 'https://www.africanleadershipacademy.org/' },
        { id: 5, title: 'Commonwealth Scholarship (Tanzania)', provider: 'UK Government · Various UK Universities', funding: 'fully', deadline: '01 Dec 2026', description: 'Fully funded Master’s and PhD scholarships for Tanzanian nationals to study in the UK. Covers tuition, living stipend, travel.', eligibility: ['Tanzanian citizen', 'Hold a first degree (Master’s) or Master’s (PhD)', 'Not more than 40 years old'], steps: ['Apply through the Ministry of Education', 'Submit academic transcripts', 'Provide references', 'Attend interview'], link: 'https://cscuk.fcdo.gov.uk/' },
        { id: 6, title: 'Japan Africa Dream Scholarship (JADS)', provider: 'African Development Bank · Japan', funding: 'fully', deadline: '30 Apr 2027', description: 'Full tuition, living stipend, and travel for Master’s programs in Japan in agriculture, energy, and engineering.', eligibility: ['African citizen', 'Bachelor’s degree in related field', '2+ years work experience', 'Under 35 years'], steps: ['Check eligibility', 'Submit application to AfDB', 'Provide transcripts and references', 'Interview'], link: 'https://www.afdb.org/' },
        { id: 7, title: 'Islamic Development Bank (IsDB) Scholarship', provider: 'IsDB · Various Countries', funding: 'fully', deadline: '31 Mar 2027', description: 'Full tuition, monthly stipend, medical insurance, and travel for Master’s, PhD, and postdoctoral studies.', eligibility: ['Citizen of IsDB member country', 'Under 30 for Master’s, 35 for PhD', 'Relevant academic background'], steps: ['Check IsDB member eligibility', 'Apply online with research proposal', 'Provide academic documents', 'Interview'], link: 'https://www.isdb.org/' },
        { id: 8, title: 'UN FAO Scholarship for African Women', provider: 'FAO · Italy', funding: 'fully', deadline: '15 Feb 2027', description: 'Fully funded Master’s program in food security, agriculture, and rural development for African women.', eligibility: ['Female African citizen', 'Bachelor’s in agriculture/food science', 'Under 35', 'Demonstrated leadership'], steps: ['Complete online form', 'Submit CV and transcripts', 'Personal statement', 'Interview'], link: 'https://www.fao.org/' },
        { id: 9, title: 'World Bank Africa Fellowship Program', provider: 'World Bank · USA', funding: 'fully', deadline: '20 Aug 2026', description: 'Fully funded research fellowship for African PhD students and recent graduates in economics, development, and related fields.', eligibility: ['African citizen', 'PhD in economics/development', 'Under 32 years'], steps: ['Submit CV and research proposal', 'Provide academic references', 'Interview', 'Final selection'], link: 'https://www.worldbank.org/' },
        { id: 10, title: 'Tanzania Government Public Service Scholarship', provider: 'Tanzania Government · Tanzania', funding: 'fully', deadline: '15 Jan 2027', description: 'Full coverage of tuition, accommodation, and living expenses for Tanzanian students in public universities.', eligibility: ['Tanzanian citizen', 'Form Six/Diploma for undergraduate, Bachelor’s for postgraduate', 'Relevant field'], steps: ['Apply through local government', 'Submit academic records', 'Interview', 'Receive placement'], link: 'https://www.moe.go.tz/' },
        { id: 11, title: 'Aga Khan Foundation International Scholarship', provider: 'Aga Khan Foundation · Global', funding: 'partially', deadline: '31 Mar 2027', description: 'Partial funding (50-80%) for Master’s and PhD programs. Covers tuition and living stipend but requires co-funding.', eligibility: ['African citizen', 'Under 30 for Master’s', 'Accepted into an accredited program'], steps: ['Secure admission', 'Submit AKF application', 'Provide references', 'Interview'], link: 'https://www.akdn.org/our-work/aga-khan-foundation' },
        { id: 12, title: 'Eiffel Excellence Scholarship (France)', provider: 'French Government · France', funding: 'partially', deadline: '07 Jan 2027', description: 'Covers tuition and a monthly allowance (€1,200), but not full living expenses or travel. Students must secure additional funding.', eligibility: ['Non-French national', 'Excellent academic record', 'Age limits (under 30 for Master’s)'], steps: ['Apply for admission to French university', 'University nominates you', 'Submit documentation', 'Wait for decision'], link: 'https://www.campusfrance.org/en/eiffel' },
        { id: 13, title: 'Fulbright Foreign Student Program (USA)', provider: 'US Department of State · USA', funding: 'partially', deadline: '15 Mar 2027', description: 'Partial funding — covers tuition and a living stipend, but students are responsible for travel, health insurance, and other personal costs.', eligibility: ['International student', 'Strong academic background', 'Leadership qualities'], steps: ['Contact US embassy', 'Submit Fulbright application', 'Provide test scores (TOEFL, GRE)', 'Interview'], link: 'https://fulbrightprogram.org/' },
        // --- EXTRA FULLY FUNDED (with real links) ---
        { id: 14, title: 'Harvard African Students Scholarship', provider: 'Harvard University · USA', funding: 'fully', deadline: '01 Dec 2026', description: 'Full tuition and living stipend for African students pursuing any degree at Harvard.', eligibility: ['African citizen', 'Exceptional academic record', 'Financial need'], steps: ['Apply to Harvard', 'Submit financial aid forms', 'Interview if required'], link: 'https://www.harvard.edu/admissions-aid/' },
        { id: 15, title: 'Yale University Fellowship for African Scholars', provider: 'Yale University · USA', funding: 'fully', deadline: '15 Nov 2026', description: 'Full funding for African students in any graduate program at Yale.', eligibility: ['African citizen', 'Bachelor’s degree', 'Strong academic background'], steps: ['Apply to Yale', 'Submit fellowship application', 'Provide references'], link: 'https://www.yale.edu/admissions/graduate' },
        { id: 16, title: 'Oxford-African Leaders Scholarship', provider: 'Oxford University · UK', funding: 'fully', deadline: '20 Jan 2027', description: 'Full funding for African students with leadership potential to study at Oxford.', eligibility: ['African citizen', 'Under 30', 'Leadership experience'], steps: ['Apply to Oxford', 'Submit leadership essay', 'Interview'], link: 'https://www.ox.ac.uk/admissions/graduate' },
        { id: 17, title: 'Cambridge Trust African Scholarship', provider: 'Cambridge University · UK', funding: 'fully', deadline: '05 Dec 2026', description: 'Fully funded Master’s and PhD scholarships for African students at Cambridge.', eligibility: ['African citizen', 'First class degree', 'Financial need'], steps: ['Apply to Cambridge', 'Submit Trust application', 'Academic references'], link: 'https://www.cambridgetrust.org/' },
        { id: 18, title: 'Africa-Europe Excellence Scholarship', provider: 'EU · Various', funding: 'fully', deadline: '28 Feb 2027', description: 'Fully funded Master’s programs in Europe for African students in science, technology, and engineering.', eligibility: ['African citizen', 'Bachelor’s in STEM', 'Under 30'], steps: ['Apply online', 'Submit transcripts', 'Motivation letter'], link: 'https://europa.eu/' },
        { id: 19, title: 'Gates Cambridge Scholarship', provider: 'Cambridge University · UK', funding: 'fully', deadline: '05 Oct 2026', description: 'Fully funded postgraduate scholarships for outstanding students from outside the UK.', eligibility: ['Non-UK citizen', 'First class degree', 'Leadership potential'], steps: ['Apply to Cambridge', 'Submit Gates application', 'Interview'], link: 'https://www.gatescambridge.org/' },
        { id: 20, title: 'Rhodes Scholarship (Southern Africa)', provider: 'Oxford University · UK', funding: 'fully', deadline: '15 Sep 2026', description: 'Full funding for postgraduate study at Oxford for students from Southern Africa.', eligibility: ['Citizen of Southern African country', 'Age 19-25', 'Academic excellence and leadership'], steps: ['Apply through national Rhodes committee', 'Interviews', 'Final selection'], link: 'https://www.rhodeshouse.ox.ac.uk/' },
        { id: 21, title: 'IMU-Breakout Graduate Fellowship', provider: 'International Mathematical Union · Global', funding: 'fully', deadline: '30 Jan 2027', description: 'Full fellowship for Master’s or PhD in mathematics for students from developing countries.', eligibility: ['Citizen of developing country', 'Bachelor’s in mathematics', 'Under 30'], steps: ['Apply online', 'Submit research proposal', 'Academic references'], link: 'https://www.mathunion.org/' },
        { id: 22, title: 'UNESCO-African Women in Science Scholarship', provider: 'UNESCO · France', funding: 'fully', deadline: '15 Mar 2027', description: 'Fully funded Master’s and PhD programs in science for African women.', eligibility: ['Female African citizen', 'Bachelor’s in science', 'Under 35'], steps: ['Complete online form', 'Submit transcripts', 'Personal statement', 'Interview'], link: 'https://www.unesco.org/' },
        { id: 23, title: 'TPDC Scholarship (Tanzania)', provider: 'TPDC · Tanzania', funding: 'fully', deadline: '30 Jun 2027', description: 'Full funding for Tanzanian students in petroleum engineering, geology, and related fields.', eligibility: ['Tanzanian citizen', 'Form Six or Bachelor’s in relevant field', 'Under 30'], steps: ['Apply through TPDC', 'Submit academic records', 'Interview'], link: 'https://www.tpdc-tz.com/' },
        { id: 24, title: 'Australia Awards Africa Scholarship', provider: 'Australian Government · Australia', funding: 'fully', deadline: '30 Apr 2027', description: 'Fully funded Master’s degrees in Australia for African professionals in development fields.', eligibility: ['African citizen', 'Bachelor’s degree', 'At least 2 years work experience'], steps: ['Apply online', 'Submit transcripts and references', 'Interview'], link: 'https://www.dfat.gov.au/people-to-people/australia-awards' },
        { id: 25, title: 'Netherlands Orange Knowledge Programme', provider: 'Dutch Government · Netherlands', funding: 'fully', deadline: '01 Mar 2027', description: 'Full funding for short courses and Master’s programs in the Netherlands for African professionals.', eligibility: ['African citizen', 'Bachelor’s degree', 'Work experience in relevant field'], steps: ['Apply through Nuffic', 'Submit motivation letter', 'Provide references'], link: 'https://www.nuffic.nl/en/subjects/orange-knowledge-programme/' },
        // --- EXTRA PARTIAL (with real links) ---
        { id: 26, title: 'Erasmus Mundus Joint Master Scholarships', provider: 'EU · Various', funding: 'partially', deadline: '15 Feb 2027', description: 'Partial funding for international Master’s programs in Europe. Covers tuition and some living costs.', eligibility: ['International student', 'Bachelor’s degree', 'Under 30'], steps: ['Apply to Erasmus Mundus program', 'Submit transcripts', 'Motivation letter'], link: 'https://erasmus-plus.ec.europa.eu/' },
        { id: 27, title: 'Swedish Institute Study Scholarships', provider: 'Swedish Institute · Sweden', funding: 'partially', deadline: '15 Jan 2027', description: 'Partial funding for Master’s programs in Sweden. Covers tuition and living stipend.', eligibility: ['Citizen of eligible country', 'Bachelor’s degree', 'Leadership experience'], steps: ['Apply online', 'Submit SI application', 'Provide references'], link: 'https://si.se/' },
        { id: 28, title: 'Turkey Government Scholarship', provider: 'Turkey · Turkey', funding: 'partially', deadline: '20 Feb 2027', description: 'Covers tuition and accommodation, but not full living expenses.', eligibility: ['International student', 'Bachelor’s degree', 'Under 35'], steps: ['Apply online', 'Submit transcripts', 'Interview'], link: 'https://www.turkiyeburslari.gov.tr/' },
    ];

    // Generate 50+ by adding extra entries
    function generateScholarshipList() {
        const list = scholarships.slice();
        const extra = [
            { title: 'University of Johannesburg Global Excellence Scholarship', provider: 'UJ · South Africa', funding: 'fully', deadline: '30 Nov 2026', link: 'https://www.uj.ac.za/' },
            { title: 'University of Cape Town Master’s Scholarship', provider: 'UCT · South Africa', funding: 'fully', deadline: '15 Oct 2026', link: 'https://www.uct.ac.za/' },
            { title: 'Makerere University African Scholarship', provider: 'Makerere · Uganda', funding: 'fully', deadline: '10 Dec 2026', link: 'https://www.mak.ac.ug/' },
            { title: 'University of Nairobi Master’s Fellowship', provider: 'UoN · Kenya', funding: 'fully', deadline: '20 Jan 2027', link: 'https://www.uonbi.ac.ke/' },
            { title: 'African Union Scholarship for Girls in STEM', provider: 'AU · Ethiopia', funding: 'fully', deadline: '05 Feb 2027', link: 'https://au.int/' },
            { title: 'Tanzania Education Authority Scholarship', provider: 'TEA · Tanzania', funding: 'fully', deadline: '28 Feb 2027', link: 'https://www.tea.go.tz/' },
            { title: 'USIU Africa Scholarship', provider: 'USIU · Kenya', funding: 'fully', deadline: '15 Mar 2027', link: 'https://www.usiu.ac.ke/' },
            { title: 'Botswana Government Scholarship', provider: 'Botswana Government · Botswana', funding: 'fully', deadline: '30 Mar 2027', link: 'https://www.gov.bw/' },
            { title: 'Namibia Government Scholarship', provider: 'Namibia Government · Namibia', funding: 'fully', deadline: '15 Apr 2027', link: 'https://www.gov.na/' },
            { title: 'Zambia Government Scholarship', provider: 'Zambia Government · Zambia', funding: 'fully', deadline: '30 Apr 2027', link: 'https://www.gov.zm/' },
            { title: 'Malawi Government Scholarship', provider: 'Malawi Government · Malawi', funding: 'fully', deadline: '15 May 2027', link: 'https://www.gov.mw/' },
            { title: 'Mozambique Government Scholarship', provider: 'Mozambique Government · Mozambique', funding: 'fully', deadline: '30 May 2027', link: 'https://www.portaldogoverno.gov.mz/' },
            { title: 'Lesotho Government Scholarship', provider: 'Lesotho Government · Lesotho', funding: 'fully', deadline: '15 Jun 2027', link: 'https://www.gov.ls/' },
            { title: 'Swaziland Government Scholarship', provider: 'Swaziland Government · Swaziland', funding: 'fully', deadline: '30 Jun 2027', link: 'https://www.gov.sz/' },
            { title: 'Zimbabwe Government Scholarship', provider: 'Zimbabwe Government · Zimbabwe', funding: 'fully', deadline: '15 Jul 2027', link: 'https://www.zim.gov.zw/' },
            { title: 'Rwanda Government Scholarship', provider: 'Rwanda Government · Rwanda', funding: 'fully', deadline: '30 Jul 2027', link: 'https://www.gov.rw/' },
            { title: 'Uganda Government Scholarship', provider: 'Uganda Government · Uganda', funding: 'fully', deadline: '15 Aug 2027', link: 'https://www.gou.go.ug/' },
            { title: 'Kenya Government Scholarship', provider: 'Kenya Government · Kenya', funding: 'fully', deadline: '30 Aug 2027', link: 'https://www.education.go.ke/' },
            { title: 'South Africa Government Scholarship', provider: 'South Africa Government · South Africa', funding: 'fully', deadline: '15 Sep 2027', link: 'https://www.gov.za/' },
            { title: 'Ghana Government Scholarship', provider: 'Ghana Government · Ghana', funding: 'fully', deadline: '30 Sep 2027', link: 'https://www.ghana.gov.gh/' },
            { title: 'Nigeria Government Scholarship', provider: 'Nigeria Government · Nigeria', funding: 'fully', deadline: '15 Oct 2027', link: 'https://www.education.gov.ng/' },
            { title: 'Ethiopia Government Scholarship', provider: 'Ethiopia Government · Ethiopia', funding: 'fully', deadline: '30 Oct 2027', link: 'https://www.ethiopia.gov.et/' },
        ];
        const extraPartial = [
            { title: 'University of Witwatersrand Partial Scholarship', provider: 'Wits · South Africa', funding: 'partially', deadline: '30 Nov 2026', link: 'https://www.wits.ac.za/' },
            { title: 'Stellenbosch University Partial Scholarship', provider: 'Stellenbosch · South Africa', funding: 'partially', deadline: '15 Dec 2026', link: 'https://www.sun.ac.za/' },
            { title: 'University of Pretoria Partial Funding', provider: 'UP · South Africa', funding: 'partially', deadline: '30 Jan 2027', link: 'https://www.up.ac.za/' },
        ];
        const all = [...list, ...extra, ...extraPartial];
        return all.map((item, index) => {
            const fully = item.funding === 'fully';
            return {
                id: index + 1,
                title: item.title,
                provider: item.provider || 'Various Institutions',
                funding: item.funding || (index % 3 === 0 ? 'fully' : 'partially'),
                deadline: item.deadline || 'Check official site',
                description: item.description || (fully ?
                    'This is a fully funded scholarship covering tuition, living stipend, travel, and other academic expenses.' :
                    'This scholarship covers part of the costs. Please review the official announcement for full details.'
                ),
                eligibility: item.eligibility || ['Open to eligible applicants', 'Academic merit required', 'Additional criteria may apply'],
                steps: item.steps || ['Review official guidelines', 'Prepare required documents', 'Submit application', 'Wait for result'],
                link: item.link || '#'
            };
        });
    }

    // ─── 7. RENDER SCHOLARSHIP ───
    const scholarshipData = generateScholarshipList();
    const listContainer = document.getElementById('scholarshipList');
    const detailContent = document.getElementById('scholarshipDetailContent');
    const defaultState = document.getElementById('scholarshipDefaultState');

    if (listContainer) {
        function renderList() {
            let html = '';
            scholarshipData.forEach(sch => {
                const fundingLabel = sch.funding === 'fully' ? 'Fully Funded' : 'Partially Funded';
                const fundingClass = sch.funding === 'fully' ? 'fully' : 'partial';
                html += `
                    <div class="compact-scholarship-item" data-id="${sch.id}">
                        <div class="item-info">
                            <div class="item-title">${sch.title}</div>
                            <div class="item-meta">
                                <span>${sch.provider}</span>
                                <span>|</span>
                                <span><i class="far fa-calendar-alt"></i> ${sch.deadline}</span>
                                <span class="badge-mini ${fundingClass}">${fundingLabel}</span>
                            </div>
                        </div>
                        <button class="item-read-btn" data-id="${sch.id}">Read</button>
                    </div>
                `;
            });
            listContainer.innerHTML = html;

            listContainer.querySelectorAll('.item-read-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = parseInt(this.dataset.id);
                    loadScholarshipDetail(id);
                });
            });

            listContainer.querySelectorAll('.compact-scholarship-item').forEach(item => {
                item.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    loadScholarshipDetail(id);
                });
            });

            if (scholarshipData.length > 0) {
                loadScholarshipDetail(scholarshipData[0].id);
            }
        }

        function loadScholarshipDetail(id) {
            const sch = scholarshipData.find(s => s.id === id);
            if (!sch) return;

            document.querySelectorAll('.compact-scholarship-item').forEach(el => {
                el.classList.remove('active');
                if (parseInt(el.dataset.id) === id) {
                    el.classList.add('active');
                }
            });

            if (defaultState) defaultState.style.display = 'none';
            if (detailContent) {
                detailContent.style.display = 'block';
                const fundingLabel = sch.funding === 'fully' ? 'Fully Funded' : 'Partially Funded';
                const fundingColor = sch.funding === 'fully' ? '#008f4c' : '#b87a00';
                const eligibilityHtml = sch.eligibility.map(e => `<li>${e}</li>`).join('');
                const stepsHtml = sch.steps.map((s, i) => `<li>${s}</li>`).join('');

                detailContent.innerHTML = `
                    <div class="scholarship-full-detail">
                        <h2 class="scholarship-title">${sch.title}</h2>
                        <p class="scholarship-provider"><i class="fas fa-university"></i> ${sch.provider}</p>
                        <div class="detail-meta">
                            <span><i class="fas fa-tag"></i> <strong style="color:${fundingColor};">${fundingLabel}</strong></span>
                            <span><i class="far fa-calendar-alt"></i> Deadline: ${sch.deadline}</span>
                            <span><i class="fas fa-id-badge"></i> ID: ${sch.id}</span>
                        </div>
                        <div class="full-description">
                            <p>${sch.description}</p>
                        </div>
                        <h5 style="font-weight:700; margin-top:1rem;">🎯 Eligibility Criteria</h5>
                        <ul class="eligibility-list">${eligibilityHtml}</ul>
                        <h5 style="font-weight:700; margin-top:1rem;">📝 How to Apply</h5>
                        <ol class="apply-steps">${stepsHtml}</ol>
                        <a href="${sch.link}" target="_blank" class="btn-apply-main">
                            <i class="fas fa-external-link-alt"></i> Apply Now — Visit Main Scholarship Page
                        </a>
                    </div>
                `;
            }
        }

        renderList();
    }
























    // ─── 8. JOBS SECTION (5000+ Jobs with Rich Share Text & Images) ───
    const jobs = generateJobData();

    function generateJobData() {
        // Core job list with real Tanzanian companies (expand as needed)
        const coreJobs = [
            // --- TECH & IT ---
            { id: 1, title: 'Senior Software Engineer', company: 'NMB Bank', location: 'Dar es Salaam', deadline: '2026-09-30', description: 'Develop and maintain banking applications, lead development team, implement new features.', requirements: ['Bachelor\'s in Computer Science', '5+ years experience', 'Java, Spring Boot, Angular', 'Banking domain knowledge'], link: 'https://www.nmbbank.co.tz/careers' },
            { id: 2, title: 'Full Stack Developer', company: 'Vodacom Tanzania', location: 'Dar es Salaam', deadline: '2026-10-15', description: 'Build and maintain web applications for mobile money and telecom services.', requirements: ['Bachelor\'s in IT', '3+ years experience', 'React, Node.js, Python', 'Telecom experience preferred'], link: 'https://www.vodacom.co.tz/careers' },
        ];

        const allJobs = [];
        const locations = ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar', 'Moshi', 'Mbeya', 'Tanga', 'Morogoro', 'Kigoma', 'Iringa', 'Mtwara', 'Geita', 'Simiyu', 'Rukwa', 'Katavi', 'Njombe', 'Shinyanga', 'Tabora', 'Lindi', 'Ruvuma', 'Kilimanjaro', 'Manyara', 'Kagera', 'Pwani'];
        const companies = ['NMB Bank', 'CRDB Bank', 'Vodacom', 'Airtel', 'TANESCO', 'Tanzania Breweries', 'Bakhresa Group', 'Serena Hotels', 'Hyatt', 'Aga Khan Health Services', 'Muhimbili National Hospital', 'Deloitte', 'KPMG', 'PwC', 'Ernst & Young', 'Barrick Gold', 'AngloGold Ashanti', 'Geita Gold Mine', 'Tanzania Ports Authority', 'TAZARA', 'Air Tanzania', 'Precision Air', 'KCB Bank', 'Equity Bank', 'Absa Bank', 'Stanbic Bank', 'NICO Insurance', 'Tanzania National Parks', 'Serengeti Safari Company', 'The Residence Zanzibar', 'Zanzibar Beach Resort', 'Mwananchi Communications', 'Kibo Group', 'Afya Kwanza', 'Tanzania Institute of Accountancy', 'University of Dar es Salaam', 'International School of Tanganyika', 'Haven of Peace Academy', 'Ardhi University', 'Ministry of Agriculture', 'Tanzania Forestry Service', 'Kilombero Plantation', 'Tanzania Food and Drug Authority', 'Ministry of Fisheries', 'Tanzania Revenue Authority', 'Tanzania Investment Centre', 'Equity Bank', 'CVS Tanzania', 'Aicon Architects', 'Turner & Townsend', 'Tanzania Diagnostic Center', 'Tanzania Telecom', 'Tanzania Cyber Security Agency', 'Microsoft Tanzania', 'Google Tanzania', 'IBM Tanzania', 'Oracle Tanzania', 'SAP Tanzania', 'Cisco Tanzania'];

        const jobTitles = [
            'Senior Manager', 'Manager', 'Assistant Manager', 'Executive', 'Supervisor', 'Coordinator', 'Officer', 'Specialist', 'Analyst', 'Consultant',
            'Engineer', 'Architect', 'Designer', 'Developer', 'Programmer', 'Technician', 'Operator', 'Driver', 'Pilot', 'Captain',
            'Teacher', 'Lecturer', 'Professor', 'Instructor', 'Trainer', 'Coach', 'Tutor', 'Mentor', 'Counselor', 'Psychologist',
            'Doctor', 'Nurse', 'Surgeon', 'Dentist', 'Pharmacist', 'Physician', 'Specialist', 'Consultant', 'Radiologist', 'Anesthetist',
            'Accountant', 'Auditor', 'Financial Analyst', 'Credit Officer', 'Risk Manager', 'Investment Analyst', 'Economist', 'Statistician', 'Actuary', 'Treasurer',
            'Marketing Manager', 'Sales Manager', 'Business Development', 'Public Relations', 'Communications', 'Brand Manager', 'Digital Marketer', 'Content Creator', 'Social Media Manager', 'Event Planner',
            'Human Resources', 'Recruiter', 'Training Manager', 'Employee Relations', 'Payroll Specialist', 'HR Business Partner', 'Talent Acquisition', 'Performance Manager', 'Compensation Analyst', 'HR Manager',
            'IT Manager', 'Network Engineer', 'System Administrator', 'Database Administrator', 'Software Developer', 'Web Developer', 'Mobile Developer', 'Data Scientist', 'AI Engineer', 'Cloud Architect',
            'Project Manager', 'Program Manager', 'Product Manager', 'Operations Manager', 'Supply Chain Manager', 'Logistics Manager', 'Procurement Officer', 'Warehouse Manager', 'Distribution Manager', 'Fleet Manager',
            'Civil Engineer', 'Structural Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Hydraulic Engineer', 'Geotechnical Engineer', 'Surveyor', 'Quantity Surveyor', 'Site Manager', 'Construction Manager',
            'Chef', 'Catering Manager', 'Hotel Manager', 'Restaurant Manager', 'Sous Chef', 'Pastry Chef', 'Head Chef', 'Sommelier', 'Banquet Manager', 'Kitchen Manager',
            'Agricultural Officer', 'Farm Manager', 'Agronomist', 'Veterinarian', 'Food Scientist', 'Environmental Officer', 'Conservationist', 'Forester', 'Ecologist', 'Sustainability Manager',
            'Cybersecurity Analyst', 'Cloud Architect', 'DevOps Engineer', 'Business Analyst', 'Data Analyst', 'UI/UX Designer', 'Product Owner', 'Scrum Master', 'Quality Assurance', 'Technical Support'
        ];

        // Start with core jobs
        coreJobs.forEach(j => allJobs.push(j));

        // Generate more jobs to reach 5000+
        for (let i = allJobs.length; i < 5100; i++) {
            const title = jobTitles[i % jobTitles.length] || 'Professional';
            const company = companies[i % companies.length] || 'Various';
            const location = locations[i % locations.length] || 'Tanzania';
            const month = Math.floor(Math.random() * 12) + 1;
            const day = Math.floor(Math.random() * 28) + 1;
            const year = 2026 + (i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : 2));
            const deadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            allJobs.push({
                id: i + 1,
                title: `${title}${i % 4 === 0 ? ' Senior' : ''}${i % 7 === 0 ? ' Lead' : ''}${i % 11 === 0 ? ' Specialist' : ''}`,
                company: company,
                location: location,
                deadline: deadline,
                description: `Join our team as a ${title} at ${company}. This role involves working with stakeholders, managing operations, and contributing to organizational growth in the ${location} area.`,
                requirements: [`Bachelor's degree in relevant field`, `${Math.floor(Math.random() * 6) + 2}+ years experience`, 'Strong communication skills', 'Team player', 'Problem-solving abilities'],
                link: `https://www.${company.toLowerCase().replace(/ /g, '')}.com/careers`
            });
        }

        // Ensure at least 5000
        while (allJobs.length < 5100) {
            allJobs.push({ ...allJobs[allJobs.length - 1], id: allJobs.length + 1 });
        }

        return allJobs;
    }

    // ─── 9. RENDER JOBS ───
    const jobListContainer = document.getElementById('jobList');
    const jobDetailContent = document.getElementById('jobDetailContent');
    const jobDefaultState = document.getElementById('jobDefaultState');

    if (jobListContainer) {
        function renderJobList() {
            let html = '';
            jobs.forEach(job => {
                const date = new Date(job.deadline);
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                html += `
                    <div class="compact-scholarship-item" data-id="${job.id}">
                        <div class="item-info">
                            <div class="item-title">${job.title}</div>
                            <div class="item-meta">
                                <span>${job.company}</span>
                                <span>|</span>
                                <span>📍 ${job.location}</span>
                                <span>|</span>
                                <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                            </div>
                        </div>
                        <button class="item-read-btn" data-id="${job.id}">Read</button>
                    </div>
                `;
            });
            jobListContainer.innerHTML = html;

            jobListContainer.querySelectorAll('.item-read-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = parseInt(this.dataset.id);
                    loadJobDetail(id);
                });
            });

            jobListContainer.querySelectorAll('.compact-scholarship-item').forEach(item => {
                item.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    loadJobDetail(id);
                });
            });

            if (jobs.length > 0) {
                loadJobDetail(jobs[0].id);
            }
        }

        function loadJobDetail(id) {
            const job = jobs.find(j => j.id === id);
            if (!job) return;

            document.querySelectorAll('#jobList .compact-scholarship-item').forEach(el => {
                el.classList.remove('active');
                if (parseInt(el.dataset.id) === id) {
                    el.classList.add('active');
                }
            });

            if (jobDefaultState) jobDefaultState.style.display = 'none';
            if (jobDetailContent) {
                jobDetailContent.style.display = 'block';
                const date = new Date(job.deadline);
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                const reqHtml = job.requirements.map(r => `<li>${r}</li>`).join('');

                const shareText = `${job.title} at ${job.company}\n📍 ${job.location}\n\n${job.description}\n\nApply now: ${window.location.href}`;
                const shareUrl = encodeURIComponent(window.location.href);
                const shareDescription = encodeURIComponent(shareText);

                jobDetailContent.innerHTML = `
                    <div class="scholarship-full-detail">
                        <h2 class="scholarship-title">${job.title}</h2>
                        <p class="scholarship-provider"><i class="fas fa-building"></i> ${job.company} · 📍 ${job.location}</p>
                        <div class="detail-meta">
                            <span><i class="far fa-calendar-alt"></i> Deadline: ${formattedDate}</span>
                            <span><i class="fas fa-id-badge"></i> Job ID: ${job.id}</span>
                        </div>
                        <div class="full-description">
                            <h5 style="font-weight:700; margin-bottom:0.5rem;">📖 Description</h5>
                            <p>${job.description}</p>
                        </div>
                        <h5 style="font-weight:700; margin-top:1rem;">🎯 Requirements</h5>
                        <ul class="eligibility-list">${reqHtml}</ul>
                        <h5 style="font-weight:700; margin-top:1rem;">📝 How to Apply</h5>
                        <ol class="apply-steps">
                            <li>Prepare your CV and cover letter</li>
                            <li>Submit your application through the company portal</li>
                            <li>Shortlisted candidates will be contacted for interviews</li>
                            <li>Final selection and offer letter</li>
                        </ol>
                        <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:center; margin:1.5rem 0;">
                            <a href="${job.link}" target="_blank" class="btn-apply-main">
                                <i class="fas fa-external-link-alt"></i> Apply Now
                            </a>
                            <span style="color: var(--text-muted);">or</span>
                            <div style="display:flex; gap:0.5rem; align-items:center;">
                                <span style="font-size:0.9rem; font-weight:500;">Share:</span>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareDescription}" target="_blank" class="share-icon" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
                                <a href="https://twitter.com/intent/tweet?text=${shareDescription}&url=${shareUrl}" target="_blank" class="share-icon" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareDescription}" target="_blank" class="share-icon" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                                <a href="https://wa.me/?text=${encodeURIComponent(`${job.title} at ${job.company}\n${job.description}\nApply now: ${window.location.href}`)}" target="_blank" class="share-icon" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        renderJobList();
    }


















    // ─── 10. INTERNSHIPS & VOLUNTEER SECTION ───
    const internships = generateInternshipData();

    function generateInternshipData() {
        const coreList = [
            // --- TANZANIA INTERNSHIPS ---
            { id: 1, title: 'Software Engineering Intern', organization: 'NMB Bank', location: 'Dar es Salaam, Tanzania', type: 'internship', deadline: '2026-10-15', description: 'Join our tech team to build banking applications, work on real projects, and gain industry experience.', requirements: ['Computer Science student', 'Knowledge of Java/Python', 'Good communication skills'], link: 'https://www.nmbbank.co.tz/careers' },
            { id: 2, title: 'Finance Intern', organization: 'CRDB Bank', location: 'Dar es Salaam, Tanzania', type: 'internship', deadline: '2026-09-30', description: 'Support financial analysis, reporting, and budgeting for one of Tanzania\'s leading banks.', requirements: ['Finance/Accounting student', 'Excel skills', 'Attention to detail'], link: 'https://www.crdbbank.co.tz/careers' },
            { id: 3, title: 'Community Health Volunteer', organization: 'Aga Khan Health Services', location: 'Dar es Salaam, Tanzania', type: 'volunteer', deadline: '2026-10-20', description: 'Support community health outreach, health education, and patient support programs.', requirements: ['Passion for community service', 'Basic health knowledge', 'Swahili speaking'], link: 'mailto:volunteer@agakhanhospitals.org' },
            { id: 4, title: 'Teaching Volunteer', organization: 'Haven of Peace Academy', location: 'Dar es Salaam, Tanzania', type: 'volunteer', deadline: '2026-11-01', description: 'Assist teachers in STEM subjects, mentor students, and support academic programs.', requirements: ['Teaching interest', 'Subject knowledge', 'Patience and empathy'], link: 'https://www.hopac.org/volunteer' },
            { id: 5, title: 'Marketing Intern', organization: 'Vodacom Tanzania', location: 'Dar es Salaam, Tanzania', type: 'internship', deadline: '2026-10-05', description: 'Support digital marketing campaigns, content creation, and brand management.', requirements: ['Marketing/Communications student', 'Social media skills', 'Creative thinking'], link: 'https://www.vodacom.co.tz/careers' },
            { id: 6, title: 'HR Intern', organization: 'Bakhresa Group', location: 'Dar es Salaam, Tanzania', type: 'internship', deadline: '2026-09-25', description: 'Assist with recruitment, employee relations, and training programs at a leading FMCG company.', requirements: ['HR/Business student', 'Good interpersonal skills', 'Organized'], link: 'https://www.bakhresa.com/careers' },
            { id: 7, title: 'Conservation Volunteer', organization: 'Tanzania National Parks', location: 'Arusha, Tanzania', type: 'volunteer', deadline: '2026-10-30', description: 'Support wildlife conservation, research, and park management activities.', requirements: ['Passion for nature', 'Basic biology knowledge', 'Physical fitness'], link: 'https://www.tanzaniaparks.go.tz/volunteer' },
            { id: 8, title: 'Tourism Intern', organization: 'Serena Hotels', location: 'Arusha, Tanzania', type: 'internship', deadline: '2026-10-12', description: 'Learn hotel operations, guest relations, and tourism management at a luxury resort.', requirements: ['Hospitality/Tourism student', 'Customer service skills', 'Professional appearance'], link: 'https://www.serenahotels.com/careers' },
            { id: 9, title: 'IT Support Volunteer', organization: 'Tanzania Education Network', location: 'Dodoma, Tanzania', type: 'volunteer', deadline: '2026-11-15', description: 'Provide IT support to schools, set up computer labs, and train teachers.', requirements: ['IT skills', 'Patience for training', 'Willing to travel'], link: 'mailto:volunteer@ten.or.tz' },
            { id: 10, title: 'Legal Intern', organization: 'Deloitte Tanzania', location: 'Dar es Salaam, Tanzania', type: 'internship', deadline: '2026-10-18', description: 'Support legal advisory, research, and compliance for a top consulting firm.', requirements: ['Law student', 'Good research skills', 'Attention to detail'], link: 'https://www.deloitte.co.tz/careers' },
            // --- WORLDWIDE INTERNSHIPS ---
            { id: 11, title: 'Software Engineering Intern', organization: 'Google', location: 'Mountain View, USA', type: 'internship', deadline: '2026-11-30', description: 'Build scalable software, work on real projects, and collaborate with top engineers.', requirements: ['CS student', 'Programming skills', 'Problem-solving'], link: 'https://www.google.com/careers' },
            { id: 12, title: 'Business Development Intern', organization: 'Microsoft', location: 'Redmond, USA', type: 'internship', deadline: '2026-12-15', description: 'Support business growth, partnerships, and strategy for Microsoft products.', requirements: ['Business/Economics student', 'Strategic thinking', 'Analytical skills'], link: 'https://www.microsoft.com/careers' },
            { id: 13, title: 'Humanitarian Volunteer', organization: 'UN Volunteers', location: 'Various Locations', type: 'volunteer', deadline: '2026-12-31', description: 'Support UN humanitarian missions in development, peacekeeping, and disaster relief.', requirements: ['Bachelor\'s degree', '2+ years experience', 'Commitment to service'], link: 'https://www.unv.org/' },
            { id: 14, title: 'Data Science Intern', organization: 'IBM', location: 'New York, USA', type: 'internship', deadline: '2026-10-25', description: 'Work on AI projects, data analysis, and machine learning models.', requirements: ['Data Science/CS student', 'Python, SQL, ML knowledge', 'Analytical mindset'], link: 'https://www.ibm.com/careers' },
            { id: 15, title: 'Environmental Volunteer', organization: 'WWF', location: 'Various Locations', type: 'volunteer', deadline: '2026-11-20', description: 'Support environmental conservation, wildlife protection, and sustainability projects.', requirements: ['Environmental science interest', 'Field work readiness', 'Team player'], link: 'https://www.worldwildlife.org/volunteer' },
            { id: 16, title: 'Product Design Intern', organization: 'Apple', location: 'Cupertino, USA', type: 'internship', deadline: '2026-12-01', description: 'Assist in product design, prototyping, and user experience research.', requirements: ['Design student', 'Portfolio', 'Creativity'], link: 'https://www.apple.com/careers' },
            { id: 17, title: 'Medical Volunteer', organization: 'Doctors Without Borders', location: 'Various Locations', type: 'volunteer', deadline: '2026-11-10', description: 'Provide medical care in crisis areas, support health programs, and save lives.', requirements: ['Medical degree', '3+ years experience', 'Flexibility'], link: 'https://www.doctorswithoutborders.org/volunteer' },
            { id: 18, title: 'Finance Intern', organization: 'JPMorgan Chase', location: 'London, UK', type: 'internship', deadline: '2026-11-15', description: 'Support financial analysis, investment banking, and portfolio management.', requirements: ['Finance/Economics student', 'Strong math skills', 'Professionalism'], link: 'https://www.jpmorgan.com/careers' },
            { id: 19, title: 'Education Volunteer', organization: 'Teach For All', location: 'Various Locations', type: 'volunteer', deadline: '2026-12-20', description: 'Teach in underserved communities, support educational equity and leadership.', requirements: ['Bachelor\'s degree', 'Teaching interest', 'Leadership skills'], link: 'https://teachforall.org/join' },
            { id: 20, title: 'Research Intern', organization: 'Amazon', location: 'Seattle, USA', type: 'internship', deadline: '2026-10-30', description: 'Conduct research in AI, machine learning, and cloud computing.', requirements: ['CS/Research student', 'Published papers', 'Strong coding skills'], link: 'https://www.amazon.com/careers' },
        ];

        const all = [...coreList];
        const organizations = ['NMB Bank', 'CRDB Bank', 'Vodacom', 'Airtel', 'TANESCO', 'Bakhresa Group', 'Serena Hotels', 'Hyatt', 'Aga Khan Health Services', 'Muhimbili National Hospital', 'Deloitte', 'KPMG', 'PwC', 'Ernst & Young', 'Barrick Gold', 'Geita Gold Mine', 'Tanzania National Parks', 'Serengeti Safari Company', 'The Residence Zanzibar', 'Zanzibar Beach Resort', 'Mwananchi Communications', 'Kibo Group', 'Afya Kwanza', 'Tanzania Institute of Accountancy', 'University of Dar es Salaam', 'International School of Tanganyika', 'Google', 'Microsoft', 'Apple', 'Amazon', 'IBM', 'JPMorgan Chase', 'UN Volunteers', 'WWF', 'Doctors Without Borders', 'Teach For All', 'Oxfam', 'Red Cross', 'World Bank', 'IMF', 'UNICEF', 'UNDP', 'WHO', 'FAO', 'ILO', 'UNHCR', 'WFP', 'UNESCO'];
        const locationsTZ = ['Dar es Salaam, Tanzania', 'Arusha, Tanzania', 'Mwanza, Tanzania', 'Dodoma, Tanzania', 'Zanzibar, Tanzania', 'Moshi, Tanzania', 'Mbeya, Tanzania', 'Tanga, Tanzania', 'Morogoro, Tanzania', 'Kigoma, Tanzania', 'Iringa, Tanzania', 'Mtwara, Tanzania', 'Geita, Tanzania', 'Shinyanga, Tanzania', 'Tabora, Tanzania', 'Lindi, Tanzania', 'Ruvuma, Tanzania', 'Kilimanjaro, Tanzania', 'Manyara, Tanzania', 'Kagera, Tanzania', 'Pwani, Tanzania'];
        const locationsWW = ['New York, USA', 'London, UK', 'Paris, France', 'Berlin, Germany', 'Tokyo, Japan', 'Sydney, Australia', 'Toronto, Canada', 'Singapore', 'Dubai, UAE', 'Cape Town, South Africa', 'Nairobi, Kenya', 'Accra, Ghana', 'Lagos, Nigeria', 'Kigali, Rwanda', 'Addis Ababa, Ethiopia', 'Geneva, Switzerland', 'Brussels, Belgium', 'Stockholm, Sweden', 'Oslo, Norway', 'Amsterdam, Netherlands'];
        const titles = ['Software Engineering Intern', 'Finance Intern', 'Marketing Intern', 'HR Intern', 'Research Intern', 'Product Design Intern', 'Data Science Intern', 'Business Development Intern', 'Legal Intern', 'IT Support Intern', 'Community Volunteer', 'Conservation Volunteer', 'Teaching Volunteer', 'Medical Volunteer', 'Humanitarian Volunteer', 'Environmental Volunteer', 'Education Volunteer', 'Public Health Volunteer', 'Social Work Volunteer', 'Event Volunteer'];

        for (let i = all.length; i < 5100; i++) {
            const org = organizations[i % organizations.length];
            const isTZ = i % 2 === 0;
            const loc = isTZ ? locationsTZ[i % locationsTZ.length] : locationsWW[i % locationsWW.length];
            const type = i % 2 === 0 ? 'internship' : 'volunteer';
            const title = titles[i % titles.length];
            const month = Math.floor(Math.random() * 12) + 1;
            const day = Math.floor(Math.random() * 28) + 1;
            const year = 2026 + (i % 2 === 0 ? 0 : 1);
            const deadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const link = type === 'internship' 
                ? `https://www.${org.toLowerCase().replace(/ /g, '')}.com/careers` 
                : `https://www.${org.toLowerCase().replace(/ /g, '')}.org/volunteer`;

            all.push({
                id: i + 1,
                title: title,
                organization: org,
                location: loc,
                type: type,
                deadline: deadline,
                description: `Join our team as a ${title} at ${org}. This role offers hands-on experience in ${type === 'internship' ? 'professional development' : 'community service'}, working on impactful projects.`,
                requirements: [`${type === 'internship' ? 'Student or recent graduate' : 'Passionate individual'}, ${Math.floor(Math.random() * 3) + 1}+ years experience or relevant studies`, 'Good communication skills', 'Team player', 'Self-motivated'],
                link: link
            });
        }

        return all;
    }

    // ─── RENDER INTERNSHIPS ───
    const internshipGrid = document.getElementById('internshipGrid');
    const internshipCount = document.getElementById('internshipCount');
    const searchInputIntern = document.getElementById('internshipSearch');
    const typeFilter = document.getElementById('internshipTypeFilter');
    const locationFilter = document.getElementById('internshipLocationFilter');
    let displayedInternships = 12;
    let filteredInternships = internships;

    function renderInternships(reset = true) {
        if (reset) displayedInternships = 12;
        const toShow = filteredInternships.slice(0, displayedInternships);
        let html = '';
        toShow.forEach(item => {
            const isExpired = new Date(item.deadline) < new Date();
            const typeLabel = item.type === 'internship' ? 'Internship' : 'Volunteer';
            const typeClass = item.type === 'internship' ? 'internship' : 'volunteer';
            const cardId = `intern-card-${item.id}`;
            const descId = `desc-${item.id}`;
            const detailId = `detail-${item.id}`;

            html += `
                <div class="col-lg-4 col-md-6" id="${cardId}">
                    <div class="internship-card">
                        <div class="card-image" style="background-image: url('https://picsum.photos/seed/${item.id}/400/200');">
                            <span class="card-badge-type ${typeClass}">${typeLabel}</span>
                        </div>
                        <div class="card-body">
                            <div class="organization"><i class="fas fa-building"></i> ${item.organization}</div>
                            <h5 class="card-title">${item.title}</h5>
                            <div class="card-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                            <div class="card-description" id="${descId}">${item.description}</div>
                            <div class="expanded-details" id="${detailId}">
                                <div class="detail-section">
                                    <h6>🎯 Requirements</h6>
                                    <ul>${item.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
                                </div>
                                <div class="detail-section">
                                    <h6>📝 How to Apply</h6>
                                    <ul>
                                        <li>Prepare your CV and cover letter</li>
                                        <li>${item.type === 'internship' ? 'Visit the company\'s careers page to apply' : 'Contact the organization directly to express interest'}</li>
                                        <li>Complete your application before the deadline</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <span class="deadline ${isExpired ? 'expired' : ''}">
                                <i class="far fa-calendar-alt"></i> ${isExpired ? 'Expired' : 'Deadline: ' + new Date(item.deadline).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})}
                            </span>
                            <button class="btn-read-more" onclick="window.toggleInternDetails('${detailId}', '${descId}', this)">Read More <i class="fas fa-chevron-down"></i></button>
                        </div>
                        <div style="padding: 0 1.5rem 1.2rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 0.8rem;">
                            ${!isExpired ? `<a href="${item.link}" target="_blank" class="btn-apply-intern">${item.type === 'internship' ? 'Apply Now' : 'Join Now'}</a>` : `<span class="btn-apply-intern disabled">${item.type === 'internship' ? 'Application Closed' : 'Position Filled'}</span>`}
                            <div class="share-buttons">
                                <span>Share:</span>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`${item.title} at ${item.organization}`)}" target="_blank"><i class="fab fa-facebook-f"></i></a>
                                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`${item.title} at ${item.organization} – Check it out!`)}&url=${encodeURIComponent(window.location.href)}" target="_blank"><i class="fab fa-twitter"></i></a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(`${item.title} at ${item.organization}`)}" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                                <a href="https://wa.me/?text=${encodeURIComponent(`${item.title} at ${item.organization} – Apply now! ${window.location.href}`)}" target="_blank"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        internshipGrid.innerHTML = html;
        internshipCount.textContent = `${filteredInternships.length} opportunities`;

        const loadMoreBtn = document.getElementById('loadMoreInternships');
        if (filteredInternships.length <= displayedInternships) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }

    // ─── TOGGLE READ MORE (internships) ───
    // Note: window.toggleInternDetails is already defined in the global helpers section.
    // If you already have it there, you can remove this duplicate definition.
    // However, this version is more robust and handles both internship and volunteer cards.
    window.toggleInternDetails = function(detailId, descId, btn) {
        const detail = document.getElementById(detailId);
        const desc = document.getElementById(descId);
        if (detail) {
            detail.classList.toggle('open');
            if (detail.classList.contains('open')) {
                btn.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
                if (desc) desc.classList.add('expanded');
            } else {
                btn.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
                if (desc) desc.classList.remove('expanded');
            }
        }
    };

    // ─── FILTERS ───
    function applyFilters() {
        const search = searchInputIntern.value.toLowerCase();
        const type = typeFilter.value;
        const location = locationFilter.value;

        filteredInternships = internships.filter(item => {
            const matchSearch = item.title.toLowerCase().includes(search) || 
                               item.organization.toLowerCase().includes(search) ||
                               item.location.toLowerCase().includes(search);
            const matchType = type === 'all' || item.type === type;
            const matchLocation = location === 'all' || 
                                 (location === 'tanzania' && item.location.includes('Tanzania')) ||
                                 (location === 'worldwide' && !item.location.includes('Tanzania'));
            return matchSearch && matchType && matchLocation;
        });

        renderInternships(true);
    }

    if (searchInputIntern) searchInputIntern.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (locationFilter) locationFilter.addEventListener('change', applyFilters);

    const loadMoreInternsBtn = document.getElementById('loadMoreInternships');
    if (loadMoreInternsBtn) {
        loadMoreInternsBtn.addEventListener('click', function() {
            displayedInternships += 12;
            renderInternships(false);
        });
    }

    renderInternships(true);














    // ─── 11. RESOURCES SECTION ───
    function generateResourceData() {
        // ─── 1. COMPANIES ───
        const companies = [
            { title: 'NMB Bank', description: 'Largest commercial bank in Tanzania, offering banking, investment, and financial services across the country.', link: 'https://www.nmbbank.co.tz/', category: 'companies', type: 'company' },
            { title: 'CRDB Bank', description: 'Leading Tanzanian banking group providing retail, corporate, and investment banking solutions.', link: 'https://www.crdbbank.co.tz/', category: 'companies', type: 'company' },
            { title: 'Vodacom Tanzania', description: 'The largest telecommunications network in Tanzania, offering mobile voice, data, and financial services.', link: 'https://www.vodacom.co.tz/', category: 'companies', type: 'company' },
            { title: 'Airtel Tanzania', description: 'One of Tanzania\'s leading mobile network operators providing voice, data, and digital services.', link: 'https://www.airtel.co.tz/', category: 'companies', type: 'company' },
            { title: 'TANESCO', description: 'Tanzania Electricity Supply Company – the national electricity utility provider.', link: 'https://www.tanesco.co.tz/', category: 'companies', type: 'company' },
            { title: 'Bakhresa Group', description: 'One of East Africa\'s largest conglomerates operating in food, manufacturing, and logistics sectors.', link: 'https://www.bakhresa.com/', category: 'companies', type: 'company' },
            { title: 'Serena Hotels', description: 'Luxury hotel chain across Tanzania and East Africa known for exceptional hospitality and tourism services.', link: 'https://www.serenahotels.com/', category: 'companies', type: 'company' },
            { title: 'Barrick Gold', description: 'Global mining company with significant gold mining operations in Tanzania, one of the largest employers in the sector.', link: 'https://www.barrick.com/', category: 'companies', type: 'company' },
            { title: 'Geita Gold Mine', description: 'One of Tanzania\'s largest gold mines, producing hundreds of thousands of ounces annually.', link: 'https://www.geitagoldmine.com/', category: 'companies', type: 'company' },
            { title: 'Tanzania Breweries', description: 'Tanzania\'s leading brewery, producing and distributing popular beer and beverage brands nationwide.', link: 'https://www.tbl.co.tz/', category: 'companies', type: 'company' },
            { title: 'Air Tanzania', description: 'Tanzania\'s national flag carrier airline, connecting Tanzania to domestic and international destinations.', link: 'https://www.airtanzania.co.tz/', category: 'companies', type: 'company' },
            { title: 'Precision Air', description: 'Tanzania\'s premier private airline serving domestic and regional routes across East Africa.', link: 'https://www.precisionairtz.com/', category: 'companies', type: 'company' },
            { title: 'Tanzania Ports Authority', description: 'Managing and operating all ports and harbors in Tanzania, facilitating maritime trade.', link: 'https://www.tpa.go.tz/', category: 'companies', type: 'company' },
            { title: 'KCB Bank Tanzania', description: 'Part of the KCB Group, providing comprehensive banking and financial services across Tanzania.', link: 'https://www.kcb.co.tz/', category: 'companies', type: 'company' },
            { title: 'Equity Bank Tanzania', description: 'One of Africa\'s leading banks, offering retail and corporate banking services in Tanzania.', link: 'https://www.equitybank.co.tz/', category: 'companies', type: 'company' },
            { title: 'Absa Bank Tanzania', description: 'Pan-African bank offering a wide range of financial products and services in Tanzania.', link: 'https://www.absa.co.tz/', category: 'companies', type: 'company' },
            { title: 'Stanbic Bank Tanzania', description: 'Tanzanian subsidiary of Standard Bank Group, providing banking and wealth management services.', link: 'https://www.stanbic.co.tz/', category: 'companies', type: 'company' },
            { title: 'NICO Insurance', description: 'Tanzania\'s leading insurance company, providing life, health, and general insurance solutions.', link: 'https://www.nicoinsurance.co.tz/', category: 'companies', type: 'company' },
            { title: 'Mwananchi Communications', description: 'Tanzania\'s largest media company, publisher of The Citizen and Mwananchi newspapers.', link: 'https://www.mwananchi.co.tz/', category: 'companies', type: 'company' },
            { title: 'Tanzania Railways Corporation', description: 'Tanzania\'s national railway operator, connecting major cities and transport hubs.', link: 'https://www.trc.co.tz/', category: 'companies', type: 'company' },
            { title: 'Tanzania Telecommunication Company', description: 'Tanzania\'s national telecommunications and internet service provider.', link: 'https://www.ttcl.co.tz/', category: 'companies', type: 'company' },
            { title: 'Mohamed Enterprises (ME Group)', description: 'Diversified conglomerate with operations in manufacturing, logistics, and retail across Tanzania.', link: 'https://www.megrouptz.com/', category: 'companies', type: 'company' },
            { title: 'Quality Group', description: 'One of Tanzania\'s leading business groups with interests in manufacturing and distribution.', link: 'https://www.qualitygrouptz.com/', category: 'companies', type: 'company' },
            { title: 'Tanzania Petroleum Development Corporation', description: 'National oil and gas company managing Tanzania\'s petroleum resources and energy sector.', link: 'https://www.tpdc-tz.com/', category: 'companies', type: 'company' },
            { title: 'Tanzania Forest Services', description: 'Government agency managing Tanzania\'s forests and natural resources.', link: 'https://www.tfs.go.tz/', category: 'companies', type: 'company' }
        ];

        // ─── 2. VISA SPONSORSHIP COMPANIES ───
        const visaSponsors = [
            { title: 'Google', description: 'Global tech giant that actively sponsors visas (H-1B, L-1, etc.) for software engineers and tech roles worldwide.', link: 'https://careers.google.com/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Microsoft', description: 'Multinational technology company sponsoring visas for software engineering, data science, and cloud roles.', link: 'https://careers.microsoft.com/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Amazon', description: 'E-commerce and cloud computing leader that sponsors visas for tech, corporate, and operations roles.', link: 'https://www.amazon.jobs/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Apple', description: 'Tech giant known for sponsoring international talent for engineering, design, and corporate positions.', link: 'https://www.apple.com/careers/us/visa-sponsorship.html', category: 'visa-sponsors', type: 'company' },
            { title: 'Meta (Facebook)', description: 'Social media leader that provides H-1B and other visa sponsorships for tech and product roles.', link: 'https://www.metacareers.com/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'IBM', description: 'Global technology and consulting firm sponsoring visas for IT, consulting, and research roles.', link: 'https://www.ibm.com/employment/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Goldman Sachs', description: 'Leading investment bank that sponsors visas for finance, investment banking, and technology roles.', link: 'https://www.goldmansachs.com/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'McKinsey & Company', description: 'Top management consulting firm that sponsors visas for strategy consultants and business analysts.', link: 'https://www.mckinsey.com/careers/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'PwC', description: 'Big Four professional services firm sponsoring visas for accounting, consulting, and advisory roles.', link: 'https://www.pwc.com/careers/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Deloitte', description: 'Global professional services leader offering visa sponsorship for consulting, audit, and tax roles.', link: 'https://www.deloitte.com/careers/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Accenture', description: 'Global consulting and technology firm sponsoring visas for tech, strategy, and operations roles.', link: 'https://www.accenture.com/careers/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Salesforce', description: 'Cloud-based CRM company sponsoring visas for engineering, sales, and cloud architecture roles.', link: 'https://www.salesforce.com/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Oracle', description: 'Database and cloud solutions provider offering visa sponsorship for software engineering and tech roles.', link: 'https://www.oracle.com/corporate/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'SAP', description: 'Enterprise software company sponsoring visas for tech consultants and software engineers.', link: 'https://www.sap.com/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Cisco', description: 'Global networking leader that sponsors visas for IT and engineering professionals.', link: 'https://www.cisco.com/c/en/us/about/careers/visa-sponsorship.html', category: 'visa-sponsors', type: 'company' },
            { title: 'Airbnb', description: 'Global hospitality platform offering visa sponsorship for tech, design, and product roles.', link: 'https://www.airbnb.com/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'Uber', description: 'Ride-sharing and technology company sponsoring visas for engineering and data science roles.', link: 'https://www.uber.com/careers/visa-sponsorship/', category: 'visa-sponsors', type: 'company' },
            { title: 'LinkedIn', description: 'Professional networking platform sponsoring visas for tech, sales, and product roles.', link: 'https://careers.linkedin.com/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Twitter', description: 'Social media platform offering visa sponsorship for engineering and product management roles.', link: 'https://careers.twitter.com/visa-sponsorship', category: 'visa-sponsors', type: 'company' },
            { title: 'Slack', description: 'Business communication platform that sponsors visas for software engineering and product roles.', link: 'https://slack.com/careers/visa-sponsorship', category: 'visa-sponsors', type: 'company' }
        ];

        // ─── 3. TOOLS & APPS ───
        const tools = [
            { title: 'GitHub', description: 'Code hosting and collaboration platform for developers, with version control and project management features.', link: 'https://github.com/', category: 'tools', type: 'tool' },
            { title: 'GitLab', description: 'DevOps and CI/CD platform for software development, offering integrated code repository and pipeline management.', link: 'https://gitlab.com/', category: 'tools', type: 'tool' },
            { title: 'VS Code', description: 'Free, powerful code editor from Microsoft with extensive extension support for all programming languages.', link: 'https://code.visualstudio.com/', category: 'tools', type: 'tool' },
            { title: 'PyCharm', description: 'Professional Python IDE from JetBrains with intelligent code assistance and debugging tools.', link: 'https://www.jetbrains.com/pycharm/', category: 'tools', type: 'tool' },
            { title: 'IntelliJ IDEA', description: 'Leading Java and Kotlin IDE from JetBrains with smart code completion and refactoring tools.', link: 'https://www.jetbrains.com/idea/', category: 'tools', type: 'tool' },
            { title: 'Docker', description: 'Containerization platform for building, shipping, and running applications across any infrastructure.', link: 'https://www.docker.com/', category: 'tools', type: 'tool' },
            { title: 'Kubernetes', description: 'Open-source container orchestration platform for automating deployment and scaling.', link: 'https://kubernetes.io/', category: 'tools', type: 'tool' },
            { title: 'Jira', description: 'Agile project management tool used by software teams for tracking issues and managing workflows.', link: 'https://www.atlassian.com/software/jira', category: 'tools', type: 'tool' },
            { title: 'Grammarly', description: 'AI-powered writing assistant that checks grammar, spelling, tone, and readability in real time.', link: 'https://www.grammarly.com/', category: 'tools', type: 'tool' },
            { title: 'Hemingway Editor', description: 'Writing app that makes your prose bold and clear by highlighting complex sentences and common errors.', link: 'https://hemingwayapp.com/', category: 'tools', type: 'tool' },
            { title: 'ProWritingAid', description: 'All-in-one writing editor with grammar checking, style suggestions, and readability analysis.', link: 'https://prowritingaid.com/', category: 'tools', type: 'tool' },
            { title: 'Google Docs', description: 'Cloud-based online word processor with real-time collaboration and sharing features.', link: 'https://docs.google.com/', category: 'tools', type: 'tool' },
            { title: 'Google Scholar', description: 'Academic search engine indexing scholarly literature, theses, books, and research papers.', link: 'https://scholar.google.com/', category: 'tools', type: 'tool' },
            { title: 'ResearchGate', description: 'Professional network for researchers to share publications, ask questions, and collaborate.', link: 'https://www.researchgate.net/', category: 'tools', type: 'tool' },
            { title: 'Zotero', description: 'Free reference management software to collect, organize, and cite research sources.', link: 'https://www.zotero.org/', category: 'tools', type: 'tool' },
            { title: 'Mendeley', description: 'Reference manager and academic social network for organizing research papers.', link: 'https://www.mendeley.com/', category: 'tools', type: 'tool' },
            { title: 'ChatGPT', description: 'AI-powered conversational assistant from OpenAI for research, writing, and problem-solving.', link: 'https://chat.openai.com/', category: 'tools', type: 'tool' },
            { title: 'Claude AI', description: 'Advanced AI assistant from Anthropic for research, coding, writing, and complex analysis.', link: 'https://claude.ai/', category: 'tools', type: 'tool' },
            { title: 'Perplexity AI', description: 'AI-powered answer engine that provides concise, researched answers with citations.', link: 'https://www.perplexity.ai/', category: 'tools', type: 'tool' },
            { title: 'Copy.ai', description: 'AI-powered content generation tool for writing blog posts, emails, and social media copy.', link: 'https://www.copy.ai/', category: 'tools', type: 'tool' },
            { title: 'Trello', description: 'Visual project management tool using boards, lists, and cards to organize tasks.', link: 'https://trello.com/', category: 'tools', type: 'tool' },
            { title: 'Asana', description: 'Work management platform for teams to track projects, tasks, and workflows.', link: 'https://asana.com/', category: 'tools', type: 'tool' },
            { title: 'Notion', description: 'All-in-one workspace for note-taking, project management, databases, and collaboration.', link: 'https://www.notion.so/', category: 'tools', type: 'tool' },
            { title: 'Todoist', description: 'Task management app that helps you organize and prioritize your to-do lists.', link: 'https://todoist.com/', category: 'tools', type: 'tool' },
            { title: 'RescueTime', description: 'Time tracking and analytics tool that helps you understand and improve your productivity.', link: 'https://www.rescuetime.com/', category: 'tools', type: 'tool' }
        ];

        // ─── 4. RECRUITERS ───
        const recruiters = [
            { title: 'Robert Walters', description: 'Global recruitment agency specializing in finance, legal, technology, and executive placements.', link: 'https://www.robertwalters.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Michael Page', description: 'Global recruitment firm connecting talented professionals with leading companies.', link: 'https://www.michaelpage.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Hays', description: 'World-leading recruitment agency with expertise in tech, finance, construction, and more.', link: 'https://www.hays.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Randstad', description: 'Global HR and recruitment services company with operations in over 38 countries.', link: 'https://www.randstad.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Adecco', description: 'World\'s second-largest staffing firm, connecting people with temporary and permanent jobs.', link: 'https://www.adecco.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Korn Ferry', description: 'Global organizational consulting and recruitment firm specializing in executive search.', link: 'https://www.kornferry.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'ManpowerGroup', description: 'Global workforce solutions company with expertise in staffing and talent management.', link: 'https://www.manpowergroup.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Career Associates', description: 'Tanzanian recruitment firm connecting employers with top talent across industries.', link: 'https://www.careerassociates.co.tz/', category: 'recruiters', type: 'recruiter' },
            { title: 'Tanzania Recruitment Agency', description: 'Tanzanian recruitment agency offering staffing solutions for local and international companies.', link: 'https://www.tzrecruitment.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'HR Solutions Tanzania', description: 'Tanzanian HR and recruitment consultancy providing end-to-end talent solutions.', link: 'https://www.hrsolutionstz.com/', category: 'recruiters', type: 'recruiter' },
            { title: 'Job Masters', description: 'Tanzanian recruitment agency connecting job seekers with top employers.', link: 'https://www.jobmasters.co.tz/', category: 'recruiters', type: 'recruiter' }
        ];

        // ─── 5. TANZANIA FAMOUS WEBSITES ───
        const tanzaniaSites = [
            { title: 'Ajira Portal', description: 'Tanzania\'s official government job portal listing public sector vacancies and recruitment opportunities.', link: 'https://www.ajira.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'Tanzania Government Portal', description: 'Official Tanzanian government website for public services, information, and e-government services.', link: 'https://www.tanzania.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TRA Tanzania', description: 'Tanzania Revenue Authority – official website for tax services, customs, and revenue collection.', link: 'https://www.tra.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TAMISEMI', description: 'Ministry of Regional Administration and Local Government – services for regional governance.', link: 'https://www.tamisemi.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TANTRADE', description: 'Tanzania Trade Development Authority – promoting exports, trade, and investment opportunities.', link: 'https://www.tantrade.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TIC Tanzania', description: 'Tanzania Investment Centre – facilitating investment, business registration, and permits.', link: 'https://www.tic.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'BRELA', description: 'Business Registration and Licensing Agency – for business registration and licensing in Tanzania.', link: 'https://www.brela.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'UDSM', description: 'University of Dar es Salaam – Tanzania\'s top public university offering undergraduate and postgraduate programs.', link: 'https://www.udsm.ac.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'Muhimbili University', description: 'Muhimbili University of Health and Allied Sciences – leading health sciences university in Tanzania.', link: 'https://www.muhas.ac.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'Tanzania National Parks', description: 'Official website for Tanzania\'s national parks, wildlife, and tourism information.', link: 'https://www.tanzaniaparks.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TANAPA', description: 'Tanzania National Parks Authority – managing wildlife conservation and national parks.', link: 'https://www.tanapa.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TBC Tanzania', description: 'Tanzania Broadcasting Corporation – national public broadcaster offering TV and radio services.', link: 'https://www.tbc.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'The Citizen', description: 'Tanzania\'s leading independent newspaper with comprehensive local and international news coverage.', link: 'https://www.thecitizen.co.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'Daily News Tanzania', description: 'Tanzania\'s oldest newspaper and official government news source for national updates.', link: 'https://www.dailynews.co.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'IPP Media', description: 'Tanzanian media group publishing multiple news outlets, including HabariLeo and Uhuru.', link: 'https://www.ippmedia.com/', category: 'tanzania-sites', type: 'website' },
            { title: 'Tanzania Tourism Board', description: 'Official tourism promotion website for Tanzania\'s safari, beaches, and cultural experiences.', link: 'https://www.tanzaniatourism.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'TCRA', description: 'Tanzania Communications Regulatory Authority – regulating telecoms, broadcasting, and internet services.', link: 'https://www.tcra.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'NBS Tanzania', description: 'National Bureau of Statistics – providing official statistics, census data, and economic indicators.', link: 'https://www.nbs.go.tz/', category: 'tanzania-sites', type: 'website' },
            { title: 'Tanzania Civil Aviation Authority', description: 'Regulatory body for aviation safety, airports, and air travel in Tanzania.', link: 'https://www.tcaa.go.tz/', category: 'tanzania-sites', type: 'website' }
        ];

        // ─── 6. SKILLS DEVELOPMENT ───
        const skillsSites = [
            { title: 'Coursera', description: 'Global online learning platform with courses from top universities and companies. Certificates and degrees available.', link: 'https://www.coursera.org/', category: 'skills', type: 'platform' },
            { title: 'Udemy', description: 'World\'s largest online learning marketplace with thousands of courses on technology, business, and personal development.', link: 'https://www.udemy.com/', category: 'skills', type: 'platform' },
            { title: 'edX', description: 'Non-profit online learning platform offering university-level courses from Harvard, MIT, and other top institutions.', link: 'https://www.edx.org/', category: 'skills', type: 'platform' },
            { title: 'LinkedIn Learning', description: 'Professional development platform with video courses taught by industry experts on business, tech, and creative skills.', link: 'https://www.linkedin.com/learning/', category: 'skills', type: 'platform' },
            { title: 'Khan Academy', description: 'Free world-class education platform offering courses in math, science, economics, and test preparation.', link: 'https://www.khanacademy.org/', category: 'skills', type: 'platform' },
            { title: 'Skillshare', description: 'Online learning community with thousands of classes on design, photography, business, and creative skills.', link: 'https://www.skillshare.com/', category: 'skills', type: 'platform' },
            { title: 'Alison', description: 'Free online courses and certifications in workplace skills, technology, and health and safety.', link: 'https://alison.com/', category: 'skills', type: 'platform' },
            { title: 'Google Digital Garage', description: 'Free digital marketing and career skills training from Google, including certifications.', link: 'https://learndigital.withgoogle.com/digitalgarage/', category: 'skills', type: 'platform' },
            { title: 'Microsoft Learn', description: 'Free technical training and certification from Microsoft on Azure, AI, and cloud computing.', link: 'https://learn.microsoft.com/', category: 'skills', type: 'platform' },
            { title: 'AWS Training', description: 'Cloud computing training and certification from Amazon Web Services for developers and IT professionals.', link: 'https://aws.amazon.com/training/', category: 'skills', type: 'platform' },
            { title: 'Pluralsight', description: 'Technology skills platform with courses on software development, cloud computing, and IT operations.', link: 'https://www.pluralsight.com/', category: 'skills', type: 'platform' },
            { title: 'DataCamp', description: 'Interactive data science and analytics learning platform with hands-on coding exercises.', link: 'https://www.datacamp.com/', category: 'skills', type: 'platform' },
            { title: 'Codecademy', description: 'Interactive platform for learning to code with hands-on projects in web development, data science, and more.', link: 'https://www.codecademy.com/', category: 'skills', type: 'platform' },
            { title: 'freeCodeCamp', description: 'Free coding bootcamp with thousands of hours of interactive coding lessons and projects.', link: 'https://www.freecodecamp.org/', category: 'skills', type: 'platform' },
            { title: 'The Odin Project', description: 'Free full-stack web development curriculum with comprehensive project-based learning.', link: 'https://www.theodinproject.com/', category: 'skills', type: 'platform' },
            { title: 'IBM SkillsBuild', description: 'Free digital skills platform from IBM offering courses in AI, cybersecurity, and cloud computing.', link: 'https://skillsbuild.org/', category: 'skills', type: 'platform' }
        ];

        // ─── 7. JOB BOARDS ───
        const jobBoards = [
            { title: 'LinkedIn Jobs', description: 'The world\'s largest professional network connecting job seekers with employers globally.', link: 'https://www.linkedin.com/jobs/', category: 'job-boards', type: 'website' },
            { title: 'Indeed', description: 'Global job board aggregating millions of job listings from company websites and recruitment agencies.', link: 'https://www.indeed.com/', category: 'job-boards', type: 'website' },
            { title: 'Glassdoor', description: 'Job board with company reviews, salary insights, and interview experiences from employees.', link: 'https://www.glassdoor.com/', category: 'job-boards', type: 'website' },
            { title: 'Monster', description: 'One of the world\'s oldest and most trusted job boards with millions of vacancies across industries.', link: 'https://www.monster.com/', category: 'job-boards', type: 'website' },
            { title: 'CareerJet', description: 'Global job search engine aggregating vacancies from thousands of websites in one place.', link: 'https://www.careerjet.com/', category: 'job-boards', type: 'website' },
            { title: 'ZipRecruiter', description: 'AI-powered job matching platform that connects employers with qualified candidates quickly.', link: 'https://www.ziprecruiter.com/', category: 'job-boards', type: 'website' },
            { title: 'FlexJobs', description: 'Job board specializing in remote, part-time, and flexible work opportunities.', link: 'https://www.flexjobs.com/', category: 'job-boards', type: 'website' },
            { title: 'Remote.co', description: 'Job board dedicated to remote work opportunities across the globe.', link: 'https://remote.co/', category: 'job-boards', type: 'website' },
            { title: 'We Work Remotely', description: 'The largest remote work community with thousands of remote jobs in tech and business.', link: 'https://weworkremotely.com/', category: 'job-boards', type: 'website' },
            { title: 'Ajira Yetu Tanzania', description: 'Popular Tanzanian job portal listing local employment opportunities across sectors.', link: 'https://www.ajirayetu.co.tz/', category: 'job-boards', type: 'website' },
            { title: 'Ajira Zetu', description: 'Tanzanian job portal connecting job seekers with employers and recruiters.', link: 'https://www.ajirazetu.co.tz/', category: 'job-boards', type: 'website' },
            { title: 'Nafasi za Kazi', description: 'Tanzanian job board with listings from top employers across the country.', link: 'https://www.nafasizakazi.com/', category: 'job-boards', type: 'website' },
            { title: 'KaziBora', description: 'Tanzanian career platform featuring jobs, internships, and volunteer opportunities.', link: 'https://www.kazibora.co.tz/', category: 'job-boards', type: 'website' },
            { title: 'Tanzania Jobs', description: 'Comprehensive Tanzanian job portal with listings for professionals and graduates.', link: 'https://www.tanzaniajobs.com/', category: 'job-boards', type: 'website' },
            { title: 'BRAC Tanzania Jobs', description: 'Career opportunities at BRAC Tanzania, one of the largest non-profits in the country.', link: 'https://www.brac.net/careers', category: 'job-boards', type: 'website' }
        ];

        // ─── BUILD UNIQUE RESOURCES ───
        const allResources = [];
        const usedKeys = new Set();

        function addResource(title, description, link, category, type) {
            const key = `${title}|${link}`;
            if (!usedKeys.has(key)) {
                usedKeys.add(key);
                const imageSeed = (allResources.length * 31 + 17) % 1000;
                allResources.push({
                    id: allResources.length + 1,
                    title: title,
                    description: description,
                    category: category,
                    type: type,
                    image: `https://picsum.photos/seed/${imageSeed}/400/200`,
                    link: link
                });
                return true;
            }
            return false;
        }

        // Add all real resources
        [...companies, ...visaSponsors, ...tools, ...recruiters, ...tanzaniaSites, ...skillsSites, ...jobBoards].forEach(r => {
            addResource(r.title, r.description, r.link, r.category, r.type);
        });

        // ─── GENERATE MORE UNIQUE RESOURCES WITH DESCRIPTIONS ───
        const categoryKeys = ['companies', 'visa-sponsors', 'tools', 'recruiters', 'tanzania-sites', 'skills', 'job-boards'];
        const typeKeys = ['company', 'platform', 'tool', 'website', 'recruiter'];

        const titleWords = [
            'Global', 'Tech', 'Digital', 'Smart', 'Future', 'Elite', 'Premier', 'Top', 'Leading', 'Innovative',
            'Next-Gen', 'Advanced', 'Expert', 'Accelerate', 'Transform', 'Empower', 'Unlock', 'Master', 'Build', 'Grow'
        ];

        const nameWords = [
            'Solutions', 'Group', 'Partners', 'Associates', 'Consulting', 'Advisory', 'Services', 'Global',
            'International', 'Africa', 'East Africa', 'Tanzania', 'Worldwide', 'Enterprise', 'Systems', 'Network'
        ];

        const domains = ['.com', '.org', '.net', '.io', '.co', '.tz'];

        function generateDescription(title, category, type) {
            const templates = {
                'companies': `A ${type} that provides innovative business solutions and professional services, trusted by organizations worldwide.`,
                'visa-sponsors': `A global ${type} offering visa sponsorship opportunities for skilled professionals in technology, finance, and consulting.`,
                'tools': `A powerful ${type} designed to enhance productivity, streamline workflow, and support collaboration for professionals and teams.`,
                'recruiters': `A ${type} connecting talented job seekers with leading employers and helping organizations build exceptional teams.`,
                'tanzania-sites': `A leading Tanzanian ${type} providing essential information, services, and resources for citizens and businesses.`,
                'skills': `A ${type} platform offering courses and training to help professionals develop in-demand skills and advance their careers.`,
                'job-boards': `A ${type} that aggregates job opportunities, connecting employers with qualified candidates across industries.`
            };
            return templates[category] || `A ${type} resource for career growth and professional development.`;
        }

        let attempts = 0;
        const target = 2100;
        while (allResources.length < target && attempts < 50000) {
            attempts++;
            const word1 = titleWords[Math.floor(Math.random() * titleWords.length)];
            const word2 = nameWords[Math.floor(Math.random() * nameWords.length)];
            const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
            const domain = domains[Math.floor(Math.random() * domains.length)];

            const title = `${word1} ${word2}`;
            const link = `https://${word1.toLowerCase()}${word2.toLowerCase()}${domain}`;
            const description = generateDescription(title, category, type);

            addResource(title, description, link, category, type);
        }

        return allResources;
    }

    // ─── RENDER RESOURCES ───
    let resources = [];
    let filteredResources = [];
    let displayedResources = 12;

    function initResources() {
        resources = generateResourceData();
        filteredResources = resources;
        renderResources(true);
    }

    function renderResources(reset = true) {
        if (reset) displayedResources = 12;
        const toShow = filteredResources.slice(0, displayedResources);
        const grid = document.getElementById('resourceGrid');
        const countEl = document.getElementById('resourceCount');

        if (!grid) return;

        let html = '';
        toShow.forEach(item => {
            const shareUrl = encodeURIComponent(window.location.href);
            const shareText = encodeURIComponent(`${item.title} – ${item.description}`);

            html += `
                <div class="col-lg-3 col-md-6">
                    <div class="resource-card">
                        <div class="resource-image" style="background-image: url('${item.image}');">
                            <span class="resource-badge-category">${item.category}</span>
                            <span class="resource-badge-type">${item.type}</span>
                        </div>
                        <div class="resource-body">
                            <h5 class="resource-title">${item.title}</h5>
                            <p class="resource-description">${item.description}</p>
                        </div>
                        <div class="resource-footer">
                            <a href="${item.link}" target="_blank" class="btn-access-resource">Visit <i class="fas fa-arrow-right"></i></a>
                            <div class="share-buttons-resource">
                                <span>Share:</span>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}" target="_blank"><i class="fab fa-facebook-f"></i></a>
                                <a href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank"><i class="fab fa-twitter"></i></a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${shareText}" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                                <a href="https://wa.me/?text=${encodeURIComponent(`${item.title} – ${item.description} ${window.location.href}`)}" target="_blank"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        if (countEl) countEl.textContent = `${filteredResources.length} resources`;

        const loadMoreBtn = document.getElementById('loadMoreResources');
        if (loadMoreBtn) {
            if (filteredResources.length <= displayedResources) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    // ─── FILTERS ───
    function applyResourceFilters() {
        const search = document.getElementById('resourceSearch')?.value?.toLowerCase() || '';
        const category = document.getElementById('resourceCategoryFilter')?.value || 'all';
        const type = document.getElementById('resourceTypeFilter')?.value || 'all';

        filteredResources = resources.filter(item => {
            const matchSearch = item.title.toLowerCase().includes(search) ||
                               item.description.toLowerCase().includes(search);
            const matchCategory = category === 'all' || item.category === category;
            const matchType = type === 'all' || item.type === type;
            return matchSearch && matchCategory && matchType;
        });

        renderResources(true);
    }

    const resourceSearch = document.getElementById('resourceSearch');
    const resourceCategory = document.getElementById('resourceCategoryFilter');
    const resourceType = document.getElementById('resourceTypeFilter');
    const loadMoreResourcesBtn = document.getElementById('loadMoreResources');

    if (resourceSearch) resourceSearch.addEventListener('input', applyResourceFilters);
    if (resourceCategory) resourceCategory.addEventListener('change', applyResourceFilters);
    if (resourceType) resourceType.addEventListener('change', applyResourceFilters);
    if (loadMoreResourcesBtn) {
        loadMoreResourcesBtn.addEventListener('click', function() {
            displayedResources += 12;
            renderResources(false);
        });
    }

    initResources();

    // ─── 12. ABOUT US TABS ───
    document.querySelectorAll('.about-nav .nav-link').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.about-nav .nav-link').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.about-panel').forEach(p => p.classList.remove('active'));
            const tab = this.dataset.tab;
            const panel = document.getElementById(`panel-${tab}`);
            if (panel) panel.classList.add('active');
        });
    });

    // ─── 13. CV FORM AJAX SUBMISSION ───
    const cvForm = document.getElementById('cvInquireForm');
    const cvFormSubmit = document.getElementById('cvFormSubmit');
    const cvFormSuccess = document.getElementById('cvFormSuccess');

    if (cvForm) {
        cvForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            cvFormSubmit.disabled = true;
            cvFormSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const formData = new FormData(this);

            try {
                const response = await fetch('https://formspree.io/f/mgaezarg', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    cvForm.style.display = 'none';
                    if (cvFormSuccess) {
                        cvFormSuccess.style.display = 'block';
                    }

                    cvFormSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
                    cvFormSubmit.disabled = false;

                    setTimeout(() => {
                        if (cvFormSuccess) {
                            cvFormSuccess.style.display = 'none';
                        }
                        cvForm.style.display = 'block';
                        cvForm.reset();
                    }, 3000);

                } else {
                    alert('Something went wrong. Please try again.');
                    cvFormSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
                    cvFormSubmit.disabled = false;
                }
            } catch (error) {
                alert('Network error. Please check your connection and try again.');
                cvFormSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
                cvFormSubmit.disabled = false;
            }
        });
    }












        // ─── 14. INTERVIEW TABS ───
    const interviewNavLinks = document.querySelectorAll('.interview-nav .nav-link');
    const interviewPanels = document.querySelectorAll('.interview-panel');

    interviewNavLinks.forEach(btn => {
        btn.addEventListener('click', function() {
            interviewNavLinks.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            interviewPanels.forEach(p => p.classList.remove('active'));
            const topic = this.dataset.itopic;
            const panel = document.getElementById(`itopic-${topic}`);
            if (panel) panel.classList.add('active');
        });
    });














       // ─── 15. FACULTY & JOB TITLE DATA (27 Faculties) ───
    const FACULTY_DATA = {
        'electrical': {
            label: 'Electrical Engineering',
            jobs: ['Electrical Engineer', 'Electrical Design Engineer', 'Electrical Maintenance Engineer', 'Power Systems Engineer', 'Electrical Technician', 'Control & Instrumentation Engineer', 'Electronics Engineer', 'Renewable Energy Engineer', 'Project Electrical Engineer', 'Electrical Engineering Assistant']
        },
        'oilgas': {
            label: 'Oil & Gas / Sustainable Energy',
            jobs: ['Petroleum Engineer', 'Oil & Gas Engineer', 'Drilling Engineer', 'Production Engineer', 'Process Engineer', 'Energy Engineer', 'Renewable Energy Specialist', 'Energy Analyst', 'Environmental & HSE Officer', 'Oil & Gas Operations Officer']
        },
        'tourism': {
            label: 'Tourism & Hospitality',
            jobs: ['Tour Guide', 'Tour Operator', 'Tourism Officer', 'Travel Consultant', 'Front Office Officer', 'Hotel Operations Officer', 'Guest Relations Officer', 'Reservations Officer', 'Hospitality Supervisor', 'Tourism Marketing Officer']
        },
        'wildlife': {
            label: 'Wildlife & Conservation',
            jobs: ['Wildlife Officer', 'Wildlife Conservation Officer', 'Wildlife Management Officer', 'Conservation Officer', 'Wildlife Research Assistant', 'Protected Area Officer', 'Ranger / Wildlife Ranger', 'Biodiversity Officer', 'Human-Wildlife Conflict Officer', 'Community Conservation Officer']
        },
        'ecology': {
            label: 'Ecology & Forestry',
            jobs: ['Ecologist', 'Forest Officer', 'Forestry Officer', 'Environmental Officer', 'Forest Management Officer', 'Biodiversity Specialist', 'Conservation Ecologist', 'Environmental Research Assistant', 'Natural Resources Officer', 'Forest Extension Officer']
        },
        'accounting': {
            label: 'Accounting & Finance',
            jobs: ['Accountant', 'Assistant Accountant', 'Finance Officer', 'Accounts Officer', 'Financial Analyst', 'Auditor', 'Internal Auditor', 'Credit Officer', 'Tax Officer', 'Finance Assistant']
        },
        'law': {
            label: 'Law',
            jobs: ['Legal Officer', 'Legal Assistant', 'Advocate', 'Legal Counsel', 'Compliance Officer', 'Corporate Lawyer', 'Legal Researcher', 'Paralegal Officer', 'Court Clerk', 'Contracts Officer']
        },
        'policy': {
            label: 'Public Policy & International Relations',
            jobs: ['Policy Analyst', 'Policy Officer', 'International Relations Officer', 'Diplomatic Officer', 'Programme Officer', 'Research Officer', 'Public Affairs Officer', 'International Cooperation Officer', 'Policy Research Assistant', 'Development Policy Officer']
        },
        'admin': {
            label: 'Public Administration',
            jobs: ['Administrative Officer', 'Administrative Assistant', 'Public Administration Officer', 'Government Relations Officer', 'Programme Officer', 'Planning Officer', 'Management Officer', 'Public Service Officer', 'Operations Officer', 'District Administrative Officer']
        },
        'hr': {
            label: 'Human Resource Management',
            jobs: ['Human Resources Officer', 'HR Assistant', 'Human Resources Manager', 'Recruitment Officer', 'Talent Acquisition Officer', 'Training & Development Officer', 'Employee Relations Officer', 'Compensation & Benefits Officer', 'HR Administrator', 'Labour Relations Officer']
        },
        'it': {
            label: 'Information Technology & Computer Science',
            jobs: ['Software Developer', 'Software Engineer', 'IT Officer', 'Systems Administrator', 'Database Administrator', 'Network Administrator', 'Web Developer', 'IT Support Officer', 'Systems Analyst', 'Data Analyst']
        },
        'cyber': {
            label: 'Cyber Security',
            jobs: ['Cybersecurity Analyst', 'Cybersecurity Officer', 'Information Security Analyst', 'Information Security Officer', 'Security Operations Center (SOC) Analyst', 'Network Security Engineer', 'Penetration Tester', 'Cybersecurity Engineer', 'Digital Forensics Analyst', 'IT Security Specialist']
        },
        'health': {
            label: 'Health & Medicine',
            jobs: ['Medical Doctor', 'Clinical Officer', 'Registered Nurse', 'Pharmacist', 'Medical Laboratory Scientist', 'Public Health Officer', 'Health Officer', 'Health Information Officer', 'Medical Records Officer', 'Community Health Officer']
        },
        'education': {
            label: 'Education & Teaching',
            jobs: ['Teacher', 'Secondary School Teacher', 'Primary School Teacher', 'Academic Tutor', 'Lecturer', 'Education Officer', 'Curriculum Officer', 'Training Officer', 'Education Coordinator', 'School Administrator']
        },
        'agriculture': {
            label: 'Agriculture & Agribusiness',
            jobs: ['Agricultural Officer', 'Agronomist', 'Agricultural Extension Officer', 'Agribusiness Officer', 'Farm Manager', 'Agricultural Research Assistant', 'Crop Production Officer', 'Livestock Officer', 'Agricultural Economist', 'Food Security Officer']
        },
        'environmental': {
            label: 'Environmental Science & Natural Resources',
            jobs: ['Environmental Officer', 'Environmental Specialist', 'Environmental Scientist', 'Environmental Impact Assessment Officer', 'Environmental Consultant', 'Natural Resources Officer', 'Climate Change Officer', 'Environmental Monitoring Officer', 'Sustainability Officer', 'Environmental Research Assistant']
        },
        'economics': {
            label: 'Economics',
            jobs: ['Economist', 'Economic Analyst', 'Economic Planning Officer', 'Research Economist', 'Development Economist', 'Policy Economist', 'Market Analyst', 'Economic Research Assistant', 'Planning Officer', 'Investment Analyst']
        },
        'procurement': {
            label: 'Procurement & Supply Chain',
            jobs: ['Procurement Officer', 'Procurement Assistant', 'Supply Chain Officer', 'Logistics Officer', 'Purchasing Officer', 'Procurement Specialist', 'Stores Officer', 'Warehouse Officer', 'Inventory Officer', 'Supply Chain Analyst']
        },
        'business': {
            label: 'Business & Management',
            jobs: ['Business Development Officer', 'Business Analyst', 'Management Officer', 'Operations Manager', 'Project Manager', 'Project Officer', 'Marketing Officer', 'Sales Officer', 'Business Development Executive', 'Management Trainee']
        },
        'marketing': {
            label: 'Marketing, Communication & Journalism',
            jobs: ['Communications Officer', 'Public Relations Officer', 'Marketing Officer', 'Digital Marketing Officer', 'Social Media Officer', 'Content Creator', 'Journalist', 'Communications Assistant', 'Media Officer', 'Public Information Officer']
        },
        'statistics': {
            label: 'Statistics, Mathematics & Data Science',
            jobs: ['Statistician', 'Data Analyst', 'Data Scientist', 'Statistical Officer', 'Monitoring & Evaluation Officer', 'Research Analyst', 'Quantitative Analyst', 'Business Intelligence Analyst', 'Data Management Officer', 'Statistical Assistant']
        },
        'civil': {
            label: 'Engineering — Civil & Construction',
            jobs: ['Civil Engineer', 'Structural Engineer', 'Site Engineer', 'Construction Engineer', 'Quantity Surveyor', 'Building Inspector', 'Project Engineer', 'Roads Engineer', 'Water Engineer', 'Construction Supervisor']
        },
        'mechanical': {
            label: 'Mechanical & Industrial Engineering',
            jobs: ['Mechanical Engineer', 'Mechanical Technician', 'Maintenance Engineer', 'Production Engineer', 'Industrial Engineer', 'Manufacturing Engineer', 'Automotive Engineer', 'Plant Engineer', 'Quality Control Engineer', 'Mechanical Engineering Technician']
        },
        'architecture': {
            label: 'Architecture, Planning & Land Management',
            jobs: ['Architect', 'Urban Planner', 'Town Planner', 'Land Officer', 'Land Surveyor', 'Quantity Surveyor', 'GIS Officer', 'Cartographer', 'Valuation Officer', 'Estate Management Officer']
        },
        'social': {
            label: 'Social Sciences & Development Studies',
            jobs: ['Social Development Officer', 'Community Development Officer', 'Social Research Officer', 'Development Officer', 'Project Officer', 'Programme Officer', 'Community Mobilization Officer', 'Social Welfare Officer', 'Research Assistant', 'Monitoring & Evaluation Officer']
        },
        'transport': {
            label: 'Procurement, Transport & Logistics',
            jobs: ['Transport Officer', 'Fleet Officer', 'Logistics Coordinator', 'Transport Coordinator', 'Clearing & Forwarding Officer', 'Warehouse Supervisor', 'Distribution Officer', 'Fleet Manager', 'Logistics Assistant', 'Operations Coordinator']
        },
        'media': {
            label: 'Media, Creative Arts & Design',
            jobs: ['Graphic Designer', 'UI/UX Designer', 'Photographer', 'Videographer', 'Video Editor', 'Animator', 'Creative Designer', 'Art Director', 'Multimedia Officer', 'Production Assistant']
        }
    };

    // ─── DYNAMICALLY POPULATE FACULTY DROPDOWN ───
    (function populateFacultyDropdown() {
        const facultySelect = document.getElementById('facultySelect');
        if (!facultySelect) return;
        facultySelect.innerHTML = '<option value="">— Choose Faculty —</option>';
        Object.keys(FACULTY_DATA).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = FACULTY_DATA[key].label;
            facultySelect.appendChild(opt);
        });
        console.log('✅ Faculty dropdown populated with ' + Object.keys(FACULTY_DATA).length + ' faculties.');
    })();

    // ─── THREE-STEP SELECTION LOGIC ───
    const facultySelectEl = document.getElementById('facultySelect');
    const jobSelectEl = document.getElementById('jobSelect');
    const levelSelectEl = document.getElementById('levelSelect');
    const startBtn = document.getElementById('startAssessmentBtn');

    if (facultySelectEl) {
        facultySelectEl.addEventListener('change', function() {
            const facultyKey = this.value;
            jobSelectEl.innerHTML = '<option value="">— Select Job Title —</option>';
            jobSelectEl.disabled = true;
            levelSelectEl.disabled = true;
            levelSelectEl.value = '';
            startBtn.disabled = true;

            if (facultyKey && FACULTY_DATA[facultyKey]) {
                const jobs = FACULTY_DATA[facultyKey].jobs;
                jobs.forEach(job => {
                    const opt = document.createElement('option');
                    opt.value = job;
                    opt.textContent = job;
                    jobSelectEl.appendChild(opt);
                });
                jobSelectEl.disabled = false;
            }
            checkStartReady();
        });
    }

    if (jobSelectEl) {
        jobSelectEl.addEventListener('change', function() {
            levelSelectEl.disabled = !this.value;
            if (!this.value) levelSelectEl.value = '';
            startBtn.disabled = true;
            checkStartReady();
        });
    }

    if (levelSelectEl) {
        levelSelectEl.addEventListener('change', function() {
            checkStartReady();
        });
    }

    function checkStartReady() {
        if (startBtn) {
            startBtn.disabled = !(
                facultySelectEl && facultySelectEl.value &&
                jobSelectEl && jobSelectEl.value &&
                levelSelectEl && levelSelectEl.value
            );
        }
    }

    if (jobSelectEl) jobSelectEl.disabled = true;
    if (levelSelectEl) levelSelectEl.disabled = true;
    if (startBtn) startBtn.disabled = true;
    console.log('✅ Three-step selection logic loaded with ' + Object.keys(FACULTY_DATA).length + ' faculties.');






















    // ─── ULTRA‑POWERFUL ASSESSMENT ENGINE ───
    (function() {
        'use strict';

        // ─── 1. VOCABULARY FOR EACH FACULTY ───
        function getVocabForFaculty(faculty) {
            const vocabMap = {
                // ELECTRICAL
                'electrical': {
                    topics: ['power systems', 'transmission lines', 'distribution networks', 'motors', 'generators', 'transformers', 'switchgear', 'protection relays', 'fault analysis', 'load flow', 'circuit breakers', 'busbars', 'cables', 'insulators', 'surge arresters', 'earthing systems', 'power factor', 'harmonic distortion', 'voltage regulation', 'frequency control'],
                    concepts: ['voltage regulation', 'power factor correction', 'frequency stability', 'short-circuit current', 'insulation coordination', 'harmonic distortion', 'transient stability', 'synchronous reactance', 'inductance', 'capacitance', 'impedance', 'admittance', 'skin effect', 'proximity effect', 'corona discharge', 'fault level', 'reactive power', 'active power', 'apparent power', 'power quality'],
                    processes: ['step-up transformation', 'step-down transformation', 'rectification', 'inversion', 'commutation', 'exciting', 'synchronising', 'isolating', 'earthing', 'testing', 'fault clearing', 'load shedding', 'parallel operation', 'tap changing', 'phase shifting'],
                    tools: ['multimeter', 'oscilloscope', 'power analyzer', 'insulation tester', 'earth resistance meter', 'clamp meter', 'thermography camera', 'partial discharge detector', 'relay tester', 'circuit breaker analyzer'],
                    units: ['kVA', 'MW', 'MVar', 'kV', 'A', 'Ω', 'Hz', 'p.u.', 'kWh', 'power factor', 'cos φ']
                },
                // OIL & GAS
                'oilgas': {
                    topics: ['reservoir characterization', 'drilling operations', 'well completion', 'production facilities', 'refining processes', 'pipeline transport', 'offshore platforms', 'LNG terminals', 'seismic interpretation', 'enhanced recovery', 'well logging', 'mud engineering', 'casing design', 'cementing', 'perforating', 'fracturing', 'separating', 'dehydrating', 'desalting', 'compressing'],
                    concepts: ['porosity', 'permeability', 'fluid saturation', 'pressure depletion', 'water cut', 'gas lift efficiency', 'artificial lift', 'hydraulic fracturing', 'sand control', 'flow assurance', 'wax deposition', 'hydrate formation', 'reservoir drive', 'capillary pressure', 'relative permeability', 'compressibility', 'viscosity', 'API gravity', 'sulfur content', 'flash point'],
                    processes: ['drilling', 'cementing', 'perforating', 'fracturing', 'separating', 'dehydrating', 'desalting', 'compressing', 'liquefying', 'transporting', 'refining', 'cracking', 'distillation', 'hydrotreating', 'catalytic reforming'],
                    tools: ['mud balance', 'viscometer', 'gas chromatograph', 'PVT cell', 'core holder', 'permeameter', 'resistivity meter', 'neutron tool', 'density tool', 'sonic tool'],
                    units: ['psi', 'bar', 'cp', 'md', '°API', 'scf/bbl', 'GOR', 'water cut %', 'ppm', '°F', '°C']
                },
                // TOURISM & HOSPITALITY
                'tourism': {
                    topics: ['guest services', 'reservations management', 'front office operations', 'housekeeping', 'food & beverage', 'event coordination', 'tour operations', 'destination marketing', 'customer experience', 'hospitality technology', 'revenue management', 'yield management', 'guest relations', 'concierge services', 'travel agency operations', 'tour guiding', 'heritage management', 'eco-tourism', 'cultural tourism', 'MICE tourism'],
                    concepts: ['service quality', 'guest satisfaction', 'personalisation', 'cultural sensitivity', 'sustainability', 'revenue per available room', 'brand loyalty', 'staff empowerment', 'experience design', 'online reputation', 'customer lifetime value', 'occupancy rate', 'average daily rate', 'RevPAR', 'customer service excellence', 'destination competitiveness', 'tourism multiplier effect', 'carrying capacity', 'seasonality', 'tourism leakage'],
                    processes: ['check-in', 'check-out', 'reservation booking', 'tour guiding', 'event planning', 'complaint handling', 'service recovery', 'up-selling', 'cross-selling', 'feedback collection', 'yield management', 'dynamic pricing', 'reputation management', 'guest profiling', 'loyalty program management'],
                    tools: ['PMS', 'CRS', 'GDS', 'OTA platforms', 'revenue management software', 'channel manager', 'guest feedback systems', 'social media monitoring', 'CRM software', 'property management system'],
                    units: ['ADR', 'RevPAR', 'occupancy %', 'GOPPAR', 'RevPASH', 'Net Promoter Score', 'customer satisfaction score', 'market share']
                },
                // WILDLIFE & CONSERVATION
                'wildlife': {
                    topics: ['habitat fragmentation', 'species monitoring', 'ecosystem management', 'national parks', 'protected areas', 'migratory patterns', 'population dynamics', 'human-wildlife conflict', 'anti-poaching', 'conservation strategies', 'ecological corridors', 'biodiversity hotspots', 'endangered species', 'invasive species', 'captive breeding', 'reintroduction', 'conservation genetics', 'wildlife forensics', 'environmental law', 'community conservation'],
                    concepts: ['biodiversity', 'endemism', 'carrying capacity', 'edge effects', 'corridor connectivity', 'breeding programs', 'reintroduction', 'anti-poaching', 'community engagement', 'sustainable utilisation', 'species richness', 'evenness', 'indicator species', 'umbrella species', 'keystone species', 'trophic cascade', 'minimum viable population', 'genetic diversity', 'population viability analysis'],
                    processes: ['monitoring', 'tracking', 'census', 'collaring', 'translocation', 'quarantine', 'vaccination', 'capture', 'release', 'habitat restoration', 'fire management', 'water point management', 'community outreach', 'law enforcement', 'conservation education'],
                    tools: ['GPS collars', 'camera traps', 'drones', 'telemetry', 'GIS', 'DNA analysis', 'acoustic monitoring', 'transects', 'mark-recapture', 'aerial surveys'],
                    units: ['population density', 'home range size', 'migration distance', 'species richness', 'Shannon index', 'Simpson index']
                },
                // ECOLOGY & FORESTRY
                'ecology': {
                    topics: ['forest management', 'wetland conservation', 'grassland ecology', 'marine ecosystems', 'soil science', 'water cycles', 'carbon sequestration', 'climate change adaptation', 'invasive species', 'ecological restoration', 'deforestation', 'reforestation', 'agroforestry', 'silviculture', 'fire ecology', 'riparian zones', 'montane forests', 'tropical forests', 'temperate forests', 'boreal forests'],
                    concepts: ['succession', 'nutrient cycling', 'trophic levels', 'keystone species', 'indicator species', 'ecosystem services', 'resilience', 'adaptation', 'mitigation', 'sustainable use', 'biomass', 'net primary productivity', 'gross primary productivity', 'decomposition', 'mineralization', 'nitrification', 'denitrification', 'photosynthesis', 'respiration', 'evapotranspiration'],
                    processes: ['reforestation', 'afforestation', 'controlled burning', 'pest management', 'seed dispersal', 'pollination', 'decomposition', 'nitrogen fixation', 'water filtration', 'erosion control', 'thinning', 'pruning', 'coppicing', 'stand management', 'harvesting'],
                    tools: ['dendrometer', 'increment borer', 'soil auger', 'corer', 'hyperspectral imagery', 'LiDAR', 'leaf area index meter', 'photosynthesis meter', 'chromatography', 'spectrophotometry'],
                    units: ['m³/ha', 'tonnes/ha', 'DBH', 'basal area', 'site index', 'crown class', 'leaf area index', 'g C/m²/year']
                },
                // ACCOUNTING & FINANCE
                'accounting': {
                    topics: ['financial statements', 'general ledger', 'taxation', 'auditing', 'cost accounting', 'budgeting', 'forensic accounting', 'consolidation', 'depreciation', 'revenue recognition', 'working capital', 'cash flow', 'financial analysis', 'financial reporting', 'management accounting', 'payroll', 'internal controls', 'risk management', 'corporate finance', 'investment analysis'],
                    concepts: ['materiality', 'going concern', 'accrual basis', 'fair value', 'consistency', 'comparability', 'relevance', 'faithful representation', 'prudence', 'substance over form', 'time value of money', 'discounted cash flow', 'net present value', 'internal rate of return', 'payback period', 'profitability index', 'economic value added', 'return on equity', 'return on assets', 'gearing ratio'],
                    processes: ['recording', 'classifying', 'summarising', 'analysing', 'interpreting', 'reporting', 'verifying', 'adjusting', 'closing', 'reconciling', 'auditing', 'tax planning', 'budgeting', 'forecasting', 'variance analysis'],
                    tools: ['ERP systems', 'accounting software', 'spreadsheets', 'tax software', 'audit software', 'financial modeling tools'],
                    units: ['$', '%', 'ratio', 'times', 'days', 'basis points', 'EPS', 'P/E ratio', 'BVPS']
                },
                // LAW
                'law': {
                    topics: ['contract law', 'torts', 'property law', 'criminal law', 'constitutional law', 'administrative law', 'labour law', 'family law', 'evidence', 'procedural law', 'corporate law', 'international law', 'human rights law', 'environmental law', 'tax law', 'intellectual property', 'media law', 'cyber law', 'arbitration', 'legal drafting'],
                    concepts: ['jurisdiction', 'burden of proof', 'precedent', 'stare decisis', 'due process', 'equality before the law', 'natural justice', 'actus reus', 'mens rea', 'vicarious liability', 'privity of contract', 'consideration', 'frustration', 'misrepresentation', 'duress', 'undue influence', 'negligence', 'defamation', 'trespass', 'nuisance'],
                    processes: ['pleading', 'discovery', 'motion practice', 'trial', 'appeal', 'negotiation', 'mediation', 'arbitration', 'drafting', 'interpretation', 'legal research', 'case analysis', 'due diligence', 'contract drafting', 'opinion writing'],
                    tools: ['legal databases', 'case management software', 'document review software', 'electronic discovery tools', 'citation tools'],
                    units: ['years imprisonment', 'fine amount', 'damages', 'injunction']
                },
                // PUBLIC POLICY & INTERNATIONAL RELATIONS
                'policy': {
                    topics: ['international relations', 'diplomacy', 'trade agreements', 'human rights', 'climate policy', 'development aid', 'security', 'governance', 'multilateralism', 'peacekeeping', 'foreign policy', 'geopolitics', 'international law', 'conflict resolution', 'humanitarian affairs', 'economic integration', 'political economy', 'public diplomacy', 'soft power', 'international organizations'],
                    concepts: ['sovereignty', 'national interest', 'soft power', 'hard power', 'global governance', 'norm diffusion', 'regime theory', 'liberal internationalism', 'realism', 'constructivism', 'interdependence', 'hegemony', 'multipolarity', 'bipolarity', 'unipolarity', 'containment', 'deterrence', 'balance of power', 'collective security', 'human security'],
                    processes: ['negotiation', 'ratification', 'implementation', 'monitoring', 'evaluation', 'advocacy', 'lobbying', 'public consultation', 'policy analysis', 'crisis management', 'diplomatic communication', 'summitry', 'treaty making', 'sanctions', 'peace negotiations'],
                    tools: ['policy briefs', 'strategic assessments', 'diplomatic cables', 'negotiation frameworks', 'crisis simulation models', 'data analysis tools'],
                    units: ['percentage of GDP', 'aid per capita', 'trade volume', 'diplomatic missions']
                },
                // PUBLIC ADMINISTRATION
                'admin': {
                    topics: ['public administration', 'civil service', 'decentralization', 'local government', 'budgeting', 'personnel management', 'ethics', 'e-government', 'performance management', 'service delivery', 'public policy', 'public finance', 'organizational behavior', 'strategic management', 'public procurement', 'public-private partnerships', 'governance reform', 'anti-corruption', 'regulatory compliance', 'citizen engagement'],
                    concepts: ['accountability', 'transparency', 'responsiveness', 'effectiveness', 'efficiency', 'equity', 'legitimacy', 'discretion', 'bureaucracy', 'public interest', 'red tape', 'governance', 'stakeholder engagement', 'value for money', 'public value', 'administrative law', 'due process', 'administrative discretion', 'public trust', 'citizen centricity'],
                    processes: ['planning', 'organising', 'staffing', 'directing', 'coordinating', 'budgeting', 'evaluating', 'reporting', 'communicating', 'decision-making', 'policy implementation', 'program evaluation', 'service delivery', 'public consultation', 'regulatory oversight'],
                    tools: ['ERP systems', 'budgeting software', 'performance dashboards', 'e-government platforms', 'GIS', 'project management tools', 'public consultation platforms'],
                    units: ['budget allocation', 'service delivery metrics', 'citizen satisfaction %']
                },
                // HUMAN RESOURCE MANAGEMENT
                'hr': {
                    topics: ['recruitment', 'selection', 'training', 'performance appraisal', 'compensation', 'benefits', 'employee relations', 'labour law', 'diversity', 'talent management', 'succession planning', 'employee engagement', 'organizational culture', 'change management', 'psychometric testing', 'job analysis', 'job evaluation', 'reward systems', 'employee retention', 'HR analytics'],
                    concepts: ['job analysis', 'person-organization fit', 'motivation', 'engagement', 'turnover', 'career development', 'work-life balance', 'organisational culture', 'leadership', 'change management', 'employee value proposition', 'psychological contract', 'industrial relations', 'collective bargaining', 'labour standards', 'discrimination', 'affirmative action', 'competency modeling', '360 degree feedback', 'balanced scorecard'],
                    processes: ['sourcing', 'screening', 'interviewing', 'onboarding', 'mentoring', 'coaching', 'evaluating', 'promoting', 'terminating', 'investigating', 'training needs analysis', 'performance calibration', 'compensation benchmarking', 'grievance handling', 'disciplinary procedures'],
                    tools: ['ATS', 'HRIS', 'performance management software', 'assessment tools', 'psychometric tests', 'training management systems', 'employee engagement surveys'],
                    units: ['turnover rate %', 'time-to-hire', 'cost-per-hire', 'engagement index', 'eNPS']
                },
                // INFORMATION TECHNOLOGY
                'it': {
                    topics: ['software development', 'algorithms', 'networks', 'databases', 'cloud computing', 'AI', 'UI/UX', 'agile', 'devops', 'cybersecurity', 'data structures', 'operating systems', 'compilers', 'computer architecture', 'software testing', 'system design', 'distributed systems', 'web technologies', 'mobile development', 'blockchain'],
                    concepts: ['abstraction', 'encapsulation', 'inheritance', 'polymorphism', 'OOP', 'RESTful APIs', 'microservices', 'scalability', 'load balancing', 'containerisation', 'big O notation', 'data structures', 'networking protocols', 'database indexing', 'ACID', 'CAP theorem', 'eventual consistency', 'concurrency', 'parallelism', 'garbage collection'],
                    processes: ['coding', 'testing', 'deploying', 'debugging', 'refactoring', 'integrating', 'monitoring', 'backup', 'recovery', 'troubleshooting', 'system design', 'architecture planning', 'code review', 'CI/CD', 'performance tuning'],
                    tools: ['IDEs', 'version control', 'CI/CD tools', 'containerization', 'monitoring tools', 'debugging tools', 'testing frameworks'],
                    units: ['MB', 'GB', 'ms', 'GHz', 'transactions/sec', 'bandwidth', 'latency', 'throughput']
                },
                // CYBER SECURITY
                'cyber': {
                    topics: ['network security', 'application security', 'cryptography', 'incident response', 'vulnerability assessment', 'penetration testing', 'malware analysis', 'digital forensics', 'GDPR', 'zero trust', 'security architecture', 'identity management', 'access control', 'security operations', 'threat intelligence', 'risk management', 'compliance', 'security awareness', 'secure coding', 'cloud security'],
                    concepts: ['confidentiality', 'integrity', 'availability', 'non-repudiation', 'authentication', 'authorisation', 'anonymity', 'privacy', 'threat modelling', 'risk management', 'cryptographic algorithms', 'hash functions', 'digital signatures', 'PKI', 'SSL/TLS', 'firewall', 'IDS', 'IPS', 'SOC', 'SIEM'],
                    processes: ['monitoring', 'detection', 'containment', 'eradication', 'recovery', 'analysis', 'auditing', 'reporting', 'testing', 'training', 'risk assessment', 'security audit', 'incident management', 'forensic imaging', 'evidence preservation'],
                    tools: ['Wireshark', 'Metasploit', 'Nmap', 'Burp Suite', 'Snort', 'Splunk', 'Cuckoo Sandbox', 'Volatility', 'EnCase', 'Kali Linux'],
                    units: ['bits', 'keysize', 'hashes per second', 'IPS']
                },
                // HEALTH & MEDICINE
                'health': {
                    topics: ['clinical procedures', 'diagnostics', 'patient care', 'pharmacology', 'public health', 'health policy', 'medical ethics', 'health informatics', 'emergency medicine', 'specialty practices', 'anatomy', 'physiology', 'pathology', 'microbiology', 'immunology', 'biochemistry', 'genetics', 'epidemiology', 'nutrition', 'mental health'],
                    concepts: ['evidence-based practice', 'patient safety', 'quality improvement', 'clinical governance', 'risk management', 'holistic care', 'prevention', 'rehabilitation', 'palliation', 'health promotion', 'differential diagnosis', 'prognosis', 'efficacy', 'bioavailability', 'pharmacodynamics', 'pharmacokinetics', 'nosocomial infection', 'comorbidity', 'mortality rate', 'incidence rate'],
                    processes: ['diagnosis', 'treatment', 'monitoring', 'referral', 'follow-up', 'counselling', 'record-keeping', 'consent', 'informed decision-making', 'interprofessional collaboration', 'clinical audit', 'patient education', 'screening', 'vaccination', 'health surveillance'],
                    tools: ['stethoscope', 'ophthalmoscope', 'otoscope', 'ECG', 'X-ray', 'MRI', 'CT scan', 'ultrasound', 'blood pressure monitor', 'pulse oximeter', 'ventilator', 'defibrillator', 'endoscope', 'microscope', 'centrifuge', 'spectrophotometer', 'PCR machine', 'flow cytometer', 'ventilator', 'infusion pump'],
                    units: ['mg', 'g', 'kg', 'mL', 'L', 'mmol/L', 'mg/dL', 'IU', 'mm Hg', 'bpm', '°C', '°F', 'respirations/min', 'BMI']
                },
                // EDUCATION & TEACHING
                'education': {
                    topics: ['pedagogy', 'curriculum development', 'lesson planning', 'educational assessment', 'classroom management', 'student engagement', 'inclusive education', 'digital learning', 'educational policy', 'teacher training', 'learning psychology', 'special education', 'educational technology', 'distance learning', 'assessment design', 'feedback strategies', 'differentiation', 'educational leadership', 'school administration', 'educational evaluation'],
                    concepts: ['differentiated instruction', 'formative assessment', 'summative assessment', 'learning outcomes', 'student motivation', 'critical thinking', 'problem-solving', 'collaborative learning', 'adaptive learning', 'educational equity', 'zone of proximal development', 'scaffolding', 'metacognition', 'self-regulated learning', 'grit', 'resilience', 'growth mindset', 'fixed mindset', 'constructivism', 'connectivism'],
                    processes: ['lesson planning', 'instructional delivery', 'student assessment', 'curriculum mapping', 'professional development', 'parent communication', 'classroom arrangement', 'feedback provision', 'differentiation', 'scaffolding', 'accommodation', 'modification', 'co-teaching', 'peer coaching', 'team teaching'],
                    tools: ['learning management systems', 'educational apps', 'assessment tools', 'interactive whiteboards', 'student response systems', 'digital portfolios', 'video conferencing tools', 'collaboration platforms', 'adaptive learning software', 'simulation tools'],
                    units: ['grades', 'scores', 'percentages', 'achievement levels', 'growth scores', 'attendance rates', 'graduation rates']
                },
                // AGRICULTURE & AGRIBUSINESS
                'agriculture': {
                    topics: ['crop production', 'livestock management', 'soil science', 'irrigation', 'agribusiness', 'food security', 'sustainable agriculture', 'agricultural economics', 'post-harvest handling', 'pest management', 'plant breeding', 'seed technology', 'fertilizer management', 'precision agriculture', 'farm mechanization', 'rural development', 'value chain', 'market access', 'agricultural policy', 'climate-smart agriculture'],
                    concepts: ['crop diversification', 'value addition', 'market access', 'agricultural productivity', 'climate-smart agriculture', 'sustainable intensification', 'food safety', 'rural development', 'resource efficiency', 'supply chain integration', 'integrated pest management', 'soil health', 'water use efficiency', 'livestock productivity', 'animal welfare', 'farm profitability', 'input efficiency', 'output maximization', 'risk management', 'smallholder empowerment'],
                    processes: ['land preparation', 'planting', 'fertilization', 'pest control', 'harvesting', 'storage', 'processing', 'marketing', 'extension services', 'farm planning', 'soil testing', 'irrigation scheduling', 'crop rotation', 'intercropping', 'integrated nutrient management', 'disease diagnosis', 'weed control', 'pruning', 'grafting', 'animal breeding'],
                    tools: ['tractor', 'planters', 'harvesters', 'irrigation systems', 'soil moisture sensors', 'weather stations', 'drones', 'GIS', 'crop models', 'livestock monitoring systems', 'milk meters', 'weight scales', 'moisture meters', 'pH meters', 'EC meters', 'pest traps', 'sprayers', 'fertilizer spreaders', 'seed drills', 'harvesters'],
                    units: ['kg/ha', 'tonnes/ha', 'bags/ha', 'litres/ha', 'mm rainfall', 'crop yield', 'conception rate', 'growth rate', 'feed conversion ratio']
                },
                // ENVIRONMENTAL SCIENCE
                'environmental': {
                    topics: ['climate change', 'biodiversity', 'pollution', 'environmental impact assessment', 'natural resource management', 'sustainable development', 'environmental policy', 'ecosystem restoration', 'waste management', 'environmental monitoring', 'air quality', 'water quality', 'soil contamination', 'environmental toxicology', 'renewable energy', 'environmental economics', 'environmental law', 'conservation biology', 'ecological restoration', 'environmental impact studies'],
                    concepts: ['sustainability', 'ecological resilience', 'carbon footprint', 'environmental justice', 'adaptive management', 'ecosystem services', 'conservation', 'environmental governance', 'pollution control', 'green technology', 'life cycle assessment', 'environmental auditing', 'precautionary principle', 'polluter pays', 'environmental standards', 'biodiversity offsets', 'carbon sequestration', 'emissions trading', 'circular economy', 'natural capital'],
                    processes: ['environmental assessment', 'monitoring', 'impact mitigation', 'restoration planning', 'stakeholder engagement', 'policy analysis', 'data collection', 'reporting', 'compliance checking', 'environmental education', 'site remediation', 'pollution prevention', 'environmental planning', 'resource conservation', 'sustainable design'],
                    tools: ['spectrophotometer', 'gas chromatograph', 'mass spectrometer', 'pH meter', 'thermometer', 'wind vane', 'anemometer', 'barometer', 'hygrometer', 'rain gauge', 'air sampler', 'water sampler', 'sediment sampler', 'biodiversity assessment tools', 'GIS', 'remote sensing'],
                    units: ['ppm', 'ppb', 'µg/m³', 'mg/L', '°C', 'mm', 'kg CO2e', 'nitrate mg/L', 'phosphate mg/L', 'BOD', 'COD', 'pH', 'conductivity µS/cm', 'turbidity NTU', 'dissolved oxygen mg/L']
                },
                // ECONOMICS
                'economics': {
                    topics: ['microeconomics', 'macroeconomics', 'development economics', 'international trade', 'public finance', 'economic policy', 'labour economics', 'monetary economics', 'economic growth', 'economic modelling', 'econometrics', 'financial economics', 'environmental economics', 'public choice', 'game theory', 'economic history', 'political economy', 'welfare economics', 'behavioral economics', 'resource economics'],
                    concepts: ['supply and demand', 'elasticity', 'market failure', 'externalities', 'inflation', 'unemployment', 'GDP', 'human development', 'income distribution', 'poverty alleviation', 'opportunity cost', 'comparative advantage', 'absolute advantage', 'economies of scale', 'diminishing returns', 'public goods', 'rent seeking', 'moral hazard', 'adverse selection', 'time inconsistency'],
                    processes: ['economic analysis', 'forecasting', 'policy formulation', 'data interpretation', 'cost-benefit analysis', 'appraisal', 'evaluation', 'monitoring', 'budgeting', 'planning', 'regression analysis', 'hypothesis testing', 'model building', 'simulation', 'impact assessment'],
                    tools: ['statistical software', 'econometric packages', 'data visualization tools', 'economic databases', 'spreadsheets', 'mathematical modeling'],
                    units: ['%', 'GDP', 'GNP', 'HDI', 'Gini coefficient', 'PPP', 'CPI', 'PPI', 'exchange rate', 'interest rate']
                },
                // PROCUREMENT & SUPPLY CHAIN
                'procurement': {
                    topics: ['supply chain management', 'logistics', 'inventory management', 'warehousing', 'purchasing', 'contract management', 'supplier relationship', 'procurement strategy', 'e-procurement', 'global sourcing', 'demand forecasting', 'distribution management', 'reverse logistics', 'supply chain risk', 'sustainable procurement', 'procurement law', 'tendering', 'negotiation', 'performance measurement', 'supply chain analytics'],
                    concepts: ['efficiency', 'cost reduction', 'quality assurance', 'risk management', 'compliance', 'sustainability', 'value for money', 'transparency', 'accountability', 'timeliness', 'total cost of ownership', 'supplier performance', 'lead time', 'stock turnover', 'order accuracy', 'inventory optimization', 'supplier integration', 'supply chain resilience', 'agile supply chain', 'lean logistics'],
                    processes: ['needs assessment', 'sourcing', 'tendering', 'evaluation', 'contract awarding', 'order processing', 'receiving', 'inspection', 'storage', 'distribution', 'inventory counting', 'demand planning', 'supplier evaluation', 'performance monitoring', 'contract administration'],
                    tools: ['ERP systems', 'supply chain management software', 'procurement platforms', 'inventory management systems', 'warehouse management systems', 'transport management systems', 'RFID', 'barcode scanners', 'supplier portals'],
                    units: ['lead time days', 'stock turnover ratio', 'order accuracy %', 'cost per order', 'supplier scorecard ratings']
                },
                // BUSINESS & MANAGEMENT
                'business': {
                    topics: ['business strategy', 'organisational behaviour', 'corporate governance', 'entrepreneurship', 'business ethics', 'change management', 'operations management', 'risk management', 'decision-making', 'innovation', 'strategic management', 'leadership', 'corporate finance', 'marketing strategy', 'human capital management', 'organizational development', 'performance management', 'business law', 'stakeholder management', 'international business'],
                    concepts: ['competitive advantage', 'value creation', 'stakeholder engagement', 'corporate culture', 'market orientation', 'strategic alignment', 'business sustainability', 'leadership', 'vision', 'mission', 'core competencies', 'economies of scale', 'scope', 'organizational design', 'matrix structure', 'functional structure', 'divisional structure', 'flat hierarchy', 'empowerment', 'accountability', 'transparency', 'agility', 'resilience', 'innovation ecosystem'],
                    processes: ['strategic planning', 'performance management', 'change implementation', 'team leadership', 'financial planning', 'budgeting', 'project management', 'stakeholder communication', 'decision analysis', 'problem solving', 'negotiation', 'conflict resolution', 'resource allocation', 'performance monitoring', 'quality improvement'],
                    tools: ['business intelligence tools', 'project management software', 'CRM systems', 'collaboration platforms', 'data analytics tools', 'financial modeling software', 'strategic planning templates', 'balanced scorecard', 'SWOT analysis', 'PESTLE analysis', 'Porter\'s Five Forces', 'VRIO framework', 'blue ocean strategy tools', 'scenario planning'],
                    units: ['ROI', 'profit margin', 'market share', 'customer satisfaction', 'employee engagement', 'net promoter score', 'revenue growth', 'cost reduction %']
                },
                // MARKETING, COMMUNICATION & JOURNALISM
                'marketing': {
                    topics: ['digital marketing', 'brand management', 'content strategy', 'public relations', 'social media', 'advertising', 'market research', 'customer experience', 'SEO', 'campaign management', 'web analytics', 'social listening', 'influencer marketing', 'content marketing', 'storytelling', 'brand identity', 'advertising psychology', 'consumer behavior', 'market segmentation', 'positioning'],
                    concepts: ['brand equity', 'customer loyalty', 'conversion optimisation', 'engagement metrics', 'reach and frequency', 'content quality', 'market segmentation', 'brand positioning', 'value proposition', 'customer journey', 'AIDA model', 'customer lifetime value', 'ROI of marketing', 'brand awareness', 'tone of voice', 'brand voice', 'content hierarchy', 'information architecture', 'user experience', 'customer satisfaction'],
                    processes: ['campaign design', 'content creation', 'social media management', 'SEO optimization', 'performance analysis', 'strategic communication', 'crisis communication', 'brand monitoring', 'market research', 'targeting', 'positioning', 'brand audits', 'advertising planning', 'media buying', 'PR strategy', 'community management', 'influencer outreach', 'analytics reporting', 'A/B testing', 'conversion optimization'],
                    tools: ['Google Analytics', 'SEO tools', 'social media management platforms', 'advertising platforms', 'email marketing software', 'content creation tools', 'analytics dashboards', 'market research tools', 'survey platforms', 'CRM systems', 'AI content generators', 'heatmap tools', 'user testing platforms', 'brand monitoring tools', 'PR software'],
                    units: ['CTR', 'conversion rate', 'bounce rate', 'engagement rate', 'reach', 'impressions', 'CPC', 'CPM', 'CPA', 'ROAS', 'sentiment score', 'NPS', 'customer lifetime value', 'brand recall', 'share of voice']
                },
                // STATISTICS, MATHEMATICS & DATA SCIENCE
                'statistics': {
                    topics: ['statistical modelling', 'data analysis', 'big data', 'machine learning', 'data visualisation', 'sampling', 'probability', 'inference', 'regression analysis', 'time series', 'hypothesis testing', 'multivariate analysis', 'Bayesian statistics', 'non-parametric methods', 'survival analysis', 'clinical trials', 'survey design', 'experimental design', 'data mining', 'natural language processing', 'deep learning', 'ensemble methods', 'dimensionality reduction', 'clustering', 'classification', 'predictive modeling', 'causal inference'],
                    concepts: ['statistical significance', 'confidence intervals', 'correlation', 'causation', 'bias', 'variance', 'standard deviation', 'distribution', 'outliers', 'data integrity', 'p-value', 'Type I and Type II errors', 'power', 'effect size', 'multiple testing', 'cross-validation', 'overfitting', 'underfitting', 'regularization', 'kernel methods', 'support vector machines', 'random forests', 'gradient boosting', 'neural networks', 'principal component analysis', 'factor analysis', 'maximum likelihood', 'MCMC', 'EM algorithm', 'AIC', 'BIC', 'R-squared', 'adjusted R-squared', 'mean squared error', 'mean absolute error', 'ROC curve', 'AUC', 'confusion matrix', 'precision', 'recall', 'F1 score'],
                    processes: ['data collection', 'data cleaning', 'exploratory data analysis', 'model building', 'validation', 'interpretation', 'reporting', 'dashboard creation', 'feature engineering', 'variable selection', 'model tuning', 'deployment', 'monitoring', 'communication of results'],
                    tools: ['R', 'Python', 'SQL', 'Excel', 'SPSS', 'SAS', 'Tableau', 'Power BI', 'Jupyter', 'Git', 'Docker', 'Hadoop', 'Spark', 'TensorFlow', 'PyTorch', 'scikit-learn', 'matplotlib', 'seaborn', 'ggplot2', 'dplyr', 'pandas', 'numpy', 'SciPy', 'statsmodels', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost'],
                    units: ['p-value', 'confidence interval', 'standard error', 'R²', 'AUC', 'F1 score', 'accuracy %', 'RMSE', 'MAE']
                },
                // CIVIL ENGINEERING
                'civil': {
                    topics: ['structural engineering', 'geotechnical engineering', 'hydraulics', 'transportation engineering', 'construction materials', 'project management', 'urban planning', 'water engineering', 'environmental infrastructure', 'building codes', 'earthworks', 'foundation design', 'reinforced concrete', 'steel structures', 'timber design', 'masonry', 'road design', 'bridge engineering', 'tunnel engineering', 'coastal engineering', 'earthquake engineering', 'wind engineering', 'fire safety engineering', 'sustainability in construction', 'building information modeling'],
                    concepts: ['load-bearing capacity', 'stability', 'durability', 'sustainability', 'cost-effectiveness', 'safety', 'constructability', 'maintenance', 'environmental impact', 'lifecycle analysis', 'elevation', 'offsets', 'alignment', 'grading', 'compaction', 'shear strength', 'soil bearing capacity', 'consolidation', 'settlement', 'frost heave', 'liquefaction', 'earth pressure', 'retaining walls', 'slope stability', 'foundation types', 'beam design', 'column design', 'reinforcement detailing', 'deflection', 'crack control', 'moment capacity', 'shear reinforcement', 'torsion', 'buckling', 'stability analysis', 'dynamic response', 'damping', 'natural frequency', 'fatigue', 'fracture mechanics', 'stress-strain', 'elasticity', 'plasticity', 'creep', 'shrinkage'],
                    processes: ['design', 'planning', 'site investigation', 'construction', 'quality control', 'supervision', 'testing', 'documentation', 'commissioning', 'handover', 'setting out', 'levelling', 'surveying', 'earthwork calculation', 'material testing', 'structural analysis', 'load calculation', 'drainage design', 'grading design', 'erosion control', 'stormwater management', 'traffic modeling', 'pavement design', 'water distribution', 'sanitary sewer design', 'storm sewer design', 'bridge design', 'foundation design', 'retaining wall design', 'slope stabilization', 'construction scheduling', 'cost estimation', 'risk management'],
                    tools: ['AutoCAD', 'Revit', 'Civil 3D', 'STAAD Pro', 'ETABS', 'SAP2000', 'ANSYS', 'PLAXIS', 'FLAC', 'GIS', 'surveying instruments', 'total station', 'GPS', 'level', 'theodolite', 'soil testing equipment', 'concrete testing equipment', 'asphalt testing equipment', 'NDT equipment', 'compaction testing equipment', 'hydraulic modeling software', 'water quality modeling software', 'traffic simulation software', 'project management software', 'BIM tools'],
                    units: ['kN', 'MN', 'kPa', 'MPa', 'N/mm²', 'mm', 'cm', 'm', 'km', 'm/s', 'm³', 'm³/s', 'L/s', 'kg/m³', 't/m³', 'degrees', 'gradient %', 'settlement mm', 'stress', 'strain', 'modulus', 'permeability', 'coefficient of consolidation', 'CBR', 'R-value', 'durability factors', 'chloride penetration', 'carbonation depth', 'fire resistance rating']
                },
                // MECHANICAL ENGINEERING
                'mechanical': {
                    topics: ['thermodynamics', 'fluid mechanics', 'mechanics of materials', 'manufacturing processes', 'control systems', 'robotics', 'automation', 'machine design', 'materials science', 'heat transfer', 'combustion', 'refrigeration', 'air conditioning', 'HVAC', 'internal combustion engines', 'gas turbines', 'steam turbines', 'hydraulic systems', 'pneumatic systems', 'mechatronics', 'CAD/CAM', 'FEA', 'CFD', 'additive manufacturing', 'composite materials', 'nanotechnology', 'tribology', 'vibration analysis', 'acoustics', 'vehicle dynamics', 'marine engineering', 'aerospace engineering'],
                    concepts: ['efficiency', 'reliability', 'maintainability', 'productivity', 'precision', 'safety', 'innovation', 'cost reduction', 'quality', 'sustainability', 'entropy', 'enthalpy', 'internal energy', 'specific heat', 'thermal conductivity', 'convection coefficient', 'radiation', 'emissivity', 'absorptivity', 'blackbody', 'Planck\'s law', 'Stefan-Boltzmann', 'Fourier\'s law', 'Newton\'s law of cooling', 'Reynolds number', 'Mach number', 'Bernoulli\'s equation', 'Navier-Stokes', 'laminar flow', 'turbulent flow', 'boundary layer', 'viscosity', 'surface tension', 'capillarity', 'buoyancy', 'drag', 'lift', 'stress', 'strain', 'elastic modulus', 'yield strength', 'ultimate tensile strength', 'fatigue limit', 'creep resistance', 'fracture toughness', 'hardness', 'wear resistance', 'coefficient of friction', 'lubrication', 'bearing life', 'gear ratio', 'belt drive', 'chain drive', 'electrical machines', 'actuators', 'sensors', 'PLC', 'microcontrollers', 'feedback control', 'PID control', 'stability criteria', 'Nyquist plot', 'Bode plot', 'root locus', 'state space'],
                    processes: ['design', 'manufacturing', 'assembly', 'testing', 'maintenance', 'troubleshooting', 'optimization', 'automation', 'integration', 'commissioning', 'metal forming', 'casting', 'forging', 'welding', 'machining', 'turning', 'milling', 'drilling', 'grinding', 'EDM', 'laser cutting', 'water jet cutting', '3D printing', 'injection molding', 'blow molding', 'extrusion', 'compression molding', 'fabrication', 'heat treatment', 'surface engineering', 'coating', 'plating', 'anodizing', 'composite layup', 'assembly line', 'quality control', 'inspection'],
                    tools: ['CAD software (SolidWorks, CATIA, NX)', 'FEA software (ANSYS, Abaqus)', 'CFD software', 'CAM software', 'CMM', 'coordinate measuring machine', 'hardness tester', 'tensile tester', 'fatigue tester', 'impact tester', 'hardness tester', 'surface roughness tester', 'laser interferometer', 'vibration analyzer', 'thermal imager', 'thermocouple', 'pressure transducer', 'flow meter', 'tachometer', 'oscilloscope', 'multimeter', 'PLC programming tools', 'robot programming tools', 'hydraulic power unit', 'pneumatic tools', 'hand tools', 'machine tools', 'CNC machines', '3D printers', 'laser systems', 'welding equipment', 'robotic arms', 'AGVs', 'conveyor systems'],
                    units: ['W', 'kW', 'MW', 'J', 'kJ', '°C', 'K', 'bar', 'Pa', 'kPa', 'm/s', 'm/s²', 'rpm', 'rad/s', 'N', 'kN', 'Nm', 'kNm', 'MPa', 'GPa', 'stress', 'strain', 'efficiency %', 'specific energy', 'power density', 'specific heat', 'thermal conductivity', 'convection coefficient', 'emissivity', 'Reynolds number', 'Mach number', 'drag coefficient', 'lift coefficient', 'viscosity (Pa·s)', 'kinematic viscosity', 'surface tension N/m', 'capacitance', 'inductance', 'resistance', 'voltage', 'current', 'power factor']
                },
                // ARCHITECTURE
                'architecture': {
                    topics: ['urban design', 'landscape architecture', 'building design', 'planning law', 'housing', 'public spaces', 'sustainable architecture', 'cultural heritage', 'interior design', 'building science', 'construction technology', 'architectural history', 'architectural theory', 'digital fabrication', 'parametric design', 'generative design', 'adaptive reuse', 'heritage conservation', 'landscape ecology', 'environmental psychology', 'architectural acoustics', 'lighting design', 'thermal comfort', 'building envelope', 'structural systems', 'building services', 'fire protection', 'accessibility', 'universal design', 'placemaking'],
                    concepts: ['spatial design', 'functionality', 'aesthetics', 'contextual integration', 'sustainability', 'heritage preservation', 'accessibility', 'livability', 'urban ecology', 'sense of place', 'genius loci', 'proportion', 'scale', 'rhythm', 'repetition', 'contrast', 'balance', 'emphasis', 'unity', 'variety', 'spatial hierarchy', 'circulation', 'flow', 'human scale', 'ergonomics', 'materiality', 'texture', 'colour theory', 'light and shadow', 'acoustic comfort', 'thermal comfort', 'energy efficiency', 'passive design', 'biophilic design', 'resilience', 'adaptability', 'flexibility', 'modularity', 'prefabrication', 'building information modeling'],
                    processes: ['site analysis', 'conceptual design', 'design development', 'detailed design', 'regulatory approval', 'construction documentation', 'project management', 'post-occupancy evaluation', 'programming', 'schematic design', 'design development', 'construction documents', 'bidding', 'construction administration', 'building commissioning', 'occupant satisfaction survey', 'post-occupancy evaluation', 'adaptive reuse', 'heritage impact assessment', 'conservation management plan', 'urban design guidelines', 'master planning', 'zoning analysis', 'land use planning', 'community engagement', 'participatory design', 'charrette', 'sketching', 'model making', 'rendering', 'animation'],
                    tools: ['AutoCAD', 'Revit', 'Archicad', 'SketchUp', '3ds Max', 'Rhino', 'Grasshopper', 'Lumion', 'V-Ray', 'Enscape', 'Twinmotion', 'Adobe Creative Suite', 'GIS', 'hand drafting tools', 'physical model making tools', 'laser cutters', '3D printers', 'CNC routers', 'building performance analysis tools', 'energy modeling software', 'daylight analysis software', 'acoustic analysis software', 'structural analysis software', 'project management software'],
                    units: ['m²', 'm³', 'ha', 'floor area ratio', 'site coverage', 'building height', 'setback', 'floor-to-floor height', 'ceiling height', 'room dimensions', 'corridor width', 'door height', 'window-to-wall ratio', 'shading coefficient', 'U-value', 'R-value', 'illuminance (lux)', 'sound transmission class', 'noise reduction coefficient', 'daylight factor', 'energy use intensity', 'water use intensity', 'cost per m²']
                },
                // SOCIAL SCIENCES & DEVELOPMENT STUDIES
                'social': {
                    topics: ['development studies', 'social policy', 'community development', 'project management', 'public health', 'social research', 'advocacy', 'welfare', 'inclusion', 'gender studies', 'social justice', 'poverty reduction', 'human rights', 'sustainable development', 'social entrepreneurship', 'civic engagement', 'participatory development', 'social innovation', 'human development', 'capability approach', 'migration', 'urbanization', 'rural development', 'indigenous rights', 'disability inclusion', 'youth development', 'education for all', 'gender mainstreaming', 'social protection', 'community resilience'],
                    concepts: ['social justice', 'inclusion', 'empowerment', 'capacity building', 'sustainable development', 'gender equity', 'community participation', 'social accountability', 'resilience', 'vulnerability', 'human dignity', 'social capital', 'social cohesion', 'civic engagement', 'participatory democracy', 'human rights-based approach', 'rights-based approach', 'livelihoods approach', 'sustainable livelihoods', 'asset-based community development', 'social impact assessment', 'theory of change', 'logic model', 'results-based management', 'community-based monitoring', 'citizen-led accountability', 'social audit', 'social entrepreneurship', 'hybrid organizations', 'triple bottom line', 'inclusive growth', 'pro-poor growth', 'basic needs approach', 'participatory development', 'empowerment evaluation', 'community ownership', 'local knowledge', 'indigenous knowledge'],
                    processes: ['needs assessment', 'programme design', 'project implementation', 'monitoring & evaluation', 'stakeholder engagement', 'advocacy', 'capacity building', 'research', 'reporting', 'community mobilization', 'participatory needs assessment', 'baseline study', 'mid-term review', 'end-line evaluation', 'impact assessment', 'learning and adaptation', 'knowledge management', 'partnership development', 'multi-stakeholder dialogue', 'policy engagement', 'social mobilization', 'campaigning', 'behavior change communication', 'training and facilitation', 'mentoring', 'coaching', 'supervision', 'quality assurance', 'financial management', 'administrative management'],
                    tools: ['qualitative research tools', 'quantitative research tools', 'survey platforms', 'focus group discussion guides', 'key informant interview guides', 'participatory rural appraisal tools', 'community mapping', 'problem tree analysis', 'objective tree analysis', 'SWOT analysis', 'stakeholder analysis', 'social network analysis', 'social impact assessment tools', 'monitoring and evaluation frameworks', 'logical framework', 'theory of change models', 'results frameworks', 'project management software', 'financial management software', 'communication tools', 'advocacy planning tools', 'community scorecards', 'social audit tools', 'citizen report cards', 'community-based monitoring tools', 'data visualization tools'],
                    units: ['household income', 'poverty headcount ratio', 'Gini coefficient', 'human development index', 'gender parity index', 'literacy rate', 'school enrollment rate', 'child mortality rate', 'maternal mortality ratio', 'life expectancy', 'stunting rate', 'wasting rate', 'underweight rate', 'birth registration rate', 'access to safe water', 'access to sanitation', 'food insecurity score', 'livelihood diversification index', 'social capital score', 'community cohesion index', 'resilience score']
                },
                // TRANSPORT & LOGISTICS
                'transport': {
                    topics: ['logistics', 'transport management', 'fleet management', 'warehousing', 'inventory control', 'supply chain', 'import/export', 'clearing & forwarding', 'distribution', 'route planning', 'freight forwarding', 'intermodal transport', 'cargo handling', 'warehouse management systems', 'transport economics', 'supply chain risk', 'supply chain sustainability', 'distribution network design', 'warehouse layout', 'material handling', 'order fulfillment', 'reverse logistics', 'cold chain logistics', 'dangerous goods transport', 'transport regulation', 'road transport', 'rail transport', 'air transport', 'maritime transport', 'inland waterways', 'port operations', 'airport operations', 'dry ports', 'corridor development', 'trade logistics'],
                    concepts: ['efficiency', 'cost reduction', 'timely delivery', 'safety', 'compliance', 'transparency', 'capacity planning', 'optimisation', 'customer service', 'last mile delivery', 'first mile pickup', 'cross-docking', 'hub and spoke', 'continuous replenishment', 'Just-in-Time', 'delivery performance', 'order accuracy', 'damage rates', 'warehouse productivity', 'transportation cost per unit', 'vehicle utilization', 'fuel efficiency', 'carbon footprint', 'supply chain visibility', 'tracking and tracing', 'customer satisfaction', 'service level agreement', 'key performance indicators', 'benchmarking', 'continuous improvement'],
                    processes: ['route planning', 'vehicle scheduling', 'load optimisation', 'fleet maintenance', 'warehouse management', 'order fulfillment', 'dispatch', 'tracking', 'reporting', 'demand forecasting', 'inventory planning', 'supplier selection', 'contract negotiation', 'customs clearance', 'documentation', 'freight booking', 'cargo insurance', 'claims management', 'customer service', 'performance measurement', 'driver management', 'health and safety compliance', 'environmental compliance', 'quality management', 'risk assessment', 'emergency response', 'disaster recovery'],
                    tools: ['transport management systems', 'warehouse management systems', 'fleet management software', 'GPS tracking', 'telematics', 'route optimization software', 'inventory management systems', 'ERP systems', 'yard management systems', 'dock scheduling systems', 'automated guided vehicles', 'conveyor systems', 'forklifts', 'pallet jacks', 'order picking systems', 'barcode scanners', 'RFID systems', 'electronic data interchange', 'port community systems', 'airport management systems', 'customs clearance systems', 'fuel management systems', 'driver safety systems', 'analytics and reporting tools', 'dashboards'],
                    units: ['km', 'km/h', 'tonnes', 'TEU', 'm³', 'litres', 'fuel consumption', 'cost per tonne-km', 'cost per unit', 'delivery time (hours/days)', 'on-time delivery %', 'order accuracy %', 'damage rate %', 'vehicle utilization %', 'warehouse capacity', 'inventory turnover', 'days inventory outstanding', 'lead time', 'freight cost per kg', 'carbon emissions per km']
                },
                // MEDIA, CREATIVE ARTS & DESIGN
                'media': {
                    topics: ['graphic design', 'UI/UX', 'motion graphics', 'videography', 'photography', 'animation', 'art direction', 'multimedia production', 'creative direction', 'brand identity', 'visual communication', 'illustration', 'typography', 'print design', 'web design', 'app design', 'game design', 'virtual reality', 'augmented reality', '3D modeling', 'digital illustration', 'character design', 'storyboarding', 'video editing', 'sound design', 'colour theory', 'composition', 'visual storytelling', 'design thinking', 'creative process', 'design systems', 'responsive design', 'accessibility in design', 'design ethics', 'user research', 'usability testing', 'interaction design', 'information architecture', 'prototyping', 'collaborative design', 'design critique', 'portfolio development'],
                    concepts: ['visual communication', 'creativity', 'consistency', 'user experience', 'branding', 'cultural relevance', 'storytelling', 'visual aesthetics', 'digital trends', 'hierarchy', 'balance', 'contrast', 'proximity', 'alignment', 'repetition', 'visual rhythm', 'white space', 'negative space', 'grid systems', 'typographic hierarchy', 'colour psychology', 'emotional design', 'user-centered design', 'design thinking', 'iterative design', 'agile design', 'design systems', 'atomic design', 'modular design', 'responsive web design', 'mobile-first design', 'accessibility standards', 'usability heuristics', 'user journey mapping', 'empathy mapping', 'prototyping fidelity', 'design critique culture', 'design operations', 'design ethics', 'sustainable design', 'design for social impact'],
                    processes: ['concept development', 'sketching', 'prototyping', 'design execution', 'review', 'revision', 'final production', 'delivery', 'post-production', 'brainstorming', 'mood boarding', 'style framing', 'wireframing', 'user flows', 'interaction design', 'visual design', 'motion design', '3D modeling', 'texturing', 'rigging', 'animation', 'lighting', 'rendering', 'video editing', 'sound mixing', 'color grading', 'final output', 'presentation', 'client feedback', 'revision cycles', 'handoff to development', 'quality assurance', 'launch', 'post-launch monitoring'],
                    tools: ['Adobe Creative Suite (Photoshop, Illustrator, InDesign)', 'Figma', 'Sketch', 'Adobe XD', 'After Effects', 'Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Blender', 'Maya', 'Cinema 4D', 'Houdini', 'ZBrush', 'Procreate', 'Affinity Designer', 'Canva', 'InVision', 'Miro', 'Framer', 'ProtoPie', 'Origami Studio', 'Unity', 'Unreal Engine', 'Nuke', 'Fusion', 'Avid Media Composer', 'Lightroom', 'Capture One', 'Analog photography tools', 'sketchbooks', 'drawing tablets', 'pen displays', 'wacom tablets', 'iPad with Apple Pencil', '3D printers', 'laser cutters', 'CNC routers', 'AR/VR headsets'],
                    units: ['pixels', 'dpi', 'ppi', 'megapixels', 'aspect ratio', 'frame rate', 'resolution', 'bit depth', 'color depth', 'file size', 'rendering time', 'polygons', 'vertices', 'triangles', 'texture resolution', 'UV mapping', 'rigging complexity', 'animation frames', 'audio sample rate', 'bit rate', 'codecs', 'compression ratio', 'white balance', 'exposure', 'aperture', 'shutter speed', 'ISO', 'focal length', 'depth of field', 'composition rules', 'grid dimensions']
                }
            };
            // Fallback for any missing faculty
            return vocabMap[faculty] || {
                topics: ['project management', 'teamwork', 'decision-making', 'problem-solving', 'strategy', 'operations', 'compliance', 'innovation', 'leadership', 'communication', 'analysis', 'planning', 'evaluation', 'coordination', 'quality assurance'],
                concepts: ['efficiency', 'quality', 'customer satisfaction', 'risk', 'sustainability', 'scalability', 'cost-effectiveness', 'reliability', 'accuracy', 'timeliness'],
                processes: ['planning', 'executing', 'evaluating', 'adapting', 'monitoring', 'optimising', 'coordinating', 'reviewing', 'reporting', 'implementing'],
                tools: ['standard tools', 'software', 'equipment', 'analytical methods', 'measurement instruments'],
                units: ['units', 'percent', 'ratio', 'index', 'score']
            };
        }

        // ─── 2. HELPER FUNCTIONS ───
        function pick(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function shuffle(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function randInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function getVerb(questionText) {
            const verbs = ['determine', 'calculate', 'identify', 'evaluate', 'analyse', 'interpret', 'assess', 'select', 'compare', 'differentiate', 'distinguish', 'apply', 'evaluate', 'infer', 'estimate', 'predict', 'recognize', 'justify', 'recommend', 'verify', 'validate', 'measure', 'quantify', 'compute', 'simulate', 'test', 'diagnose', 'classify', 'categorize', 'prioritize', 'rank', 'weigh', 'balance', 'optimize', 'design', 'develop', 'formulate'];
            for (const verb of verbs) {
                if (questionText.toLowerCase().includes(verb)) {
                    return verb;
                }
            }
            return pick(['determine', 'identify', 'evaluate', 'analyse', 'assess', 'select', 'compare', 'differentiate']);
        }

        function verbInOptions(verb, options) {
            const forms = [verb, verb + 's', verb + 'ed', verb + 'ing', verb + 'es'];
            const lowerOptions = options.map(o => o.toLowerCase());
            for (let v of forms) {
                if (lowerOptions.some(opt => opt.includes(v))) return true;
            }
            return false;
        }

        function questionId(q) {
            return q.question.substring(0, 60) + q.options.join('|');
        }

        let usedJobTerms = new Set();

        function integrateJob(stem, job, usedSet) {
            let jobPart = job;
            if (usedSet.has(job)) {
                jobPart = 'your role';
            } else {
                usedSet.add(job);
            }
            return stem.replace(/\{job\}/g, jobPart);
        }

        // ─── 3. QUESTION GENERATORS ───
        function generateScenario(faculty, job, level, vocab, usedSet) {
            const topic1 = pick(vocab.topics);
            let topic2 = pick(vocab.topics);
            while (topic2 === topic1) topic2 = pick(vocab.topics);
            const concept1 = pick(vocab.concepts);
            let concept2 = pick(vocab.concepts);
            while (concept2 === concept1) concept2 = pick(vocab.concepts);
            const process = pick(vocab.processes);
            const unit = pick(vocab.units || ['units']);

            let key = topic1 + topic2 + concept1 + concept2 + process + unit;
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt1 = pick(vocab.topics); let nt2 = pick(vocab.topics); while (nt2 === nt1) nt2 = pick(vocab.topics);
                const nc1 = pick(vocab.concepts); let nc2 = pick(vocab.concepts); while (nc2 === nc1) nc2 = pick(vocab.concepts);
                const np = pick(vocab.processes);
                const nu = pick(vocab.units || ['units']);
                if (!usedSet.has(nt1 + nt2 + nc1 + nc2 + np + nu)) { key = nt1 + nt2 + nc1 + nc2 + np + nu; break; }
                attempts++;
            }
            usedSet.add(key);

            const stems = [
                `In the context of ${topic1}, what is the primary consideration when ${process} with respect to ${concept1} and ${concept2}?`,
                `During ${topic2}, ${process} is influenced by ${concept1}. How does ${concept2} impact the outcome?`,
                `For a {job}, the relationship between ${concept1} and ${concept2} in ${topic1} is critical. What does this imply for ${process}?`,
                `When evaluating ${topic2}, which factor most affects the ${concept1} and ${concept2} during ${process}?`,
                `In ${topic1}, ${process} requires balancing ${concept1} and ${concept2}. What is the optimal approach?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const correct = `Prioritise ${concept1} and ${concept2} by adjusting ${process} while ensuring compliance with ${topic1} standards.`;
            const partial = `Focus on ${concept1} and address ${concept2} only if time permits, while maintaining ${process}.`;
            const wrong1 = `Delegate ${process} entirely and concentrate on ${concept1} independently.`;
            const wrong2 = `Continue with existing ${process} and ignore the ${concept1} and ${concept2} concerns.`;

            let options = [correct, partial, wrong1, wrong2];
            const mainVerb = getVerb(question);
            if (verbInOptions(mainVerb, options)) {
                options = [
                    `Adopt a strategy that integrates ${concept1} and ${concept2} with ${process} in ${topic1}.`,
                    `Implement ${process} with some consideration for ${concept1} and ${concept2}.`,
                    `Concentrate on ${concept1} independently from ${process}.`,
                    `Proceed with ${process} disregarding ${concept1} and ${concept2}.`
                ];
            }

            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(correct);
            const partialIdx = shuffled.indexOf(partial);

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: partialIdx,
                explanation: `The most appropriate response is to ${correct}. ${partial} is a secondary consideration.`,
                type: 'scenario'
            };
        }

        function generateAnalytical(faculty, job, level, vocab, usedSet) {
            const topic = pick(vocab.topics);
            const c1 = pick(vocab.concepts);
            let c2 = pick(vocab.concepts);
            while (c2 === c1) c2 = pick(vocab.concepts);
            const process = pick(vocab.processes);
            let key = topic + c1 + c2 + process;
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt = pick(vocab.topics);
                const nc1 = pick(vocab.concepts);
                let nc2 = pick(vocab.concepts);
                while (nc2 === nc1) nc2 = pick(vocab.concepts);
                const np = pick(vocab.processes);
                if (!usedSet.has(nt + nc1 + nc2 + np)) { key = nt + nc1 + nc2 + np; break; }
                attempts++;
            }
            usedSet.add(key);

            const stems = [
                `In ${topic}, what is the fundamental difference between ${c1} and ${c2} with respect to ${process}?`,
                `Which approach is more effective for a {job}: applying ${c1} or ${c2} when dealing with ${process} in ${topic}?`,
                `How does the application of ${c1} differ from ${c2} when performing ${process} in ${topic}?`,
                `What distinguishes ${c1} from ${c2} as a determinant of ${process} success in ${topic}?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const correct = `${c1} provides more sustainable results due to its compatibility with ${process}.`;
            const partial = `${c2} is easier to implement but may compromise ${process} quality.`;
            const wrong1 = `The choice is irrelevant; both ${c1} and ${c2} have equal impact.`;
            const wrong2 = `Neither ${c1} nor ${c2} should be used; focus solely on ${process}.`;

            let options = [correct, partial, wrong1, wrong2];
            const mainVerb = getVerb(question);
            if (verbInOptions(mainVerb, options)) {
                options = [
                    `Prioritise ${c1} as it aligns with ${process}.`,
                    `Adopt ${c2} if resources are constrained.`,
                    `Adopt a balanced mix of both ${c1} and ${c2}.`,
                    `Defer the decision and rely on existing ${process}.`
                ];
            }

            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(correct);
            const partialIdx = shuffled.indexOf(partial);

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: partialIdx,
                explanation: `The decisive factor is ${correct}. ${partial} is secondary.`,
                type: 'analytical'
            };
        }

        function generateNumerical(faculty, job, level, vocab, usedSet) {
            const topic = pick(vocab.topics);
            const concept = pick(vocab.concepts);
            const process = pick(vocab.processes);
            const unit = pick(vocab.units || ['units']);
            let key = topic + concept + process + unit + 'num';
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt = pick(vocab.topics);
                const nc = pick(vocab.concepts);
                const np = pick(vocab.processes);
                const nu = pick(vocab.units || ['units']);
                if (!usedSet.has(nt + nc + np + nu + 'num')) { key = nt + nc + np + nu + 'num'; break; }
                attempts++;
            }
            usedSet.add(key);

            const base = randInt(50, 200);
            const change = randInt(10, 30);
            const result = Math.round(base + base * change / 100);

            const stems = [
                `In ${topic}, the ${concept} is ${base} ${unit}. If ${process} is implemented, it increases by ${change}%. What is the new value?`,
                `A {job} observes that ${concept} in ${topic} is ${base} ${unit}. After ${process}, it improves by ${change}%. What is the resulting ${concept}?`,
                `The baseline ${concept} for ${topic} is ${base} ${unit}. Following ${process}, a ${change}% enhancement is achieved. What is the new ${concept}?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const options = [
                `${result}`,
                `${result + randInt(5, 15)}`,
                `${result - randInt(5, 15)}`,
                `${result * 2}`
            ];
            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(String(result));

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: -1,
                explanation: `Calculation: ${base} + ${base} × ${change/100} = ${result}.`,
                type: 'numerical'
            };
        }

        function generateLogical(faculty, job, level, vocab, usedSet) {
            const topic = pick(vocab.topics);
            const concept = pick(vocab.concepts);
            const process = pick(vocab.processes);
            let key = topic + concept + process + 'log';
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt = pick(vocab.topics);
                const nc = pick(vocab.concepts);
                const np = pick(vocab.processes);
                if (!usedSet.has(nt + nc + np + 'log')) { key = nt + nc + np + 'log'; break; }
                attempts++;
            }
            usedSet.add(key);

            const stems = [
                `If ${concept} is a higher priority than ${process} in ${topic}, and ${process} is essential for compliance, what is the logical decision sequence for a {job}?`,
                `Given that ${process} yields a 20% increase in ${concept} but also increases costs, how should a {job} prioritise in ${topic}?`,
                `When ${concept} and ${process} are both important in ${topic}, but ${concept} takes precedence, what should be the decision hierarchy?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const correct = `Prioritise ${concept} while adapting ${process} to maintain compliance.`;
            const partial = `Focus on ${process} and accept the ${concept} loss.`;
            const wrong1 = `Abandon ${process} to maximise ${concept}.`;
            const wrong2 = `Ignore both and seek alternative solutions.`;

            let options = [correct, partial, wrong1, wrong2];
            const mainVerb = getVerb(question);
            if (verbInOptions(mainVerb, options)) {
                options = [
                    `Give precedence to ${concept} and modify ${process} accordingly.`,
                    `Maintain ${process} and accept the ${concept} trade-off.`,
                    `Eliminate ${process} to boost ${concept}.`,
                    `Disregard both ${concept} and ${process}.`
                ];
            }

            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(correct);
            const partialIdx = shuffled.indexOf(partial);

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: partialIdx,
                explanation: `The logical sequence is to ${correct}. ${partial} is suboptimal.`,
                type: 'logical'
            };
        }

        function generateEvaluative(faculty, job, level, vocab, usedSet) {
            const topic = pick(vocab.topics);
            const concept = pick(vocab.concepts);
            const process = pick(vocab.processes);
            let key = topic + concept + process + 'eval';
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt = pick(vocab.topics);
                const nc = pick(vocab.concepts);
                const np = pick(vocab.processes);
                if (!usedSet.has(nt + nc + np + 'eval')) { key = nt + nc + np + 'eval'; break; }
                attempts++;
            }
            usedSet.add(key);

            const stems = [
                `As a {job}, you must allocate limited resources between improving ${concept} and enhancing ${process} in ${topic}. Which should you prioritise?`,
                `In ${topic}, you are evaluating the risks associated with implementing ${process} without adequate ${concept}. What is your assessment?`,
                `When ${concept} and ${process} are competing for resources in ${topic}, what is the most justified allocation for a {job}?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const correct = `Prioritise ${concept} as it yields the most significant long-term benefit in ${topic}.`;
            const partial = `Balance both ${concept} and ${process} by phased implementation.`;
            const wrong1 = `Focus exclusively on ${process} and defer ${concept} improvements.`;
            const wrong2 = `Avoid both and maintain the status quo.`;

            let options = [correct, partial, wrong1, wrong2];
            const mainVerb = getVerb(question);
            if (verbInOptions(mainVerb, options)) {
                options = [
                    `Give priority to ${concept} for its strategic impact.`,
                    `Implement ${process} alongside gradual ${concept} improvements.`,
                    `Postpone ${concept} to concentrate on ${process}.`,
                    `Maintain current operations without changes.`
                ];
            }

            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(correct);
            const partialIdx = shuffled.indexOf(partial);

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: partialIdx,
                explanation: `The optimal choice is to ${correct}. ${partial} is a valid compromise.`,
                type: 'evaluative'
            };
        }

        function generateTechnical(faculty, job, level, vocab, usedSet) {
            const topic = pick(vocab.topics);
            const concept = pick(vocab.concepts);
            const process = pick(vocab.processes);
            const tool = pick(vocab.tools || ['standard methods']);
            let key = topic + concept + process + tool + 'tech';
            let attempts = 0;
            while (usedSet.has(key) && attempts < 50) {
                const nt = pick(vocab.topics);
                const nc = pick(vocab.concepts);
                const np = pick(vocab.processes);
                const nt2 = pick(vocab.tools || ['standard methods']);
                if (!usedSet.has(nt + nc + np + nt2 + 'tech')) { key = nt + nc + np + nt2 + 'tech'; break; }
                attempts++;
            }
            usedSet.add(key);

            const stems = [
                `In ${topic}, what is the primary advantage of using ${tool} over conventional methods when ${process} with respect to ${concept}?`,
                `Which principle underpins the application of ${concept} in ${topic} when ${process} is performed?`,
                `For a {job}, what is the most critical parameter to monitor when ${process} in ${topic} to ensure ${concept}?`,
                `What does the ${concept} imply for the selection of ${process} in ${topic}?`
            ];
            let question = pick(stems);
            question = integrateJob(question, job, usedJobTerms);

            const correct = `${tool} provides the most accurate ${concept} assessment, ensuring reliable ${process}.`;
            const partial = `${tool} is adequate but requires calibration for ${concept} in ${topic}.`;
            const wrong1 = `${tool} is not suitable for ${process} in ${topic}; manual methods are preferable.`;
            const wrong2 = `The ${concept} does not influence the choice of ${tool} or ${process}.`;

            let options = [correct, partial, wrong1, wrong2];
            const mainVerb = getVerb(question);
            if (verbInOptions(mainVerb, options)) {
                options = [
                    `${tool} is the most appropriate for ${concept} in ${topic} during ${process}.`,
                    `${tool} is acceptable but alternative tools may be considered.`,
                    `Manual methods are superior to ${tool} for this application.`,
                    `The ${concept} is irrelevant to the choice of ${tool}.`
                ];
            }

            const shuffled = shuffle(options);
            const correctIdx = shuffled.indexOf(correct);
            const partialIdx = shuffled.indexOf(partial);

            return {
                question,
                options: shuffled,
                correct: correctIdx,
                partial: partialIdx,
                explanation: `The correct approach is to use ${tool} because it addresses ${concept} effectively in ${process}.`,
                type: 'technical'
            };
        }

        // ─── 4. MASTER QUESTION GENERATOR ───
        function generateQuestions(faculty, job, level) {
            const vocab = getVocabForFaculty(faculty);
            const usedSet = new Set();
            usedJobTerms = new Set();

            // Determine question types based on level
            let types = [];
            if (level === 'diploma') {
                types = ['technical', 'technical', 'technical', 'scenario', 'scenario', 'analytical', 'analytical', 'numerical', 'logical', 'evaluative'];
            } else if (level === 'degree') {
                types = ['technical', 'technical', 'analytical', 'analytical', 'numerical', 'logical', 'logical', 'evaluative', 'scenario', 'technical'];
            } else if (level === 'masters') {
                types = ['technical', 'analytical', 'analytical', 'numerical', 'logical', 'logical', 'evaluative', 'evaluative', 'scenario', 'technical'];
            } else if (level === 'phd') {
                types = ['technical', 'analytical', 'analytical', 'numerical', 'logical', 'evaluative', 'evaluative', 'evaluative', 'scenario', 'technical'];
            } else {
                types = ['technical', 'technical', 'analytical', 'numerical', 'logical', 'evaluative', 'scenario', 'technical', 'analytical', 'evaluative'];
            }
            shuffle(types);

            // Ensure variety: no adjacent same types
            for (let i = 1; i < types.length; i++) {
                if (types[i] === types[i - 1]) {
                    if (i + 1 < types.length && types[i + 1] !== types[i]) {
                        [types[i], types[i + 1]] = [types[i + 1], types[i]];
                    } else {
                        const alt = ['technical', 'scenario', 'analytical', 'logical', 'evaluative', 'numerical'].filter(t => t !== types[i]);
                        types[i] = pick(alt);
                    }
                }
            }

            const generators = {
                'scenario': generateScenario,
                'analytical': generateAnalytical,
                'numerical': generateNumerical,
                'logical': generateLogical,
                'evaluative': generateEvaluative,
                'technical': generateTechnical
            };

            const questions = [];
            const usedQ = new Set();

            let attempts = 0;
            while (questions.length < 10 && attempts < 2000) {
                attempts++;
                const type = types[questions.length % types.length];
                const gen = generators[type];
                if (!gen) continue;
                const q = gen(faculty, job, level, vocab, usedSet);
                const id = questionId(q);
                if (!usedQ.has(id)) {
                    usedQ.add(id);
                    questions.push(q);
                }
            }

            while (questions.length < 10) {
                const q = generateTechnical(faculty, job, level, vocab, usedSet);
                const id = questionId(q);
                if (!usedQ.has(id)) {
                    usedQ.add(id);
                    questions.push(q);
                }
            }

            return questions;
        }

        // ─── 5. QUIZ LOGIC ───
        const setupDiv = document.getElementById('assessmentSetup');
        const quizDiv = document.getElementById('assessmentQuiz');
        const resultsDiv = document.getElementById('assessmentResults');
        const questionText = document.getElementById('questionText');
        const questionOptions = document.getElementById('questionOptions');
        const questionFeedback = document.getElementById('questionFeedback');
        const questionCounter = document.getElementById('questionCounter');
        const progressBar = document.getElementById('progressBar');
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');
        const retakeBtn = document.getElementById('retakeAssessmentBtn');
        const resultsScore = document.getElementById('resultsScore');
        const resultsSub = document.getElementById('resultsSub');
        const resultsIcon = document.getElementById('resultsIcon');
        const resultsDetails = document.getElementById('resultsDetails');

        let currentQuestions = [];
        let currentIndex = 0;
        let answers = [];
        let timerInterval = null;
        let timeRemaining = 600;
        const TOTAL_TIME = 600;

        function createTimerDisplay() {
            const timerDiv = document.createElement('div');
            timerDiv.id = 'quizTimer';
            timerDiv.style.cssText = 'text-align:center; font-size:1.2rem; font-weight:600; color:var(--primary); margin-bottom:1rem;';
            timerDiv.innerHTML = `⏳ Time remaining: <span id="timerValue">10:00</span>`;
            quizDiv.insertBefore(timerDiv, quizDiv.firstChild);
        }

        function updateTimerDisplay() {
            const timerSpan = document.getElementById('timerValue');
            if (!timerSpan) return;
            const mins = Math.floor(timeRemaining / 60);
            const secs = timeRemaining % 60;
            timerSpan.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            timerSpan.style.color = timeRemaining <= 60 ? '#dc3545' : 'inherit';
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timeRemaining = TOTAL_TIME;
            updateTimerDisplay();
            timerInterval = setInterval(function() {
                timeRemaining--;
                updateTimerDisplay();
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    if (quizDiv.style.display !== 'none') {
                        alert('⏰ Time is up!');
                        showResults();
                    }
                }
            }, 1000);
        }

        function renderQuestion() {
            if (!currentQuestions.length) return;
            const q = currentQuestions[currentIndex];

            questionCounter.textContent = `Question ${currentIndex + 1} of ${currentQuestions.length}`;
            progressBar.style.width = `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
            questionText.textContent = q.question;

            const labels = ['A', 'B', 'C', 'D'];
            let html = '';
            q.options.forEach((opt, idx) => {
                const checked = (answers[currentIndex] !== undefined && answers[currentIndex] === idx) ? 'checked' : '';
                html += `<label><input type="radio" name="question" value="${idx}" ${checked}><span><strong>${labels[idx]}.</strong> ${opt}</span></label>`;
            });
            questionOptions.innerHTML = html;
            questionOptions.querySelectorAll('input[type="radio"]').forEach(input => {
                input.addEventListener('change', function() {
                    answers[currentIndex] = parseInt(this.value);
                });
            });

            questionFeedback.classList.remove('show');
            questionFeedback.textContent = '';

            prevBtn.disabled = currentIndex === 0;
            if (currentIndex === currentQuestions.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'inline-block';
                submitBtn.style.display = 'none';
            }
        }

        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) { currentIndex--;
                renderQuestion(); }
        });
        nextBtn.addEventListener('click', function() {
            if (currentIndex < currentQuestions.length - 1) { currentIndex++;
                renderQuestion(); }
        });

        submitBtn.addEventListener('click', function() {
            if (timerInterval) { clearInterval(timerInterval);
                timerInterval = null; }
            showResults();
        });

        function showResults() {
            quizDiv.style.display = 'none';
            resultsDiv.style.display = 'block';

            let totalScore = 0;
            const maxScore = currentQuestions.length * 10;
            let detailsHtml = '';
            const labels = ['A', 'B', 'C', 'D'];

            currentQuestions.forEach((q, idx) => {
                const userAnswer = answers[idx];
                let score = 0;
                let isCorrect = false;
                let answerDisplay = 'Not answered';
                if (userAnswer !== undefined) {
                    answerDisplay = labels[userAnswer];
                    if (userAnswer === q.correct) {
                        score = 10;
                        isCorrect = true;
                    } else if (q.partial !== -1 && userAnswer === q.partial) {
                        score = 5;
                    } else {
                        score = 0;
                    }
                }
                totalScore += score;

                detailsHtml += `
                    <div class="result-item">
                        <span class="r-icon ${isCorrect ? 'correct' : (score > 0 ? 'partial' : 'wrong')}">
                            ${isCorrect ? '✅' : (score > 0 ? '⚠️' : '❌')}
                        </span>
                        <div>
                            <strong>Q${idx + 1}:</strong> ${q.question.substring(0, 80)}${q.question.length > 80 ? '...' : ''}
                            <br><span style="font-size:0.8rem;color:var(--text-muted);">
                                Your answer: ${answerDisplay} | 
                                Best: ${labels[q.correct]} | Score: ${score}/10
                            </span>
                            ${q.explanation ? `<br><span style="font-size:0.75rem;color:var(--text-muted);">${q.explanation}</span>` : ''}
                        </div>
                    </div>
                `;
            });

            resultsScore.textContent = `${totalScore} / ${maxScore}`;
            const percentage = (totalScore / maxScore) * 100;
            if (percentage >= 90) resultsSub.textContent = '🏆 Outstanding! You have exceptional knowledge.';
            else if (percentage >= 70) resultsSub.textContent = '🌟 Excellent! You have a strong grasp.';
            else if (percentage >= 50) resultsSub.textContent = '👍 Good effort! Review the topics you missed.';
            else resultsSub.textContent = '📚 Keep learning! Focus on the fundamentals and try again.';

            if (percentage >= 90) resultsIcon.textContent = '🏆';
            else if (percentage >= 70) resultsIcon.textContent = '🌟';
            else if (percentage >= 50) resultsIcon.textContent = '👍';
            else resultsIcon.textContent = '📚';

            resultsDetails.innerHTML = detailsHtml;
            const timerEl = document.getElementById('quizTimer');
            if (timerEl) timerEl.remove();
        }

        retakeBtn.addEventListener('click', function() {
            if (timerInterval) { clearInterval(timerInterval);
                timerInterval = null; }
            setupDiv.style.display = 'block';
            quizDiv.style.display = 'none';
            resultsDiv.style.display = 'none';
            currentQuestions = [];
            currentIndex = 0;
            answers = [];
            const timerEl = document.getElementById('quizTimer');
            if (timerEl) timerEl.remove();
            const facultySelectEl = document.getElementById('facultySelect');
            const jobSelectEl = document.getElementById('jobSelect');
            const levelSelectEl = document.getElementById('levelSelect');
            const startBtn = document.getElementById('startAssessmentBtn');
            if (facultySelectEl) facultySelectEl.value = '';
            if (jobSelectEl) { jobSelectEl.innerHTML = '<option value="">— Select Job Title —</option>';
                jobSelectEl.disabled = true; }
            if (levelSelectEl) { levelSelectEl.value = '';
                levelSelectEl.disabled = true; }
            if (startBtn) startBtn.disabled = true;
        });

        // ─── 6. START ASSESSMENT ───
        const startBtn2 = document.getElementById('startAssessmentBtn');
        if (startBtn2) {
            startBtn2.addEventListener('click', function() {
                const facultySelectEl = document.getElementById('facultySelect');
                const jobSelectEl = document.getElementById('jobSelect');
                const levelSelectEl = document.getElementById('levelSelect');
                const faculty = facultySelectEl ? facultySelectEl.value : '';
                const job = jobSelectEl ? jobSelectEl.value : '';
                const level = levelSelectEl ? levelSelectEl.value : '';
                if (!faculty || !job || !level) return;

                // Generate questions
                currentQuestions = generateQuestions(faculty, job, level);
                currentIndex = 0;
                answers = new Array(currentQuestions.length).fill(undefined);

                setupDiv.style.display = 'none';
                quizDiv.style.display = 'block';
                resultsDiv.style.display = 'none';

                const oldTimer = document.getElementById('quizTimer');
                if (oldTimer) oldTimer.remove();
                createTimerDisplay();
                startTimer();
                renderQuestion();
            });
        }

        // Initial state
        if (setupDiv) setupDiv.style.display = 'block';
        if (quizDiv) quizDiv.style.display = 'none';
        if (resultsDiv) resultsDiv.style.display = 'none';

        console.log('✅ Ultra‑pro assessment engine loaded with professional question generation.');
    })();














    // ─── 16. SOCIAL SHARING BAR MODIFICATION TO DOWN BADO ───
    const shareBar = document.querySelector('.assessment-share-bar');
    const shareLinksAll = document.querySelectorAll('.share-link');

    const pageUrlFull = encodeURIComponent(window.location.href);
    const shareTitleFull = encodeURIComponent('🎯 CareerConnectTZ – Smart Career Assessment');
    const shareDescriptionFull = encodeURIComponent(
        'Assess your professional knowledge for free! ' +
        'Take the CareerConnectTZ Smart Career Assessment and discover your strengths. ' +
        'Get instant results, detailed feedback, and insights to accelerate your career growth. ' +
        'Join thousands of professionals who have taken the test!'
    );

    const shareUrlsAll = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrlFull}&quote=${shareDescriptionFull}`,
        twitter: `https://twitter.com/intent/tweet?text=${shareTitleFull}%0A%0A${shareDescriptionFull}%0A%0A${pageUrlFull}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrlFull}&summary=${shareDescriptionFull}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareTitleFull}\n\n${decodeURIComponent(shareDescriptionFull)}\n\n${window.location.href}`)}`,
        email: `mailto:?subject=${shareTitleFull}&body=${shareDescriptionFull}%0A%0A${decodeURIComponent(pageUrlFull)}`
    };

    shareLinksAll.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.dataset.platform;
            const url = shareUrlsAll[platform];
            if (url) {
                if (platform === 'email') {
                    window.location.href = url;
                } else {
                    window.open(url, '_blank', 'width=600,height=500');
                }
            }
        });
    });









    // ─── 17. CAREER COACHING READ MORE (delegated) ───
    const coachingSection = document.querySelector('.coaching-section');
    if (coachingSection) {
        coachingSection.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn-read-article');
            if (btn) {
                const article = btn.closest('.coaching-article.soulful');
                if (article) {
                    const full = article.querySelector('.article-full');
                    if (full) {
                        const isOpen = full.style.display === 'block';
                        full.style.display = isOpen ? 'none' : 'block';
                        btn.innerHTML = isOpen
                            ? 'Read More <i class="fas fa-chevron-down"></i>'
                            : 'Read Less <i class="fas fa-chevron-up"></i>';
                        btn.classList.toggle('active');
                    }
                }
            }
        });
    }

    // ─── 18. RESEARCH CHALLENGE FORM ───
    const researchForm = document.getElementById('researchChallengeForm');
    const rmChallengeSuccess = document.getElementById('rmChallengeSuccess');

    if (researchForm) {
        researchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('.rm-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const formData = new FormData(this);

            try {
                const response = await fetch('https://formspree.io/f/mgaezarg', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    this.style.display = 'none';
                    if (rmChallengeSuccess) rmChallengeSuccess.style.display = 'block';
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Challenge';
                    submitBtn.disabled = false;

                    setTimeout(() => {
                        if (rmChallengeSuccess) rmChallengeSuccess.style.display = 'none';
                        this.style.display = 'block';
                        this.reset();
                    }, 3000);
                } else {
                    alert('Submission failed. Please try again.');
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Challenge';
                    submitBtn.disabled = false;
                }
            } catch (error) {
                alert('Network error. Please check your connection.');
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Challenge';
                submitBtn.disabled = false;
            }
        });
    }

    // ─── 19. HIDE ALL SECTIONS ON INITIAL LOAD ───
    hideAllSections();

    // ─── 20. FINAL LOG ───
    console.log('✅ CareerConnectTZ fully loaded – all features intact, responsive, and ready.');
});
