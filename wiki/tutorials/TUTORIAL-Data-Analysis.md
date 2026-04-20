# Tutorial: Analyzing a Dataset

![Data analysis](images/tutorial-data-analysis.png)

*30 minutes · Intermediate*

---

## What You'll Build

A complete exploratory data analysis (EDA) workflow — from raw data to insights, with visualizations and a summary report.

After this tutorial, you'll be able to quickly understand any dataset and communicate findings.

---

## 📋 Prerequisites

- Alex installed in VS Code
- A CSV or Excel file with data
- Python installed (Alex will help set up if needed)

---

## Why EDA with Alex?

Data analysis is iterative. You look at something, form a hypothesis, check it, and repeat. Alex accelerates this loop:

- No memorizing pandas syntax
- Instant visualizations
- Pattern suggestions you might miss
- Narrative generation from findings

---

## 📍 Steps

### Step 1: Load and Profile

Open your data file or point Alex to it:

```
Analyze the data in sales_data.csv
```

Alex will:
1. Load the file
2. Show basic statistics (rows, columns, types)
3. Identify potential issues (nulls, duplicates, outliers)

✅ **Checkpoint**: You should see a summary like:
- 10,000 rows × 12 columns
- 3 columns with missing values
- Date range: 2023-01-01 to 2024-12-31

---

### Step 2: Ask Questions

Start exploring with natural questions:

```
What's the distribution of sales by region?
```

```
Show me the trend over time
```

```
Are there any outliers in the revenue column?
```

Alex generates code, runs it, and shows results — you focus on the questions.

---

### Step 3: Dig Deeper

When you see something interesting, follow up:

```
Why did Q3 2024 have lower sales?
```

```
Which products drive most of the revenue?
```

```
Is there a correlation between discount and quantity?
```

Alex builds on previous context, so you don't need to re-explain the data.

---

### Step 4: Generate Visualizations

Request specific charts:

```
Create a heatmap of sales by month and product category
```

```
Show a box plot of revenue by region
```

```
Make a scatter plot of price vs quantity with a trend line
```

Alex generates the visualization and explains what it shows.

---

### Step 5: Summarize Findings

When you've explored enough:

```
Summarize the key findings from this analysis
```

Alex produces a narrative summary:
- Main insights discovered
- Notable patterns or anomalies
- Suggested next steps or hypotheses to test

---

## 💡 Tips

### Cleaning Data

If the data has issues:

```
Clean this dataset:
- Fill missing values in 'region' with 'Unknown'
- Remove duplicate rows
- Convert 'date' column to datetime
```

### Saving Your Work

```
Save the cleaned data to cleaned_sales.csv
```

```
Export these visualizations as PNG files
```

### Comparing Groups

```
Compare the performance of Product A vs Product B
```

```
Is there a significant difference between regions?
```

---

## ⚠️ Common Issues

### "File not found"

Make sure the file path is correct. You can drag the file into VS Code chat to reference it directly.

### Charts Look Crowded

```
Simplify the chart — show only top 10 categories
```

### Need Statistical Tests

```
Run a t-test comparing sales before and after the campaign
```

Alex can perform statistical analysis, not just visualization.

---

## Example Session

Here's a realistic workflow:

1. **Load**: "Analyze customer_orders.csv"
2. **Profile**: "What columns have missing data?"
3. **Clean**: "Fill missing 'country' with mode, drop rows with missing 'amount'"
4. **Explore**: "What's the average order value by country?"
5. **Visualize**: "Create a bar chart of top 10 countries by revenue"
6. **Deep dive**: "Why does Germany have high volume but low average order value?"
7. **Summarize**: "Write a summary of findings for my team"

---

## What's Next?

- [Writing a Technical Document](TUTORIAL-Technical-Writing.md) — Turn your analysis into a report
- [Building Your Own Skill](TUTORIAL-Build-Skill.md) — Create custom analysis templates

---

*Skills used: data-analysis, data-visualization, data-storytelling, chart-interpretation*
