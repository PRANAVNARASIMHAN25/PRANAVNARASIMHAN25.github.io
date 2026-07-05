const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');

// ??? Helpers ???????????????????????????????????????????????????????????????

const BRAND = "1F4E79"; // dark navy
const ACCENT = "2E75B6"; // blue
const LIGHT_BG = "EBF3FB";
const GREY_BG = "F2F2F2";
const WARN_BG = "FFF2CC";
const RED_BG = "FCE4D6";
const GREEN_BG = "E2EFDA";
const MID_BG = "DDEBF7";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 36, color: BRAND, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, size: 28, color: ACCENT, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: BRAND, font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}

function pMixed(runs) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: runs.map(r => new TextRun({ size: 22, font: "Arial", ...r }))
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function bulletMixed(runs, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: runs.map(r => new TextRun({ size: 22, font: "Arial", ...r }))
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function gap(sz = 120) {
  return new Paragraph({ spacing: { before: sz, after: 0 }, children: [new TextRun("")] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function callout(text, bg = LIGHT_BG) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [new TextRun({ text, size: 22, font: "Arial", italics: true })]
            })]
          })
        ]
      })
    ]
  });
}

function makeTable(headers, rows, colWidths, headerBg = BRAND) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: headerBg, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF", font: "Arial" })]
      })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => {
      const isObj = typeof cell === 'object' && cell !== null && !Array.isArray(cell);
      const txt = isObj ? cell.text : cell;
      const bg = isObj ? cell.bg : (ri % 2 === 0 ? "FFFFFF" : "F7FBFF");
      const bold = isObj ? (cell.bold || false) : false;
      const align = isObj ? (cell.align || AlignmentType.LEFT) : AlignmentType.LEFT;
      return new TableCell({
        borders,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: align,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: txt, size: 20, font: "Arial", bold })]
        })]
      });
    })
  }));

  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

// ??? Document ??????????????????????????????????????????????????????????????

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ]
      },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: BRAND },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [

      // ?? COVER ??????????????????????????????????????????????????????????
      gap(600),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "DITTO INSURANCE", bold: true, size: 48, color: BRAND, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Founder\u2019s Office Assignment", bold: true, size: 36, color: ACCENT, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
        children: [new TextRun({ text: "Influencer Marketing \u2014 Operating System Design & Portfolio Analysis", size: 24, color: "555555", font: "Arial" })]
      }),
      gap(80),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "June 2026", size: 22, color: "777777", font: "Arial" })]
      }),
      gap(400),

      // Summary box
      makeTable(
        ["SCOPE SUMMARY"],
        [
          [{ text: "Dataset: 180 campaigns \u2022 49 unique influencers \u2022 Sep 2025 \u2013 Jan 2026", bold: false, bg: "FFFFFF" }],
          [{ text: "Total Spend: \u20B922,682,106  \u2022  Total Premiums: \u20B967,546,021  \u2022  Overall ROI: 1.98x", bold: true, bg: LIGHT_BG }],
          [{ text: "Products: Health | Term Insurance | Both (Health & Term)", bold: false, bg: "FFFFFF" }],
        ],
        [9360], BRAND
      ),

      pageBreak(),

      // ?? PART A ??????????????????????????????????????????????????????????
      h1("Part A: CRM & Tracking System \u2014 From Zero"),
      gap(60),
      h2("The Problem in One Line"),
      p("Without a system, every influencer relationship exists in someone\u2019s inbox, memory, or WhatsApp. You can\u2019t scale what you can\u2019t see."),
      gap(80),

      h2("System Overview"),
      p("The entire workflow lives in one Google Sheet with six tabs. The philosophy is simple: it should be impossible to run a campaign without filling in the basics. Every tab feeds the next. No tab, no launch."),
      gap(60),

      h3("Tab 1: Influencer Master Database"),
      p("This is the source of truth for who exists in your universe. Every influencer \u2014 whether contacted, onboarded, or rejected \u2014 lives here. Key fields:"),
      bullet("Influencer name, handle, platform, niche, follower count, location"),
      bullet("Estimated CPE (cost per engagement) and historical avg conversion rate (auto-populated from Tab 4 once data exists)"),
      bullet("Product fit tag: Health / Term / Both"),
      bullet("Blacklist flag: Yes/No with reason"),
      bullet("Owner (the team member responsible for this relationship)"),
      bullet("Last contacted date (auto-pulled from Tab 2)"),
      gap(60),

      h3("Tab 2: Outreach Pipeline"),
      p("Every outreach attempt is logged here before a single message is sent. This is how you kill duplicate outreach \u2014 if an influencer already has a row here with any status other than \u2018Rejected\u2019, no one else can initiate contact. The pipeline stages are:"),
      gap(40),
      makeTable(
        ["Stage", "What It Means", "What Must Be Filled"],
        [
          ["1. Identified", "Added to pipeline, not yet contacted", "Name, platform, owner, product fit"],
          ["2. Contacted", "First outreach sent (email/DM/WhatsApp)", "Date contacted, channel used, message summary"],
          ["3. In Negotiation", "They replied, terms being discussed", "Rate card shared, counter-offer (if any)"],
          ["4. Brief Sent", "Campaign brief formally shared", "Brief date, product, content type, go-live date"],
          ["5. Contract Signed", "Agreement confirmed", "Agreed cost (INR), payment terms"],
          ["6. Live", "Campaign is running", "Campaign ID, UTM/code assigned, live date"],
          ["7. Completed", "Content posted, campaign closed", "Post URL, leads captured, conversion count"],
          ["8. Rejected / Ghosted", "No response or declined", "Reason, date of last attempt"],
        ],
        [1440, 2880, 5040], BRAND
      ),
      gap(80),
      p("SLA rules baked into the sheet via conditional formatting:"),
      bullet("If Stage = Contacted and no update in 3 days \u2192 row turns yellow (nudge owner)"),
      bullet("If Stage = In Negotiation and no update in 5 days \u2192 row turns orange (escalate to manager)"),
      bullet("If Stage = Brief Sent and go-live is within 48 hours but Stage \u2260 Live \u2192 row turns red"),
      gap(60),

      h3("Tab 3: Campaign Briefs & Activation Checklist"),
      p("No campaign goes live without this tab being complete. This is your pre-flight checklist. Mandatory fields that must be filled before a campaign is marked \u2018Live\u2019:"),
      bullet("Campaign ID (format: IF-YYYY-####, auto-generated)"),
      bullet("Influencer name (linked to Tab 1)"),
      bullet("Product: Health / Term / Both"),
      bullet("Content type: Reel / Story / YouTube Dedicated / YouTube Integrated / LinkedIn Post"),
      bullet("Go-live date"),
      bullet("UTM link (generated and logged here \u2014 no UTM = no live approval)"),
      bullet("Unique campaign code (e.g., DITTO-IF-1001) for leads who come via WhatsApp or calls"),
      bullet("Lead form URL (if applicable)"),
      bullet("Brief doc link (Google Doc or PDF)"),
      bullet("Approval status: Pending / Approved by Manager"),
      gap(40),
      callout("Rule: If any mandatory field above is empty, the \u2018Go Live\u2019 column auto-shows \u2018BLOCKED\u2019 in red. The manager does a 2-minute check every Monday and Thursday to clear blockers.", WARN_BG),
      gap(60),

      h3("Tab 4: Campaign Performance"),
      p("This is where results land after a campaign closes. Columns mirror the dataset you\u2019ve been given:"),
      bullet("Campaign ID, Influencer, Start date, Content type, Product"),
      bullet("Cost (INR), Leads, % Quality leads, Converts, Total Premium (INR), ROI"),
      bullet("Lead source breakdown: UTM-tracked / Campaign code / Direct call attribution"),
      bullet("Notes: anything anomalous (influencer posted late, UTM broke, etc.)"),
      gap(60),

      h3("Tab 5: Attribution Reconciliation Log"),
      p("UTMs will break. People will screenshot and share links. Leads will call and mention an influencer\u2019s name without clicking any link. This tab is your reconciliation layer."),
      gap(40),
      p("How attribution works in the real world at Ditto:"),
      bullet("Tier 1 \u2014 UTM tracked: Lead clicked the tracked link directly. Clean, automatic. Log in Tab 4 as \u2018UTM\u2019."),
      bullet("Tier 2 \u2014 Campaign code: Lead fills the form or mentions the code on the call. Sales team tags the CRM entry with the campaign code. Weekly, these are pulled and matched to Tab 4."),
      bullet("Tier 3 \u2014 Influencer mention: Lead says \u2018I saw this on [influencer]\u2019 during the call. Sales team logs the influencer name in a \u2018referral source\u2019 field. Weekly, influencer manager reconciles these against active campaigns."),
      bullet("Tier 4 \u2014 Time-window heuristic: If a lead comes in within 7 days of a campaign going live and the geographic/demographic profile matches the influencer\u2019s audience, it is tagged as \u2018probable\u2019 attribution. These are counted at 50% in ROI calculations and flagged as uncertain."),
      gap(40),
      callout("The goal is not perfect attribution. The goal is directional accuracy that\u2019s good enough to make scale vs. cut decisions. A 15% attribution uncertainty does not change whether an influencer with 4x ROI is worth scaling.", LIGHT_BG),
      gap(60),

      h3("Tab 6: Weekly Review Dashboard"),
      p("Auto-populates from Tabs 2 and 4 using SUMIF/COUNTIF formulas. The manager opens this on Monday morning. It shows:"),
      bullet("Pipeline health: # of influencers in each stage"),
      bullet("Campaigns live this week vs. planned"),
      bullet("Leads this week vs. last week (% change)"),
      bullet("Conversions this week vs. last week"),
      bullet("Top 3 performing campaigns (by ROI) in the last 30 days"),
      bullet("Budget spent YTD vs. allocated"),
      gap(80),

      h2("How Outreach Starts"),
      p("The manager (or a team member) identifies an influencer from Ditto\u2019s existing network, a competitor\u2019s campaign, or an inbound inquiry. Before sending a single message, they open Tab 1 and search the influencer\u2019s name. If a row exists with any active status, they stop \u2014 someone already owns that relationship. If not, they add a row in Tab 1, assign themselves as Owner, then move to Tab 2 and create an Outreach row at Stage 1."),
      p("This single step \u2014 \u2018check before you contact\u2019 \u2014 eliminates duplicate outreach entirely."),
      gap(80),

      h2("What the Weekly Review Looks Like"),
      p("Every Monday at 10am, the Influencer Manager opens Tab 6 and does a 20-minute review. The review has three questions:"),
      bullet("Are any live campaigns under-delivering on leads? If yes, why, and does the influencer know?"),
      bullet("Are any pipeline deals stalled past their SLA? If yes, who owns it and what\u2019s the next action?"),
      bullet("What\u2019s going live this week and are all briefs/UTMs confirmed?"),
      p("The output is a 5-line Slack message to the VP Marketing with the answers to those three questions. That\u2019s it. No deck, no spreadsheet attachment."),

      pageBreak(),

      // ?? PART B ??????????????????????????????????????????????????????????
      h1("Part B: ROI Analysis & Portfolio Decisions"),
      gap(60),

      h2("ROI Validation"),
      pMixed([
        { text: "The provided ROI formula (Total Premiums \u2212 Cost) / Cost has been validated against all 180 rows. " },
        { text: "Maximum discrepancy: 0.0005 (rounding only). The dataset is clean.", bold: true },
      ]),
      gap(60),

      h2("Portfolio-Level Numbers"),
      gap(40),
      makeTable(
        ["Metric", "Value"],
        [
          ["Total campaigns", "180"],
          ["Unique influencers", "49"],
          ["Total spend", "\u20B922,682,106"],
          ["Total premiums generated", "\u20B967,546,021"],
          ["Total conversions", "2,838"],
          ["Overall blended ROI", "1.98x"],
          ["Avg cost per conversion", "\u20B97,992"],
          ["Campaigns with negative ROI", "34 (19%)"],
          ["Campaigns with ROI > 3x", "51 (28%)"],
        ],
        [4680, 4680], BRAND
      ),
      gap(80),

      h2("What the Data Is Telling Us"),
      gap(40),

      h3("1. Product Mix Is the Biggest ROI Driver"),
      p("This is the most important finding in the dataset. Campaigns promoting Both (Health & Term) together generate 4.23x blended ROI versus 1.66x for Health-only and 0.92x for Term-only. The Both campaigns are doing \u20B96,467 per conversion versus \u20B99,172 for Term alone. Combined-product campaigns should be the default offering to any influencer who has relevant audience overlap."),
      gap(40),
      makeTable(
        ["Product", "Campaigns", "Total Spend", "Total Premium", "Blended ROI", "Cost / Conv"],
        [
          [{ text: "Both (Health & Term)", bold: true, bg: GREEN_BG }, "48", "\u20B95,387,308", "\u20B928,165,876", { text: "4.23x", bold: true, bg: GREEN_BG }, { text: "\u20B96,467", bold: true, bg: GREEN_BG }],
          ["Health", "65", "\u20B98,352,505", "\u20B922,228,851", "1.66x", "\u20B98,109"],
          [{ text: "Term Insurance", bg: WARN_BG }, { text: "67", bg: WARN_BG }, { text: "\u20B98,942,293", bg: WARN_BG }, { text: "\u20B917,151,294", bg: WARN_BG }, { text: "0.92x", bold: true, bg: WARN_BG }, { text: "\u20B99,172", bg: WARN_BG }],
        ],
        [2600, 1000, 1600, 1800, 1100, 1260], BRAND
      ),
      gap(80),

      h3("2. Content Format Matters, But Less Than You Think"),
      p("LinkedIn posts deliver the highest blended ROI (2.41x) and the lowest cost per conversion (\u20B97,002). This is counterintuitive \u2014 LinkedIn is not where most of the campaigns are. Instagram Stories are the worst performers with 1.10x ROI and \u20B911,750 per conversion. The recommendation is not to exit Stories entirely, but to use them only for influencers who have demonstrated strong story-to-conversion performance. Dedicated YouTube videos are the biggest absolute budget item (\u20B98.46 Cr) and deliver solid volume \u2014 1,109 conversions \u2014 but the ROI is middle-of-the-pack. Integrated YouTube videos with multiple mentions per video outperform dedicated videos in ROI."),
      gap(40),
      makeTable(
        ["Content Type", "Campaigns", "Blended ROI", "Cost / Conv", "Verdict"],
        [
          [{ text: "LinkedIn Post", bold: true }, "37", { text: "2.41x", bold: true, bg: GREEN_BG }, "\u20B97,002", { text: "Underused \u2014 scale", bold: true }],
          ["Integrated YouTube", "32", "2.09x", "\u20B97,891", "Scale with top performers"],
          ["Dedicated YouTube", "32", "2.00x", "\u20B97,630", "Maintain, optimize briefing"],
          ["Instagram Reels", "38", "1.97x", "\u20B98,312", "Selective \u2014 ROI-gate entry"],
          [{ text: "Instagram Story", bg: WARN_BG }, { text: "41", bg: WARN_BG }, { text: "1.10x", bold: true, bg: WARN_BG }, { text: "\u20B911,750", bg: WARN_BG }, { text: "Reduce \u2014 only proven performers", bg: WARN_BG }],
        ],
        [2400, 800, 1100, 1100, 3960], BRAND
      ),
      gap(80),

      h2("Influencer Tier Decisions"),
      p("The 49 influencers in this dataset have been sorted into four tiers based on blended ROI across all their campaigns. The tier determines the budget and attention they get next quarter."),
      gap(40),
      callout("Tier logic: Blended ROI is calculated across all campaigns an influencer has run. A single great campaign does not move an influencer to Tier 1 if their overall portfolio is weak. Conversely, one bad campaign does not cut an influencer with a strong track record.", LIGHT_BG),
      gap(60),

      h3("Tier 1: Scale Aggressively (Blended ROI > 3x) \u2014 14 Influencers"),
      p("These influencers are generating real premium volume at acceptable cost. Priority actions: increase campaign frequency, offer longer-term partnerships (quarterly retainers), move them toward Both (Health & Term) briefs where possible."),
      gap(40),
      makeTable(
        ["Influencer", "Campaigns", "Total Spend", "Total Premium", "Blended ROI", "Cost/Conv", "Conv%"],
        [
          [{ text: "IrfanSimplifiedKolkata", bold: true }, "1", "\u20B91,81,852", "\u20B920,34,656", { text: "10.19x", bold: true, bg: GREEN_BG }, "\u20B93,031", "10.4%"],
          [{ text: "RiyaProTamil", bold: true }, "1", "\u20B91,04,308", "\u20B98,41,283", { text: "7.07x", bold: true, bg: GREEN_BG }, "\u20B94,741", "8.8%"],
          [{ text: "RiyaAdvisorBengal", bold: true }, "2", "\u20B91,28,707", "\u20B99,69,594", { text: "6.53x", bold: true, bg: GREEN_BG }, "\u20B93,575", "6.8%"],
          ["MeeraBytesIndia", "5", "\u20B93,39,179", "\u20B919,76,201", "4.83x", "\u20B94,187", "4.6%"],
          [{ text: "AdityaGuidePune", bold: true }, "8", "\u20B98,90,140", "\u20B948,01,177", { text: "4.39x", bold: true }, "\u20B94,812", "6.9%"],
          ["ManavInsurePune", "2", "\u20B92,63,115", "\u20B913,09,578", "3.98x", "\u20B93,654", "6.0%"],
          ["MeeraFitChennai", "7", "\u20B98,46,113", "\u20B941,35,109", "3.89x", "\u20B94,807", "6.1%"],
          ["ManavStudioChennai", "5", "\u20B94,78,254", "\u20B921,64,425", "3.53x", "\u20B94,982", "5.9%"],
          ["ManavStudioBLR", "3", "\u20B91,66,081", "\u20B97,31,707", "3.41x", "\u20B95,190", "9.3%"],
          ["NehaLabChennai", "6", "\u20B98,43,038", "\u20B936,88,708", "3.38x", "\u20B95,895", "6.2%"],
          ["ShrutiHubKannada", "3", "\u20B93,26,514", "\u20B913,82,322", "3.23x", "\u20B94,947", "5.9%"],
          ["KabirWealthMumbai", "3", "\u20B94,16,738", "\u20B917,28,395", "3.15x", "\u20B98,014", "5.1%"],
          ["YashMoneyMarathi", "6", "\u20B96,81,855", "\u20B927,87,943", "3.09x", "\u20B97,332", "5.8%"],
          ["VikramDiaryMarathi", "1", "\u20B966,054", "\u20B93,41,655", "4.17x", "\u20B96,605", "5.8%"],
        ],
        [2400, 760, 1300, 1400, 1000, 900, 700], BRAND
      ),
      gap(40),
      callout("Note on IrfanSimplifiedKolkata, RiyaProTamil, and RiyaAdvisorBengal: Exceptional ROI on limited campaigns. Validate if the numbers hold on a second activation before committing to a retainer. They are Tier 1 on potential, not yet on volume.", WARN_BG),
      gap(80),

      h3("Tier 2: Scale Carefully (1x < ROI \u2264 3x) \u2014 19 Influencers"),
      p("Solid performers. They are profitable. The prescription is: continue at current budget, optimize the brief (push toward Both product, push toward LinkedIn or Integrated YouTube), and re-evaluate in 8 weeks. If ROI improves, move to Tier 1. If it flatlines, move to Tier 3."),
      gap(40),
      makeTable(
        ["Influencer", "Campaigns", "Blended ROI", "Cost/Conv", "Note"],
        [
          ["RahulGuideChennai", "3", "2.98x", "\u20B98,531", "Near Tier 1 \u2014 one more strong campaign promotes"],
          ["KritiCareerPune", "3", "2.94x", "\u20B95,246", "Efficient converter, scale brief complexity"],
          ["KritiFinanceHYD", "5", "2.67x", "\u20B95,377", "Consistent across 5 campaigns, reliable"],
          ["NandiniCircleKerala", "8", "2.38x", "\u20B96,796", "High volume, test Both product"],
          ["DevPulseChennai", "4", "2.29x", "\u20B98,930", "Good, but cost/conv creeping up \u2014 watch"],
          ["NandiniFitGujarat", "10", "1.85x", "\u20B97,605", "Most campaigns run, ROI plateau \u2014 refresh creative"],
          ["DevWithBengal", "6", "1.66x", "\u20B98,388", "Solid, needs product mix shift to Both"],
          ["ArjunStartupBLR", "7", "1.45x", "\u20B98,302", "Trending down \u2014 last 2 campaigns below 1x, monitor"],
          ["ManavAcademyKerala", "7", "1.01x", "\u20B910,676", "At the edge of Tier 3, no slack budget for this one"],
        ],
        [2500, 900, 1000, 1100, 3860], BRAND
      ),
      gap(40),
      p("Remaining Tier 2 influencers (ROI between 1x\u20132x, fewer campaigns): SimranInsightsHindi (2.09x), IshaMoneyBLR (1.55x), RiyaStudioGujarat (1.61x), IshaFitIndia (1.56x), DiyaBytesHindi (1.34x), AdityaGuideKolkata (1.10x), OmInsureHindi (1.01x), VikramDecodedHindi (1.73x), ArjunLabDelhi (1.64x), DiyaCircleMarathi (1.35x)."),
      gap(80),

      h3("Tier 3: Probation (0 \u2264 ROI \u2264 1x) \u2014 11 Influencers"),
      p("These influencers are marginally profitable or breaking even. They stay on one condition: a structured improvement brief within the next campaign. If the next campaign does not clear 1.5x ROI, they move to Tier 4."),
      gap(40),
      makeTable(
        ["Influencer", "Campaigns", "Blended ROI", "Cost/Conv", "Why It\u2019s Concerning"],
        [
          ["ArjunInsightsPune", "9", "0.37x", "\u20B915,635", "9 campaigns and still under 0.5x \u2014 this is a pattern, not a slump"],
          ["KabirInsureKolkata", "2", "0.07x", "\u20B928,301", "\u20B928K per conversion is unworkable"],
          ["KritiStudioIndia", "2", "0.07x", "\u20B928,642", "Same issue, very low conversion efficiency"],
          ["VikramBytesChennai", "6", "0.85x", "\u20B910,995", "6 campaigns, never broken 1x blended \u2014 pattern"],
          ["RohanDailyKannada", "5", "0.73x", "\u20B912,242", "High lead count but poor conversion rate"],
          ["NandiniTalksTamil", "5", "0.77x", "\u20B911,435", "Consistent underperformer across formats"],
          ["AnanyaLabGujarat", "3", "0.51x", "\u20B911,937", "Needs product and format change immediately"],
        ],
        [2500, 900, 1000, 1100, 3860], BRAND
      ),
      gap(80),

      h3("Tier 4: Cut (ROI < 0) \u2014 5 Influencers"),
      p("These activations cost more than they generated. There is no strategic reason to continue. Exit now, do not book next campaigns."),
      gap(40),
      makeTable(
        ["Influencer", "Campaigns", "Total Spend", "Total Premium", "Blended ROI", "Decision"],
        [
          [{ text: "AnanyaInsightsBLR", bold: true, bg: RED_BG }, { text: "1", bg: RED_BG }, { text: "\u20B91,18,452", bg: RED_BG }, { text: "\u20B939,551", bg: RED_BG }, { text: "-0.67x", bold: true, bg: RED_BG }, { text: "Cut. Do not re-engage.", bold: true, bg: RED_BG }],
          [{ text: "RiyaLabHindi", bold: true, bg: RED_BG }, { text: "1", bg: RED_BG }, { text: "\u20B951,243", bg: RED_BG }, { text: "\u20B925,174", bg: RED_BG }, { text: "-0.51x", bold: true, bg: RED_BG }, { text: "Cut.", bold: true, bg: RED_BG }],
          [{ text: "NehaTalksIndia", bold: true, bg: RED_BG }, { text: "2", bg: RED_BG }, { text: "\u20B94,73,103", bg: RED_BG }, { text: "\u20B93,93,447", bg: RED_BG }, { text: "-0.17x", bold: true, bg: RED_BG }, { text: "Cut. \u20B979K destroyed across 2 campaigns.", bold: true, bg: RED_BG }],
          [{ text: "NandiniHubHYD", bold: true, bg: RED_BG }, { text: "2", bg: RED_BG }, { text: "\u20B91,66,599", bg: RED_BG }, { text: "\u20B91,55,685", bg: RED_BG }, { text: "-0.07x", bold: true, bg: RED_BG }, { text: "Cut.", bold: true, bg: RED_BG }],
          [{ text: "OmStudioIndia", bold: true, bg: RED_BG }, { text: "5", bg: RED_BG }, { text: "\u20B97,49,408", bg: RED_BG }, { text: "\u20B97,38,091", bg: RED_BG }, { text: "-0.02x", bold: true, bg: RED_BG }, { text: "Cut. 5 chances, never broke even.", bold: true, bg: RED_BG }],
        ],
        [2400, 800, 1400, 1400, 1000, 2360], BRAND
      ),
      gap(40),
      callout("OmStudioIndia is the most important cut. Five campaigns were run with this influencer and not one of them broke even. This is not bad luck \u2014 it is an audience-product mismatch. Continuing would be a capital allocation failure.", RED_BG),
      gap(80),

      h2("Budget Reallocation Recommendation"),
      p("The \u20B98+ Cr currently allocated toward Term Insurance-only campaigns (blended ROI 0.92x) should be partially redeployed:"),
      bullet("Shift 40% of Term-only budget to Both (Health & Term) briefs for Tier 1 and Tier 2 influencers. Expected ROI uplift: from 0.92x to approximately 2.5\u20133x."),
      bullet("Stop all Instagram Story campaigns for Tier 3 and Tier 4 influencers. Redirect to LinkedIn or Integrated YouTube."),
      bullet("Expand the 3 highest-performing influencers (IrfanSimplifiedKolkata, RiyaAdvisorBengal, AdityaGuidePune) with 2x budget and quarterly retainers."),
      bullet("Free up \u20B915.6L from Tier 4 cuts. Redeploy to Tier 1 activations."),

      pageBreak(),

      // ?? PART C ??????????????????????????????????????????????????????????
      h1("Part C: Weekly Reporting & Operating Rhythm"),
      gap(60),

      h2("The Problem With Most Marketing Reports"),
      p("They\u2019re written to show effort, not to drive decisions. A 20-slide weekly deck that takes 3 hours to make and 40 minutes to read is a productivity tax, not an operating tool. The system below is designed so that each audience gets exactly what they need \u2014 nothing more."),
      gap(80),

      h2("Three Audiences, Three Reports, One Source"),
      p("All three reports pull from the same Google Sheet (Tab 6 \u2014 Weekly Review Dashboard). The influencer manager fills in Tab 4 (campaign performance) every Friday by EOD. By Monday 9am, Tab 6 auto-refreshes. Each report is written on Monday morning and sent by 10am."),
      gap(80),

      h3("Report 1: Influencer Marketing Manager \u2014 Execution View"),
      p("The manager\u2019s report is an operational dashboard. It answers: what\u2019s moving, what\u2019s stuck, and what needs to happen today. It lives in a pinned Notion page or a recurring Slack message in the #influencer-ops channel. It is never a PDF attachment."),
      gap(40),
      pMixed([{ text: "Structure:", bold: true }]),
      bullet("Pipeline Health (counts by stage from Tab 2): Identified / Contacted / In Negotiation / Brief Sent / Live / Completed this week"),
      bullet("This Week\u2019s Live Campaigns: List of campaigns going live, with UTM status (confirmed / pending)"),
      bullet("Leads & Conversions: This week vs. last week, by product"),
      bullet("Overdue SLAs: Influencers stuck in a stage past their SLA window \u2014 name, stage, days overdue, owner"),
      bullet("Next Week\u2019s Scheduled Activations: What\u2019s confirmed vs. at risk"),
      bullet("Action Items: 3\u20135 concrete next steps with owner and deadline"),
      gap(60),

      callout("Example Manager Weekly Update \u2014 Week of Jan 13, 2026\n\nPipeline Health: 12 identified, 8 contacted (3 new this week), 5 in negotiation, 4 briefs sent, 7 live, 3 completed this week.\n\nThis Week Live: 4 campaigns went live \u2014 YashMoneyMarathi (Both, IG Reels), VikramBytesChennai (Health, IG Reels), NandiniCircleKerala (Both, Dedicated YT), RiyaStudioGujarat (Both, Integrated YT). All UTMs confirmed except RiyaStudioGujarat \u2014 link broken, replaced at 6pm Sunday, monitoring.\n\nLeads & Conversions: 284 leads this week vs. 261 last week (+9%). Conversions: 38 vs. 31 (+23%). Health: 14 converts. Term: 11 converts. Both: 13 converts. Both continues to punch above its weight.\n\nOverdue SLAs: ManavAcademyKerala stuck in \u2018Brief Sent\u2019 for 6 days (SLA: 3 days). Owner: Priya. Brief was sent but influencer has not confirmed go-live date. Follow up today.\n\nAction Items: (1) Priya to call ManavAcademyKerala today and confirm go-live or mark as delayed. (2) Rebook IrfanSimplifiedKolkata for Q1 Feb slot \u2014 outstanding ROI, retainer conversation needed. (3) Off-board OmStudioIndia from pipeline \u2014 5th negative ROI campaign closed. (4) Draft Both-product brief template for Tier 1 influencers by Wednesday.", LIGHT_BG),
      gap(80),

      h3("Report 2: VP Marketing \u2014 Decision View"),
      p("The VP does not need to know which influencer posted at 3pm on Thursday. They need to know: is the channel working, where is the budget going, and what decisions are needed. This is a 400\u2013500 word Slack message or email, sent Monday by 10am. It has five fixed sections."),
      gap(40),
      pMixed([{ text: "Structure:", bold: true }]),
      bullet("Channel ROI this week and rolling 4-week average"),
      bullet("Budget utilization: spent vs. allocated YTD, forecast to end of quarter"),
      bullet("What\u2019s scaling and why (top 3 campaigns by ROI this week)"),
      bullet("What\u2019s being cut and why (any new Tier 4 determinations)"),
      bullet("Experiments and learnings: one insight from last week\u2019s data"),
      bullet("Decisions needed: explicit asks (budget reallocation, retainer approval, etc.)"),
      gap(60),

      callout("Example VP Marketing Update \u2014 Week of Jan 13, 2026\n\nChannel ROI: 2.14x this week. Rolling 4-week average: 1.97x. We are above the portfolio average for the third consecutive week, driven by a deliberate shift to Both (Health & Term) briefs for Tier 1 influencers.\n\nBudget: \u20B918.4L spent of \u20B922L allocated for January. On track. The \u20B915.6L freed up from exiting Tier 4 influencers has been reallocated to IrfanSimplifiedKolkata (retainer) and AdityaGuidePune (additional Feb campaign).\n\nScaling: Three standout campaigns this month. IrfanSimplifiedKolkata\u2019s integrated YouTube activation delivered 10.2x ROI on a \u20B91.8L spend \u2014 the highest single-campaign return in the dataset. AdityaGuidePune continues to compound across 8 campaigns at 4.4x blended ROI. MeeraFitChennai has been consistent across 7 campaigns at 3.9x \u2014 a reliable quarterly anchor.\n\nCuts: OmStudioIndia has been offboarded. Five campaigns, never broke even, blended ROI of -0.02x. AnanyaInsightsBLR and RiyaLabHindi already removed last review cycle. Budget recovered: \u20B915.6L total.\n\nLearning: Both (Health & Term) product campaigns are generating 4.23x ROI versus 0.92x for Term-only. We are under-utilizing this brief format. Recommendation: 60% of all new campaigns this quarter should lead with the Both brief. This is a budget-neutral change that should lift portfolio ROI by an estimated 0.4\u20130.6x.\n\nDecision Needed: Retainer proposal for IrfanSimplifiedKolkata at \u20B91.8L/month for 3 months. Approve / Reject / Revise by Wednesday.", LIGHT_BG),
      gap(80),

      h3("Report 3: Founders \u2014 Signal View"),
      p("Founders are not running this channel. They need to know it\u2019s working, see one number that matters, know if there\u2019s a risk, and be asked for a decision if one is needed. This is five lines. Maximum. Sent via WhatsApp or Slack, Monday morning."),
      gap(40),
      pMixed([{ text: "Structure:", bold: true }]),
      bullet("Headline output: leads and conversions this week"),
      bullet("Channel ROI and trend"),
      bullet("One big thing that worked"),
      bullet("One risk on the radar"),
      bullet("Decision needed (if any) \u2014 if none, this line is omitted"),
      gap(60),

      callout("Example Founder Update \u2014 Week of Jan 13, 2026\n\nInfluencer channel: 284 leads, 38 conversions this week. Channel ROI at 2.14x (up from 1.9x last month).\n\nBig win: IrfanSimplifiedKolkata\u2019s YouTube campaign delivered 10x ROI on \u20B91.8L spend. Proposing a 3-month retainer.\n\nRisk: ArjunInsightsPune has had 9 campaigns and never exceeded 0.5x ROI. We\u2019ve moved them to probation but \u20B911L is already sunk. Last chance campaign briefed for Feb.\n\nDecision needed: Retainer for IrfanSimplifiedKolkata at \u20B91.8L/month. Yes / No?", LIGHT_BG),

      pageBreak(),

      // ?? PART D ??????????????????????????????????????????????????????????
      h1("Part D: Outreach Automation"),
      gap(60),

      h2("What We\u2019re Automating and Why"),
      p("The current state: outreach is sent manually, follow-ups depend on someone remembering, duplicate contacts happen because there\u2019s no shared view, and nothing is logged unless someone bothers to update a spreadsheet. Automation fixes three things: it enforces the pipeline, it does follow-ups without being asked, and it logs every interaction automatically."),
      gap(40),
      p("The stack: Google Sheets + Google Apps Script + Gmail. No third-party tools required. If the team wants Zapier or Make, the same logic applies \u2014 the triggers and actions are identical."),
      gap(80),

      h2("1. Pipeline Stage System"),
      p("The pipeline tab (Tab 2) has a \u2018Stage\u2019 dropdown column with 8 values (Identified through Rejected). Every stage change timestamps automatically using an onEdit trigger in Apps Script:"),
      gap(40),
      makeTable(
        ["Event", "Script Action"],
        [
          ["Stage column is edited", "Write current timestamp to \u2018Last Stage Change\u2019 column"],
          ["Stage moves to \u2018Contacted\u2019", "Write \u2018First Contact Date\u2019 and create a follow-up task in a Tasks tab (due: +3 days)"],
          ["Stage moves to \u2018Live\u2019", "Send auto-email to influencer with UTM link and brief PDF link"],
          ["Stage moves to \u2018Completed\u2019", "Flag row for performance entry \u2014 turns orange until Tab 4 is filled"],
        ],
        [3000, 6360], BRAND
      ),
      gap(80),

      h2("2. Owner Assignment Rules"),
      p("When a new row is added to the Outreach Pipeline tab, the script checks the \u2018Owner\u2019 column. If it\u2019s blank, it assigns the influencer to the team member with the fewest active pipeline rows (simple round-robin). The owner gets a Slack DM (via webhook) or email: \u2018You\u2019ve been assigned [Influencer Name] \u2014 first contact due within 24 hours.\u2019"),
      gap(80),

      h2("3. SLA-Based Follow-Up Reminders"),
      p("A time-driven trigger runs every morning at 8am and checks every row in the Outreach tab. The logic:"),
      gap(40),
      makeTable(
        ["Stage", "SLA", "Action on Breach"],
        [
          ["Contacted", "3 days without update", "Email the owner: \u2018[Influencer] has not moved stages in 3 days. Follow up today.\u2019"],
          ["In Negotiation", "5 days without update", "Email owner + Slack the manager: \u2018[Influencer] negotiation stalled. Review needed.\u2019"],
          ["Brief Sent", "3 days without confirmation", "Email owner: \u2018Brief sent but go-live not confirmed. Chase influencer.\u2019"],
          ["Live (no leads)", "5 days after go-live", "Alert manager: \u2018[Influencer] campaign live but 0 leads recorded. Check UTM / content.\u2019"],
        ],
        [2400, 1500, 5460], BRAND
      ),
      gap(80),

      h2("4. Escalation Reminders"),
      p("If a breach goes un-actioned for a further 2 days after the first reminder, the script escalates: it emails the VP Marketing and flags the row in red in the sheet. This means the manager cannot ignore a stalled negotiation for a week without it surfacing to leadership. The escalation email is a single line: \u2018[Influencer Name] has been in [Stage] for [N] days without an update. Owner: [Name]. Please review.\u2019"),
      gap(80),

      h2("5. Preventing Duplicate Outreach"),
      p("This is the most important automation in the system. When anyone adds a new influencer to the Outreach Pipeline tab, the script checks the Influencer Master Database (Tab 1) for an exact name match. If a match exists with a status of Contacted, In Negotiation, Brief Sent, or Live, the script:"),
      numbered("Blocks the row from being saved (highlights it red with a message: \u2018Duplicate: [Name] is already in pipeline \u2014 owned by [Owner]\u2019)."),
      numbered("Sends an alert to the person trying to add the duplicate."),
      numbered("Logs the attempted duplicate in a separate Conflict Log tab with a timestamp and the name of both team members."),
      gap(40),
      p("The Conflict Log is reviewed in the Monday meeting. Recurring conflicts indicate a process breakdown (two people sourcing the same influencer) that needs a structural fix."),
      gap(80),

      h2("6. Communication History Log"),
      p("Every outreach email sent via the system (or logged manually) appends a row to a Communication Log tab with: Influencer name, Date, Channel (email/WhatsApp/DM), Direction (outbound/inbound), Owner, and a one-line summary. This creates an auditable thread for every influencer without relying on individual inboxes."),
      p("For WhatsApp communications (which can\u2019t be automated directly), the owner uses a simple slash-command in the tracker: they type /log into the Notes column of the Outreach tab, and the script prompts them to fill in date, channel, and summary. The entry is then auto-appended to the Communication Log."),
      gap(80),

      h2("7. Rollout Plan: How to Do This Without Breaking Momentum"),
      gap(40),
      h3("Day 1: Hard Mandates (Non-Negotiable from the Start)"),
      p("On Day 1, two things are enforced without exception. First, every influencer being actively worked must be entered into the Outreach Pipeline tab before any further outreach is sent. If it\u2019s not in the sheet, it doesn\u2019t exist. Second, every campaign that goes live must have a Campaign ID, a UTM link, and a unique campaign code entered in Tab 3 before the content posts. The manager does a 5-minute pre-flight check on every activation going live that week."),
      p("These two rules prevent the most damaging failures: invisible work and untracked launches. Everything else is a nice-to-have in week one."),
      gap(60),

      h3("Week 1\u20132: Gradual Additions"),
      p("Once the pipeline tab has data in it (usually within the first week, as existing conversations are back-filled), the SLA reminders are turned on. The team will initially find them annoying. That is the point. The annoyance comes from having let things sit too long \u2014 the automation is just making the invisible visible."),
      p("In week two, the duplicate check script goes live. The team is briefed in a 15-minute session: here\u2019s what it does, here\u2019s what happens if you try to add a duplicate. No lecture, no process document. Just a live demo."),
      gap(60),

      h3("Week 3\u20134: Full System Live"),
      p("By week three, the Communication Log is being used. The manager reviews it in the weekly Monday check and can see every touchpoint across every influencer without opening a single inbox. The weekly dashboard (Tab 6) is live and the three-audience reporting cadence begins."),
      gap(60),

      h3("How to Make Sure the Tracker Doesn\u2019t Die After Two Weeks"),
      p("Every tracker dies for one of two reasons: it\u2019s too complex to fill in, or it doesn\u2019t give back to the person filling it in."),
      p("On complexity: the mandatory fields at each stage are designed to be the minimum needed to do the job, not the maximum a process designer could imagine. If a field isn\u2019t used in a decision, it is not in the sheet."),
      p("On giving back: the manager\u2019s weekly report is generated almost entirely from the sheet. The SLA reminders replace the mental overhead of remembering to follow up. The duplicate check removes an embarrassing mistake that has probably already happened once. Once the team sees that filling in the sheet means the sheet does the chasing for them, compliance becomes self-reinforcing."),
      p("The first three weeks, the manager does a 5-minute Friday EOD audit: every Live campaign should have leads recorded, every Completed campaign should have performance data, every Contacted influencer should have had at least one follow-up logged. This audit habit, more than any automation, is what keeps the system alive."),
      gap(120),

      // ?? CLOSING ??????????????????????????????????????????????????????
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } },
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: "Summary of Recommendations", bold: true, size: 26, color: BRAND, font: "Arial" })]
      }),
      gap(40),
      makeTable(
        ["Area", "Action", "Priority"],
        [
          ["Product Mix", "Shift 60% of briefs to Both (Health & Term) format", { text: "Immediate", bold: true, bg: GREEN_BG }],
          ["Influencer Cuts", "Exit 5 Tier 4 influencers, recover \u20B915.6L", { text: "Immediate", bold: true, bg: GREEN_BG }],
          ["Scale", "Retainer for IrfanSimplifiedKolkata, 2x budget for AdityaGuidePune and MeeraFitChennai", { text: "This Week", bold: true, bg: LIGHT_BG }],
          ["Content", "Reduce Instagram Story campaigns; push Tier 1 toward LinkedIn and Integrated YouTube", { text: "This Quarter", bold: true, bg: LIGHT_BG }],
          ["CRM", "Google Sheet tracker live with Day 1 mandates enforced", { text: "This Week", bold: true, bg: LIGHT_BG }],
          ["Automation", "Apps Script: SLA reminders, duplicate check, stage timestamps", { text: "Week 2", bold: true }],
          ["Reporting", "Three-audience weekly cadence live from Week 1", { text: "This Week", bold: true, bg: LIGHT_BG }],
        ],
        [2400, 4560, 2400], BRAND
      ),

    ]
  }]
});

const outputPath = path.join(__dirname, "Ditto_Founders_Office_Assignment.docx");

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Done � saved to:", outputPath);
}).catch(console.error);
