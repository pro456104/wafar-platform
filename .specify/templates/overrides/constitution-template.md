# Wafar Platform Constitution — Project Scaffold (override)

<!--
  PROJECT-LOCAL CONSTITUTION SCAFFOLD — binding layer 1 of the Spec Kit
  template resolution stack (overrides > presets > extensions > core).

  Why this file exists: `/speckit.constitution` resolves `constitution-template`
  and uses it as the REQUIRED STRUCTURE, then applies the existing project values
  and amendments to that scaffold. Without this override the core scaffold governs
  (5 principle slots and two generic sections), so a `/constitution` run could
  collapse this project's ten principles and eighteen binding sections.

  Rule: keep the heading names and their order in step with
  `.specify/memory/constitution.md`. When a section is added or renamed there,
  change it here in the same change, and change the version footer with it.
  Sub-headings under a `##` section (for example `### Data entities` under
  Product Register, or `### Register gaps a slice MUST close` under Technology
  Standards) are not listed below and are not tracked here; the `##` order is.

  On every amendment (normative): this scaffold's version footer MUST move in
  the same change. The full list of stamp sites is NOT restated here — the
  constitution's Governance -> Amendment procedure is the single authority for
  it, and this block points at that paragraph. An amendment that changes only
  the constitution is an incomplete amendment, because that list has ten sites
  outside this file.
-->

# Wafar Platform Constitution

<!-- Preamble: keep the existing text — what the product is, what this
     constitution governs, and what it deliberately does not govern. -->

## Core Principles

### I. Evident, Traceable Change (NON-NEGOTIABLE)
### II. Strict Type Safety
### III. Measured Test Coverage
### IV. Accessible User Interfaces
### V. Arabic-First and RTL Interfaces (NON-NEGOTIABLE)
### VI. Catalog-Only Scope (NON-NEGOTIABLE)
### VII. Specification-First and Documentation Separation (NON-NEGOTIABLE)
### VIII. User Story Independence (NON-NEGOTIABLE)
### IX. Design System Fidelity (NON-NEGOTIABLE)
### X. Modular Monolith Architecture

<!-- Each principle keeps its binding rules and its rationale. Preserve the
     existing text; a principle is never silently dropped or redefined. -->

## Product Scope

## Product Register

## File Processing Overview

### File Processing Rules

## Single-Reference Sufficiency

## Query Safety and Secrets

## Schema and Migration Control

## Identity, Authentication, and Session Policy

## Authorization and Access Control

## Performance Budgets and Verification

### Usage Limits

## Dependency Governance

## Module Discipline and Development Workflow

## Project Structure and Debt Control

## Documentation

## Deployment and Observability

## Technology Standards

### Repository topology
### Internal layout
### Approved register
### Version-change rule
### Register gaps a slice MUST close
### Licence treatment for infrastructure services

## Design System Standards

### Module map
### Token families
### Breakpoints
### Component inventory
### Decision values (binding)
### Interface State Matrix
### State map
### Components the product requires and the design system does not yet provide
### Invariants
### Fonts and the framework bridge
### Extension procedure and design-system version
### Honoured media and capability states

## Glossary

## References

## Artifact Workflow and Traceability

## Product Fact Clarifications

## Governance

**Version**: 2.19.1 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-06
