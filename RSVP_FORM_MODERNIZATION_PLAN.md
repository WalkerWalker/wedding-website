# RSVP Form Modernization Plan
**Wedding Website Form Collection Upgrade**

## Current State Analysis

### How the Current System Works
1. **Frontend**: HTML form with fields for name, email, attendance, plus-ones, dietary restrictions, and notes
2. **Backend**: Uses **Jinshuju (金数据)** - a Chinese form service similar to Google Forms
3. **Authentication**: Uses Basic Auth with hardcoded credentials in JavaScript (security concern)
4. **Endpoint**: `https://jinshuju.net/api/v1/forms/zAk2on`
5. **Fallback**: Commented-out Google Apps Script URL suggests previous Google-based solution

### Current Issues
- **China Accessibility**: Jinshuju works in China but you no longer prefer it
- **Security**: API credentials exposed in client-side code
- **Maintenance**: Tied to a specific third-party service
- **Data Management**: Unclear how data flows to Google Sheets

## Solution Options Analysis

### Option A: Static with Email Integration (Recommended)
**Approach**: Use mailto: links or Netlify Forms with email notifications
- **Pros**: Completely static, works everywhere, simple implementation
- **Cons**: Manual data entry to Google Sheets
- **China Compatibility**: ✅ Excellent
- **Static Requirement**: ✅ Fully static

### Option B: Serverless with Google Sheets Integration
**Approach**: Vercel/Netlify Functions + Google Sheets API
- **Pros**: Automated Google Sheets integration, secure API handling
- **Cons**: Requires serverless functions (not purely static)
- **China Compatibility**: ⚠️ Depends on function hosting location
- **Static Requirement**: ⚠️ Hybrid (static frontend + serverless backend)

### Option C: Third-Party Form Services (Static-Compatible)
**Approach**: Formspree, Netlify Forms, or similar
- **Pros**: Easy implementation, some offer Google Sheets integration
- **Cons**: Still dependent on third-party services
- **China Compatibility**: ⚠️ Varies by service
- **Static Requirement**: ✅ Frontend remains static

## Revised Implementation Plan

### Phase 1: EmailJS Proof of Concept & China Testing
1. **Create Test Website**
   - Simple HTML form with EmailJS integration
   - Minimal version of RSVP form (name, email, attendance)
   - Deploy to GitHub Pages (separate test repo or branch)

2. **EmailJS Setup & Configuration**
   - Create EmailJS account and connect email service (Gmail/Outlook)
   - Create structured email template for automated parsing
   - Store email template in repo for version control
   - Configure JavaScript integration

3. **China Accessibility Testing**
   - Test form submission from China (VPN or ask someone in China)
   - Verify emails are received reliably
   - Document performance and accessibility results

### Phase 2A: Full Implementation (If EmailJS Works in China)
1. **Update Main Wedding Website**
   - Replace Jinshuju integration with EmailJS in `js/rsvp.js`
   - Remove hardcoded Jinshuju credentials
   - Update form handling and error messages
   - Maintain bilingual functionality

2. **Google Apps Script Automation**
   - Create Gmail monitoring script for RSVP emails
   - Parse structured email content automatically
   - Auto-populate Google Sheets with form data
   - Store Apps Script in repo for version control

3. **Full Workflow Testing**
   - Test complete flow: form → EmailJS → Gmail → Apps Script → Sheets
   - Verify data accuracy and error handling
   - Test from multiple regions

### Phase 2B: Fallback Implementation (If EmailJS Fails in China)
1. **Netlify Migration Option**
   - Migrate site from GitHub Pages to Netlify hosting
   - Configure Netlify Forms with email notifications
   - Test China accessibility for Netlify

2. **Alternative Service Evaluation**
   - Research other form services with proven China accessibility
   - Consider serverless function approach if necessary
   - Implement chosen fallback solution

### Phase 3: Production Deployment & Documentation
1. **Production Deployment**
   - Deploy chosen solution to production
   - Update DNS and hosting configurations if needed
   - Monitor initial submissions

2. **Documentation & Maintenance**
   - Document email template format and Apps Script setup
   - Create troubleshooting guide for common issues
   - Establish monitoring and backup procedures

## Updated Timeline
- **Week 1**: EmailJS proof of concept and China testing (Phase 1)
- **Week 2**: Full implementation or fallback setup (Phase 2A/2B)
- **Week 3**: Production deployment and documentation (Phase 3)

## Key Deliverables
1. **Test repository** with EmailJS integration
2. **Email template** (version controlled in repo)
3. **Google Apps Script** (version controlled in repo)
4. **China accessibility test results**
5. **Updated production website** with new form system
6. **Documentation** for maintenance and troubleshooting

## Decision Points Requiring Input
1. **Priority**: China accessibility vs. automation level
2. **Manual Work Tolerance**: Acceptable amount of manual Google Sheets entry
3. **Backup Strategy**: Preferred fallback if primary solution fails
4. **Data Format**: Desired Google Sheets structure and column mapping

## Success Criteria
- ✅ Form works reliably from China
- ✅ Maintains static website architecture (or minimal serverless)
- ✅ Data reaches Google Sheets (automated or manual)
- ✅ Secure credential handling
- ✅ User-friendly experience in both languages

## Next Steps
1. Choose between the three main options (A, B, or C)
2. If Option A: Design email workflow
3. If Option B: Set up serverless infrastructure
4. If Option C: Select and configure form service
5. Begin implementation phase
