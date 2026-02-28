# Homie 5 Metadata Extension

**Extension ID:** `org.homieiot.metadata`  
**Version:** 0.1.0 (Draft)  
**Status:** Draft  
**Applies to:** Homie 5

---

## 1. Overview

This extension defines a `$meta` topic for Homie 5 devices, nodes, and properties. It provides a lightweight, flat key-value store that allows services to annotate Homie entities with structured metadata — such as descriptions, tags, UI hints, or integration-specific identifiers — without modifying the core device definition.

The metadata object is owned by one service (identified by its Homie device ID) and may be updated by other authorized services via a `$meta/set` command topic.

A key distinction exists between **self-managed metadata** — where the device itself declares and owns the extension — and **externally managed metadata** — where a separate service takes ownership on behalf of a device that does not support this extension natively. This document defines rules for both cases.

---

## 2. Motivation

The Homie 5 convention defines a clean device model but intentionally leaves higher-level concerns — such as room assignment, human-readable descriptions, icon hints, or service-specific tags — outside its scope. This extension provides a standardized mechanism for attaching such metadata to any Homie entity, using well-defined key semantics and a simple update protocol.

> **Scope note:** This extension is designed for **slow-moving, descriptive data** — information that rarely changes after initial configuration, such as display names, room assignments, or UI hints. It is explicitly not intended for data that drives device behaviour. Any value that controls or reflects the operational state of a device MUST be modelled as a Homie node or property, not as metadata.

---

## 3. Extension Declaration and Ownership Modes

### 3.1 Declaring the Extension

The Homie 5 convention requires that a device lists all supported extensions in its `$extensions` topic. This extension uses the ID `org.homieiot.metadata`.

Whether or not that declaration is present has direct bearing on who is permitted to own and publish the `$meta` topic for a given device.

### 3.2 Self-Managed Metadata (Device Declares the Extension)

When a device lists `org.homieiot.metadata` in its `$extensions` topic, the device itself is the owner of its own `$meta` topic (and those of its nodes and properties). In this case:

- The device's Homie device ID MUST be the value of `$md-owner` in any `$meta` payload it publishes.
- No external service is permitted to act as owner for that device's `$meta` topic. External services MUST NOT publish to `<device-base>/$meta` directly.
- External services MAY still publish update requests to `<device-base>/$meta/set`, which the device may choose to accept or ignore according to its own policy.
- This rule applies recursively to the device's nodes and properties: if the device declares the extension, it owns `$meta` for all of its own entities.

### 3.3 Externally Managed Metadata (Device Does Not Declare the Extension)

When a device does **not** list `org.homieiot.metadata` in its `$extensions` topic, an external service MAY take ownership of the metadata for that device and its nodes and properties. In this case:

- The external service's Homie device ID is used as the `$md-owner` value.
- Only one external service should act as owner per entity. If multiple services attempt to own the same `$meta` topic, behavior is undefined; broker-level ACL rules are RECOMMENDED to prevent this.
- The owning external service MUST NOT modify or interfere with the device's own Homie topics.

### 3.4 Summary

| Device declares extension? | Who may publish `$meta`?       | Who may publish `$meta/set`? |
|----------------------------|-------------------------------|------------------------------|
| Yes                        | The device itself only         | Any client                   |
| No                         | One designated external service | Any client                   |

---

## 4. Scope

This extension MAY be applied to any of the following Homie 5 entities:

| Entity   | Topic path example                                |
|----------|---------------------------------------------------|
| Device   | `homie/5/<device-id>/$meta`                       |
| Node     | `homie/5/<device-id>/<node-id>/$meta`             |
| Property | `homie/5/<device-id>/<node-id>/<property-id>/$meta` |

For simplicity, the remainder of this document uses `<base>` to refer to the topic path of the target entity (e.g., `homie/5/my-device`).

---

## 5. The `$meta` Topic

### 5.1 Topic

```
<base>/$meta
```

### 5.2 Payload

The payload MUST be a valid JSON object. The object is a **flat key-value map** — nesting is not permitted. Both keys and values MUST be strings.

```json
{
  "$md-owner": "meta-service",
  "$label": "Living Room Thermostat",
  "$room": "living-room",
  "vendor-custom-key": "some value"
}
```

### 5.3 MQTT Attributes

| Attribute | Value     |
|-----------|-----------|
| QoS       | 1         |
| Retained  | `true`    |

The retained flag ensures that subscribing clients receive the current metadata state immediately upon connection.

### 5.4 Ownership

Every `$meta` object MUST contain the `$md-owner` key (see §7.1). Its value is the **Homie device ID** of the service responsible for maintaining this metadata object. Only the owner service is authoritative for the content of `$meta`; it is the only entity that publishes to the `$meta` topic directly. The rules governing which service is permitted to be the owner are defined in §3.

---

## 6. The `$meta/set` Topic

### 6.1 Topic

```
<base>/$meta/set
```

### 6.2 Purpose

Any client (including non-owner services) MAY request an update to the metadata by publishing to `$meta/set`. The owner service MUST subscribe to this topic and process incoming requests.

### 6.3 Payload Format

The payload MUST be a UTF-8 string of the form:

```
key=value
```

Exactly one equals sign (`=`) separates the key and value. Everything after the first `=` is treated as the value — values MAY contain `=` characters.

**Examples:**

```
$label=My Sensor
```
```
vendor:source=some-value
```
```
note=Installed 2025-01-15 (revision=3)

> **Important notice**: markdown values are allowed
```

### 6.4 MQTT Attributes

| Attribute | Value     |
|-----------|-----------|
| QoS       | 1         |
| Retained  | `false`   |

The `$meta/set` topic MUST NOT be retained.

### 6.5 Owner Processing

Upon receiving a valid `$meta/set` message, the owner service MUST:

1. Parse the `key=value` payload.
2. Validate the key and value according to §8.
3. If valid: update the in-memory metadata map and republish the updated object to `$meta` (retained).
4. If invalid: ignore the message. The owner MAY log the error. The owner MUST NOT publish a malformed `$meta` object as a result.

The owner MUST NOT allow a `$meta/set` message to overwrite the `$md-owner` key with a different value than its own device ID.

---

## 7. Well-Known Keys

Keys prefixed with `$` are **reserved for officially defined metadata keys** as specified in this document and future revisions of this extension. Implementations MUST NOT use `$`-prefixed keys for purposes other than those defined here.

### 7.1 Defined `$` Keys

| Key            | Description |
|----------------|-------------|
| `$md-owner`    | The Homie device ID of the service that owns and maintains this `$meta` object. MUST be present in every published `$meta` payload. |
| `$label`       | A human-readable display name for the entity. Intended for UI presentation. |
| `$description` | A longer human-readable description. Multiline text is permitted; Markdown is RECOMMENDED for rich content. |
| `$room`        | An identifier for the physical location or room. Slug format RECOMMENDED (e.g., `living-room`). |
| `$icon`        | A hint for UI icon selection. Specific icon sets are out of scope for this extension. |
| `$tags`        | A comma-separated list of tags. Individual tags MUST conform to the key character rules in §8.1 (alphanumeric, hyphens, underscores). Whitespace around commas is ignored. |
| `$group`       | An identifier linking this entity to a logical group of related entities. Slug format RECOMMENDED. |
| `$hidden`      | When set to `true`, signals to UIs that this entity should not be displayed by default. |
| `$sortorder`   | Preferred display order relative to sibling entities. Lower values appear first. |

> Additional `$`-prefixed keys MAY be defined in future revisions of this extension. Implementations MAY validate the value of known `$`-prefixed keys against the rules defined in this document. For unrecognized `$`-prefixed keys, implementations MUST accept and store the value as-is, applying only the general value constraints in §8.2.

---

## 8. Key and Value Constraints

### 8.1 Key Constraints

A key MUST satisfy all of the following rules:

- MUST NOT be empty.
- MUST NOT exceed 128 characters in length.
- MUST consist entirely of characters drawn from: `a–z`, `0–9`, `-` (hyphen), `:` (colon) — or `$` as the first character for reserved keys. Uppercase letters are not permitted.
- The colon (`:`) is RECOMMENDED as a namespace separator for vendor-specific keys (e.g., `acme:entity-id`). The vendor namespace is all text up to the first colon; everything after is the local key name. Multiple colons are not forbidden but carry no additional semantic meaning.
- Keys beginning with `$` are reserved (see §7).

**Valid key examples:**

```
$label
$room
vendor:source
my-custom-key
123key
```

**Invalid key examples:**

```
=value          (contains =)
MyKey           (uppercase not permitted)
my key          (contains space)
my_key          (underscore not permitted)
```

### 8.2 Value Constraints

A value MUST satisfy all of the following rules:

- MAY be empty (an empty value signals intent to clear the key; see §8.3).
- MUST NOT exceed 1024 characters in length.
- MUST be valid UTF-8.
- MUST NOT contain ASCII control characters (U+0000–U+001F, U+007F), with the exception of horizontal tab (U+0009) and line feed (U+000A).
- Leading and trailing whitespace is significant and is preserved as-is by the owner.

Values SHOULD be single-line strings. Multiline values are permitted only for keys that explicitly carry prose content (such as `$description`). Binary data MUST NOT be stored raw; if binary data is required, it MUST be base64-encoded before being stored as a string value.

### 8.3 Deleting a Key

To request removal of a key, a client publishes to `$meta/set` with the key name and an empty value:

```
my-custom-key=
```

The owner MUST remove the key from the metadata object and republish. An attempt to delete a required key (`$md-owner`) MUST be ignored.

---

## 9. Behavior Requirements

### 9.1 Owner Service

The owner service:

- MUST publish `$meta` as a retained message whenever the metadata object changes.
- MUST include `$md-owner` in every published `$meta` payload.
- MUST subscribe to `$meta/set` for each entity it manages.
- MUST republish `$meta` after each accepted `$meta/set` update.
- MUST publish an empty retained payload to `$meta` when the entity is removed (following Homie 5 last-will conventions), if it has previously published metadata for that entity.
- MUST NOT republish `$meta` if a received `$meta/set` payload is invalid or results in no change.
- MAY omit the `$meta` topic entirely when no meaningful metadata is set. If the metadata object contains only `$md-owner` and no other keys, the owner MAY clear the topic by publishing an empty retained payload to `<base>/$meta`, removing it from the topic tree. Consumers MUST treat an absent `$meta` topic as equivalent to an empty metadata object.

### 9.2 Non-Owner Clients

Clients that are not the owner:

- MAY read `$meta` to discover metadata.
- MAY publish to `$meta/set` to request updates.
- MUST NOT publish directly to `$meta`.
- MUST NOT act as owner for a device that declares this extension in its own `$extensions` topic (see §3.2).

### 9.3 Initialization

When the owner service starts, it needs to establish its working state before it begins processing `$meta/set` requests. The service MAY use either of the following strategies, or a combination:

- **Restore from persistent storage:** Load the last-known metadata state from a local store (database, file, etc.) and publish it immediately to `$meta`.
- **Resume from MQTT:** Subscribe to `$meta` and read back the currently retained value. If the retained payload is present and its `$md-owner` value matches the service's own device ID, the service MAY adopt that state as its working state without republishing. If no retained payload is present, the service MUST treat this as an empty metadata state and MUST NOT publish `$meta` until at least one key beyond `$md-owner` has been set.

In either case, the service MUST ensure its working state is fully established and `$meta` has been published (if changed) before it begins processing incoming `$meta/set` messages. This avoids a race condition where an update is accepted before the state is initialized.

---

## 10. JSON Schema

The following JSON Schema (Draft 2020-12) describes a valid `$meta` payload:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Homie5 $meta payload",
  "type": "object",
  "required": ["$md-owner"],
  "additionalProperties": {
    "type": "string",
    "maxLength": 1024,
    "pattern": "^[^\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]*$"
  },
  "properties": {
    "$md-owner": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[a-z0-9-]+$",
      "description": "Homie device ID of the owning service"
    }
  },
  "propertyNames": {
    "pattern": "^\\$?[a-z0-9\\-:]+$",
    "maxLength": 128
  }
}
```

---

## 11. Example

### Initial publish by the owner (`meta-service`)

**Topic:** `homie/5/living-room-thermostat/$meta`  
**Retained:** true  
**Payload:**

```json
{
  "$md-owner": "meta-service",
  "$label": "Living Room Thermostat",
  "$room": "living-room",
  "$tags": "climate,heating",
  "$icon": "thermostat"
}
```

### Update request by another service

**Topic:** `homie/5/living-room-thermostat/$meta/set`  
**Retained:** false  
**Payload:**

```
$description=Controls the underfloor heating in the living room
```

### Updated `$meta` republished by the owner

**Topic:** `homie/5/living-room-thermostat/$meta`  
**Retained:** true  
**Payload:**

```json
{
  "$md-owner": "meta-service",
  "$label": "Living Room Thermostat",
  "$room": "living-room",
  "$tags": "climate,heating",
  "$icon": "thermostat",
  "$description": "Controls the underfloor heating in the living room"
}
```

### Key deletion request

**Topic:** `homie/5/living-room-thermostat/$meta/set`  
**Retained:** false  
**Payload:**

```
$icon=
```

---

## 12. Implementation Notes

- The owner service SHOULD debounce rapid successive `$meta/set` messages and publish a single consolidated `$meta` update to reduce MQTT traffic. The RECOMMENDED debounce window is **5 seconds**. This is intentionally higher than typical IoT debounce values: metadata (labels, room assignments, tags) is expected to change rarely, and a longer window prevents unnecessary retained-message churn when multiple keys are updated in quick succession (e.g., during initial provisioning).
- Implementations that persist metadata across restarts SHOULD use the `$md-owner` value to prevent accidental import of metadata from a different service.
- The `$meta/set` protocol is intentionally simple (no authentication, no ACKs). For environments requiring access control, MQTT ACL rules on the broker are the appropriate mechanism to restrict who may publish to `$meta/set`.
- The flat structure is a deliberate design constraint. If structured or nested data is needed, it is RECOMMENDED to serialize it as a JSON string in a single value, with the key naming the structure (e.g., `acme:config={"entity_id":"climate.living_room"}`).

---

## 13. Conformance

An implementation is considered **conformant** with this extension if it satisfies all MUST-level requirements in §3, §5, §6, §8, and §9.

---

## Appendix A: Summary of Topics

| Topic              | Direction            | Retained | QoS | Description                             |
|--------------------|----------------------|----------|-----|-----------------------------------------|
| `<base>/$meta`     | Owner → Broker       | Yes      | 1   | Current metadata object (JSON)          |
| `<base>/$meta/set` | Any client → Broker  | No       | 1   | Update request (`key=value` string)     |

---

## Appendix B: Changelog

| Version | Date       | Notes          |
|---------|------------|----------------|
| 0.1.0   | 2026-02-27 | Initial draft  |
