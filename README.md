![Sumit Gole. Applied AI and Python backend developer.](assets/profile-banner.svg)

I build document Q&A apps that show the passages behind their answers and Python APIs for workflows like team task assignments. I previously interned at Ethara AI and am looking for entry-level roles in applied AI and Python backend development.

[**Developer portfolio**](https://sumitgole011.github.io/sumitgole011/) · [**Analytics dashboards**](https://sumitgole011.github.io/PowerBI-Industry-Analytics-Portfolio/) · [LinkedIn](https://www.linkedin.com/in/sumit-gole011/) · [Email](mailto:sumitgole011@gmail.com)

Jump to [AI & retrieval](#mental-health-buddy) · [Backend APIs](#aura-salon-booking) · [Analytics](#industry-analytics-portfolio) · [CI checks](#automated-checks) · [Toolkit](#technical-toolkit)

## Featured work

### [Mental Health Buddy](https://github.com/sumitgole011/Mental-Health-RAG-Bot)

A Flask app that answers questions from wellbeing documents. It combines keyword and semantic search, checks quotes against the source, and says when it lacks evidence.

[**Watch the 32-second demo**](https://github.com/sumitgole011/Mental-Health-RAG-Bot#live-demo) · [Reproduce the retrieval pilot](https://github.com/sumitgole011/Mental-Health-RAG-Bot/blob/main/docs/retrieval-evaluation.md)

<a href="https://github.com/sumitgole011/Mental-Health-RAG-Bot#live-demo"><img src="https://raw.githubusercontent.com/sumitgole011/Mental-Health-RAG-Bot/main/docs/rag-bot-preview.jpg" alt="Mental Health Buddy gives an answer with a source quote and flags a question outside its documents." width="560"></a>

<details>
<summary><strong>Compare the retrieval results</strong></summary>

I measured whether one of the top two results contained the annotated evidence. Each method used the same 10 new questions.

| Retrieval method | Questions with evidence in the top two |
| --- | ---: |
| Hybrid search | **8 of 10** |
| Similarity search | 8 of 10 |
| Maximal marginal relevance (MMR) | 5 of 10 |

</details>

### [AURA Salon Booking](https://github.com/sumitgole011/aura-salon-booking)

A live React and TypeScript app for appointments and invoices. The API saves the booking and its reserved slots in one Cloudflare D1 transaction to prevent overlaps.

[**Open the live app**](https://aura-salon-booking.sumitg.workers.dev/) · [Read the booking workflow](https://github.com/sumitgole011/aura-salon-booking/blob/main/docs/architecture.md#booking-flow)

<details>
<summary><strong>Preview the booking screen</strong></summary>

<a href="https://aura-salon-booking.sumitg.workers.dev/"><img src="https://raw.githubusercontent.com/sumitgole011/aura-salon-booking/main/docs/Booking_Page.png" alt="AURA customer booking screen for choosing a service and appointment time." width="680"></a>

</details>

### [Team Task Manager](https://github.com/sumitgole011/Team-task-Manager)

A Flask and SQLAlchemy app for assigning and tracking work across team projects.

<details>
<summary><strong>Inspect the access-control tests</strong></summary>

The tests cover who can read and edit shared projects, change or delete tasks, and reassign tasks. They also check that a failed write leaves the database consistent.

[Read the access-control tests](https://github.com/sumitgole011/Team-task-Manager/blob/main/tests/test_access_controls.py)

</details>

### [Industry Analytics Portfolio](https://github.com/sumitgole011/PowerBI-Industry-Analytics-Portfolio)

Four interactive dashboards explore SaaS revenue, banking credit risk, healthcare operations, and supply chain performance using synthetic data.

[**Explore all four dashboards**](https://sumitgole011.github.io/PowerBI-Industry-Analytics-Portfolio/) · [Read the December SaaS walkthrough](https://github.com/sumitgole011/PowerBI-Industry-Analytics-Portfolio/blob/main/SaaS_Revenue_Churn_Intelligence/INTERVIEW_GUIDE.md#december-smb-walkthrough)

<details>
<summary><strong>Try the SaaS revenue and churn example</strong></summary>

<a href="https://sumitgole011.github.io/PowerBI-Industry-Analytics-Portfolio/SaaS_Revenue_Churn_Intelligence/dashboard_preview.html"><img src="https://raw.githubusercontent.com/sumitgole011/PowerBI-Industry-Analytics-Portfolio/main/SaaS_Revenue_Churn_Intelligence/dashboard_screenshot.png" alt="SaaS dashboard showing monthly recurring revenue, churn, retention, and revenue by segment." width="680"></a>

[Open the SaaS dashboard](https://sumitgole011.github.io/PowerBI-Industry-Analytics-Portfolio/SaaS_Revenue_Churn_Intelligence/dashboard_preview.html) and choose **Dec 2025** in **Reporting period**. Switch **Customer segment** to **SMB** to compare monthly recurring revenue and churn with all segments.

</details>

I also built a [travel assistant](https://github.com/sumitgole011/Multi-modal-travel-agent) that uses LangGraph to route questions to document retrieval or web search and shows weather and destination images in Streamlit.

## Automated checks

| Project | What runs | GitHub Actions |
| --- | --- | --- |
| Mental Health Buddy | Citation and retrieval tests | [![Mental Health Buddy workflow status](https://github.com/sumitgole011/Mental-Health-RAG-Bot/actions/workflows/source-checks.yml/badge.svg?branch=main)](https://github.com/sumitgole011/Mental-Health-RAG-Bot/actions/workflows/source-checks.yml) |
| AURA Salon Booking | SQLite-backed API regression tests | [![AURA Salon Booking workflow status](https://github.com/sumitgole011/aura-salon-booking/actions/workflows/api-tests.yml/badge.svg?branch=main)](https://github.com/sumitgole011/aura-salon-booking/actions/workflows/api-tests.yml) |
| Team Task Manager | Signup and access-control tests | [![Team Task Manager workflow status](https://github.com/sumitgole011/Team-task-Manager/actions/workflows/python-security-tests.yml/badge.svg?branch=main)](https://github.com/sumitgole011/Team-task-Manager/actions/workflows/python-security-tests.yml) |
| Industry Analytics | Data integrity and KPI checks | [![Industry Analytics workflow status](https://github.com/sumitgole011/PowerBI-Industry-Analytics-Portfolio/actions/workflows/validate-datasets.yml/badge.svg?branch=main)](https://github.com/sumitgole011/PowerBI-Industry-Analytics-Portfolio/actions/workflows/validate-datasets.yml) |

## Technical toolkit

| Area | Tools I use |
| --- | --- |
| Retrieval & AI | Python, TF-IDF, MiniLM, LangGraph, Groq |
| APIs & data | Flask, SQLAlchemy, SQLite, Cloudflare Workers and D1 |
| Interfaces | React, TypeScript, Streamlit |
| Analytics | Power BI, DAX, Python data validation |
