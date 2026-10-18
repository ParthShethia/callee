# callee - throwaway review-gate + pin-bypass lab (OSS VRP Angular finding #5 validation)

Throwaway PUBLIC repository for an authorized Google Bug Hunters OSS VRP lab reproduction
(finding #5: merge approvals not bound to head + unpinned secondary checkout in the
reusable release workflow).

- `.github/workflows/reusable.yml` - dev-infra-pattern reusable workflow: extracts the ref after
  `@` from `github.workflow_ref`, then `actions/checkout`s THIS repo at that ref and executes the
  local `payload/` action with a caller-supplied secret. The caller pins the workflow FILE; the
  executed action content resolves from this repo's mutable `main`.
- `payload/` - local action. v1 = innocuous noop; the `push-b` workflow rewrites it to v2, which
  prints base64 of the dummy sentinel and writes `evidence.txt` for the run artifact.
- `.github/workflows/post-approval.yml` - deployment of the real dev-infra `post-approval-changes`
  action (shipped bundle @ c09a8058). Lab adaptations in main.js are limited to the repo-owner guard
  and org name (`angular`/`googlers` -> `parthtests`) plus the installation-token call sites;
  all decision logic (actor skip, pending-reviewer skip, review filter, changes-requested latch,
  re-request) is verbatim.
- `.github/workflows/open-pr.yml` - opens the landing PR authored by `github-actions[bot]`.
- `.github/workflows/push-b.yml` - bot force-pushes payload v2 onto the PR head branch.

No real secrets anywhere. The only secret-like string is a dummy sentinel (`WST-ORG-...`).
No Google/Angular infrastructure is contacted. Not affiliated with Angular or Google.