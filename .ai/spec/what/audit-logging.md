# Audit Logging

Implementation spec for compliance audit logging support in the agentic console. Parent spec: `ols/.ai/spec/what/audit-logging.md` (authoritative for cross-repo requirements, event semantics, and correlation contract).

## Behavioral Rules

### No Audit Emission

1. The agentic console does NOT emit audit events. It is a presentation layer — every consequential action (approvals, denials, configuration changes) results in a Kubernetes CR mutation observed by the operator.

### Approval Field Population

2. When the user approves or denies a run stage, the console MUST submit a JSON patch to the `AgenticRunApproval` CR that adds a stage entry under `spec.stages`. Each added entry identifies its `type` and carries applicable stage payload, such as the selected execution option or optional agent override. A denied entry sets `decision: Denied`; approval is represented by the stage entry without a `decision` field. The patch does not include a retry count.

3. The console does NOT need to populate `spec.approver` identity fields (`uid`, `username`, `timestamp`) on the patch request. The mutating admission webhook in the agentic-operator injects these from the authenticated user's AdmissionReview. If the console does include them, the webhook overwrites them.

### Approver Display

4. The console MUST display `spec.approver` fields (username, timestamp) on the run detail page once an approval has been recorded. This data is populated by the webhook and available on the `AgenticRunApproval` CR after PATCH.

5. The console MUST handle the case where `spec.approver` is absent (pre-existing approvals created before the webhook was deployed) by gracefully omitting the approver display.

## Cross-References

- `run-lifecycle.md` — approval flow UI (rules 15-19)
- `configuration.md` — configuration UI (no audit changes needed)
