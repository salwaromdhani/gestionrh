// =========================================================
// GESTIONRH — JAVASCRIPT
// Connecté à l'API Spring Boot (/api/employes, /api/departements, /api/postes)
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const API = "/api";
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ---------- État de l'application ----------
    const state = { employes: [], departements: [], postes: [], demo: false };
    const charts = {};

    // ---------- Stockage local (photos, thème, paramètres) ----------
    const store = {
        get(key, def) {
            try {
                const v = localStorage.getItem(key);
                return v ? JSON.parse(v) : def;
            } catch (e) { return def; }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) { return false; }
        }
    };

    let photos = store.get("grh-photos", {});
    let settings = Object.assign(
        { company: "GestionRH", admin: "Administrateur", email: "" },
        store.get("grh-settings", {})
    );

    // ---------- Outils ----------
    const PALETTE = ["#0E7C7B", "#F76C5E", "#F5B841", "#6366F1", "#14B8A6", "#EC4899", "#8B5CF6", "#22C55E"];

    function esc(texte) {
        const d = document.createElement("div");
        d.textContent = texte == null ? "" : String(texte);
        return d.innerHTML;
    }

    function money(v) {
        if (v == null || v === "" || isNaN(v)) return "-";
        return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " DT";
    }

    function colorFor(key) {
        let h = 0;
        const s = String(key);
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return PALETTE[h % PALETTE.length];
    }

    const deptColor = d => colorFor("dept-" + d.id);
    const initials = e => (((e.prenom || "").charAt(0) + (e.nom || "").charAt(0)).toUpperCase()) || "?";
    const sumSalaire = list => list.reduce((s, e) => s + (Number(e.salaire) || 0), 0);

    function avatarHTML(e, size) {
        const cls = "avatar " + (size || "");
        const photo = photos[e.id];
        if (photo) return `<div class="${cls}"><img src="${photo}" alt=""></div>`;
        return `<div class="${cls}" style="background:${colorFor("emp-" + e.id)}">${esc(initials(e))}</div>`;
    }

    function byDept() {
        return state.departements.map(d => ({
            d,
            list: state.employes.filter(e => e.departement && e.departement.id === d.id)
        }));
    }

    // ---------- Notifications toast ----------
    function toast(message, type) {
        type = type || "info";
        const icons = { success: "✅", error: "⛔", warning: "⚠️", info: "ℹ️" };
        const el = document.createElement("div");
        el.className = "toast toast-" + type;
        el.innerHTML = `<span>${icons[type]}</span><p>${esc(message)}</p>`;
        $("#toastContainer").appendChild(el);
        requestAnimationFrame(() => el.classList.add("show"));
        setTimeout(() => {
            el.classList.remove("show");
            setTimeout(() => el.remove(), 300);
        }, 3200);
    }

    // ---------- Date du jour ----------
    $("#currentDate").textContent = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

    // ---------- Menu mobile ----------
    const sidebar = $("#sidebar");
    const overlay = $("#overlay");

    function closeSidebar() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    }

    $("#menuToggle").addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("show");
    });
    overlay.addEventListener("click", closeSidebar);

    // ---------- Navigation entre les pages ----------
    const TITLES = {
        accueil: "Tableau de bord",
        employes: "Employés",
        departements: "Départements",
        postes: "Postes",
        statistiques: "Statistiques",
        powerbi: "Rapport Power BI",
        parametres: "Paramètres"
    };

    function showPage(id) {
        if (!TITLES[id]) id = "accueil";
        $$(".page").forEach(p => p.classList.toggle("active", p.id === id));
        $$(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.page === id));
        $("#pageTitle").textContent = TITLES[id];
        $("#notifDropdown").classList.remove("show");
        closeSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (id === "accueil" || id === "statistiques") renderCharts();
    }

    $$(".nav-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // ---------- Appels à l'API ----------
    async function api(url, options) {
        const res = await fetch(API + url, Object.assign({
            headers: { "Content-Type": "application/json" }
        }, options || {}));

        if (!res.ok) {
            let msg = "Erreur " + res.status;
            try {
                const data = await res.json();
                msg = data.message || data.error || Object.values(data).join(", ") || msg;
            } catch (e) { /* pas de JSON */ }
            throw new Error(msg);
        }

        if (res.status === 204) return null;
        const txt = await res.text();
        return txt ? JSON.parse(txt) : null;
    }

    async function loadData() {
        try {
            const [e, d, p] = await Promise.all([api("/employes"), api("/departements"), api("/postes")]);
            state.employes = Array.isArray(e) ? e : [];
            state.departements = Array.isArray(d) ? d : [];
            state.postes = Array.isArray(p) ? p : [];
            state.demo = false;
        } catch (err) {
            console.warn("API indisponible, passage en mode démo :", err.message);
            if (!state.demo) loadDemo();
            state.demo = true;
        }
        $("#demoBanner").hidden = !state.demo;
        renderAll();
    }

    function refresh() {
        if (state.demo) {
            renderAll();
            return Promise.resolve();
        }
        return loadData();
    }

    // ---------- Données de démonstration ----------
    function loadDemo() {
        const d = [
            { id: 1, nom: "Informatique", description: "Développement et maintenance des systèmes." },
            { id: 2, nom: "Finance", description: "Gestion financière et comptabilité." },
            { id: 3, nom: "Ressources humaines", description: "Recrutement et gestion du personnel." },
            { id: 4, nom: "Marketing", description: "Communication et stratégie commerciale." }
        ];
        const p = [
            { id: 1, intitule: "Développeur", description: "Conception d'applications", salaireMinimum: 1800, salaireMaximum: 3500 },
            { id: 2, intitule: "Comptable", description: "Tenue des comptes", salaireMinimum: 1500, salaireMaximum: 2800 },
            { id: 3, intitule: "Responsable RH", description: "Gestion du personnel", salaireMinimum: 2200, salaireMaximum: 4000 },
            { id: 4, intitule: "Designer", description: "Création graphique", salaireMinimum: 1400, salaireMaximum: 2600 },
            { id: 5, intitule: "Technicien", description: "Support et maintenance", salaireMinimum: 1200, salaireMaximum: 2200 }
        ];
        const E = (id, nom, prenom, email, salaire, pi, di) =>
            ({ id, nom, prenom, email, salaire, poste: p[pi], departement: d[di] });

        state.departements = d;
        state.postes = p;
        state.employes = [
            E(1, "Ben Ali", "Ahmed", "ahmed@gmail.com", 2800, 0, 0),
            E(2, "Trabelsi", "Salma", "salma@gmail.com", 2100, 1, 1),
            E(3, "Haddad", "Mohamed", "mohamed@gmail.com", 3400, 2, 2),
            E(4, "Mansour", "Amira", "amira@gmail.com", 1900, 3, 3),
            E(5, "Jaziri", "Youssef", "youssef@gmail.com", 1500, 4, 0),
            E(6, "Gharbi", "Ines", "ines@gmail.com", 3100, 0, 0),
            E(7, "Saidi", "Karim", "karim@gmail.com", 2400, 1, 1)
        ];
    }

    // ---------- Enregistrer / supprimer (API ou démo) ----------
    const nextId = arr => arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;

    async function saveEntity(type, data, id) {
        if (!state.demo) {
            return id
                ? api(`/${type}/${id}`, { method: "PUT", body: JSON.stringify(data) })
                : api(`/${type}`, { method: "POST", body: JSON.stringify(data) });
        }

        // Mode démo : modification en mémoire
        const arr = state[type];
        const obj = Object.assign({}, data);
        if (type === "employes") {
            obj.poste = data.poste ? state.postes.find(p => p.id === data.poste.id) || null : null;
            obj.departement = data.departement ? state.departements.find(d => d.id === data.departement.id) || null : null;
        }
        if (id) {
            const existant = arr.find(x => x.id === Number(id));
            Object.assign(existant, obj);
            return existant;
        }
        obj.id = nextId(arr);
        arr.push(obj);
        return obj;
    }

    async function deleteEntity(type, id) {
        if (!state.demo) return api(`/${type}/${id}`, { method: "DELETE" });

        state[type] = state[type].filter(x => x.id !== id);
        if (type === "departements") {
            state.employes.forEach(e => { if (e.departement && e.departement.id === id) e.departement = null; });
        }
        if (type === "postes") {
            state.employes.forEach(e => { if (e.poste && e.poste.id === id) e.poste = null; });
        }
    }

    // =====================================================
    // AFFICHAGE
    // =====================================================
    function renderAll() {
        applySettings();
        fillSelects();
        renderKPIs();
        renderRecent();
        renderEmployes();
        renderDepartements();
        renderPostes();
        renderStats();
        renderNotifications();
        renderCharts();
    }

    function animateNumber(el, value, format) {
        format = format || (v => Math.round(v).toLocaleString("fr-FR"));
        const start = performance.now();
        const duree = 700;
        function step(t) {
            const k = Math.min(1, (t - start) / duree);
            el.textContent = format(value * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function renderKPIs() {
        animateNumber($("#kpiEmployes"), state.employes.length);
        animateNumber($("#kpiDepartements"), state.departements.length);
        animateNumber($("#kpiPostes"), state.postes.length);
        animateNumber($("#kpiMasse"), sumSalaire(state.employes), money);
    }

    function renderRecent() {
        const list = state.employes.slice().sort((a, b) => b.id - a.id).slice(0, 5);
        $("#recentList").innerHTML = list.length
            ? list.map(e => `
                <li>
                    ${avatarHTML(e)}
                    <div class="grow">
                        <strong>${esc(e.prenom)} ${esc(e.nom)}</strong>
                        <small>${esc(e.poste ? e.poste.intitule : "Sans poste")} · ${esc(e.departement ? e.departement.nom : "Sans département")}</small>
                    </div>
                    <span class="amount">${money(e.salaire)}</span>
                </li>`).join("")
            : `<li class="empty">Aucun employé pour le moment.</li>`;
    }

    function renderEmployes() {
        const q = $("#employeeSearch").value.toLowerCase().trim();
        const filtre = $("#deptFilter").value;

        const rows = state.employes.filter(e => {
            const texte = [e.nom, e.prenom, e.email,
                e.poste && e.poste.intitule,
                e.departement && e.departement.nom].join(" ").toLowerCase();
            const okDept = !filtre || (e.departement && String(e.departement.id) === filtre);
            return texte.includes(q) && okDept;
        });

        const tbody = $("#employeeTableBody");

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty">${state.employes.length
                ? "Aucun résultat pour cette recherche."
                : "Aucun employé. Cliquez sur « Ajouter un employé »."}</td></tr>`;
        } else {
            tbody.innerHTML = rows.map(e => `
                <tr>
                    <td>
                        <div class="person">
                            ${avatarHTML(e)}
                            <div><strong>${esc(e.prenom)} ${esc(e.nom)}</strong><small>#${e.id}</small></div>
                        </div>
                    </td>
                    <td>${esc(e.email)}</td>
                    <td>${e.poste ? `<span class="tag" style="--tag:#6366F1">${esc(e.poste.intitule)}</span>` : '<span class="muted">—</span>'}</td>
                    <td>${e.departement ? `<span class="tag" style="--tag:${deptColor(e.departement)}">${esc(e.departement.nom)}</span>` : '<span class="muted">—</span>'}</td>
                    <td class="strong">${money(e.salaire)}</td>
                    <td class="right">
                        <button class="icon-btn sm" type="button" data-edit-employe="${e.id}" title="Modifier">✏️</button>
                        <button class="icon-btn sm danger" type="button" data-delete-employe="${e.id}" title="Supprimer">🗑️</button>
                    </td>
                </tr>`).join("");
        }

        $("#tableInfo").textContent = `${rows.length} employé(s) affiché(s) sur ${state.employes.length}`;
    }

    function renderDepartements() {
        const box = $("#departmentContainer");
        const data = byDept();

        if (!data.length) {
            box.innerHTML = `
                <div class="card empty-state">
                    <div class="empty-icon">🏢</div>
                    <h3>Aucun département</h3>
                    <p class="muted">Commencez par créer votre premier département.</p>
                    <button class="btn btn-primary" type="button" data-action="add-departement">+ Ajouter un département</button>
                </div>`;
            return;
        }

        box.innerHTML = data.map(({ d, list }) => {
            const moyenne = list.length ? sumSalaire(list) / list.length : 0;
            return `
                <div class="dept-card" style="--accent-c:${deptColor(d)}">
                    <div class="dept-top">
                        <div class="dept-icon">${esc((d.nom || "?").charAt(0).toUpperCase())}</div>
                        <div class="dept-actions">
                            <button class="icon-btn sm" type="button" data-edit-departement="${d.id}" title="Modifier">✏️</button>
                            <button class="icon-btn sm danger" type="button" data-delete-departement="${d.id}" title="Supprimer">🗑️</button>
                        </div>
                    </div>
                    <h3>${esc(d.nom)}</h3>
                    <p class="muted">${esc(d.description || "Aucune description")}</p>
                    <div class="dept-stats">
                        <div><strong>${list.length}</strong><small>Employé(s)</small></div>
                        <div><strong>${money(moyenne)}</strong><small>Salaire moyen</small></div>
                    </div>
                    <div class="avatar-stack">
                        ${list.slice(0, 5).map(e => avatarHTML(e, "avatar-sm")).join("")}
                        ${list.length > 5 ? `<span class="more">+${list.length - 5}</span>` : ""}
                        ${list.length === 0 ? '<small class="muted">Aucun employé</small>' : ""}
                    </div>
                </div>`;
        }).join("");
    }

    function renderPostes() {
        const tbody = $("#postesTableBody");

        if (!state.postes.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty">Aucun poste. Cliquez sur « Ajouter un poste ».</td></tr>`;
            return;
        }

        tbody.innerHTML = state.postes.map(p => {
            const nb = state.employes.filter(e => e.poste && e.poste.id === p.id).length;
            return `
                <tr>
                    <td><span class="tag" style="--tag:#6366F1">${esc(p.intitule)}</span></td>
                    <td class="muted">${esc(p.description || "—")}</td>
                    <td>${money(p.salaireMinimum)} → ${money(p.salaireMaximum)}</td>
                    <td><strong>${nb}</strong></td>
                    <td class="right">
                        <button class="icon-btn sm" type="button" data-edit-poste="${p.id}" title="Modifier">✏️</button>
                        <button class="icon-btn sm danger" type="button" data-delete-poste="${p.id}" title="Supprimer">🗑️</button>
                    </td>
                </tr>`;
        }).join("");
    }

    function renderStats() {
        const salaires = state.employes.map(e => Number(e.salaire)).filter(s => !isNaN(s) && s > 0);
        const moyenne = salaires.length ? salaires.reduce((a, b) => a + b, 0) / salaires.length : 0;

        $("#statMoyen").textContent = money(moyenne);
        $("#statMin").textContent = salaires.length ? money(Math.min.apply(null, salaires)) : "-";
        $("#statMax").textContent = salaires.length ? money(Math.max.apply(null, salaires)) : "-";
        $("#statSansDept").textContent = state.employes.filter(e => !e.departement).length;
    }

    function renderNotifications() {
        const n = [];

        if (state.demo) n.push({ i: "⚠️", t: "Mode démonstration : le serveur ne répond pas", g: "accueil" });

        const sansDept = state.employes.filter(e => !e.departement).length;
        if (sansDept) n.push({ i: "🏢", t: `${sansDept} employé(s) sans département`, g: "employes" });

        const sansPoste = state.employes.filter(e => !e.poste).length;
        if (sansPoste) n.push({ i: "💼", t: `${sansPoste} employé(s) sans poste`, g: "employes" });

        state.employes.forEach(e => {
            if (!e.poste || e.salaire == null) return;
            if (e.poste.salaireMinimum != null && e.salaire < e.poste.salaireMinimum) {
                n.push({ i: "💰", t: `${e.prenom} ${e.nom} : salaire sous le minimum du poste`, g: "employes" });
            } else if (e.poste.salaireMaximum != null && e.salaire > e.poste.salaireMaximum) {
                n.push({ i: "💰", t: `${e.prenom} ${e.nom} : salaire au-dessus du maximum du poste`, g: "employes" });
            }
        });

        byDept().filter(x => !x.list.length).forEach(x => {
            n.push({ i: "📭", t: `Le département « ${x.d.nom} » n'a aucun employé`, g: "departements" });
        });

        const badge = $("#notifBadge");
        badge.textContent = n.length;
        badge.hidden = n.length === 0;

        $("#notifList").innerHTML = n.length
            ? n.map(x => `<li data-goto="${x.g}"><span>${x.i}</span><span>${esc(x.t)}</span></li>`).join("")
            : `<li class="empty">🎉 Tout est en ordre !</li>`;
    }

    function fillSelects() {
        const optDept = state.departements.map(d => `<option value="${d.id}">${esc(d.nom)}</option>`).join("");
        const optPoste = state.postes.map(p => `<option value="${p.id}">${esc(p.intitule)}</option>`).join("");

        const filtre = $("#deptFilter");
        const valeur = filtre.value;
        filtre.innerHTML = `<option value="">Tous les départements</option>` + optDept;
        filtre.value = state.departements.some(d => String(d.id) === valeur) ? valeur : "";

        $("#departementSelect").innerHTML = `<option value="">-- Choisir un département --</option>` + optDept;
        $("#posteSelect").innerHTML = `<option value="">-- Choisir un poste --</option>` + optPoste;
    }

    // =====================================================
    // GRAPHIQUES (style Power BI) — Chart.js
    // =====================================================
    function cssVar(nom) {
        return getComputedStyle(document.body).getPropertyValue(nom).trim();
    }

    function makeChart(id, config) {
        const canvas = document.getElementById(id);
        if (!canvas || typeof Chart === "undefined") return;
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(canvas, config);
    }

    function renderCharts() {
        if (typeof Chart === "undefined") return;

        const grid = cssVar("--border");
        const cardBg = cssVar("--card");
        Chart.defaults.font.family = "Poppins, sans-serif";
        Chart.defaults.color = cssVar("--text-light");

        const dd = byDept();
        const labels = dd.map(x => x.d.nom);
        const colors = dd.map(x => deptColor(x.d));
        const legendBas = { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, padding: 14 } };
        const tooltipDT = { callbacks: { label: c => " " + money(c.raw) } };

        // 1. Employés par département
        makeChart("chartDept", {
            type: "bar",
            data: { labels, datasets: [{ label: "Employés", data: dd.map(x => x.list.length), backgroundColor: colors, borderRadius: 10, maxBarThickness: 48 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: grid } } }
            }
        });

        // 2. Répartition par poste
        const parPoste = state.postes
            .map(p => ({ p, n: state.employes.filter(e => e.poste && e.poste.id === p.id).length }))
            .filter(x => x.n > 0);

        makeChart("chartPoste", {
            type: "doughnut",
            data: {
                labels: parPoste.map(x => x.p.intitule),
                datasets: [{ data: parPoste.map(x => x.n), backgroundColor: parPoste.map((x, i) => PALETTE[i % PALETTE.length]), borderWidth: 3, borderColor: cardBg }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: legendBas } }
        });

        // 3. Masse salariale par département
        makeChart("chartMasse", {
            type: "bar",
            data: { labels, datasets: [{ label: "Masse salariale", data: dd.map(x => sumSalaire(x.list)), backgroundColor: colors.map(c => c + "CC"), borderRadius: 10, maxBarThickness: 26 }] },
            options: {
                indexAxis: "y", responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipDT },
                scales: {
                    x: { beginAtZero: true, grid: { color: grid }, ticks: { callback: v => Number(v).toLocaleString("fr-FR") } },
                    y: { grid: { display: false } }
                }
            }
        });

        // 4. Salaire moyen par poste
        const moyPoste = state.postes.map(p => {
            const l = state.employes.filter(e => e.poste && e.poste.id === p.id);
            return { p, moy: l.length ? sumSalaire(l) / l.length : 0 };
        }).filter(x => x.moy > 0);

        makeChart("chartSalairePoste", {
            type: "bar",
            data: {
                labels: moyPoste.map(x => x.p.intitule),
                datasets: [{ label: "Salaire moyen", data: moyPoste.map(x => Math.round(x.moy)), backgroundColor: moyPoste.map((x, i) => PALETTE[i % PALETTE.length]), borderRadius: 10, maxBarThickness: 44 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: tooltipDT },
                scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: grid } } }
            }
        });

        // 5. Tranches de salaire
        const tranches = [
            { l: "< 1 500 DT", f: s => s < 1500 },
            { l: "1 500 – 2 500 DT", f: s => s >= 1500 && s < 2500 },
            { l: "2 500 – 3 500 DT", f: s => s >= 2500 && s < 3500 },
            { l: "≥ 3 500 DT", f: s => s >= 3500 }
        ];

        makeChart("chartTranches", {
            type: "pie",
            data: {
                labels: tranches.map(t => t.l),
                datasets: [{
                    data: tranches.map(t => state.employes.filter(e => e.salaire != null && t.f(Number(e.salaire))).length),
                    backgroundColor: ["#5EEAD4", "#0E7C7B", "#F5B841", "#F76C5E"],
                    borderWidth: 3, borderColor: cardBg
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: legendBas } }
        });
    }

    // =====================================================
    // FENÊTRES (MODALES)
    // =====================================================
    let confirmResolve = null;

    function openModal(id) {
        $("#" + id).classList.add("show");
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("show");
        if (modal.id === "confirmModal" && confirmResolve) {
            const r = confirmResolve;
            confirmResolve = null;
            r(false);
        }
    }

    function confirmDialog(titre, texte, bouton) {
        $("#confirmTitle").textContent = titre;
        $("#confirmText").textContent = texte;
        $("#confirmOk").textContent = bouton || "Supprimer";
        openModal("confirmModal");
        return new Promise(resolve => { confirmResolve = resolve; });
    }

    $("#confirmOk").addEventListener("click", () => {
        const r = confirmResolve;
        confirmResolve = null;
        $("#confirmModal").classList.remove("show");
        if (r) r(true);
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") $$(".modal.show").forEach(closeModal);
    });

    function setLoading(btn, loading) {
        if (!btn) return;
        btn.disabled = loading;
        if (loading) {
            btn.dataset.label = btn.textContent;
            btn.textContent = "Enregistrement...";
        } else if (btn.dataset.label) {
            btn.textContent = btn.dataset.label;
        }
    }

    // ---------- Employé ----------
    let pendingPhoto; // undefined = pas de changement, null = retirer, texte = nouvelle photo

    function setPhotoPreview(src, emp) {
        const box = $("#photoPreview");
        if (src) {
            box.innerHTML = `<img src="${src}" alt="">`;
            box.style.background = "";
            box.style.color = "";
        } else if (emp) {
            box.textContent = initials(emp);
            box.style.background = colorFor("emp-" + emp.id);
            box.style.color = "#fff";
        } else {
            box.textContent = "📷";
            box.style.background = "";
            box.style.color = "";
        }
    }

    function updateSalaireHint() {
        const poste = state.postes.find(p => String(p.id) === $("#posteSelect").value);
        $("#salaireHint").textContent = poste && (poste.salaireMinimum != null || poste.salaireMaximum != null)
            ? `Fourchette du poste : ${money(poste.salaireMinimum)} → ${money(poste.salaireMaximum)}`
            : "";
    }

    function openEmployeModal(emp) {
        if (!state.departements.length) {
            toast("Créez d'abord au moins un département.", "warning");
            showPage("departements");
            return;
        }

        $("#employeeForm").reset();
        pendingPhoto = undefined;
        $("#employeeModalTitle").textContent = emp ? "Modifier l'employé" : "Ajouter un employé";
        $("#employeeId").value = emp ? emp.id : "";

        if (emp) {
            $("#nom").value = emp.nom || "";
            $("#prenom").value = emp.prenom || "";
            $("#email").value = emp.email || "";
            $("#salaire").value = emp.salaire != null ? emp.salaire : "";
            $("#posteSelect").value = emp.poste ? emp.poste.id : "";
            $("#departementSelect").value = emp.departement ? emp.departement.id : "";
        }

        setPhotoPreview(emp ? photos[emp.id] : null, emp);
        updateSalaireHint();
        openModal("employeeModal");
        setTimeout(() => $("#nom").focus(), 100);
    }

    $("#posteSelect").addEventListener("change", () => {
        updateSalaireHint();
        const poste = state.postes.find(p => String(p.id) === $("#posteSelect").value);
        if (poste && $("#salaire").value === "" && poste.salaireMinimum != null) {
            $("#salaire").value = poste.salaireMinimum;
        }
    });

    function resizeImage(file, taille) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = canvas.height = taille;
                    const cote = Math.min(img.width, img.height);
                    canvas.getContext("2d").drawImage(
                        img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, taille, taille
                    );
                    resolve(canvas.toDataURL("image/jpeg", 0.85));
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    $("#photoInput").addEventListener("change", e => {
        const file = e.target.files[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast("Veuillez choisir une image.", "error");
            return;
        }
        resizeImage(file, 160)
            .then(src => { pendingPhoto = src; setPhotoPreview(src); })
            .catch(() => toast("Impossible de lire cette image.", "error"));
    });

    $("#removePhotoBtn").addEventListener("click", () => {
        pendingPhoto = null;
        const emp = state.employes.find(x => String(x.id) === $("#employeeId").value);
        setPhotoPreview(null, emp);
    });

    $("#employeeForm").addEventListener("submit", async e => {
        e.preventDefault();
        const id = $("#employeeId").value;
        const data = {
            nom: $("#nom").value.trim(),
            prenom: $("#prenom").value.trim(),
            email: $("#email").value.trim(),
            salaire: $("#salaire").value === "" ? null : Number($("#salaire").value),
            poste: $("#posteSelect").value ? { id: Number($("#posteSelect").value) } : null,
            departement: $("#departementSelect").value ? { id: Number($("#departementSelect").value) } : null
        };

        const btn = e.submitter;
        setLoading(btn, true);
        try {
            const saved = await saveEntity("employes", data, id);
            const empId = id ? Number(id) : (saved && saved.id);

            if (empId != null && pendingPhoto !== undefined) {
                if (pendingPhoto) photos[empId] = pendingPhoto;
                else delete photos[empId];
                if (!store.set("grh-photos", photos)) {
                    toast("Photo non enregistrée : espace du navigateur plein.", "warning");
                }
            }

            closeModal($("#employeeModal"));
            toast(id ? "Employé modifié avec succès." : "Employé ajouté avec succès.", "success");
            await refresh();
        } catch (err) {
            toast("Erreur : " + err.message, "error");
        } finally {
            setLoading(btn, false);
        }
    });

    // ---------- Département ----------
    function openDeptModal(d) {
        $("#departementForm").reset();
        $("#deptModalTitle").textContent = d ? "Modifier le département" : "Ajouter un département";
        $("#deptId").value = d ? d.id : "";
        if (d) {
            $("#deptNom").value = d.nom || "";
            $("#deptDescription").value = d.description || "";
        }
        openModal("departementModal");
        setTimeout(() => $("#deptNom").focus(), 100);
    }

    $("#departementForm").addEventListener("submit", async e => {
        e.preventDefault();
        const id = $("#deptId").value;
        const data = {
            nom: $("#deptNom").value.trim(),
            description: $("#deptDescription").value.trim()
        };

        const btn = e.submitter;
        setLoading(btn, true);
        try {
            await saveEntity("departements", data, id);
            closeModal($("#departementModal"));
            toast(id ? "Département modifié." : "Département ajouté.", "success");
            await refresh();
        } catch (err) {
            toast("Erreur : " + err.message, "error");
        } finally {
            setLoading(btn, false);
        }
    });

    // ---------- Poste ----------
    function openPosteModal(p) {
        $("#posteForm").reset();
        $("#posteModalTitle").textContent = p ? "Modifier le poste" : "Ajouter un poste";
        $("#posteId").value = p ? p.id : "";
        if (p) {
            $("#posteIntitule").value = p.intitule || "";
            $("#posteDescription").value = p.description || "";
            $("#posteMin").value = p.salaireMinimum != null ? p.salaireMinimum : "";
            $("#posteMax").value = p.salaireMaximum != null ? p.salaireMaximum : "";
        }
        openModal("posteModal");
        setTimeout(() => $("#posteIntitule").focus(), 100);
    }

    $("#posteForm").addEventListener("submit", async e => {
        e.preventDefault();
        const id = $("#posteId").value;
        const min = $("#posteMin").value === "" ? null : Number($("#posteMin").value);
        const max = $("#posteMax").value === "" ? null : Number($("#posteMax").value);

        if (min != null && max != null && min > max) {
            toast("Le salaire minimum doit être inférieur au maximum.", "warning");
            return;
        }

        const data = {
            intitule: $("#posteIntitule").value.trim(),
            description: $("#posteDescription").value.trim(),
            salaireMinimum: min,
            salaireMaximum: max
        };

        const btn = e.submitter;
        setLoading(btn, true);
        try {
            await saveEntity("postes", data, id);
            closeModal($("#posteModal"));
            toast(id ? "Poste modifié." : "Poste ajouté.", "success");
            await refresh();
        } catch (err) {
            toast("Erreur : " + err.message, "error");
        } finally {
            setLoading(btn, false);
        }
    });

    // =====================================================
    // GESTION DES CLICS (tous les boutons)
    // =====================================================
    document.addEventListener("click", async e => {
        const t = e.target;

        // Fermer une fenêtre
        const close = t.closest("[data-close]");
        if (close) { closeModal(close.closest(".modal")); return; }
        if (t.classList.contains("modal")) { closeModal(t); return; }

        // Fermer les notifications si on clique ailleurs
        if (!t.closest(".notif-wrapper")) $("#notifDropdown").classList.remove("show");

        // Aller à une page
        const goto = t.closest("[data-goto]");
        if (goto) { e.preventDefault(); showPage(goto.dataset.goto); return; }

        // Boutons d'ajout
        const action = t.closest("[data-action]");
        if (action) {
            if (action.dataset.action === "add-employe") openEmployeModal(null);
            if (action.dataset.action === "add-departement") openDeptModal(null);
            if (action.dataset.action === "add-poste") openPosteModal(null);
            return;
        }

        // Modifier / supprimer
        const btn = t.closest("[data-edit-employe],[data-delete-employe],[data-edit-departement],[data-delete-departement],[data-edit-poste],[data-delete-poste]");
        if (!btn) return;

        try {
            if (btn.dataset.editEmploye) {
                openEmployeModal(state.employes.find(x => x.id === Number(btn.dataset.editEmploye)));
            }

            if (btn.dataset.deleteEmploye) {
                const emp = state.employes.find(x => x.id === Number(btn.dataset.deleteEmploye));
                if (!emp) return;
                const ok = await confirmDialog(
                    `Supprimer ${emp.prenom} ${emp.nom} ?`,
                    "Cette action est définitive. Ses congés et contrats liés peuvent empêcher la suppression."
                );
                if (!ok) return;
                await deleteEntity("employes", emp.id);
                delete photos[emp.id];
                store.set("grh-photos", photos);
                toast("Employé supprimé.", "success");
                await refresh();
            }

            if (btn.dataset.editDepartement) {
                openDeptModal(state.departements.find(x => x.id === Number(btn.dataset.editDepartement)));
            }

            if (btn.dataset.deleteDepartement) {
                const d = state.departements.find(x => x.id === Number(btn.dataset.deleteDepartement));
                if (!d) return;
                const nb = state.employes.filter(x => x.departement && x.departement.id === d.id).length;
                const ok = await confirmDialog(
                    `Supprimer le département « ${d.nom} » ?`,
                    nb ? `Attention : ${nb} employé(s) y sont rattachés. Réaffectez-les d'abord.` : "Cette action est définitive."
                );
                if (!ok) return;
                await deleteEntity("departements", d.id);
                toast("Département supprimé.", "success");
                await refresh();
            }

            if (btn.dataset.editPoste) {
                openPosteModal(state.postes.find(x => x.id === Number(btn.dataset.editPoste)));
            }

            if (btn.dataset.deletePoste) {
                const p = state.postes.find(x => x.id === Number(btn.dataset.deletePoste));
                if (!p) return;
                const nb = state.employes.filter(x => x.poste && x.poste.id === p.id).length;
                const ok = await confirmDialog(
                    `Supprimer le poste « ${p.intitule} » ?`,
                    nb ? `Attention : ${nb} employé(s) occupent ce poste.` : "Cette action est définitive."
                );
                if (!ok) return;
                await deleteEntity("postes", p.id);
                toast("Poste supprimé.", "success");
                await refresh();
            }
        } catch (err) {
            toast("Suppression impossible : " + err.message, "error");
        }
    });

    // ---------- Notifications ----------
    $("#notifBtn").addEventListener("click", e => {
        e.stopPropagation();
        $("#notifDropdown").classList.toggle("show");
    });

    // ---------- Recherche ----------
    $("#employeeSearch").addEventListener("input", renderEmployes);
    $("#deptFilter").addEventListener("change", renderEmployes);

    $("#globalSearch").addEventListener("keydown", e => {
        if (e.key !== "Enter") return;
        const valeur = e.target.value.trim();
        showPage("employes");
        $("#employeeSearch").value = valeur;
        renderEmployes();
        if (valeur) toast(`Résultats pour « ${valeur} »`, "info");
    });

    // ---------- Export CSV ----------
    function exportCSV() {
        if (!state.employes.length) {
            toast("Aucun employé à exporter.", "warning");
            return;
        }
        const entete = ["ID", "Nom", "Prénom", "Email", "Salaire", "Poste", "Département"];
        const lignes = state.employes.map(e => [
            e.id, e.nom, e.prenom, e.email, e.salaire,
            e.poste ? e.poste.intitule : "",
            e.departement ? e.departement.nom : ""
        ]);
        const csv = [entete].concat(lignes)
            .map(l => l.map(v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`).join(";"))
            .join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const lien = document.createElement("a");
        lien.href = URL.createObjectURL(blob);
        lien.download = `employes_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(lien);
        lien.click();
        lien.remove();
        setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
        toast("Fichier CSV téléchargé.", "success");
    }

    $("#exportBtn").addEventListener("click", exportCSV);
    $("#pbiExport").addEventListener("click", exportCSV);

    // ---------- Power BI ----------
    function showPbi(url) {
        if (!url) {
            $("#pbiFrame").src = "about:blank";
            $("#pbiFrameCard").hidden = true;
            return;
        }
        $("#pbiFrame").src = url;
        $("#pbiFrameCard").hidden = false;
    }

    $("#pbiForm").addEventListener("submit", e => {
        e.preventDefault();
        const url = $("#pbiUrl").value.trim();
        if (!/^https:\/\/(app\.powerbi\.com|app\.fabric\.microsoft\.com)\//i.test(url)) {
            toast("Le lien doit commencer par https://app.powerbi.com/", "error");
            return;
        }
        store.set("grh-pbi", url);
        showPbi(url);
        toast("Rapport Power BI chargé.", "success");
    });

    $("#pbiClear").addEventListener("click", () => {
        store.set("grh-pbi", "");
        $("#pbiUrl").value = "";
        showPbi("");
        toast("Rapport retiré.", "info");
    });

    const pbiSauvegarde = store.get("grh-pbi", "");
    if (pbiSauvegarde) {
        $("#pbiUrl").value = pbiSauvegarde;
        showPbi(pbiSauvegarde);
    }

    // ---------- Thème clair / sombre ----------
    function applyTheme(dark) {
        document.body.classList.toggle("dark", dark);
        $("#themeToggle").textContent = dark ? "☀️" : "🌙";
        $("#darkSwitch").checked = dark;
        store.set("grh-theme", dark ? "dark" : "light");
        renderCharts();
    }

    $("#themeToggle").addEventListener("click", () => applyTheme(!document.body.classList.contains("dark")));
    $("#darkSwitch").addEventListener("change", e => applyTheme(e.target.checked));

    // ---------- Paramètres ----------
    function applySettings() {
        $("#brandName").textContent = settings.company;
        $("#heroCompany").textContent = settings.company;
        $("#heroName").textContent = settings.admin.split(" ")[0];
        $("#adminLabel").textContent = settings.admin;
        $("#adminAvatar").textContent = (settings.admin.charAt(0) || "A").toUpperCase();
        document.title = settings.company + " — Tableau de bord RH";
    }

    $("#companyName").value = settings.company;
    $("#adminName").value = settings.admin;
    $("#adminEmail").value = settings.email;

    $("#settingsForm").addEventListener("submit", e => {
        e.preventDefault();
        settings = {
            company: $("#companyName").value.trim() || "GestionRH",
            admin: $("#adminName").value.trim() || "Administrateur",
            email: $("#adminEmail").value.trim()
        };
        store.set("grh-settings", settings);
        applySettings();
        toast("Paramètres enregistrés.", "success");
    });

    $("#clearPhotosBtn").addEventListener("click", async () => {
        const ok = await confirmDialog("Supprimer toutes les photos ?", "Les photos des employés seront retirées de ce navigateur.");
        if (!ok) return;
        photos = {};
        store.set("grh-photos", photos);
        renderAll();
        toast("Photos supprimées.", "success");
    });

    // ---------- Réessayer la connexion ----------
    $("#retryBtn").addEventListener("click", async () => {
        await loadData();
        toast(state.demo ? "Le serveur ne répond toujours pas." : "Connexion au serveur rétablie !", state.demo ? "warning" : "success");
    });

    // ---------- Déconnexion ----------
    $("#logoutBtn").addEventListener("click", async e => {
        e.preventDefault();
        const ok = await confirmDialog("Se déconnecter ?", "Vous allez quitter votre session.", "Se déconnecter");
        if (ok) {
            toast("Déconnexion réussie. À bientôt !", "success");
            setTimeout(() => location.reload(), 1200);
        }
    });

    // =====================================================
    // DÉMARRAGE
    // =====================================================
    applyTheme(store.get("grh-theme", "light") === "dark");
    applySettings();
    loadData();
});