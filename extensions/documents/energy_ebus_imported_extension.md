# Imported

Version: **<!--VERSION-->1.0.0<!--VERSION-->**
Date: **<!--DATE-->04. Jul 2026<!--DATE-->**
Authors: **<!--AUTHORS-->[Electrification Bus](https://ebus.energy)<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract

The `energy.ebus.imported` extension marks a Homie device that is a bridged mirror of a device whose system of record lives in another ecosystem (for example Home Assistant), and records which ecosystem it was imported from.

A proxy that ingests devices from an external discovery mechanism and republishes them as Homie 5 devices advertises this extension and sets an `imported-from` device attribute naming the source ecosystem. Consumers that re-export Homie devices into other ecosystems use the marker to avoid a round-trip echo: a Homie-to-Home-Assistant bridge, for instance, does not re-export a device that was imported from Home Assistant, while it still exports a device imported from a different ecosystem. The extension places no behavioral requirement on the device itself; it is provenance metadata for controllers and bridges. The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Homie Version

This extension supports Homie `5.x`.

## Extension Identifier

The ID of this extension is `energy.ebus.imported`.
Therefore the **$extensions entry** is `energy.ebus.imported:1.0.0:[5.x]`.

A device advertises the extension by including that entry in the `extensions` array of its device `$description`.

## Extension Datatypes

This extension defines no new datatypes.

## Extension Attributes

Homie 5 describes a device with a single JSON `$description` document. Per the Homie 5 forward-compatibility rule, a controller ignores unknown fields within an object but keeps the object, so an extension MAY add fields to that document. This extension defines one device-level field.

### Device Attributes

This extension defines one **optional** device attribute, added as a top-level field of the device `$description` document.

| Field           | Requiredness | Type   | Description |
|-----------------|--------------|--------|-------------|
| `imported-from` | optional     | string | The source ecosystem the device was imported from, as a stable lowercase token (see [Source ecosystem tokens](#source-ecosystem-tokens)). |

A device that advertises `energy.ebus.imported` SHOULD set `imported-from`. When the extension is advertised but `imported-from` is absent, the source is unspecified, and a re-exporter SHOULD treat the device conservatively (as though it might have originated in the re-exporter's own ecosystem).

**Example.** A device imported from Home Assistant, `$description` abbreviated:

```json
{
  "homie": "5.0",
  "name": "Kitchen Meter",
  "version": 3,
  "extensions": ["energy.ebus.imported:1.0.0:[5.x]"],
  "imported-from": "ha",
  "nodes": {}
}
```

### Node Attributes

This extension defines no node attributes.

### Property Attributes

This extension defines no property attributes.

## Source ecosystem tokens

`imported-from` carries a stable lowercase token identifying the ecosystem whose system of record owns the device. The vocabulary is open: a proxy for a new ecosystem defines a new token. Well-known values:

| Token    | Ecosystem |
|----------|-----------|
| `ha`     | Home Assistant (MQTT discovery) |
| `zigbee` | Zigbee (for example via Zigbee2MQTT) |
| `zwave`  | Z-Wave |

## Loop-avoidance semantics

A device may traverse more than one bridge on a shared broker: a proxy imports it from ecosystem X into Homie, and a second bridge exports Homie devices into ecosystem Y. When X and Y are the same ecosystem, re-exporting the device would echo it back to its own system of record as a duplicate.

A bridge that exports Homie devices into an ecosystem `Y` SHOULD NOT export a device whose `imported-from` equals `Y` (nor one that advertises `energy.ebus.imported` with an unspecified source). A device whose `imported-from` names a different ecosystem MAY be exported to `Y`, because that is not a round trip.

A device is NOT REQUIRED to advertise this extension; its absence means the device is treated as native (exportable). The extension only ever suppresses a re-export; it never changes the device's own values or topics.

## Reference implementation

The [Electrification Bus Python SDK](https://github.com/electrification-bus/python-sdk) implements this extension in its `ebus_sdk.ha` module: `imported_extension()` and `imported_from_attribute()` stamp a device, `is_imported()` / `imported_source()` read it, and `HaDiscoveryBridge` applies the loop-avoidance rule above when exporting to Home Assistant. The canonical specification is maintained in the [Electrification Bus specification](https://github.com/electrification-bus/specification/blob/main/extensions/imported.md).

## Attribution

- Structured after the [Homie extension template](https://github.com/homieiot/convention/blob/develop/extensions/extension_template.md).
