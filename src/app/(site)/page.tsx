export const dynamic = "force-dynamic"

import { getProjects }   from "@/services/projects.service"
import { getProperties } from "@/services/properties.service"
import { DUMMY_BLOG_POSTS } from "@/data/dummy-blog-posts"
import { HeroSection }              from "@/pages-sections/home/hero-section"
import { FeaturedProjectsSection }  from "@/pages-sections/home/featured-projects-section"
import { FeaturedPropertiesSection } from "@/pages-sections/home/featured-properties-section"
import { StatsSection }             from "@/pages-sections/home/stats-section"
import { WhyUsSection }             from "@/pages-sections/home/why-us-section"
import { ExperienceSection }        from "@/pages-sections/home/experience-section"
import { LocationSpotlightSection } from "@/pages-sections/home/location-spotlight-section"
import { FounderNoteSection }       from "@/pages-sections/home/founder-note-section"
import { TestimonialsSection }      from "@/pages-sections/home/testimonials-section"
import { ConsultationCtaSection }   from "@/pages-sections/home/consultation-cta-section"
import { BlogPreviewSection }       from "@/pages-sections/home/blog-preview-section"
import { ContactCtaSection }        from "@/pages-sections/home/contact-cta-section"

export default async function HomePage() {
  const [projectsRes, propertiesRes] = await Promise.all([
    getProjects({ limit: 6 }),
    getProperties({ limit: 6, status: "featured" }),
  ])

  return (
    <>
      <HeroSection />
      <StatsSection />
      <WhyUsSection />
      <FeaturedProjectsSection  projects={projectsRes.data} />
      <LocationSpotlightSection />
      <FeaturedPropertiesSection properties={propertiesRes.data} />
      <ExperienceSection />
      <TestimonialsSection />
      <FounderNoteSection />
      <ConsultationCtaSection />
      <BlogPreviewSection posts={DUMMY_BLOG_POSTS} />
      <ContactCtaSection />
    </>
  )
}
