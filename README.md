# AI Inbound Lead Qualification & Routing System

An end-to-end GTM engineering project that turns website engagement and dataset downloads into qualified CRM leads.

The system tracks website behavior with Google Tag Manager and GA4, captures users who download the DEV-CaMP dataset, sends the lead to n8n, calculates deterministic fit and intent scores, stores the qualified lead in HubSpot, and routes high-priority leads through an AI-generated summary to Slack.

---

## Business Problem

DEV-CaMP is a public research platform for exploring U.S. critical-mineral projects.

Visitors can:

- Explore mineral projects
- View individual project details
- Use an interactive map
- Read the user guide
- Download the full dataset

The website provided useful engagement data, but there was no automated workflow to identify users downloading the dataset, qualify those users, store them in a CRM, or surface high-priority leads for follow-up.

The goal of this project was to build that workflow.

---

## Solution

I built an inbound lead intelligence and routing system around the existing DEV-CaMP website.

```text
DEV-CaMP Website
        |
        v
Google Tag Manager
        |
        +--------------------> Google Analytics 4
        |
        v
Dataset Download Form
        |
        v
n8n Production Webhook
        |
        v
Rule-Based Lead Scoring
        |
        +---- Intent Score
        |
        +---- Fit Score
        |
        +---- Total Score
        |
        +---- Priority
        |
        v
HubSpot CRM
        |
        v
Is Priority HIGH?
       / \
     NO   YES
     |      |
    End     v
          OpenAI
            |
            v
      AI Lead Summary
            |
            v
          Slack
```

---

## Tech Stack

### GTM & Analytics

- Google Tag Manager
- Google Analytics 4
- Data Layer
- Custom events
- React Router history tracking

### CRM & Automation

- HubSpot
- n8n
- Webhooks
- REST/HTTP requests

### AI

- OpenAI
- Structured prompt generation
- AI-assisted lead summaries

### Engineering

- React
- JavaScript
- HTML/CSS
- Netlify
- Git/GitHub

---

## 1. Website Behavior Tracking

Google Tag Manager was added to the React application and connected to GA4.

Because the website uses React Router, page navigation does not always trigger a traditional browser reload.

I used GTM History Change events to track navigation to individual mineral projects.

For example:

```text
/mineral/BAMA
/mineral/Blackpine
/mineral/Eagle
```

generates:

```text
mineral_detail_view
```

The mineral name is dynamically extracted from the page path.

Example event:

```text
event_name: mineral_detail_view
mineral_name: BAMA
page_path: /mineral/BAMA
```

This provides a first-party behavioral signal showing which projects visitors are exploring.

---

## 2. Dataset Download Conversion

The website originally allowed users to download the complete dataset immediately.

For this project, the download was converted into a lightweight gated-resource flow.

When a visitor clicks:

```text
Download Dataset
```

they are asked for:

```text
Name
Work / University Email
Organization (optional)
```

After successful submission:

1. Lead information is sent to n8n.
2. A GTM conversion event is generated.
3. The dataset download begins.

The analytics event is:

```text
dataset_request_submit
```

with non-PII parameters such as:

```text
resource_name: DEV-CaMP Dataset
source: website
organization_provided: true/false
```

Names and email addresses are intentionally not sent to GA4.

---

## 3. Lead Capture with n8n

The React application sends the submitted lead to an n8n production webhook.

Example payload:

```json
{
  "name": "Alex Morgan",
  "email": "alex@testmining.com",
  "organization": "Test Mining",
  "source": "website",
  "conversion": "dataset_download",
  "resource_name": "DEV-CaMP Dataset"
}
```

n8n acts as the orchestration layer between the website, qualification logic, HubSpot, OpenAI, and Slack.

---

## 4. Deterministic Lead Scoring

Lead qualification is performed using explicit rules rather than asking an LLM to decide whether a lead is good.

The scoring model separates **intent** from **fit**.

### Intent Score

Intent represents what the visitor did.

For the current MVP:

| Signal | Score |
|---|---:|
| Dataset download | +40 |

### Fit Score

Fit represents the information available about the lead or organization.

| Signal | Score |
|---|---:|
| Organization provided | +20 |
| Organization matches a target-sector keyword | +30 |
| Professional email domain | +10 |

Target-sector keywords currently include:

```text
mining
minerals
energy
battery
research
university
government
```

Common personal email providers such as Gmail, Yahoo, Hotmail, and Outlook do not receive the professional-domain score.

### Priority Rules

```text
Total Score >= 70  -> HIGH
Total Score >= 40  -> MEDIUM
Total Score < 40   -> LOW
```

The total score is capped at 100.

---

## 5. Example Qualification

Test lead:

```text
Name: Alex Morgan
Email: alex@testmining.com
Organization: Test Mining
Conversion: Dataset Download
```

Scoring:

```text
Intent

Dataset download                  +40

Fit

Organization provided             +20
Target-sector match ("mining")    +30
Professional email domain         +10

--------------------------------------
Intent Score                       40
Fit Score                          60
Total Score                       100
Priority                         HIGH
```

The n8n execution was tested and produced:

```text
intent_score: 40
fit_score: 60
total_score: 100
priority: HIGH
```

---

## 6. HubSpot CRM Integration

After qualification, n8n creates or updates the contact in HubSpot using the email address.

Using **Create or Update** prevents repeated dataset requests from blindly creating duplicate contacts for the same email.

The CRM record stores:

```text
First Name
Last Name
Email
Company

Dataset Lead Source
Dataset Conversion
Downloaded Resource

Fit Score
Intent Score
Total Score
Priority
```

Example:

```text
Alex Morgan
alex@testmining.com
Test Mining

Fit Score: 60
Intent Score: 40
Total Score: 100
Priority: HIGH
```

This keeps the qualification result available as structured CRM data instead of only inside the automation workflow.

---

## 7. Conditional AI Processing

AI is intentionally **not used to calculate the lead score**.

The deterministic scoring system determines:

```text
Fit Score
Intent Score
Total Score
Priority
```

An IF condition then checks:

```text
Priority == HIGH
```

Only HIGH-priority leads continue to the AI step.

```text
HubSpot
   |
   v
Priority == HIGH?
   |
   +---- FALSE ----> End
   |
   +---- TRUE
          |
          v
        OpenAI
```

This prevents unnecessary AI calls for lower-priority leads and keeps qualification explainable.

---

## 8. AI Lead Summary

For HIGH-priority leads, OpenAI receives the structured qualification evidence.

Example input:

```text
Name: Alex Morgan
Organization: Test Mining

Intent Score: 40
Fit Score: 60
Total Score: 100
Priority: HIGH

Fit Reasons:
- Organization provided
- Organization matches a target sector
- Professional email domain
```

The model is instructed to:

- Use only the supplied information
- Explain why the lead received its priority
- Avoid inventing information
- Recommend one short next action

Example output:

```text
Alex Morgan from Test Mining is a high-priority inbound lead
with a total score of 100. The lead shows strong fit based on
the provided organization, target-sector match, and professional
email domain, combined with the dataset-download intent signal.

Recommended action: prioritize the lead for follow-up.
```

---

## 9. High-Priority Slack Routing

After the AI summary is generated, n8n sends a message to a dedicated Slack channel.

Example:

```text
HIGH PRIORITY INBOUND LEAD

Name: Alex Morgan
Email: alex@testmining.com
Organization: Test Mining

Fit Score: 60
Intent Score: 40
Total Score: 100
Priority: HIGH

Qualification Signals:
Organization provided
Organization matches a target sector
Professional email domain

AI Summary:
...
```

LOW and MEDIUM leads remain in HubSpot without triggering the AI and Slack alert path.

---

## 10. Production Workflow

The final n8n workflow is:

```text
Webhook
   |
   v
Calculate Lead Score
   |
   v
Create / Update HubSpot Contact
   |
   v
IF Priority == HIGH
   |
   +---------------- FALSE ----------------> End
   |
   TRUE
   |
   v
Generate AI Lead Summary
   |
   v
Send Slack Alert
```

The workflow uses the n8n production webhook rather than the temporary test webhook, allowing deployed website submissions to trigger the automation without manually starting an n8n test execution.

---

## 11. Testing

The workflow was tested at multiple levels.

### Website -> n8n

Verified that the React form successfully sends:

```text
name
email
organization
source
conversion
resource_name
```

to the webhook.

### Scoring

Tested both lower-fit and high-fit leads.

Example lower-fit case:

```text
Personal email
No organization
Dataset download

Intent Score: 40
Fit Score: 0
Total Score: 40
Priority: MEDIUM
```

Example high-fit case:

```text
Professional email
Mining organization
Dataset download

Intent Score: 40
Fit Score: 60
Total Score: 100
Priority: HIGH
```

### CRM

Verified that the scores and priority are persisted in HubSpot contact properties.

### Routing

Verified that HIGH-priority leads follow:

```text
IF -> OpenAI -> Slack
```

while the false branch terminates without an AI call or Slack alert.

### Production

Verified successful production n8n executions triggered by the deployed workflow.

---

## 12. Privacy and Security Decisions

Several implementation choices were made to keep analytics and lead data separate.

### PII is not sent to GA4

GTM receives conversion metadata such as:

```text
dataset_request_submit
resource_name
source
organization_provided
```

but does not send the visitor's raw name or email address to GA4.

### Credentials stay server-side

API credentials for services such as HubSpot, Slack, and AI integrations are stored inside n8n credentials rather than in the React frontend.

### Environment files are excluded from Git

The repository ignores local environment files and other credential-containing files.

---

## 13. Current Limitations

This is a portfolio/MVP implementation and intentionally keeps several areas simple.

### Lead enrichment

The current workflow does not use external person/company enrichment.

Apollo enrichment was evaluated, but the required enrichment endpoints were not available on the free plan used for this project.

The current fit model therefore uses information supplied by the visitor and the email domain.

### Intent scoring

The current intent model uses dataset download as its primary conversion signal.

The website also tracks project-level behavior, but cross-session identity stitching between anonymous GA4 behavior and the known CRM contact is not implemented in the current version.

### Scoring model

The scoring thresholds and sector keywords are deterministic demonstration rules. They have not been trained or calibrated against historical revenue or conversion data.

---

## 14. Future Improvements

Possible next iterations include:

- Company and person enrichment
- Anonymous-to-known visitor identity stitching
- Additional intent signals such as repeat project views
- User-guide download tracking
- Multiple dataset/resource conversions
- Lead-score calibration using historical outcomes
- HubSpot lifecycle automation
- Automated follow-up sequences
- Lead ownership and territory routing
- Monitoring and failure alerts for n8n executions
- Deduplication and validation beyond email-based CRM upserts

---

## Why This Project

The goal was not simply to connect several GTM tools.

The project demonstrates how a GTM engineering workflow can start with a business problem:

> Which inbound users are showing meaningful interest, and which ones should receive faster follow-up?

and turn it into an explainable system:

```text
Capture
   ->
Measure
   ->
Qualify
   ->
Store
   ->
Summarize
   ->
Route
```

The system combines marketing analytics, CRM data, automation, deterministic business logic, AI, and engineering into one end-to-end workflow.

---

## Repository Structure

```text
gtm-lead-automation/
|
|-- src/                     React application
|-- public/                  Static website assets
|-- workflow/                n8n workflow export
|-- screenshots/
|   |-- website/
|   |-- gtm/
|   |-- ga4/
|   |-- n8n/
|   |-- hubspot/
|   `-- slack/
|
|-- docs/
|   |-- architecture.md
|   |-- tracking-plan.md
|   `-- lead-scoring.md
|
|-- package.json
`-- README.md
```

---

## Status

**Working end-to-end production prototype**

Verified flow:

```text
Website
  -> n8n
  -> Lead Scoring
  -> HubSpot
  -> HIGH Priority Check
  -> AI Summary
  -> Slack Alert
```

The repository uses synthetic/test leads for demonstrations and does not claim production revenue, pipeline, or conversion impact.
