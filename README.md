# launch-kit-mcp

AI-powered product launch kit MCP server. Generate Product Hunt posts, landing page copy, launch email sequences, and go-to-market strategy — all natively inside Claude, Cursor, Windsurf, or any MCP-compatible AI client.

**Live on MCPize:** [mcpize.com/mcp/launch-kit-mcp](https://mcpize.com/mcp/launch-kit-mcp)

---

## Tools

| Tool | Description |
|------|-------------|
| `create_product_hunt_post` | Generate a complete Product Hunt submission — tagline, description, first comment, and hunter notes |
| `write_landing_page_copy` | Write full landing page copy: hero, features, social proof, pricing, FAQ, and CTA sections |
| `create_launch_email_sequence` | Build a pre-launch + launch day + post-launch email sequence (3-7 emails) |
| `build_gtm_strategy` | Create a go-to-market strategy with channel recommendations, timing, and launch checklist |

---

## Usage

Use via MCPize gateway (no local setup required):

```json
{
  "mcpServers": {
    "launch-kit": {
      "url": "https://launch-kit-mcp.mcpize.run/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCPIZE_API_KEY"
      }
    }
  }
}
```

Or run locally:

```bash
git clone https://github.com/tylerscomic-lab/launch-kit-mcp
cd launch-kit-mcp
npm install
GROQ_API_KEY=your_key node server.js
```

---

## Examples

**Create a Product Hunt post:**
```
create_product_hunt_post(
  product_name: "TaskFlow",
  tagline: "The AI-powered project manager for solo founders",
  key_features: "AI task prioritization, time tracking, client billing",
  target_audience: "Freelancers and indie hackers"
)
```

**Write landing page copy:**
```
write_landing_page_copy(
  product_name: "TaskFlow",
  product_description: "AI project management for solo founders",
  target_audience: "Freelancers and consultants",
  key_benefits: "Save 5 hours/week, never miss a deadline, impress clients",
  tone: "confident"
)
```

**Build GTM strategy:**
```
build_gtm_strategy(
  product_name: "TaskFlow",
  product_type: "SaaS",
  target_audience: "Freelancers",
  launch_timeline: "4 weeks",
  budget: "bootstrap"
)
```

---

## Powered by

- [Groq](https://groq.com) — Llama 3.3 70B for fast inference
- [Model Context Protocol](https://modelcontextprotocol.io) — Anthropic's open standard
- [MCPize](https://mcpize.com) — MCP server hosting and marketplace

---

## Pricing

Available on [MCPize marketplace](https://mcpize.com/mcp/launch-kit-mcp):
- **Free:** 20 requests/day
- **Pro:** $9.99/month — unlimited requests

---

## More MCP Servers

Browse the full suite: [mcpize.com](https://mcpize.com) | GitHub org: [github.com/tylerscomic-lab](https://github.com/tylerscomic-lab)
