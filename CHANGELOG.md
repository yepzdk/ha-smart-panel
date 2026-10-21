# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Smart Panels sidebar page: a Setup tab with the Wi-Fi settings, the provisioning QR code and an enrolment guide, and a Manage tab to send commands to each panel.
- Panels as devices with entities for the screen, brightness, maintenance mode, reload, restart and app updates, plus `smart_panel.navigate` and `smart_panel.factory_reset` actions.
- Live panel status (online, versions, screen, brightness, maintenance mode) reported by the panel app.
