# My First API — Built by Someone Who'd Never Written One

![Building first API](images/blog-first-api.png)

*A non-developer's experience building a real web service*

---

## The Problem

I maintain a small nonprofit's website. Nothing fancy — just information pages. But our volunteers kept asking for a way to check their scheduled shifts without logging into Google Calendar.

I knew the data was there. I just didn't know how to make it accessible.

## How Alex Helped

### Starting with What I Wanted, Not How to Build It

I described the goal in plain language:

> "I want volunteers to be able to check their shifts from our website. The shifts are in a Google Sheet. I don't know how to connect these things."

Alex didn't start with code. It started with questions:
- How do volunteers identify themselves? (Email)
- Should they see only their shifts or everyone's? (Only theirs)
- How often does the sheet update? (Weekly)

This conversation defined what we were building before we built anything.

### Learning by Doing

Alex introduced concepts as we needed them:

- **API**: "An API is just a way for programs to talk to each other. Your website will ask your server for shift data. The server will answer in a format both understand."

- **JSON**: "This is the format: structured text that computers read easily. Like a spreadsheet but flattened into text."

- **Endpoints**: "Each URL your API responds to is an endpoint. You'll have one: `/shifts?email=volunteer@example.com`"

Each concept came with a working example I could modify. I wasn't memorizing theory — I was seeing it work.

### The Actual Build

We built a simple Python server using FastAPI. Alex explained it line by line:

```python
@app.get("/shifts")
def get_shifts(email: str):
    # This runs when someone visits /shifts?email=...
    # It returns their shifts from the spreadsheet
```

When something broke (and things broke a lot), Alex helped me understand *why*:

> "The error says 'KeyError: volunteer@example.com'. That means the email isn't in your spreadsheet. Let's add error handling so the API returns a helpful message instead of crashing."

## What I Learned

1. **You don't need to understand everything to build something.** I still can't explain half the code. But it works, and I know enough to fix it when it breaks.

2. **APIs aren't magic.** They're just programs that respond to web requests. Once I understood that, the mystique disappeared.

3. **Good error messages matter.** The time we spent on error handling saved me hours of debugging later.

## The Result

The nonprofit now has a `/shifts` page where volunteers enter their email and see their upcoming shifts. It pulls live from our Google Sheet. Zero manual work for me.

One volunteer asked if I'd become a programmer. I said no — I just have a really good teacher.

---

## Try This Yourself

1. Start with a plain-language description of what you want
2. Let Alex help you define the requirements (who, what, when, how)
3. Build incrementally — get something working, then add features
4. Focus on error handling early (you'll thank yourself later)

The `api-design` skill has patterns for REST APIs. The `debugging-patterns` skill helps when things break.

---

*Domain: Web Development | Skills Used: api-design, api-documentation, debugging-patterns, project-scaffolding*
