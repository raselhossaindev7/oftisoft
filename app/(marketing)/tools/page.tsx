import { AnimatedDiv, AnimatedH1, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import AffiliateTools from "@/components/affiliate-tools";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[160px] opacity-30 pointer-events-none" />
      <div className="container px-6 mx-auto relative z-10 space-y-20">

        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <AnimatedDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="px-5 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold text-xs tracking-wide">
              RECOMMENDED TOOLS
            </Badge>
          </AnimatedDiv>
          <AnimatedH1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Tools We <span className="text-primary">Recommend</span>
          </AnimatedH1>
          <AnimatedP initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto">
            The software, platforms, and services we use daily — and trust enough to recommend.
          </AnimatedP>
        </div>

        <div className="space-y-16">
          <section>
            <h3 className="text-sm font-bold text-white/40 tracking-widest uppercase mb-6">Hosting & Cloud</h3>
            <AffiliateTools category="hosting" />
          </section>
          <section>
            <h3 className="text-sm font-bold text-white/40 tracking-widest uppercase mb-6">Developer Tools</h3>
            <AffiliateTools category="tools" />
          </section>
          <section>
            <h3 className="text-sm font-bold text-white/40 tracking-widest uppercase mb-6">Design & Templates</h3>
            <AffiliateTools category="design" />
          </section>
        </div>
      </div>
    </div>
  );
}
