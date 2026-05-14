# devopsBot Deployment Workflow for Devpod (MANDATORY GitHub CI/CD)

## IMPORTANT: NO DIRECT SSH DEPLOYMENTS — USE GITHUB CI/CD ONLY
All deployments to dev-pod MUST be done via GitHub Actions CI/CD pipeline. No direct SSH/SCP deployments allowed.

## Prerequisites
- Devpod SSH private key is available in Vault at secret/data/devpod/ssh
- Devpod is reachable at 100.70.200.116 over Tailscale

## Deployment Steps (STRICTLY FOLLOW SHARED SPACE RULES)
1. **Prepare the app files**: Ensure all app files are ready in the project directory
2. **Create a GitHub repo** for the project (if not already exists)
3. **Add GitHub CI/CD workflow**: Create .github/workflows/deploy.yml using the template from references/github-ci-cd-template.md
4. **Add GitHub Secret**: Add DEVPOD_SSH_PRIVATE_KEY (from Vault) to the repo's Settings > Secrets and variables > Actions
5. **Push the code** to the main branch — this will trigger the GitHub Actions deployment
6. **Verify the deployment**: Check GitHub Actions logs to ensure the deployment succeeded
7. **Document everything**: Add a note to memory files about the deployment

## Shared Space Rules (AGAIN, STRICTLY ENFORCED)
- ❌ NO sudo, NO system-wide installs
- ❌ NO edits to /etc, /usr, /var, or other shared directories
- ✅ Use ONLY ~/.local/bin, ~/bin, ~/.npm-global, ~/apps, ~/.config, ~/.local/share
- ✅ Use systemd user services only if needed
