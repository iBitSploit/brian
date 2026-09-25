# Brian Home

> A calm operating system for building Brian: see infrastructure clearly, discover it continuously, and make it understandable to the people responsible for it.

## Current state

- Phase: MVP foundation
- Frontend: React, TypeScript, Vite, local mock data
- Backend: Flask API with JWT, SQLAlchemy, Marshmallow, migrations configuration, tests, and OpenAPI documentation
- Product documents: [[01 - Product North Star]], [[02 - Product Scope]], [[03 - User and Market]], [[04 - Requirements Map]]
- Later bets captured: customer-owned Ollama assistant and DevOps/container visibility in [[07 - Feature Plans]]
- Execution: [[05 - Roadmap]], [[06 - Backlog]], [[07 - Feature Plans]], [[08 - Quality and Operations]]

## This week

- [ ] Replace frontend mock data with a typed API client.
- [ ] Connect the first frontend view to the Flask API.
- [ ] Add a real database migration workflow.
- [ ] Add integration test coverage for the first end-to-end device flow.

## Key links

- [[02 - Product Scope]]
- [[05 - Roadmap]]
- [[06 - Backlog]]
- [[07 - Feature Plans]]
- [[09 - Decisions]]
- [[10 - Risks and Open Questions]]
- [[11 - Project Journal]]

## Project boundaries

Brian is an infrastructure visibility and topology platform. It is not a packet capture product, a vulnerability scanner, a full network management system, a hosted LLM, a CI/CD platform, or a replacement for NetBox. Its job is to unify context and make relationships operationally legible.

Inbox: [[Human Input]]
