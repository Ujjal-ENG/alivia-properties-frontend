export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  coverImage: string
  author: { name: string; avatar: string; title: string }
  readTime: number
  publishedAt: string
  featured: boolean
}

export const BLOG_CATEGORIES = [
  "Buying Guide",
  "Selling Guide",
  "Investment Insights",
  "Real Estate Tips",
  "Legal & Documentation",
  "Home Loan & Finance",
]

export const DUMMY_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-001",
    slug: "how-to-buy-your-first-home-in-dhaka",
    title: "How to Buy Your First Home in Dhaka: A Step-by-Step Guide for 2025",
    excerpt:
      "Buying your first home in Dhaka can feel overwhelming. From choosing the right area to navigating the registration process, this guide walks you through every step to make your dream home a reality.",
    content: `## Why Buying in Dhaka Requires a Different Approach

Dhaka's real estate market is one of South Asia's most dynamic — with high demand, limited supply in prime areas, and prices that can vary dramatically within the same neighbourhood. Here's what first-time buyers need to know...

## Step 1: Define Your Budget Realistically

Before browsing listings, establish your total budget inclusive of:
- Property price
- Registration fees (typically 12-14% of deed value)
- Legal fees (advocate charges)
- Stamp duty
- Moving costs

## Step 2: Choose the Right Area

Popular areas for first-time buyers in Dhaka include:
- **Uttara** — planned layout, affordable, good connectivity
- **Bashundhara R/A** — premium amenities, green environment
- **Mohammadpur** — central, affordable, established community
- **Mirpur** — best value for money, improving infrastructure

## Step 3: Verify the Developer or Seller

Always check:
- RAJUK approval documents
- Land ownership mutation papers
- Developer's track record and completed projects

## Step 4: Understand the Registration Process

Property registration in Bangladesh involves:
1. Drafting a sale agreement (Baina Nama)
2. Executing the deed at Sub-Registrar's office
3. Paying stamp duty and registration fees
4. Updating the mutation record

## Step 5: Consider a Home Loan

Several Bangladeshi banks offer home loans at 9-12% interest for up to 20 years. DBBL, BRAC Bank, and Islami Bank have competitive offerings for salaried professionals.`,
    category: "Buying Guide",
    tags: ["buying", "first home", "Dhaka", "registration", "guide"],
    coverImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format",
    author: {
      name: "Md. Rafiqul Islam",
      avatar: "/founder.jpg",
      title: "Founder & MD, Alivia Properties",
    },
    readTime: 8,
    publishedAt: "2025-01-06T09:00:00Z",
    featured: true,
  },
  {
    id: "blog-002",
    slug: "property-investment-purbachal-2025",
    title: "Why Purbachal is the Smartest Real Estate Investment in 2025",
    excerpt:
      "Purbachal New Town is Bangladesh's largest planned satellite city. Here's why savvy investors are betting big on this rapidly developing area and how you can benefit.",
    content: `## The Purbachal Opportunity

Purbachal New Town is a 6,224-acre master-planned satellite city being developed by RAJUK just 16km east of Dhaka. With Phase 1 infrastructure nearly complete, 2025 marks a tipping point for property values in this area...

## Why Purbachal is Appreciating Fast

1. **Mega infrastructure** — 300-ft main road, Kanchpur Bridge, and proposed metro rail extension
2. **Planned layout** — 27 sectors with schools, hospitals, mosques, and parks allocated
3. **Price trajectory** — plot prices have tripled in 5 years and are still below comparable Dhaka areas
4. **Government push** — key ministries relocating operations nearby

## Current Price Range

- Residential plots: BDT 1.5–3.5 crore per katha depending on sector
- Ready apartments: BDT 50–80 lakh per unit (growing fast)

## Risk Factors to Consider

- Utility connections still in progress in some sectors
- Traffic congestion during peak hours
- Long-term play — expect 7-10 year horizon for maximum returns

## Our Recommendation

Purbachal offers the best risk-reward ratio in Dhaka's periphery. Focus on Sectors 10–20 for residential, and Sectors 1–5 for commercial potential.`,
    category: "Investment Insights",
    tags: ["investment", "Purbachal", "land", "appreciation", "2025"],
    coverImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format",
    author: {
      name: "Md. Rafiqul Islam",
      avatar: "/founder.jpg",
      title: "Founder & MD, Alivia Properties",
    },
    readTime: 6,
    publishedAt: "2025-01-04T09:00:00Z",
    featured: true,
  },
  {
    id: "blog-003",
    slug: "legal-documents-checklist-property-bangladesh",
    title: "Property Legal Documents Checklist in Bangladesh — What to Check Before Buying",
    excerpt:
      "Skipping due diligence on property documents is the #1 mistake buyers make in Bangladesh. Use this comprehensive checklist to protect yourself from fraud and title disputes.",
    content: `## Why Document Verification is Critical

Property fraud cases in Bangladesh often involve forged ownership documents, multiple sales of the same property, or undisclosed encumbrances. This checklist ensures you don't become a victim.

## Essential Documents to Verify

### Ownership Documents
- [ ] Original deed (Dastabeez / Mouza Khotiyan)
- [ ] CS, RS, BS, City Khotiyan records
- [ ] Mutation record (Namjari) in buyer's name or seller's name
- [ ] Rent receipt (Khajna Rasid) showing current owner

### Developer/Building Documents (For Apartments)
- [ ] RAJUK / CDA / KDA approved building plan
- [ ] Developer's license from REHAB
- [ ] Land ownership deed of the developer
- [ ] Completion certificate
- [ ] Power of Attorney from landowner to developer

### Legal Clearance
- [ ] No encumbrance certificate from bank (if loan was taken)
- [ ] No court case or dispute record on the property
- [ ] NOC from relevant authority (WASA, DESCO, BGSL)

### Due Diligence Steps
1. Hire a reputable advocate for title search
2. Visit the Sub-Registrar's office to verify deed history
3. Physically verify the land from Mouza map
4. Check if property is in flood zone or Khas land

## Red Flags to Watch

- Seller rushing the sale
- Deed value far below market value
- Original documents not available — only photocopies
- Multiple owners on title without clear division`,
    category: "Legal & Documentation",
    tags: ["legal", "documents", "deed", "registration", "due diligence"],
    coverImage: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&auto=format",
    author: {
      name: "Alivia Properties Team",
      avatar: "/logo.svg",
      title: "Editorial Team",
    },
    readTime: 10,
    publishedAt: "2025-01-02T09:00:00Z",
    featured: false,
  },
  {
    id: "blog-004",
    slug: "home-loan-guide-bangladesh-2025",
    title: "Home Loan Guide for Bangladesh 2025: Banks, Rates & How to Apply",
    excerpt:
      "Confused by home loan options? This complete guide covers the best banks in Bangladesh for home loans, current interest rates, eligibility criteria, and a step-by-step application process.",
    content: `## Home Loan Landscape in Bangladesh

With property prices rising, most buyers now opt for home financing. Bangladesh offers both conventional and Islamic home loan products from over 20 banks.

## Current Interest Rate Comparison (2025)

| Bank | Rate Type | Interest Rate | Max Tenure |
|------|-----------|---------------|------------|
| BRAC Bank | Floating | 9.5% | 25 years |
| Dutch-Bangla Bank | Fixed/Floating | 9.0-9.5% | 20 years |
| Islami Bank | Islamic Hire Purchase | 10.5% | 20 years |
| Southeast Bank | Floating | 9.5% | 25 years |
| City Bank | Fixed | 10.0% | 20 years |

## Eligibility Criteria

Most banks require:
- Salaried employee or business owner
- Minimum monthly income: BDT 50,000
- Age: 23–60 years
- Maximum LTV: 70% of property value

## Documents Required

For Salaried:
- Last 3 months salary slips
- Last 1-year bank statement
- Employment confirmation letter
- NID and TIN certificate

For Business Owners:
- Last 2 years tax return (ITR)
- Trade license
- Last 1-year bank statement

## Mortgage Calculator Example

For a 1 crore property at 30 lakh down payment:
- Loan amount: 70 lakh
- Rate: 9.5% for 20 years
- Estimated EMI: ~BDT 65,500/month

## Tips to Get Approved Faster

1. Maintain a healthy bank statement — avoid large unexplained credits
2. Clear existing loans before applying
3. Apply jointly with spouse to increase eligible amount
4. Choose RAJUK-approved projects for easier processing`,
    category: "Home Loan & Finance",
    tags: ["home loan", "mortgage", "bank", "interest rate", "EMI", "finance"],
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format",
    author: {
      name: "Alivia Properties Team",
      avatar: "/logo.svg",
      title: "Editorial Team",
    },
    readTime: 9,
    publishedAt: "2024-12-28T09:00:00Z",
    featured: false,
  },
  {
    id: "blog-005",
    slug: "how-to-sell-property-fast-bangladesh",
    title: "How to Sell Your Property Fast in Bangladesh: 8 Proven Strategies",
    excerpt:
      "Sitting on a property that won't sell? These 8 data-backed strategies will help you close faster and at a better price in Bangladesh's competitive market.",
    content: `## Why Properties Sit Unsold

The most common reasons properties linger on the market in Bangladesh:
1. Overpriced relative to comparables
2. Poor photography and listing description
3. Wrong platform — not enough exposure
4. Legal documents not ready
5. Inflexibility on negotiation

## Strategy 1: Price It Right from Day One

Overpricing is the biggest mistake. A property priced correctly sells in 30-60 days. One priced too high sits for 6-12 months and eventually sells for less.

Get a comparative market analysis from at least 3 agents before listing.

## Strategy 2: Professional Photography

In Bangladesh, most listings have dark, blurry phone photos. Professional photography increases inquiry volume by 3x. It costs BDT 3,000–8,000 and pays for itself many times over.

## Strategy 3: List on Multiple Platforms

- Alivia Properties marketplace
- Bikroy.com
- lamudi.com.bd
- Facebook property groups (100k+ member groups in Dhaka)

## Strategy 4: Have Documents Ready

Buyers lose interest when they ask for documents and are told "we'll arrange them." Have your full document set ready before listing.

## Strategy 5: Set a Competitive Baina Nama Policy

Allow a reasonable holding deposit (BDT 2-5 lakh) for serious buyers. This filters time-wasters and speeds up commitment.

## Strategy 6: Stage Your Property

Even basic staging — clean, paint touch-ups, and removing clutter — can increase perceived value by 10-15%.

## Strategy 7: Price Bands for Negotiation

Price slightly above your minimum to leave room for negotiation. Buyers feel they've "won" when you come down 3-5% from asking.

## Strategy 8: Hire a Verified Agent

A good agent earns their 1.5-2% commission through faster sale time, better pricing, and handling the paperwork you'd rather not deal with.`,
    category: "Selling Guide",
    tags: ["selling", "tips", "fast sale", "pricing", "photography"],
    coverImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&auto=format",
    author: {
      name: "Md. Rafiqul Islam",
      avatar: "/founder.jpg",
      title: "Founder & MD, Alivia Properties",
    },
    readTime: 7,
    publishedAt: "2024-12-22T09:00:00Z",
    featured: false,
  },
  {
    id: "blog-006",
    slug: "real-estate-tips-first-time-investors-bangladesh",
    title: "10 Real Estate Tips Every First-Time Investor in Bangladesh Must Know",
    excerpt:
      "Real estate is Bangladesh's most popular investment class, but first-timers make costly mistakes. These 10 tips will help you invest smarter and build real wealth.",
    content: `## Why Real Estate Beats Other Investments in Bangladesh

With fixed deposit rates at 6-7% and stock market volatility, real estate consistently delivers 12-18% annual returns in prime Dhaka areas — through a combination of capital appreciation and rental yield.

## Tip 1: Location Above Everything

In Bangladesh real estate, the three rules are: location, location, location. A mediocre apartment in Gulshan will outperform a luxury apartment in a remote area every time.

## Tip 2: Buy Under-Priced Markets Early

Uttara was "too far" in 2005. Bashundhara was "in the middle of nowhere" in 2010. Purbachal is "developing" in 2025. Follow infrastructure, not current popularity.

## Tip 3: Rental Yield vs. Capital Gains

Calculate both:
- **Rental yield** = Annual rent ÷ Property price × 100 (aim for 5-8%)
- **Capital appreciation** = % price increase per year (aim for 8-15% in good areas)

## Tip 4: Invest in RAJUK-Approved Projects Only

Non-approved buildings face demolition risk and cannot be used as loan collateral. RAJUK approval adds 15-20% premium but protects your investment.

## Tip 5: Don't Over-Leverage

Maximum recommended LTV is 60%. A market correction with 70%+ leverage can wipe out your equity.

## Tip 6: Diversify Across Types

Don't put all funds in one type. Mix residential (stable income) with commercial (higher yield) and land (highest capital gain).

## Tip 7: Factor in Holding Costs

Monthly costs for an empty property:
- Service charge: BDT 3,000-15,000
- Utility minimum: BDT 2,000-5,000
- Property tax: BDT 500-2,000

## Tip 8: Have an Exit Strategy Before You Enter

Before buying, know: Who would buy this from me? At what price? In what time frame?

## Tip 9: Build a Trusted Team

You need: a reliable agent, a good advocate, a chartered accountant familiar with property taxation, and a reputable banker.

## Tip 10: Be Patient — It's a Long Game

The best real estate investors in Bangladesh held for 10-20 years. Panic selling in a down market locks in losses.`,
    category: "Real Estate Tips",
    tags: ["investment", "tips", "returns", "first time", "wealth"],
    coverImage: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&auto=format",
    author: {
      name: "Alivia Properties Team",
      avatar: "/logo.svg",
      title: "Editorial Team",
    },
    readTime: 11,
    publishedAt: "2024-12-18T09:00:00Z",
    featured: true,
  },
]
