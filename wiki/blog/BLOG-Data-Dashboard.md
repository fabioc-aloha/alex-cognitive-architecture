# From Spreadsheet to Dashboard in an Afternoon

![Data dashboard creation](images/blog-data-dashboard.png)

*A business analyst's journey from raw data to visual insight*

---

## The Problem

My manager dropped a CSV on my desk. Three years of sales data — 50,000 rows, 12 columns, no documentation. She wanted "a dashboard" by end of week.

I knew Excel. I'd made charts before. But a dashboard? With filters and interactivity? That felt like developer territory.

## How Alex Helped

### Understanding the Data First

Instead of jumping to visualization, Alex helped me understand what I had:

> "Before we build anything, let's profile this data. What are the columns? Are there nulls? What's the date range?"

We wrote a quick Python script (Alex wrote most of it, explaining each part) that showed me:
- Sales by region had a clear seasonal pattern
- Two regions had missing data for Q3 2024
- The "category" column had inconsistent naming ("Electronics" vs "electronics" vs "ELECTRONICS")

Cleaning that data first meant the dashboard wouldn't lie to anyone.

### Choosing the Right Charts

I wanted to put everything in bar charts. Alex pushed back:

> "Bar charts work for comparing categories. But for showing trends over time, you want a line chart. For showing part-of-whole relationships, consider a pie or treemap."

We ended up with:
- Line chart for revenue trends (shows seasonality)
- Bar chart for regional comparison (shows relative performance)
- KPI cards for current quarter highlights (shows what matters most)

### Building Without Coding

Alex showed me how to build the dashboard in HTML with Chart.js — a JavaScript library that handles the hard parts. The skill `dashboard-design` had templates I could modify.

But more importantly, Alex explained *why* each design decision mattered:

- Why the filters go at the top (users scan top-to-bottom)
- Why we limited to 5 colors (more creates confusion)
- Why the title of each chart should state the insight, not just the metric

## What I Learned

1. **Data quality comes first.** A pretty dashboard built on messy data is worse than no dashboard.

2. **Every chart should answer a question.** If you can't say what question a chart answers, delete it.

3. **Simple tools can produce professional results.** I didn't need Tableau or Power BI — just HTML, JavaScript, and guidance.

## The Result

I delivered the dashboard in three hours, not three days. My manager could filter by region, see trends, and understand performance at a glance.

She asked how I learned to do that. I said I had help.

---

## Try This Yourself

1. Start with data profiling: "Help me understand this CSV"
2. Identify the key questions the dashboard should answer
3. Let Alex suggest chart types based on your data
4. Use the `dashboard-design` skill for layout patterns

The `data-storytelling` skill ties analysis, visualization, and narrative together.

---

*Domain: Business Analytics | Skills Used: data-analysis, data-visualization, dashboard-design, data-storytelling*
