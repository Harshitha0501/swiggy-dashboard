import "./App.css";
import Papa from "papaparse";
import { useMemo, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },
  },

  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "#edf0f5",
      },
    },

    x: {
      grid: {
        display: false,
      },
    },
  },
};

// Convert values such as "₹500", "₹ 500", "500" into numbers
const parseNumber = (value) => {
  if (value === null || value === undefined) return NaN;

  const cleaned = String(value).replace(/[₹,\s]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : NaN;
};

// Clean text values
const cleanText = (value) => {
  if (value === null || value === undefined) return "";

  return String(value).trim();
};

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [parseWarning, setParseWarning] = useState("");

  // --------------------------------------------------
  // CSV UPLOAD
  // --------------------------------------------------

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setFileName(file.name);
    setUploadError("");
    setParseWarning("");
    setRestaurants([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setUploadError(
            "The CSV file is empty or contains no readable records."
          );
          return;
        }

        // Remove completely empty rows
        const cleanedRows = results.data.filter((row) => {
          return Object.values(row).some(
            (value) => cleanText(value) !== ""
          );
        });

        setRestaurants(cleanedRows);

        if (results.errors && results.errors.length > 0) {
          setParseWarning(
            `${results.errors.length} CSV formatting issue(s) were detected.`
          );
        }
      },

      error: () => {
        setUploadError(
          "Unable to read the CSV file. Please check the file format."
        );
      },
    });

    // Allow uploading the same file again
    event.target.value = "";
  };

  // --------------------------------------------------
  // DATA ANALYSIS
  // --------------------------------------------------

  const analysis = useMemo(() => {
    if (restaurants.length === 0) {
      return {
        total: 0,
        topLocation: "—",
        topLocationCount: 0,
        topCuisine: "—",
        topCuisineCount: 0,
        averageRating: 0,
        ratingGroup: "—",
        ratingGroupCount: 0,
        highCostAverage: 0,
        anomalyCost: 0,
        anomalyName: "—",
        locationCounts: {},
        cuisineCounts: {},
        ratingGroups: {},
      };
    }

    // -----------------------------
    // Location count
    // -----------------------------

    const locationCounts = {};

    restaurants.forEach((restaurant) => {
      const city = cleanText(
        restaurant.city || restaurant.location
      );

      if (!city) return;

      locationCounts[city] =
        (locationCounts[city] || 0) + 1;
    });

    const topLocationEntry =
      Object.entries(locationCounts).sort(
        (a, b) => b[1] - a[1]
      )[0] || ["—", 0];

    // -----------------------------
    // Cuisine count
    // -----------------------------

    const cuisineCounts = {};

    restaurants.forEach((restaurant) => {
      const cuisineText = cleanText(
        restaurant.cuisine
      );

      if (!cuisineText) return;

      const cuisines = cuisineText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      cuisines.forEach((cuisine) => {
        cuisineCounts[cuisine] =
          (cuisineCounts[cuisine] || 0) + 1;
      });
    });

    const topCuisineEntry =
      Object.entries(cuisineCounts).sort(
        (a, b) => b[1] - a[1]
      )[0] || ["—", 0];

    // -----------------------------
    // Ratings
    // -----------------------------

    const validRatings = restaurants
      .map((restaurant) =>
        parseNumber(restaurant.rating)
      )
      .filter(
        (rating) =>
          Number.isFinite(rating) &&
          rating >= 0 &&
          rating <= 5
      );

    const averageRating =
      validRatings.length > 0
        ? validRatings.reduce(
            (sum, rating) => sum + rating,
            0
          ) / validRatings.length
        : 0;

    // Rating groups
    const ratingGroups = {
      "0.0–2.9": 0,
      "3.0–3.9": 0,
      "4.0–4.4": 0,
      "4.5–5.0": 0,
    };

    validRatings.forEach((rating) => {
      if (rating < 3) {
        ratingGroups["0.0–2.9"]++;
      } else if (rating < 4) {
        ratingGroups["3.0–3.9"]++;
      } else if (rating < 4.5) {
        ratingGroups["4.0–4.4"]++;
      } else {
        ratingGroups["4.5–5.0"]++;
      }
    });

    const largestRatingGroup =
      Object.entries(ratingGroups).sort(
        (a, b) => b[1] - a[1]
      )[0] || ["—", 0];

    // -----------------------------
    // Cost >= ₹500 average rating
    // -----------------------------

    const highCostRatings = restaurants
      .map((restaurant) => {
        const cost = parseNumber(restaurant.cost);
        const rating = parseNumber(restaurant.rating);

        return {
          cost,
          rating,
        };
      })
      .filter(
        (item) =>
          Number.isFinite(item.cost) &&
          item.cost >= 500 &&
          Number.isFinite(item.rating) &&
          item.rating >= 0 &&
          item.rating <= 5
      );

    const highCostAverage =
      highCostRatings.length > 0
        ? highCostRatings.reduce(
            (sum, item) => sum + item.rating,
            0
          ) / highCostRatings.length
        : 0;

    // -----------------------------
    // Highest cost restaurant
    // -----------------------------

    let anomalyRestaurant = null;

    restaurants.forEach((restaurant) => {
      const cost = parseNumber(restaurant.cost);

      if (!Number.isFinite(cost)) return;

      if (
        !anomalyRestaurant ||
        cost > anomalyRestaurant.cost
      ) {
        anomalyRestaurant = {
          name:
            cleanText(
              restaurant.name ||
                restaurant.restaurant_name
            ) || "Unknown restaurant",

          cost,
        };
      }
    });

    return {
      total: restaurants.length,

      topLocation: topLocationEntry[0],
      topLocationCount: topLocationEntry[1],

      topCuisine: topCuisineEntry[0],
      topCuisineCount: topCuisineEntry[1],

      averageRating,

      ratingGroup: largestRatingGroup[0],
      ratingGroupCount: largestRatingGroup[1],

      highCostAverage,

      anomalyCost: anomalyRestaurant
        ? anomalyRestaurant.cost
        : 0,

      anomalyName: anomalyRestaurant
        ? anomalyRestaurant.name
        : "—",

      locationCounts,
      cuisineCounts,
      ratingGroups,
    };
  }, [restaurants]);

  // --------------------------------------------------
  // DOWNLOAD ANALYSIS REPORT
  // --------------------------------------------------

  const downloadReport = () => {
    if (restaurants.length === 0) {
      alert("Please upload the Swiggy CSV file first.");
      return;
    }

    const locationEntries = Object.entries(
      analysis.locationCounts || {}
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const cuisineEntries = Object.entries(
      analysis.cuisineCounts || {}
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const report = `
SWIGGY RESTAURANT ANALYTICS REPORT
===================================

DATA SOURCE
-----------
CSV File: ${fileName}
Total Records Analyzed: ${analysis.total.toLocaleString("en-IN")}

SUMMARY
-------
Top Location: ${analysis.topLocation}
Top Location Records: ${analysis.topLocationCount.toLocaleString("en-IN")}

Top Cuisine: ${analysis.topCuisine}
Top Cuisine Records: ${analysis.topCuisineCount.toLocaleString("en-IN")}

Average Restaurant Rating: ${
      analysis.averageRating > 0
        ? analysis.averageRating.toFixed(2)
        : "N/A"
    }

RATING DISTRIBUTION
-------------------
Largest Rating Group: ${analysis.ratingGroup}
Records in Largest Group: ${analysis.ratingGroupCount.toLocaleString(
      "en-IN"
    )}

Rating Groups:
0.0–2.9: ${(
      analysis.ratingGroups["0.0–2.9"] || 0
    ).toLocaleString("en-IN")}

3.0–3.9: ${(
      analysis.ratingGroups["3.0–3.9"] || 0
    ).toLocaleString("en-IN")}

4.0–4.4: ${(
      analysis.ratingGroups["4.0–4.4"] || 0
    ).toLocaleString("en-IN")}

4.5–5.0: ${(
      analysis.ratingGroups["4.5–5.0"] || 0
    ).toLocaleString("en-IN")}

PRICING ANALYSIS
----------------
Average Rating for ₹500+ Cost Group: ${
      analysis.highCostAverage > 0
        ? analysis.highCostAverage.toFixed(2)
        : "N/A"
    }

DATA QUALITY
------------
Highest Recorded Cost: ₹${analysis.anomalyCost.toLocaleString(
      "en-IN"
    )}

Restaurant: ${analysis.anomalyName}

TOP 10 LOCATIONS
----------------
${locationEntries
  .map(
    ([location, count], index) =>
      `${index + 1}. ${location} — ${count.toLocaleString(
        "en-IN"
      )} records`
  )
  .join("\n")}

TOP 10 CUISINES
---------------
${cuisineEntries
  .map(
    ([cuisine, count], index) =>
      `${index + 1}. ${cuisine} — ${count.toLocaleString(
        "en-IN"
      )} records`
  )
  .join("\n")}

NOTE
----
This report is generated from the uploaded CSV dataset.
High-cost values should be validated against the original
source data before drawing conclusions.

Generated by SwiggyInsights
Built with React, JavaScript and Chart.js
`;

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "swiggy-analysis-report.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // LOCATION CHART
  // --------------------------------------------------

  const locationChartData = useMemo(() => {
    const entries = Object.entries(
      analysis.locationCounts || {}
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: entries.map((item) => item[0]),

      datasets: [
        {
          label: "Restaurant Records",
          data: entries.map((item) => item[1]),
          backgroundColor: "#fc8019",
          borderRadius: 8,
        },
      ],
    };
  }, [analysis]);

  // --------------------------------------------------
  // CUISINE CHART
  // --------------------------------------------------

  const cuisineChartData = useMemo(() => {
    const entries = Object.entries(
      analysis.cuisineCounts || {}
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: entries.map((item) => item[0]),

      datasets: [
        {
          label: "Cuisine Records",
          data: entries.map((item) => item[1]),
          backgroundColor: "#fc8019",
          borderRadius: 8,
        },
      ],
    };
  }, [analysis]);

  // --------------------------------------------------
  // RATING CHART
  // --------------------------------------------------

  const ratingChartData = useMemo(() => {
    const groups = analysis.ratingGroups || {};

    return {
      labels: Object.keys(groups),

      datasets: [
        {
          label: "Restaurant Records",
          data: Object.values(groups),
          backgroundColor: "#fc8019",
          borderRadius: 8,
        },
      ],
    };
  }, [analysis]);

  // --------------------------------------------------
  // COST CHART
  // --------------------------------------------------

  const costChartData = {
    labels: ["₹500+ Cost Group"],

    datasets: [
      {
        label: "Average Rating",
        data: [analysis.highCostAverage],
        backgroundColor: "#fc8019",
        borderRadius: 8,
      },
    ],
  };

  // --------------------------------------------------
  // SUMMARY CARDS
  // --------------------------------------------------

  const stats = [
    {
      title: "Total Restaurants",
      value: analysis.total.toLocaleString("en-IN"),
      icon: "🍽️",
      note: "Records loaded from CSV",
    },

    {
      title: "Top Location",
      value: analysis.topLocation,
      icon: "📍",
      note: `${analysis.topLocationCount.toLocaleString(
        "en-IN"
      )} records`,
    },

    {
      title: "Top Cuisine",
      value: analysis.topCuisine,
      icon: "🍛",
      note: `${analysis.topCuisineCount.toLocaleString(
        "en-IN"
      )} records`,
    },

    {
      title: "Average Rating",
      value:
        analysis.averageRating > 0
          ? analysis.averageRating.toFixed(2)
          : "—",
      icon: "⭐",
      note: "Valid restaurant ratings",
    },
  ];

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <span className="brand-icon">S</span>

          <span>
            Swiggy
            <span className="brand-light">
              Insights
            </span>
          </span>
        </div>

        <p className="menu-label">
          MAIN MENU
        </p>

        <nav>
          <a
            className="nav-item active"
            href="#overview"
          >
            ▦ Dashboard
          </a>

          <a
            className="nav-item"
            href="#locations"
          >
            📍 Locations
          </a>

          <a
            className="nav-item"
            href="#ratings"
          >
            ⭐ Ratings
          </a>

          <a
            className="nav-item"
            href="#cuisines"
          >
            🍛 Cuisines
          </a>

          <a
            className="nav-item"
            href="#pricing"
          >
            ₹ Pricing Analysis
          </a>
        </nav>

        <div className="sidebar-bottom">
          <p>DATA SOURCE</p>

          <span>
            MySQL · Swiggy Dataset
          </span>

          <small>
            {analysis.total > 0
              ? `${analysis.total.toLocaleString(
                  "en-IN"
                )} uploaded records`
              : "Upload CSV to begin"}
          </small>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main
        className="main-content"
        id="overview"
      >

        {/* HEADER */}

        <header className="topbar">

          <div>
            <p className="eyebrow">
              DATA ANALYTICS / OVERVIEW
            </p>

            <h1>
              Restaurant Analytics
            </h1>

            <p className="subtitle">
              Explore restaurant trends, ratings,
              cuisines, and pricing.
            </p>
          </div>

          {/* HEADER BUTTONS */}

          <div className="upload-box">

            <div className="header-actions">

              <label
                htmlFor="csv-upload"
                className="upload-button"
              >
                📂 Upload CSV
              </label>

              <button
                type="button"
                className="report-button"
                onClick={downloadReport}
                disabled={restaurants.length === 0}
              >
                📥 Download Report
              </button>

            </div>

            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              hidden
            />

            {fileName && (
              <small>
                {fileName}
              </small>
            )}

            {uploadError && (
              <small className="error-message">
                {uploadError}
              </small>
            )}

            {parseWarning && (
              <small className="error-message">
                {parseWarning}
              </small>
            )}

          </div>

        </header>

        {/* UPLOAD RESULT */}

        {restaurants.length > 0 && (
          <section className="upload-result">

            <h3>
              ✅ CSV Uploaded Successfully
            </h3>

            <p>
              File:{" "}
              <strong>
                {fileName}
              </strong>
            </p>

            <p>
              Records analyzed:{" "}
              <strong>
                {restaurants.length.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </p>

          </section>
        )}

        {/* WELCOME */}

        <section className="welcome-card">

          <div>

            <span className="welcome-label">
              SWIGGY DATA INSIGHTS
            </span>

            <h2>
              Turning Food Data into Meaningful
              Insights
            </h2>

            <p>
              Analyze restaurant records with
              data-driven insights into locations,
              ratings, cuisines, and pricing.
            </p>

          </div>

          <div className="welcome-emoji">
            🍽️
          </div>

        </section>

        {/* SUMMARY CARDS */}

        <section className="stats-grid">

          {stats.map((stat) => (

            <article
              className="stat-card"
              key={stat.title}
            >

              <div className="stat-top">

                <span className="stat-title">
                  {stat.title}
                </span>

                <span className="stat-icon">
                  {stat.icon}
                </span>

              </div>

              <h2>
                {stat.value}
              </h2>

              <p>
                {stat.note}
              </p>

            </article>

          ))}

        </section>

        {/* LOCATION + CUISINE */}

        <section className="content-grid">

          <article
            className="panel"
            id="locations"
          >

            <div className="panel-heading">

              <div>

                <h3>
                  Restaurant Distribution
                </h3>

                <p>
                  Top 10 locations in uploaded data
                </p>

              </div>

              <span className="panel-icon">
                📍
              </span>

            </div>

            <div className="chart-container">

              {restaurants.length > 0 ? (
                <Bar
                  data={locationChartData}
                  options={chartOptions}
                />
              ) : (
                <p>
                  Upload a CSV to view location
                  analysis.
                </p>
              )}

            </div>

            <p className="chart-note">
              Top location:{" "}
              <strong>
                {analysis.topLocation}
              </strong>{" "}
              with{" "}
              {analysis.topLocationCount.toLocaleString(
                "en-IN"
              )}{" "}
              records.
            </p>

          </article>

          <article
            className="panel"
            id="cuisines"
          >

            <div className="panel-heading">

              <div>

                <h3>
                  Popular Cuisine
                </h3>

                <p>
                  Top 10 cuisine categories
                </p>

              </div>

              <span className="panel-icon">
                🍛
              </span>

            </div>

            <div className="chart-container">

              {restaurants.length > 0 ? (
                <Bar
                  data={cuisineChartData}
                  options={chartOptions}
                />
              ) : (
                <p>
                  Upload a CSV to view cuisine
                  analysis.
                </p>
              )}

            </div>

            <p className="chart-note">
              Top cuisine:{" "}
              <strong>
                {analysis.topCuisine}
              </strong>{" "}
              with{" "}
              {analysis.topCuisineCount.toLocaleString(
                "en-IN"
              )}{" "}
              records.
            </p>

          </article>

        </section>

        {/* RATING ANALYSIS */}

        <section
          className="panel rating-panel"
          id="ratings"
        >

          <div className="panel-heading">

            <div>

              <h3>
                Rating Distribution
              </h3>

              <p>
                Rating groups calculated from
                uploaded restaurant data
              </p>

            </div>

            <span className="rating-pill">
              ⭐ {analysis.ratingGroup}
            </span>

          </div>

          <div className="chart-container">

            {restaurants.length > 0 ? (
              <Bar
                data={ratingChartData}
                options={chartOptions}
              />
            ) : (
              <p>
                Upload a CSV to view rating
                analysis.
              </p>
            )}

          </div>

          <p className="chart-note">
            Largest rating group:{" "}
            <strong>
              {analysis.ratingGroup}
            </strong>{" "}
            with{" "}
            {analysis.ratingGroupCount.toLocaleString(
              "en-IN"
            )}{" "}
            records.
          </p>

        </section>

        {/* PRICING ANALYSIS */}

        <section
          className="panel rating-panel"
          id="pricing"
        >

          <div className="panel-heading">

            <div>

              <h3>
                Cost vs Rating Analysis
              </h3>

              <p>
                Average rating for restaurants
                costing ₹500 or more
              </p>

            </div>

            <span className="rating-pill">
              ₹ Pricing
            </span>

          </div>

          <div className="chart-container">

            {restaurants.length > 0 ? (
              <Bar
                data={costChartData}
                options={{
                  ...chartOptions,

                  scales: {
                    ...chartOptions.scales,

                    y: {
                      ...chartOptions.scales.y,
                      max: 5,
                    },
                  },
                }}
              />
            ) : (
              <p>
                Upload a CSV to view pricing
                analysis.
              </p>
            )}

          </div>

          <p className="chart-note">
            Average rating for the ₹500+ cost
            group:{" "}
            <strong>
              {analysis.highCostAverage > 0
                ? analysis.highCostAverage.toFixed(2)
                : "—"}
            </strong>
          </p>

        </section>

        {/* DATA QUALITY */}

        <section className="panel rating-panel">

          <div className="panel-heading">

            <div>

              <h3>
                Data Quality Alert
              </h3>

              <p>
                Highest recorded restaurant cost
              </p>

            </div>

            <span className="panel-icon">
              ⚠️
            </span>

          </div>

          <div className="highlight-number">

            {analysis.anomalyCost > 0
              ? `₹${analysis.anomalyCost.toLocaleString(
                  "en-IN"
                )}`
              : "—"}

          </div>

          <p className="highlight-label">
            Highest recorded cost:
            {" "}
            {analysis.anomalyName}
          </p>

          <p className="chart-note">
            A high value should be validated against
            the original source data before drawing
            conclusions.
          </p>

        </section>

        {/* FOOTER */}

        <footer>

          <span>
            Swiggy Restaurant Analytics
          </span>

          <span>
            Built with React · CSS · JavaScript ·
            Chart.js
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;