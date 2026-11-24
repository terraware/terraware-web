#!/bin/bash
# Most scripts start by installing system-level dependencies by running this script. Since each
# build step can potentially run on a freshly-created host, we need to make sure the necessary
# system packages are installed.

set -euo pipefail

YQ_VERSION=4.45.4

install_node() {
    local node_version
    node_version=$(<"$(dirname "${BASH_SOURCE[0]}")/../../.nvmrc")
    node_version=${node_version%%.*}
    if ! command -v node &>/dev/null || ! node --version | grep -q "^v${node_version}\."; then
        echo "Installing Node.js ${node_version}..."
        curl -fsSL "https://rpm.nodesource.com/setup_${node_version}.x" | sudo bash -
        sudo dnf install -y --allowerasing "nodejs-${node_version}.*"
        hash -r
    fi
    if ! command -v yarn &>/dev/null; then
        if ! command -v corepack &>/dev/null; then
            sudo npm install --global corepack@0.36.0
        fi
        sudo corepack enable yarn
    fi
}

install_jq() {
    if command -v jq &>/dev/null; then
        return
    fi
    echo "Installing jq..."
    sudo dnf install -y jq
}

install_yq() {
    if command -v yq &>/dev/null && yq --version 2>&1 | grep -q "${YQ_VERSION}"; then
        return
    fi
    echo "Installing yq ${YQ_VERSION}..."
    sudo curl -sL -o /usr/local/bin/yq \
        "https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_amd64"
    sudo chmod +x /usr/local/bin/yq
}

install_rsync() {
    if command -v rsync &>/dev/null; then
        return
    fi
    echo "Installing rsync..."
    sudo dnf install -y rsync
}

install_playwright_system_deps() {
    echo "Installing Playwright system dependencies..."
    # Install chromium-headless-shell system dependencies on Amazon Linux 2023
    sudo dnf install -y \
        atk \
        at-spi2-atk \
        cups-libs \
        libdrm \
        libXcomposite \
        libXdamage \
        libXfixes \
        libXrandr \
        mesa-libgbm \
        nss \
        pango \
        xorg-x11-server-Xvfb \
        alsa-lib \
        libxkbcommon \
        || true
}

echo "--- :linux: Install system packages"

for arg in "$@"; do
    case "$arg" in
        --node)             install_node ;;
        --tools)            install_jq && install_yq && install_rsync ;;
        --playwright)       install_playwright_system_deps ;;
        *)
            echo "Unknown argument: $arg"
            exit 1
            ;;
    esac
done
