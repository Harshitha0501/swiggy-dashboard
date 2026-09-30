# 🍽️ Swiggy Restaurant Analytics Dashboard

An interactive data analytics dashboard built with **React, JavaScript, and Chart.js** to explore restaurant locations, cuisines, ratings, and pricing patterns from the Swiggy restaurant dataset.

## 📊 Live Demo

🚀 Live Demo: Coming soon

## 🔗 Related SQL Analysis

This dashboard is the visual analytics companion to my Swiggy SQL project:

👉 https://github.com/Harshitha0501/Swiggy-SQL-Analysis

---

## ✨ Features

- 📂 Upload Swiggy restaurant data through CSV
- 📊 Analyze restaurant distribution by location
- 🍛 Explore popular cuisine categories
- ⭐ Analyze restaurant rating distribution
- ₹ Analyze average ratings for higher-cost restaurants
- ⚠️ Identify unusually high recorded cost values
- 📥 Download an analytics report as a `.txt` file
- 🔄 Automatically recalculate insights from the uploaded dataset
- 📈 Interactive charts powered by Chart.js
- 📱 Responsive dashboard interface

---

## 📌 Dashboard Insights

The dashboard analyzes:

### 📍 Restaurant Distribution

Identifies locations with the highest number of restaurant records.

### 🍛 Cuisine Analysis

Breaks down cuisine categories and identifies the most frequently occurring cuisines.

### ⭐ Rating Distribution

Groups restaurant ratings into:

- 0.0–2.9
- 3.0–3.9
- 4.0–4.4
- 4.5–5.0

### ₹ Pricing Analysis

Calculates the average restaurant rating for restaurants with a recorded cost of ₹500 or more.

### ⚠️ Data Quality Alert

Highlights the highest recorded restaurant cost so unusually large values can be validated against the original source data.

---

## 📂 Dataset

The dashboard works with a CSV export of the Swiggy restaurant dataset.

The dataset used for the project contains:

**81,777 restaurant records**

Important fields include:

- `id`
- `name`
- `city`
- `cuisine`
- `rating`
- `rating_count`
- `cost`
- `lic_no`
- `link`
- `address`

> The dashboard calculates its insights directly from the CSV uploaded by the user.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | User interface |
| JavaScript | Application logic |
| Chart.js | Data visualization |
| React Chart.js 2 | React integration for charts |
| PapaParse | CSV parsing |
| CSS | Dashboard styling |
| Vite | Development and build tool |
| Git & GitHub | Version control |

---

## 🖥️ Dashboard Sections

The application contains:

- **Dashboard Overview**
- **Restaurant Distribution**
- **Popular Cuisine**
- **Rating Distribution**
- **Cost vs Rating Analysis**
- **Data Quality Alert**
- **CSV Upload**
- **Report Download**

---

## 📥 Download Report

After uploading the CSV dataset, click:

**📥 Download Report**

The dashboard generates:

```text
swiggy-analysis-report.txt
```

The report contains:

- Dataset information
- Total records
- Top location
- Top cuisine
- Average rating
- Rating distribution
- ₹500+ cost group average rating
- Highest recorded cost
- Top locations
- Top cuisines

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Harshitha0501/swiggy-dashboard.git
```

### 2. Open the project

```bash
cd swiggy-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Vite will provide a local URL similar to:

```text
http://localhost:5173/
```

---

## 📈 Project Workflow

```text
Swiggy Dataset
      ↓
MySQL Data Cleaning
      ↓
SQL Analysis
      ↓
CSV Export
      ↓
React Dashboard
      ↓
Interactive Visualizations
      ↓
Analytics Report
```

---

## 🔍 Related Project

### Swiggy SQL Analysis

MySQL-based analysis of the Swiggy restaurant dataset covering:

- Restaurant locations
- Cuisine trends
- Rating distribution
- Pricing patterns
- Cost vs rating analysis
- Data quality investigation

👉 https://github.com/Harshitha0501/Swiggy-SQL-Analysis

---

## 👩‍💻 Author

**Harshitha C.**

Software Developer | Aspiring Data Analyst

- GitHub: https://github.com/Harshitha0501
- LinkedIn: https://www.linkedin.com/in/harshitha-c2605/