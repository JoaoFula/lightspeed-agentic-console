# Project Structure

<<<<<<< HEAD
Package tree (authoritative for agents): see `AGENTS.md` Architecture section.
Do not maintain a duplicate path inventory here.

## Key Entry Points

| Entry point | How invoked |
|---|---|
| `lightspeed_agentic.app:app` | Uvicorn ASGI target (`uvicorn lightspeed_agentic.app:app --host 0.0.0.0 --port 8080`) |
| `config.resolve_sdk()` | Called once at startup in `app.py` before provider construction |
| `create_provider(sdk.name)` | Called once at module load in `app.py` with SDK name from `resolve_sdk()` |
| `build_router(provider, ...)` | Called once at module load in `app.py`, mounted at `/v1/agent` |
| `register_metrics_route(app)` | Registers `GET /metrics` on the FastAPI app |
| Lifespan `init_tracer` / `shutdown_tracer` | OTel TracerProvider setup/teardown in `app.py` |

## Naming Conventions

- **Package:** `lightspeed_agentic` under `src/` (hatchling src-layout).
- **Provider modules:** one file per provider in `providers/`, named after the SDK (`deepagents.py`, `gemini.py`, `openai.py`). Each exports a single `XProvider` class.
- **Route modules:** `routes/` contains `models.py` (Pydantic shapes), `query.py` (endpoint registration), `__init__.py` (router builder).
- **Observability modules:** `audit.py` (span events), `metrics.py` (`/metrics`), `tracing.py` (TracerProvider + traceparent).
- **Config / MCP:** `config.py` maps `LIGHTSPEED_*` → SDK env; `mcp.py` parses `LIGHTSPEED_MCP_SERVERS`.
- **Test layout:** `tests/` mirrors source structure. `tests/e2e/` holds BDD feature files and step definitions. `evals/` is a separate integration test suite run in containers.

## Dependency Organization

The project uses optional extras to gate provider SDKs:

| Extra | Packages |
|---|---|
| `deepagents` | `deepagents`, `langchain-anthropic`, `langchain-google-vertexai`, `langchain-aws`, `langchain-mcp-adapters` |
| `gemini` | `google-adk` |
| `openai` | `openai-agents` |
| `all` | All three provider extras |
| `dev` | All providers + test/lint tools |
| `eval` | Eval-specific test dependencies |
| `e2e` | BDD test dependencies |

Provider SDK imports are always lazy (inside methods or guarded by the factory match) so the base package imports cleanly without any extras installed.
=======
## Module Map

| File/Directory | Key Symbols | Responsibility |
|---|---|---|
| `src/models/proposal.ts` | All K8sModel definitions, GVK constants, CRD types, `derivePhaseFromConditions`, `getPhaseDisplay`, `resultOutcome` | Central type definitions and phase logic |
| `src/config.ts` | `getApiUrl` | API proxy URL construction |
| `src/utils/approval.ts` | `findStage`, `getStageStatus`, `stageNeedsApproval`, `buildApprovalPatch` | Pure functions for approval logic |
| `src/hooks/useStageApproval.ts` | `useStageApproval` | React hook wrapping approval state and K8s patch operations |
| `src/utils/markdown.ts` | — | Markdown rendering utilities |
| `src/components/proposals/ProposalListPage.tsx` | `ProposalListPage` | Proposal list with virtualized table and phase filters |
| `src/components/proposals/ProposalDetailPage.tsx` | `ProposalDetailPage`, `OverviewTab`, `ProposalTab`, `ResultTab`, `VerificationTab`, `EscalationTab` | Multi-tab proposal detail with approval flows |
| `src/components/proposals/SandboxLogViewer.tsx` | `SandboxLogViewer` | Real-time pod log streaming with reconnection |
| `src/components/proposals/EscalateModal.tsx` | `EscalateModal` | Escalation confirmation modal |
| `src/components/proposals/MarkdownText.tsx` | `MarkdownText` | Sanitized markdown-to-HTML rendering |
| `src/components/proposals/PhaseIcon.tsx` | `PhaseIcon` | Phase status icon with failure indicators |
| `src/components/proposals/DynamicComponent.tsx` | `DynamicComponent` | Component registry dispatch for adapter components |
| `src/components/proposals/dynamic/` | `ResourceDiff`, `Visualization`, `DataTable`, `ActionPicker`, `EvidenceTable`, `StatusTimeline`, `CmoComponents` | Individual dynamic component renderers |
| `src/components/configuration/ConfigurationPage.tsx` | `ConfigurationPage` | Configuration page with tabbed layout |
| `src/components/configuration/ApprovalPolicyTab.tsx` | `ApprovalPolicyTab` | Approval policy CRUD |
| `src/components/configuration/LLMProvidersTab.tsx` | `LLMProvidersTab` | LLM provider list and creation |
| `src/components/configuration/AgentsTab.tsx` | `AgentsTab` | Agent tier list and creation |
| `src/components/configuration/LLMProviderForm.tsx` | `LLMProviderForm` | Type-specific provider creation form |
| `src/components/configuration/AgentForm.tsx` | `AgentForm` | Agent creation form with provider selection |
| `console-extensions.json` | — | Plugin extension declarations (routes, nav items) |
| `webpack.config.ts` | — | Module federation and build configuration |

## Key Entry Points

The plugin has no traditional `main` entry point. Webpack's `ConsoleRemotePlugin` generates entry points from `console-extensions.json`. The three exposed modules are:

1. `ProposalListPage` → `src/components/proposals/ProposalListPage.tsx`
2. `ProposalDetailPage` → `src/components/proposals/ProposalDetailPage.tsx`
3. `ConfigurationPage` → `src/components/configuration/ConfigurationPage.tsx`

## Naming Conventions

- Components: PascalCase `.tsx` files, one primary component per file, default export.
- CSS: co-located `.css` files alongside components. All classes prefixed `ols-plugin__`.
- Models: singular `proposal.ts` contains all CRD types (not split by CRD).
- Hooks: `use` prefix, one hook per file in `src/hooks/`.
- Dynamic components: each renderer in `src/components/proposals/dynamic/`, re-exported via `index.tsx`.
>>>>>>> e3eff94 (Initialize spec structure)
