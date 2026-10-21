# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-10-21

### Changed

- While a panel is offline its screen, brightness, maintenance mode, automatic brightness, Home Assistant app version and panel app entities are unavailable; Connectivity, Last seen and the buttons stay available.
- The Offline badge on the Manage tab shows the time of the panel's last report on hover.

### Fixed

- Panels no longer show as offline after a Home Assistant restart; the last status report and its time are kept.

## [0.1.0] - 2026-10-21

### Added

- Smart Panels sidebar page: a Setup tab with the Wi-Fi settings, the provisioning QR code and an enrolment guide, and a Manage tab to send commands to each panel.
- Panels as devices with entities for the screen, brightness, maintenance mode, reload, restart and app updates, plus `smart_panel.navigate` and `smart_panel.factory_reset` actions.
- Live panel status (online, versions, screen, brightness, maintenance mode) reported by the panel app.
- The QR code tells the panel which Wi-Fi network to keep, so a network joined earlier in the setup wizard is forgotten; the enrolment guide explains how to skip that Wi-Fi screen.
- Panels away from home (vacation home, boat, office) can report their status from any network; the Home Assistant address must use `https://` unless it is a local address.
- Turning a panel's screen off is disabled until [Home Assistant issue 176371](https://github.com/home-assistant/core/issues/176371) is fixed, because it makes the panel stop receiving commands; turning the screen on still works.

[Unreleased]: https://github.com/yepzdk/ha-smart-panel/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/yepzdk/ha-smart-panel/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/yepzdk/ha-smart-panel/releases/tag/v0.1.0
