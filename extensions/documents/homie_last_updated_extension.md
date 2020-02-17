# Last-updated timestamp

Version: **<!--VERSION-->1.0.0<!--VERSION-->**
Date: **<!--DATE-->25. Jan 2020<!--DATE-->**
Authors: **<!--AUTHORS-->Max Berger<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension adds best-effort last-updated timestamps to properties.

Homie devices will publish a last-updated timestamp along with any property value changes. The last-update timestamp can be used by devices or gateways that do not constantly pull data from the real back-end. In this case, they can report when they last actually updated the data, so that clients can act accordingly, and maybe ignore old data, or display this information in an UI.
## Homie Version
This extension supports Homie `3.0.1` and `4.x`.

## Extension Identifier
The ID of this extension is `name.berger.max.last-updated`.
Therefore the **$extensions entry** is `name.berger.max.last-updated:1.0.0:[3.0.1;4.x]`.

## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Device Attributes

This extension defines no device attributes.

### Node Attributes
This extension defines no direct node attributes.

#### Nested Node Attributes

This extension defines no nested node attributes.


### Property Attributes

This extension defines one property attribute.

#### $last-updated

The **$last-updated** property attribute is **optional**.

If its used, it **must** follow the description below:

| Topic                                 | Description                                       | Payload type                       |
|---------------------------------------|---------------------------------------------------|------------------------------------|
| $last-updated        | Timestamp when the property value was last updated by the Homie device | integer: seconds that have passed since the Unix epoch (00:00:00 UTC on 1 January 1970) OR 0 for unknown |

Device usage:
* The $last-update **must** always be published immediately before a value update.
* $last-update **must** be 0 or a positive integer
* $last-update **must** be in UTC
* If a device cannot get the actual timestamp for whatever reason (clock is skewed, ntp has not yet finished, etc.) it **may** publish 0
* If a device has published a $last-update in the past and is now unable to determine the last-update timestamp, it **must** publish 0 at least once.
* the Qos and the Retained flags **must** match the value updates.

**Examples**
Assuming the base topic is *homie*, device ID is *super-car*, node is *wheels*, and the property is *pressure* then:
```java
homie/super-car/wheels/pressure/$last-updated → 1579965965
homie/super-car/wheels/pressure/ → 32
```

This means that the property pressure was last fecthed from its source at unix timestamp 1579965965 (2020 Jan 25, 16:26:05 UTC, or 2020 Jan 25, 17:26:05 CET)

**Client considerations**

Note that MQTT is not atomic, and does not guarantee any order. This means that even though both the value and the last-update timestamp are published together and in the oder above, the clients may receive these messages in any order, or one of them may be lost. Therefore, **$last-updated** is entirely **best-effort**. It **must** **not** be used for any critical operation.


## Attribution
- <sup>\[1\]</sup>: [The Homie Convention](https://homieiot.github.io/specification/#), [CCA 4.0](https://homieiot.github.io/license)
