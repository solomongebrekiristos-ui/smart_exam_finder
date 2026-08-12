# 🎓 Smart Exam Finder - Gambella University

A modern, responsive web application designed for students and staff at Gambella University to quickly look up exam schedules, room assignments, seat numbers, and instructors.

---

## ✨ Features

* **Instant Search:** Search by student full name or ID number in real-time.
* **Stream Filtering:** Quick-access tabs to toggle between *All Students*, *Natural Science*, and *Social Science*.
* **Live Google Sheets Integration:** Fetches up-to-date data directly from a live Google Sheet using Google Apps Script (`doGet`).
* **Detailed Student Cards:** Displays subject, room/block, seat number, exam time, and teacher information clearly.
* **Developer Info Modal:** Interactive popup highlighting project creator details.
* **Responsive Design:** Optimized for mobile phones, tablets, and desktop computers.

---

## 🛠️ Built With

* **HTML5** – Page structure and layout.
* **CSS3** – Modern styling, flexbox/grid, and variables.
* **JavaScript (ES6+)** – Asynchronous data fetching, filtering, and DOM manipulation.
* **Google Apps Script** – Backend connector for Google Sheets JSON API.
* **FontAwesome** – UI icons.

---

## 🚀 Getting Started Locally

To run or test this project on your local machine:

1. Clone or download this repository to your computer.
2. Ensure you have the following core files in your directory:
   * `index.html`
   * `style.css`
   * `script.js`
3. Open `index.html` directly in any modern web browser, or use a local development server like Live Server in VS Code.

---

## 📊 Setting Up the Google Sheet Backend

1. Create a Google Sheet with columns for: 
   `id`, `name`, `subject`, `block`, `seat`, `time`, `teacher`.
2. Go to **Extensions > Apps Script** in your Google Sheet and deploy the script as a Web App (access set to *Anyone*).
3. Paste your deployed Web App URL into your `script.js` file where the API endpoint is configured.

---

## 👤 Author

* **Created by:** Gambella University Developer Team