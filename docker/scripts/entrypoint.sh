#!/bin/bash
set -e

# Map ANTHROPIC_AUTH_TOKEN -> ANTHROPIC_API_KEY (what Claude Code reads)
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    export ANTHROPIC_API_KEY="$ANTHROPIC_AUTH_TOKEN"
fi

# Git identity from env vars
if [ -n "$GIT_USER_NAME" ]; then
    git config --global user.name "$GIT_USER_NAME"
fi
if [ -n "$GIT_USER_EMAIL" ]; then
    git config --global user.email "$GIT_USER_EMAIL"
fi

# Git credential helper from GIT_TOKEN
if [ -n "$GIT_TOKEN" ]; then
    git config --global credential.helper '!f() { echo "username=git"; echo "password='"$GIT_TOKEN"'"; }; f'
    echo "$GIT_TOKEN" | gh auth login --with-token
fi

# Clone repo if not already present
if [ -n "$GIT_REPO_URL" ]; then
    if [ ! -d "/workspace/repo/.git" ]; then
        echo "Cloning $GIT_REPO_URL..."
        git clone "$GIT_REPO_URL" /workspace/repo
    else
        echo "Repo already cloned, pulling latest..."
        git -C /workspace/repo pull
    fi

    cd /workspace/repo

    # Restore .NET packages if a solution or project file exists
    if find . -maxdepth 3 \( -name "*.sln" -o -name "*.csproj" \) | grep -q .; then
        echo "Restoring .NET packages..."
        dotnet restore
    fi
fi

exec "$@"
