# Decisions

Record only decisions that constrain future work.

## D-001 - Ollama is customer-owned

**Date:** 2026-09-25  
**Status:** accepted  
**Source:** [[Human Input]]

Brian may later talk to Ollama. The customer owns the Ollama service and chooses the network Brian uses to reach it. Brian will not ship a hosted LLM or default to a vendor model API.

## D-002 - AI and DevOps overlays wait for the core loop

**Date:** 2026-09-25  
**Status:** accepted

Customer-owned assistant and container/lifecycle visibility are wanted product direction. They are out of MVP. See [[07 - Feature Plans]] and [[05 - Roadmap]].

## D-003 - Console access is not a default remote-shell product

**Date:** 2026-09-25  
**Status:** accepted

If console or exec is offered, it uses customer-owned credentials or a runtime API, is explicitly enabled, and is auditable. Brian does not become a general jump host.
