# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added `recommendation`, `reference`, `description`, and `impact` fields to
  `hackerone_report`

### Added

- The following entities are added:

  | Resources     | Entity `_type`            | Entity `_class` |
  | ------------- | ------------------------- | --------------- |
  | Account       | `hackerone_account`       | `Account`       |
  | Assessment    | `hackerone_assessment`    | `Assessment`    |
  | Organization  | `hackerone_organization`  | `Organization`  |
  | Program Asset | `hackerone_program_asset` | `Entity`        |

- The following relationships are added:

  | Source Entity `_type`     | Relationship `_class` | Target Entity `_type`     |
  | ------------------------- | --------------------- | ------------------------- |
  | `hackerone_account`       | **HAS**               | `hackerone_organization`  |
  | `hackerone_account`       | **HAS**               | `hackerone_program`       |
  | `hackerone_account`       | **HAS**               | `hackerone_program_asset` |
  | `hackerone_organization`  | **HAS**               | `hackerone_program`       |
  | `hackerone_program_asset` | **HAS**               | `hackerone_report`        |
  | `hackerone_program`       | **PERFORMED**         | `hackerone_assessment`    |
  | `hackerone_program`       | **IDENTIFIED**        | `hackerone_report`        |
  | `hackerone_program`       | **SCANS**             | `hackerone_program_asset` |

## 1.0.0 - 2022-12-21

### Changed

- Complete overhaul to use new SDK patterns.

## 0.4.15 - 2021-10-29

### Changed

- Improve messaging to client to clarify errors when incorrect program handle is
  specified in the config.
