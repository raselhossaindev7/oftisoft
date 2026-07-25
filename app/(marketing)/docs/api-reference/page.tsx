"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, Reveal } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Shield, Gauge, AlertTriangle, Copy } from "lucide-react";

const sections = [
    {
        id: "authentication",
        icon: Shield,
        color: "text-purple-400",
        title: "Authentication",
        description: "All API requests require a valid API key. Include it in the Authorization header.",
        code: `curl -H "Authorization: Bearer oft_sk_live_abc123def456" \\
  https://api.oftisoft.com/v1/projects`,
        notes: [
            "API keys are scoped to specific permissions (read, write, admin)",
            "Pass keys via Authorization header as Bearer token",
            "Rotate keys from the dashboard — old keys are revoked immediately",
            "Never expose secret keys in client-side code"
        ]
    },
    {
        id: "endpoints",
        icon: Code2,
        color: "text-blue-400",
        title: "Endpoints",
        description: "Base URL: https://api.oftisoft.com/v1",
        code: `# List all projects
curl https://api.oftisoft.com/v1/projects \\
  -H "Authorization: Bearer oft_sk_live_abc123def456"

# Get a single project
curl https://api.oftisoft.com/v1/projects/{id} \\
  -H "Authorization: Bearer oft_sk_live_abc123def456"

# Create a new deployment
curl -X POST https://api.oftisoft.com/v1/deployments \\
  -H "Authorization: Bearer oft_sk_live_abc123def456" \\
  -H "Content-Type: application/json" \\
  -d '{"projectId": "proj_xyz", "branch": "main"}'`,
        notes: [
            "All endpoints return JSON responses",
            "POST/PUT/PATCH require Content-Type: application/json",
            "IDs are prefixed: proj_, dep_, key_, org_ for easy identification",
            "Pagination uses cursor-based offset via the cursor parameter"
        ]
    },
    {
        id: "rate-limiting",
        icon: Gauge,
        color: "text-green-400",
        title: "Rate Limiting",
        description: "Rate limits protect the API from abuse and ensure fair usage across all clients.",
        code: `# Rate limit headers in every response
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1684256400

# When exceeded, you'll receive 429 Too Many Requests
curl https://api.oftisoft.com/v1/projects \\
  -H "Authorization: Bearer oft_sk_live_abc123def456"
# → 429 { "error": "rate_limit_exceeded", "retryAfter": 30 }`,
        notes: [
            "Free tier: 1,000 requests/hour",
            "Pro tier: 10,000 requests/hour",
            "Enterprise: Custom limits",
            "Retry after the Retry-After header value when rate limited"
        ]
    },
    {
        id: "error-handling",
        icon: AlertTriangle,
        color: "text-red-400",
        title: "Error Handling",
        description: "The API uses conventional HTTP response codes and returns structured error objects.",
        code: `# 400 Bad Request — invalid input
{ "error": "validation_error", "message": "projectId is required", "field": "projectId" }

# 401 Unauthorized — missing or invalid API key
{ "error": "unauthorized", "message": "Invalid or expired API key" }

# 404 Not Found — resource doesn't exist
{ "error": "not_found", "message": "Project not found" }

# 500 Internal Server Error — something went wrong
{ "error": "internal_error", "message": "An unexpected error occurred" }`,
        notes: [
            "Always check the error field before parsing the message",
            "Implement exponential backoff for 429 and 5xx responses",
            "Subscribe to our status page for incident notifications",
            "Contact support if you receive persistent 500 errors"
        ]
    }
];

export default function ApiReferencePage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-purple-500/30 bg-purple-500/5 text-purple-400 font-semibold tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            API REFERENCE
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white">
                        API <span className="text-primary">Reference</span>.
                    </AnimatedH1>
                    <AnimatedDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">RESTful API for programmatic access to all Oftisoft platform features.</p>
                    </AnimatedDiv>
                </div>

                <div className="max-w-4xl mx-auto space-y-16">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <Reveal key={section.id} delay={idx * 0.1}>
                                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-primary/30 transition-all duration-700">
                                    <CardHeader className="p-10 pb-0">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center ${section.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <CardTitle className="text-3xl font-semibold tracking-tight text-white">{section.title}</CardTitle>
                                        </div>
                                        <p className="text-muted-foreground font-medium mt-2">{section.description}</p>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-6 space-y-6">
                                        <div className="relative group">
                                            <pre className="bg-black/60 border border-white/5 rounded-2xl p-6 overflow-x-auto text-sm text-green-400 font-mono leading-relaxed">
                                                <code>{section.code}</code>
                                            </pre>
                                            <button onClick={() => navigator.clipboard.writeText(section.code)} className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {section.notes.map((note, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                    <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${section.color.replace('text-', 'bg-')}`} />
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
