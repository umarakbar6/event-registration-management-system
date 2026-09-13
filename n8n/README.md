# Gatherly n8n workflow

The file `gatherlyRegistrationWorkflow.json` is an importable n8n workflow. It receives a registration event, checks the important fields, normalizes the data, and returns a clean accepted response.

Import the JSON in n8n and activate the workflow. Set the n8n environment value `GATHERLY_WEBHOOK_SECRET` when a shared secret is needed, then set the same value as `N8N_WEBHOOK_SECRET` in Gatherly. Copy the production webhook URL into `N8N_REGISTRATION_WEBHOOK_URL` in the Gatherly environment. The application sends a registration event after the database transaction succeeds. If n8n is unavailable, the registration still succeeds and the failed delivery is logged for operations review.

You can add an email, Slack, CRM, or spreadsheet node after `Validate and normalize`. Keep credentials inside n8n and never place them in the Gatherly repository.
