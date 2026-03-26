## **Lean Production Checklist for a Language App**

#1. Product scope and system boundaries
app purpose clearly defined
target users clearly defined
supported platforms defined, web, Android, iOS
supported browsers and OS versions listed
core features clearly separated from future ideas
user journeys documented
what the system does not do documented
external services listed, such as auth, email, payments, analytics, storage, speech APIs
ownership defined for product, backend, frontend, infrastructure, content, security
#2. Functional requirements
learning flows defined
vocabulary flow defined
grammar flow defined
sentence practice flow defined
exam practice flow defined
registration and login flow defined
password reset flow defined
subscription or payment flow defined, if applicable
progress tracking rules defined
scoring rules defined
audio recording and playback rules defined
content publishing workflow defined
admin workflow defined, if admin panel exists
error states defined for all important flows
empty states defined
offline behavior defined, if any offline support exists
#3. Non-functional requirements
acceptable app startup time defined
acceptable page/screen load time defined
acceptable API response times defined
uptime target defined
storage growth expectations defined
expected user concurrency estimated
acceptable failure behavior defined
acceptable recovery time for outages defined
acceptable data loss tolerance defined
supported localization/internationalization scope defined
# 4. Architecture and separation of concerns
frontend, backend, database, storage, and content pipeline clearly separated
UI code separated from business logic
business logic separated from persistence logic
API layer separated from internal service logic
content generation pipeline separated from runtime delivery pipeline
auth logic centralized
permission logic centralized
scoring logic centralized
configuration separated from code
reusable shared types or schemas defined where needed
architecture diagram maintained
data flow diagram maintained
trust boundaries identified
external integrations isolated behind clear adapters or service modules
# 5. Contracts and schema discipline
request and response schemas defined
input validation enforced at API boundaries
shared models versioned
database schema versioned
migration files tracked in version control
content schema clearly defined
canonical data model defined
no silent fallback when required fields are missing
enum values controlled
optional vs required fields explicitly defined
backward compatibility policy defined for APIs and stored content
content import/export formats defined if used
file upload validation defined
# 6. Codebase structure and cleanliness
repository structure consistent
folders have clear responsibilities
naming conventions consistent
modules small enough to reason about
low duplication across the codebase
no copy-paste business logic spread across screens
no business-critical logic hidden in UI components
no direct database logic in presentation code
helper utilities not turned into random dumping grounds
dead code removed regularly
commented-out code not kept long term
TODOs tracked properly, not buried in code
comments explain why, not obvious what
linting enforced
formatting enforced
type checking enforced where language supports it
complexity kept under control
# 7. Version control and team discipline
git used properly
main branch protected
pull requests required
code reviews required
commit messages meaningful
no direct edits in production
feature branches used
hotfix process defined
release tags used
important releases documented
rollback to earlier versions possible from version history
# 8. Authentication and user identity
secure user registration
secure login
secure password hashing
password reset flow secured
session expiration policy defined
refresh token policy defined if used
logout clears auth state correctly
account deletion flow defined
duplicate account edge cases handled
email verification defined if needed
admin accounts separated from normal user accounts
auth failures handled safely
rate limits for login and reset endpoints
brute-force protection considered
# 9. Authorization and access control
role definitions clear
user permissions defined
admin permissions defined
content management permissions defined
premium vs free access rules defined
server-side authorization enforced
UI restrictions not treated as security
user can access only their own progress, recordings, subscriptions, and private data
admin actions audited if applicable
# 10. Input validation and output safety
all user input validated server-side
all forms validated client-side for usability, but server remains source of truth
string length limits enforced
accepted file formats restricted
file size limits enforced
audio upload validation enforced
URL validation applied where needed
malformed payloads rejected cleanly
safe output encoding used
injection protections in place
dangerous HTML or script input sanitized or blocked where relevant
# 11. Secrets and sensitive configuration
API keys never stored in frontend code unless explicitly public
secrets never hardcoded in repository
secrets stored in environment variables or secret manager
production secrets separated from development secrets
secret rotation possible
service credentials scoped minimally
no secrets logged
no secrets exposed in crash dumps or screenshots
# 12. Dependency and package management
dependencies pinned sensibly
dependency updates reviewed
unused dependencies removed
security scanning for dependencies enabled
package lockfiles committed
dependency sprawl controlled
libraries chosen for stability, not only popularity
abandoned libraries avoided
transitive dependency risk monitored where possible
# 13. Database and storage design
database choice justified
data models normalized enough to avoid chaos
indexes defined for key queries
foreign key or referential integrity strategy defined
migration workflow defined
destructive migrations handled carefully
soft delete vs hard delete policy defined
large media stored outside main relational database if appropriate
storage paths and metadata handled consistently
orphaned file cleanup strategy defined
retention policy for recordings defined
backup strategy defined
restore tested
# 14. Content management and learning data integrity
vocabulary content has defined schema
grammar content has defined schema
sentence content has defined schema
exam tasks have defined schema
content difficulty tagging rules defined
content review process defined
duplicate content detection considered
bad or broken content can be unpublished quickly
content versioning strategy defined
content provenance known
generated content validated before release if AI-assisted generation is used
manual review process defined for high-stakes content
scoring keys and expected answers versioned
content release does not break user progress
# 15. Audio, speech, and media handling
supported audio formats defined
max recording duration defined
microphone permission handling correct
upload retry behavior defined
incomplete uploads handled safely
transcoding pipeline defined if needed
media storage lifecycle defined
playback compatibility tested
browser/mobile microphone edge cases tested
network interruption behavior handled
media corruption cases handled
privacy controls around recordings defined
deletion of recordings supported where required
# 16. Privacy and data protection
personal data inventory maintained
only needed personal data collected
purpose of each data category known
retention policy defined
user can access their own data where required
user can request deletion where required
lawful basis for processing considered
consent flows handled correctly where consent is used
analytics reviewed for data exposure
third-party processors identified
privacy policy matches actual behavior
children’s data implications considered if relevant
recordings treated as potentially sensitive personal data
logs reviewed to avoid storing unnecessary personal data
# 17. Security basics
HTTPS enforced
secure headers configured where relevant
CORS configured correctly
CSRF protection used where applicable
rate limiting used on sensitive endpoints
upload endpoints protected
admin endpoints protected
ID enumeration risk considered
direct object reference issues prevented
server errors do not leak internals
account takeover paths reviewed
dependency vulnerability scanning enabled
basic threat modeling done for auth, uploads, payments, admin, and recordings
abuse cases considered, spam, scraping, fake accounts, content abuse
# 18. Payments and subscriptions, if applicable
payment provider chosen carefully
payment secrets secured
webhook verification enforced
subscription state source of truth defined
failed payment handling defined
cancellation flow defined
refund logic defined
entitlement updates idempotent
no trust placed in client for premium access
invoice or receipt flow defined if needed
billing edge cases tested
trial period logic tested if used
# 19. Error handling and resilience
expected error types defined
user-facing error messages understandable
internal errors logged with context
validation errors returned consistently
network timeouts handled
retry logic used only where safe
duplicate submission prevention used where needed
idempotency considered for critical actions
background task failures monitored
partial failure behavior defined
system fails safely, not unpredictably
no blank white screens on common failures
fallback UI states defined
maintenance mode possible if needed
# 20. Testing strategy
unit tests for core logic
integration tests for important flows
API tests for contracts
end-to-end tests for critical user journeys
auth flow tested
payment flow tested if applicable
migration tests performed
content validation tests implemented
upload and media tests implemented
error scenarios tested
permission scenarios tested
regression tests for bugs that were fixed
smoke tests for deployment
test data strategy defined
flaky tests minimized
CI test runs reliable
# 21. Performance and scalability
app startup performance checked
slow queries identified
API latency measured
image and media optimization applied
bundle size monitored
large lists paginated or virtualized where needed
caching strategy defined
CDN usage considered for static assets
background jobs used where appropriate
concurrency assumptions tested
load testing done at least lightly for critical endpoints
performance regressions monitored
# 22. Observability and operations
structured logging used
request IDs or trace IDs used where possible
metrics collected for key endpoints
error monitoring enabled
uptime monitoring enabled
health check endpoints provided
dashboards for app health available
logs searchable
important business events tracked, login success, lesson start, submission success, payment success
alerting set for major failures
deployment status visible
operational runbook exists for common failures
# 23. CI/CD and release discipline
build process automated
test pipeline automated
lint/type checks in pipeline
preview/staging environment available
production deployment process documented
deployment approvals defined if needed
migrations included safely in release process
smoke tests run after deployment
canary or staged rollout considered
rollback procedure documented
release notes maintained
feature flags used where helpful
no manual undocumented production steps
# 24. Environment management
separate dev, staging, and production environments
environment variables documented
environment defaults safe
configuration drift minimized
local development setup reproducible
seed/test data setup defined
production-only behavior not hidden or mysterious
third-party service sandbox/test modes used correctly
# 25. Documentation
README maintained
local setup steps documented
architecture overview documented
API documentation maintained
environment configuration documented
deployment process documented
rollback process documented
content pipeline documented
admin workflow documented
troubleshooting notes maintained
onboarding notes maintained
known limitations documented
important decisions recorded
# 26. Accessibility and usability
keyboard navigation works
color contrast acceptable
text readable
screen reader basics supported
buttons and inputs labeled
focus states visible
error messages visible and understandable
forms usable on mobile
audio controls accessible
tap targets large enough on mobile
core flows tested by real users if possible
onboarding understandable
progress feedback visible
loading states shown clearly
# 27. Mobile and cross-platform reliability
app tested on different screen sizes
Android and iOS differences checked
browser differences checked for web
network loss handling checked
background/resume behavior checked
local storage behavior checked
session persistence checked
permission prompts handled properly
audio recording tested on real devices
file upload tested on real devices
app update flow checked so old clients fail gracefully if backend changes
# 28. Analytics and product feedback
analytics events chosen intentionally
no excessive tracking
privacy reviewed for analytics tools
event names consistent
key conversion funnels tracked
lesson completion tracked
failure events tracked
churn or drop-off points visible
user feedback channel exists
crash reports reviewed regularly
analytics do not expose secrets or sensitive data
# 29. Admin and internal tooling
admin interface access restricted
admin actions logged
admin forms validated
dangerous admin actions require confirmation
bulk content operations safe
publish/unpublish controls available
user support actions controlled
internal tools separated from public app
auditability for sensitive admin actions maintained
# 30. Backup, recovery, and business continuity
database backups automated
backup retention defined
restore procedure documented
restore tested
media backup strategy defined if needed
recovery priorities defined
outage communication plan considered
accidental deletion recovery plan defined
core service dependencies known
# 31. Long-term maintainability
small changes do not require touching unrelated modules
APIs evolve in controlled way
migrations do not trap the system
deprecated code removed in planned way
architecture reviewed periodically
technical debt tracked
“temporary” shortcuts reviewed later
team knowledge not locked in one person’s head
domain concepts named consistently
business rules documented
core flows protected by tests
hidden state minimized
manual operations reduced over time
# 32. AI-assisted content or AI-assisted features, if you use them
AI-generated content reviewed before release for important learning material
prompts versioned where important
generated outputs validated against schema
hallucinated or invalid content filtered
user-facing AI output clearly bounded
fallback behavior defined when AI service fails
cost controls defined
abuse controls defined
moderation considered if user-generated text is involved
no sensitive user data sent to AI services without review
provider outages handled gracefully
# 33. Minimum release gate before production
app installs and starts correctly
registration/login works
password reset works
lesson start and completion work
progress saving works
payments work, if applicable
audio record/upload/playback works, if applicable
content loads correctly
errors handled acceptably
tests pass
migrations safe
monitoring active
rollback possible
backups current
no known critical vulnerabilities
privacy policy and terms match actual product behavior
Priority levels for your app
Absolutely required before real public release
clear architecture
auth and authorization
input validation
secrets management
migrations and backups
CI/CD basics
logging and error monitoring
core tests
documentation for setup and deployment
privacy basics
mobile/web flow testing
release and rollback process
Strongly recommended as soon as users grow
threat modeling
rate limiting
dependency scanning
performance monitoring
dashboards and alerts
staged rollouts
stronger content validation workflow
admin audit logs
load testing
feature flags
Add when product complexity increases
advanced tracing
stronger disaster recovery setup
fuller audit trails
more formal security review cycles
deeper compliance processes
stronger entitlement/billing reconciliation
automated content quality scoring
more advanced anti-abuse controls
