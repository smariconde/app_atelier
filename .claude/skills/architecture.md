# /architecture skill

**Trigger**: `/architecture [question]`

**Description**: Knowledge-only Q&A about the AppAtelier codebase architecture. Delegates to the `architecture` sub-agent.

---

## Behavior

1. If the user provided a question after `/architecture`, pass it directly to the agent.
   If not, ask: "What would you like to know about the AppAtelier architecture?"

2. Invoke the `architecture` agent with the question and this context:
   > "Answer this architecture question about the AppAtelier codebase. Read only — do not write or modify any files."

3. Show the agent's full response.

---

## Examples

- "How does subdomain routing work?"
- "Where do I add a new app?"
- "Why does every table need a prefix?"
- "How is auth wired up?"
- "What's the difference between `app/apps/` and `apps/`?"

---

## Constraints

- The `architecture` agent is read-only — it never writes or modifies code
- Do not make architectural recommendations that would change the codebase without user approval
