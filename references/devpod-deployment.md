# Devpod Deployment Reference

## Devpod Details
- **Hostname/IP**: 100.70.200.116 (Tailscale)
- **User**: clawbot
- **SSH Key Path in Vault**: secret/data/devpod/ssh (keys: private_key, public_key)

## Shared Space Rules (STRICTLY ENFORCED)
- ❌ NO system-wide changes (no sudo, no edits to /etc, /usr, /var, etc.)
- ❌ NO shared resource modifications
- ✅ Use ONLY clawbot's private directories:
  - Binaries: ~/.local/bin or ~/bin
  - npm packages: ~/.npm-global (set npm prefix to ~/.npm-global)
  - Deployments: ~/apps/<app-name>
  - Config: ~/.config
  - Data: ~/.local/share
- ✅ Use systemd user services only if needed (not system-wide)

## Deployment Workflow for devopsBot
1. Fetch SSH private key from Vault at secret/data/devpod/ssh
2. Connect to devpod via SSH (clawbot@100.70.200.116) using the private key
3. Create deployment directory: ~/apps/<app-name> (mkdir -p)
4. Copy app files to ~/apps/<app-name>
5. Install any dependencies only in clawbot's private space
6. Test the deployment (ensure it works without impacting other users)
7. Document the deployment in memory files
