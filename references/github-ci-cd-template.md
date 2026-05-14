# GitHub CI/CD Pipeline Template for Devpod Deployment

## Overview
All projects MUST use this GitHub Actions workflow for deploying to dev-pod. No direct SSH deployments allowed.

## Workflow File: .github/workflows/deploy.yml
```yaml
name: Deploy to Devpod

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install SSH key
        uses: shimataro/ssh-key-action@v2
        with:
          key: ${{ secrets.DEVPOD_SSH_PRIVATE_KEY }}
          known_hosts: unnecessary

      - name: Deploy to Devpod
        run: |
          # Create deployment directory on devpod
          ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null clawbot@100.70.200.116 "mkdir -p ~/apps/${{ github.event.repository.name }}"
          
          # Copy files to devpod
          scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ./* clawbot@100.70.200.116:~/apps/${{ github.event.repository.name }}/
```

## GitHub Secrets Required
- `DEVPOD_SSH_PRIVATE_KEY`: Private SSH key for devpod (from Vault: secret/data/devpod/ssh)

## Steps to Set Up for a New Project
1. Create a GitHub repo for the project
2. Add the `DEVPOD_SSH_PRIVATE_KEY` secret to the repo's Settings > Secrets and variables > Actions
3. Add the `.github/workflows/deploy.yml` file to the project
4. Push the code to the `main` branch — this will trigger the deployment
