"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe, Zap, Users, ArrowUpRight, ArrowRight, Code2,
} from "lucide-react";
import CountUp from "react-countup";
import FounderIntro from "@/components/sections/about/founder-intro";
import MissionValues from "@/components/sections/about/mission-values";
import CompanyTimeline from "@/components/sections/about/company-timeline";
import OfficeCulture from "@/components/sections/about/office-culture";
import Awards from "@/components/sections/about/awards";
import TeamShowcase from "@/components/sections/about/team-showcase";
import CapabilityEngine from "@/components/sections/about/capability-engine";
import { useMousePosition } from "@/hooks/useMousePosition";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = { Globe, Users, Zap, ShieldCheck: Globe };

const pageData = {
  hero: {
    badge: "SINCE 2019", title: "We Are Oftisoft", highlightedWord: "Innovation",
    description: "A team of passionate engineers, designers, and strategists dedicated to building world-class digital products. Headquartered in Bangladesh, serving clients globally.",
    ctaText: "Start Your Project", cardTitle: "From Satkhira, For the World",
    cardDescription: "Rasel bootstrapped Oftisoft in 2019 from a small town in Bangladesh with nothing but a laptop and a stubborn belief that world-class software could be built from anywhere. 500+ projects and 25+ teammates later — we're still proving that point, one line of code at a time."
  },
  stats: [
    { id: "projects", icon: "Zap", value: "500+", label: "Projects Delivered" },
    { id: "clients", icon: "Globe", value: "30+", label: "Happy Clients" },
    { id: "team", icon: "Users", value: "25+", label: "Expert Engineers" },
  ],
  founder: {
    name: "Rasel Hossain", role: "Founder & CEO", tagline: "Building world-class software from Bangladesh",
    image: "/images/2.png",
    socials: { github: "https://github.com/oftisoft", linkedin: "https://linkedin.com/company/oftisoft", twitter: "https://twitter.com/oftisoft" },
    badgeTitle: "Meet the Founder", titleLine1: "Built by a Developer,", titleLine2: "for Developers.",
    bioPar1: "Rasel has been building software since 2015. He founded Oftisoft in 2019 with a vision to create a world-class software engineering firm from Bangladesh. Under his leadership, Oftisoft has grown from a solo consultancy to a 25+ person engineering powerhouse serving clients across 4 continents.",
    bioPar2: "His philosophy is simple: great software comes from great teams, transparent processes, and a relentless focus on quality. Every project at Oftisoft is treated as a partnership, not a transaction.",
    stats: [{ num: 10, suffix: "+", label: "Years Building" }, { num: 500, suffix: "+", label: "Projects Led" }, { num: 25, suffix: "+", label: "Team Built" }]
  },
  mission: {
    badge: "OUR MISSION", titleLine1: "Democratizing", titleLine2: "World-Class Engineering",
    quote: "We believe exceptional software should be accessible to every business, regardless of size or location. Oftisoft combines deep technical expertise with transparent, collaborative partnerships to deliver enterprise-grade solutions.",
    quoteHighlight: "exceptional software should be accessible to every business",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
  },
  values: [
    { id: "quality", icon: "Zap", title: "Quality Obsession", description: "Every line of code is reviewed, tested, and optimized. We don't ship mediocre work.", color: "from-blue-500 to-cyan-500" },
    { id: "transparency", icon: "Globe", title: "Radical Transparency", description: "Daily updates, live dashboards, and open communication. You always know where your project stands.", color: "from-purple-500 to-pink-500" },
    { id: "growth", icon: "Users", title: "Continuous Growth", description: "We invest 20% of our time in learning. New technologies, better processes, constant improvement.", color: "from-green-500 to-teal-500" },
    { id: "partnership", icon: "Handshake", title: "Client Partnership", description: "We work as an extension of your team, not a vendor. Shared goals, shared risks, and shared success.", color: "from-red-500 to-rose-500" },
  ],
  timeline: {
    timelineBadge: "MILESTONES",
    timelineTitle: "Our Journey",
    timelineTitleHighlight: "So Far",
    timeline: [
      { id: "t1", year: "2019", title: "Founded", desc: "Rasel started Oftisoft as a solo development consultancy in Satkhira, Bangladesh.", icon: "Rocket", gradient: "from-blue-500 to-cyan-500" },
      { id: "t2", year: "2020", title: "First Team", desc: "Grew to 5 engineers and delivered first enterprise client project — a fintech platform.", icon: "Users", gradient: "from-purple-500 to-pink-500" },
      { id: "t3", year: "2021", title: "Global Reach", desc: "Started working with international clients from US, UK, and Australia.", icon: "Globe", gradient: "from-green-500 to-teal-500" },
      { id: "t4", year: "2022", title: "AI Division", desc: "Launched dedicated AI/ML practice. Built first AI-powered analytics platform.", icon: "Cpu", gradient: "from-orange-500 to-red-500" },
      { id: "t5", year: "2023", title: "20+ Team", desc: "Expanded to 20+ engineers. Moved to larger office in Khulna.", icon: "Users", gradient: "from-indigo-500 to-violet-500" },
      { id: "t6", year: "2024", title: "Product Launch", desc: "Launched first SaaS product. Reached $1M ARR milestone.", icon: "Rocket", gradient: "from-amber-400 to-orange-500" },
      { id: "t7", year: "2025", title: "Scale & Impact", desc: "500+ projects delivered. 25+ team members. Serving 4 continents.", icon: "Globe", gradient: "from-cyan-400 to-blue-500" },
    ]
  },
  culture: {
    badge: "OUR CULTURE",
    titleLine1: "Where Innovation",
    titleLine2: "Meets Craftsmanship",
    items: [
      { id: "c1", icon: "Cpu", title: "Innovation Lab", size: "md:col-span-2 md:row-span-1", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", type: "image", location: "Khulna, Bangladesh", description: "Dedicated R&D time for exploring new technologies and building internal tools." },
      { id: "c2", icon: "Users", title: "Collaborative Space", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80", type: "image", location: "Satkhira, Bangladesh", description: "Open floor plan, pair programming culture, and weekly knowledge-sharing sessions." },
      { id: "c3", icon: "Globe", title: "Remote-First", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80", type: "image", location: "Remote Global", description: "Flexible remote work policy with team members across Bangladesh and beyond." },
      { id: "c4", icon: "BookOpen", title: "Learning Hub", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", type: "image", location: "Khulna, Bangladesh", description: "Weekly tech talks, hackathons, and dedicated learning hours keep our team at the cutting edge." },
      { id: "c5", icon: "Code2", title: "Tech Studio", size: "md:col-span-2 md:row-span-1", thumb: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80", type: "image", location: "Dhaka, Bangladesh", description: "State-of-the-art development studio with dual monitors, ergonomic setups, and high-speed infrastructure." },
      { id: "c6", icon: "Heart", title: "Team Events", size: "md:col-span-1 md:row-span-1", thumb: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", type: "image", location: "Cox's Bazar, Bangladesh", description: "From Friday team lunches to annual retreats, we celebrate wins together and build bonds that last." },
    ]
  },
  awards: [
    { id: "a1", title: "Top Software Company", org: "Clutch", year: "2024", description: "Recognized as a top performing software development company in Bangladesh. Ranked in the top 5% of B2B service providers globally.", image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80", gradient: "from-amber-400 to-orange-500" },
    { id: "a2", title: "Best Startup", org: "Basis", year: "2023", description: "Awarded Best Tech Startup at the Bangladesh Innovation Summit for groundbreaking work in fintech and AI solutions.", image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80", gradient: "from-purple-500 to-pink-500" },
    { id: "a3", title: "Google Cloud Partner", org: "Google", year: "2024", description: "Certified Google Cloud Partner for infrastructure, data services, and machine learning pipeline deployments.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", gradient: "from-cyan-400 to-blue-500" },
    { id: "a4", title: "ISO 27001 Certified", org: "BSI Group", year: "2025", description: "Achieved ISO 27001:2022 certification for information security management, ensuring enterprise-grade data protection for all client projects.", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80", gradient: "from-emerald-400 to-teal-500" },
  ],
  awardsContent: {
    awardsBadge: "RECOGNITION", awardsTitle: "Awards &", awardsTitleHighlight: "Partnerships",
    awardsDescription: "We are proud to be recognized by industry leaders and trusted by global technology partners."
  },
  team: {
    badge: "OUR TEAM",
    titleLine1: "The People Behind",
    titleLine2: "the Code",
    members: [
      { id: "m1", name: "Rasel Hossain", role: "Founder & CEO", image: "/images/2.png", bio: "Visionary leader with 10+ years in software engineering.", category: "Leadership", gradient: "from-blue-500 to-cyan-500", socials: { github: "https://github.com/oftisoft", linkedin: "https://linkedin.com/company/oftisoft", twitter: "https://twitter.com/oftisoft" } },
      { id: "m2", name: "Sarah Rahman", role: "CTO", image: "", bio: "Full-stack architect specializing in distributed systems.", category: "Leadership", gradient: "from-purple-500 to-pink-500", socials: { github: "#", linkedin: "#", twitter: "#" } },
      { id: "m3", name: "Kabir Ahmed", role: "Lead Engineer", image: "", bio: "Expert in React, Node.js, and cloud infrastructure.", category: "Development", gradient: "from-green-500 to-teal-500", socials: { github: "#", linkedin: "#", twitter: "#" } },
    ]
  },
  cta: { title: "Ready to Build Something Great?", description: "Let's talk about your project. Free 15-minute discovery call.", buttonText: "Start Conversation" }
};

export default function AboutPage() {
  const mousePos = useMousePosition();
  const { hero, stats, founder, mission, values, timeline, culture, awards, awardsContent, team, cta } = pageData;

  return (
    <div className="relative min-h-screen pt-24 pb-24 bg-[#020202]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnimatedDiv
          animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
          transition={{ type: "spring", damping: 50, stiffness: 200 }}
          className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/20 rounded-full blur-[150px] opacity-20"
        />
        <div className="absolute top-[20%] left-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[160px] opacity-30" />
        <div className="absolute inset-0 bg-neutral-900/5 opacity-50" />
        <div className="absolute inset-0 bg-grain opacity-20 brightness-50 pointer-events-none" />
      </div>
      <div className=" container px-6 mx-auto ">
        {" "}
        <FounderIntro data={founder} />
      </div>{" "}
      <div className="relative overflow-hidden py-5 border-y border-white/[0.03] bg-white/[0.01]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-30" />
        <div className="animate-marquee flex gap-6 items-center w-max">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-6 items-center shrink-0">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/[0.06] border border-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 animate-ping opacity-75" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-green-400 tracking-widest uppercase">
                  Oftisoft Active
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-white/70 tracking-wide">
                  Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-white/70 tracking-wide">
                  6+ Years
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-medium text-white/70 tracking-wide">
                  Web · Mobile · AI
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/[0.05] border border-primary/20">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  25+ Engineers
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container px-6 mx-auto relative z-10 space-y-32 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="px-6 py-2.5 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold text-sm tracking-wide"
              >
                {hero?.badge ?? ""}
              </Badge>
            </AnimatedDiv>

            <AnimatedH1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-6"
            >
              {hero?.title ?? ""} <br />
              <span className="text-primary relative inline-block">
                {hero?.highlightedWord ?? ""}
                <AnimatedDiv
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute -bottom-2 left-0 h-4 bg-primary/20 -z-10"
                />
              </span>
              .
            </AnimatedH1>

            <AnimatedP
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground font-normal leading-relaxed max-w-xl"
            >
              {hero?.description ?? ""}
            </AnimatedP>

            <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-xl shadow-primary/20 group">
                {hero?.ctaText ?? ""}{" "}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </AnimatedDiv>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 blur-[100px] rounded-full opacity-60" />
            <AnimatedDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <Card className="relative border-white/[0.08] bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/[0.04] group-hover:ring-primary/20 transition-all duration-500">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="p-8 md:p-10 space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[
                        { initials: "RH", from: "from-blue-500/60", to: "to-cyan-500/60" },
                        { initials: "SR", from: "from-purple-500/60", to: "to-pink-500/60" },
                        { initials: "KA", from: "from-green-500/60", to: "to-teal-500/60" },
                        { initials: "NJ", from: "from-orange-500/60", to: "to-red-500/60" },
                      ].map((avatar, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full border-2 border-[#050505] bg-gradient-to-br ${avatar.from} ${avatar.to} flex items-center justify-center text-xs font-bold text-white`}
                        >
                          {avatar.initials}
                        </div>
                      ))}
                    </div>
                    <div className="h-8 w-px bg-white/[0.06]" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white/40 tracking-[0.15em] uppercase">The Team</p>
                      <p className="text-sm font-medium text-white/70">25+ Engineers & Designers</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
<span className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none">500+</span>
                          <span className="text-base font-medium text-primary/70">projects shipped</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      {[
                        { dot: "bg-green-500", label: "4 Continents" },
                        { dot: "bg-blue-500", label: "30+ Clients" },
                        { dot: "bg-amber-500", label: "Since 2019" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                          <span className="text-sm text-white/50">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end gap-2.5 h-20">
                    {[
                      { label: "19", h: 20 },
                      { label: "20", h: 35 },
                      { label: "21", h: 45 },
                      { label: "22", h: 58 },
                      { label: "23", h: 72 },
                      { label: "24", h: 88 },
                      { label: "25", h: 100 },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <AnimatedDiv
                          initial={{ height: 0 }}
                          whileInView={{ height: `${bar.h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary/70 to-primary/20 min-h-[4px]"
                        />
                        <span className="text-xs text-white/25 font-medium tracking-wide">{bar.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/[0.04]">
                    <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      {hero?.cardTitle ?? ""}
                    </h4>
                    <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                      {hero?.cardDescription ?? ""}
                    </p>
                  </div>
                </div>
              </Card>
            </AnimatedDiv>
          </div>
        </div>

        <CapabilityEngine />

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat: any, idx: number) => {
            const Icon = iconMap[stat.icon] || Zap;
            const valueNum = parseInt(stat.value);
            const suffix = stat.value.replace(/[0-9]/g, "");
            return (
              <AnimatedDiv
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <Card className="border-white/5 bg-white/[0.01] rounded-[24px] sm:rounded-[40px] p-8 sm:p-12 text-center space-y-4 hover:border-primary/30 transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                    <Icon size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white font-mono">
                      {isNaN(valueNum) ? (
                        stat.value
                      ) : (
                        <>
                          <CountUp
                            end={valueNum}
                            duration={2.5}
                            enableScrollSpy
                            scrollSpyOnce
                          />
                          {suffix}
                        </>
                      )}
                    </span>
                    <p className="text-sm font-semibold tracking-wide text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              </AnimatedDiv>
            );
          })}
        </div>

        <MissionValues data={{ mission, values }} />
        <CompanyTimeline data={{ ...timeline }} />
        <OfficeCulture data={culture} />
        <Awards data={{ ...awardsContent, awards }} />
        <TeamShowcase data={team} />

        <div className="p-8 sm:p-12 md:p-20 rounded-[32px] sm:rounded-[60px] bg-primary/[0.03] border-2 border-primary/10 text-center space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-1000" />
          <AnimatedH3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight text-white relative z-10"
          >
            {cta?.title ?? ""}
          </AnimatedH3>
          <AnimatedP
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground font-normal max-w-2xl mx-auto relative z-10"
          >
            {cta?.description ?? ""}
          </AnimatedP>
          <AnimatedDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              className="h-14 px-10 rounded-2xl border-2 border-primary/30 bg-background text-primary font-semibold text-base shadow-lg hover:bg-primary hover:text-white transition-all relative z-10"
            >
              {cta?.buttonText ?? ""} <ArrowUpRight className="w-5 h-5 ml-3" />
            </Button>
          </AnimatedDiv>
        </div>
      </div>
    </div>
  );

}
