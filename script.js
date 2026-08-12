// ==================================================
// SMART EXAM FINDER - GAMBELLA UNIVERSITY (GMBU)
// Developer: Solomon Gebrekiristos Wube
// ==================================================

// Paste your Published Google Sheets CSV or Apps Script Web App URL here:
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbziCmJ_mKNOcIapZfehllBTWPNqRK6fD8B1bRMjE3cURDcxTpL6fwrziReANAysj36I/exec';

// Current Academic Year at GMBU
const CURRENT_ACADEMIC_YEAR = 2026;

// --------------------------------------------------
// 🗓️ EXAM SEASON CONFIGURATION (YYYY-MM-DD)
// Set the start and end dates for the official exam session.
// --------------------------------------------------
const EXAM_START_DATE = new Date('2026-08-10T00:00:00'); // Exam start date
const EXAM_END_DATE   = new Date('2026-08-26T23:59:59'); // Exam end date

let studentsData = [];
let activeStream = 'all';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const resultsGrid = document.getElementById('resultsGrid');
const totalCount = document.getElementById('totalCount');
const searchStatus = document.getElementById('searchStatus');
const filterTabs = document.querySelectorAll('.tab-btn');

// Modal Elements
const devModal = document.getElementById('devModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    checkExamSeasonAndLoad();
    setupEventListeners();
});

// 1. Check Exam Date Window Before Fetching Data
function checkExamSeasonAndLoad() {
    const today = new Date();

    // If current date is BEFORE start date or AFTER end date -> Show Closed Portal Screen
    if (today < EXAM_START_DATE || today > EXAM_END_DATE) {
        showPortalClosedScreen(today);
    } else {
        fetchExamData(); // Portal is Active! Proceed to load data
    }
}

// 2. Closed Portal UI Message
function showPortalClosedScreen(today) {
    if (totalCount) totalCount.textContent = "0";
    if (searchStatus) {
        searchStatus.textContent = "🔒 Portal Closed";
        if (searchStatus.parentElement) {
            searchStatus.parentElement.style.backgroundColor = "#fee2e2";
            searchStatus.parentElement.style.color = "#991b1b";
        }
    }

    if (!resultsGrid) return;

    let statusMessage = today < EXAM_START_DATE 
        ? `Exams will officially begin on <strong>${EXAM_START_DATE.toDateString()}</strong>.` 
        : `Exam season ended on <strong>${EXAM_END_DATE.toDateString()}</strong>.`;

    resultsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <i class="fa-solid fa-calendar-xmark" style="font-size: 56px; color: #0284c7; margin-bottom: 16px;"></i>
            <h2 style="color: #1e293b; margin-bottom: 8px;">Exam Schedule Portal is Currently Closed</h2>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 16px;">${statusMessage}</p>
            <span style="background: #f1f5f9; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; color: #475569;">
                GMBU STEM Center Academic System
            </span>
        </div>
    `;
}

// 3. Fetch Exam Data (Supports Apps Script JSON & Published CSV)
async function fetchExamData() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL, { redirect: 'follow' });
        if (!response.ok) throw new Error("Failed to connect to sheet URL.");

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const json = await response.json();
            studentsData = normalizeData(json);
        } else {
            const csvText = await response.text();
            studentsData = parseCSV(csvText);
        }

        if (searchStatus) searchStatus.textContent = "⚡ System Connected";

    } catch (error) {
        console.warn("Using Offline GMBU Dataset (Fallback Mode):", error);

        // Sample Fallback Data for Local Offline Demos
        const rawFallback = [
            { id: "1001", name: "Solomon Gebrekiristos", program: "Civil Eng (4-Yr)", batch_year: "2026", subject: "Physics Final", room: "Block A - Room 101", seat: "Row 1, Seat 4", time: "8:30 AM - 10:30 AM", teacher: "Dr. Abebe" },
            { id: "1002", name: "Tadesse Worku", program: "Electrical Eng (2-Yr)", batch_year: "2025", subject: "Chemistry", room: "Block B - Room 202", seat: "Row 3, Seat 12", time: "10:30 AM - 12:30 PM", teacher: "Alemayehu T." },
            { id: "1003", name: "Bethlehem Alemu", program: "Social Science", batch_year: "2026", subject: "Economics", room: "Social Hall B - Room 105", seat: "Row 2, Seat 8", time: "2:00 PM - 4:00 PM", teacher: "Dr. Hassan" },
            { id: "1007", name: "Genet Assefa", program: "Computer Science", batch_year: "2026", subject: "Computer Science", room: "STEM Lab - Room 1", seat: "Row 1, Seat 2", time: "8:30 AM - 10:30 AM", teacher: "Eng. Daniel" },
            { id: "1051", name: "Omot Okello", program: "Civil Eng (4-Yr)", batch_year: "2026", subject: "Physics Final", room: "Block A - Room 101", seat: "Row 4, Seat 10", time: "8:30 AM - 10:30 AM", teacher: "Dr. Abebe" }
        ];

        studentsData = normalizeData(rawFallback);
        if (searchStatus) searchStatus.textContent = "🔒 System Off-Season (Offline Mode)";
    }

    filterStudents();
}

// 4. Quote-Safe CSV Parser
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/[\s\-_]/g, ''));

    const rawList = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });

    return normalizeData(rawList);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
        if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// 5. Normalize Records with GMBU Dynamic Program Duration Logic
function normalizeData(rawList) {
    return rawList.map(item => {
        const subj = (item.subject || '').toLowerCase();
        const prog = (item.program || '').toLowerCase();
        const batchYear = parseInt(item.batch_year || item.batchyear || item.year) || CURRENT_ACADEMIC_YEAR;

        // Determine Program Duration based on GMBU Curriculum
        let programDuration = 3; // Default GMBU undergraduate duration (3 years)
        if (prog.includes('4-yr') || prog.includes('4 yr') || prog.includes('civil') || prog.includes('software')) {
            programDuration = 4;
        } else if (prog.includes('2-yr') || prog.includes('2 yr')) {
            programDuration = 2;
        }

        // Automatic Graduation Calculation
        const isGraduated = (batchYear + programDuration) <= CURRENT_ACADEMIC_YEAR;
        const computedStatus = isGraduated ? 'Graduated' : 'Active';

        // Assign Academic Stream
        let stream = 'social';
        if (subj.includes('phys') || subj.includes('chem') || subj.includes('math') || subj.includes('biol') || prog.includes('eng') || prog.includes('comp') || prog.includes('tech')) {
            stream = 'natural';
        }

        return {
            id: String(item.id || item.student_id || ''),
            name: item.name || item.student_name || '',
            program: item.program || item.department || '',
            batch_year: batchYear,
            subject: item.subject || item.course || '',
            room: item.room || item.exam_room || '',
            seat: item.seat || item.seat_number || '',
            time: item.time || item.exam_time || '',
            teacher: item.teacher || item.instructor || '',
            status: computedStatus,
            stream: stream
        };
    });
}

// 6. Filtering Engine
function filterStudents() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const filtered = studentsData.filter(student => {
        // Automatically hide graduated students
        const isActive = student.status === 'Active';

        const nameMatch = student.name.toLowerCase().includes(query);
        const idMatch = student.id.toLowerCase().includes(query);
        const progMatch = student.program.toLowerCase().includes(query);
        const subjMatch = student.subject.toLowerCase().includes(query);
        const roomMatch = student.room.toLowerCase().includes(query);
        const teacherMatch = student.teacher.toLowerCase().includes(query);

        const matchesSearch = nameMatch || idMatch || progMatch || subjMatch || roomMatch || teacherMatch;
        const matchesStream = (activeStream === 'all') || (student.stream === activeStream);

        return isActive && matchesSearch && matchesStream;
    });

    renderStudents(filtered);
}

// 7. Render Student Cards to DOM
function renderStudents(list) {
    if (totalCount) totalCount.textContent = list.length;

    if (!resultsGrid) return;
    resultsGrid.innerHTML = '';

    if (list.length === 0) {
        resultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fa-solid fa-graduation-cap" style="font-size: 48px; margin-bottom: 12px; color: #cbd5e1;"></i>
                <h3>No active exam schedules found matching your search.</h3>
            </div>`;
        return;
    }

    list.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="margin: 0; color: #1e293b;">${student.name}</h3>
                <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">ID: ${student.id}</span>
            </div>
            <p style="margin: 0 0 10px 0; color: #0284c7; font-weight: 500;"><i class="fa-solid fa-book"></i> ${student.program || 'Undergraduate'}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 10px;">
            <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                <p style="margin: 4px 0;"><strong>Exam:</strong> ${student.subject}</p>
                <p style="margin: 4px 0;"><strong>Room:</strong> <span style="background: #fef08a; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${student.room}</span></p>
                <p style="margin: 4px 0;"><strong>Seat:</strong> ${student.seat}</p>
                <p style="margin: 4px 0;"><strong>Time:</strong> ${student.time}</p>
                <p style="margin: 4px 0;"><strong>Instructor:</strong> ${student.teacher || 'N/A'}</p>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

// 8. Setup UI Event Listeners
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterStudents();
        });
    }

    // Tab Filtering Buttons
    filterTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterTabs.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeStream = e.currentTarget.getAttribute('data-stream') || 'all';
            filterStudents();
        });
    });

    // Developer Modal Controls
    if (openModalBtn && devModal) {
        openModalBtn.addEventListener('click', () => {
            devModal.classList.add('active');
        });
    }

    if (closeModalBtn && devModal) {
        closeModalBtn.addEventListener('click', () => {
            devModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === devModal) {
            devModal.classList.remove('active');
        }
    });
}

