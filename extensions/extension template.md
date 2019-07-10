# Name of the Extension

Version: **<!--VERSION-->x.x.x<!--VERSION-->**
Date: **<!--DATE-->01. Jan 2000<!--DATE-->**
Authors: **<!--AUTHORS-->Your Name or Organization<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
The abstract of an extension document should consist of two paragraphs.

The first one should be very short, only one or two sentences and serves as a short description of the extension.
The second paragraph should be longer and should explain the intention of an extension.
This is the extension template document.
It is used to create an extension according to the [Homie Extension Convention]().
"A Homie device may therefore support extensions, defined in separate documents. Every extension is identified by a unique ID and will be linked from this section"<sup>\[1\]</sup>.
The above was a quote from the Homie Convention to illustrate the usage of the [Attribution](#Attribution) section.

## Extension Identifier
The ID of this extension is `org.example.our-feature`.

## Homie Version
This extension supports Homie `3.0.1` and `4.0`.

## Extension Datatypes
This extension defines one new datatype.

### Vector
- Vector payload validity varies depending on the property format definition
- Vector types are represented in format (f<sub>1</sub>,...,f<sub>n</sub>) where f<sub>1</sub> to f<sub>n</sub> are string literal representations of 64-bit signed floating point numbers
- Vector entries range from 2<sup>-1074</sup> to (2-2<sup>-52</sup>)&ast;2<sup>1023</sup>
- An empty string ("") is not a valid payload

#### Vector format
- The format of a Vector type specifies its mathematical dimension `n`
- Therefor the format has to be a natrual number greater then 0

## Extension Attributes

### Device Attributes

This extension defines no direct device attributes.

#### Nested Device Attributes

This extension defines one nested device attribute.

##### $org.example.our-feature

The **$org.example.our-feature** nesting attribute is **required**.

It defines **no optional** attributes and the following **required** nested attributes:

| Topic                                    | Description                                                             | Payload type                            |
|------------------------------------------|-------------------------------------------------------------------------|-----------------------------------------|
| $org.example.our-feature/$version        | The version of this extension                                           | String with constant value: "x.x.x"     |
| $org.example.our-feature/$homie-versions | The Homie versions this extension supports, separated by a comma (`,`)  | String with constant value: "3.0.1,4.0" |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$org.example.our-feature/$version → "x.x.x"
homie/super-car/$org.example.our-feature/$homie-versions → "3.0.1,4.0"
```

### Node Attributes
This extension defines no direct node attributes.

#### Nested Node Attributes

This extension defines one nested node attribute.

##### $coordinate-system

The **$coordinate-system** nesting attribute is **optional**.
If its used, it defines one **required** nested attribute:

| Topic                                 | Description                                       | Payload type                       |
|---------------------------------------|---------------------------------------------------|------------------------------------|
| $coordinate-system/$handedness        | Handedness of the coordinate system.              | Enum: \[left_handed,right_handed\] |

**Examples**
Assuming the base topic is *homie*, device ID is *super-car* and node is *wheels* then:
```java
homie/super-car/wheels/$coordinate-system/$handedness → "left_handed"
```

If the **$coordinate-system** nesting attribute is used, following nested attributes are **optional**.
Not that the following table has a `Default value` row. Only tables for **optional** attributes have this row.

| Topic                                 | Description                                       | Payload type                       | Default value|
|---------------------------------------|---------------------------------------------------|------------------------------------|--------------|
| $coordinate-system/$first-axis-name   | Name of the first axis of the coordinate system.  | String                             | "x-Axis"     |
| $coordinate-system/$second-axis-name  | Name of the second axis of the coordinate system. | String                             | "y-Axis"     |
| $coordinate-system/$third-axis-name   | Name of the third axis of the coordinate system.  | String                             | "z-Axis"     |
| $coordinate-system/$axis-unit         | The unit of the coordinate axis                   | String                             |              |

**Examples**
Assuming the base topic is *homie*, device ID is *super-car* and node is *wheels* then:
```java
homie/super-car/wheels/$coordinate-system/$first-axis-name → "Pitch"
homie/super-car/wheels/$coordinate-system/$second-axis-name → "Yaw"
homie/super-car/wheels/$coordinate-system/$third-axis-name → "Roll"
homie/super-car/wheels/$coordinate-system/$axis-unit → "meter"
```

### Property Attributes

This extension defines no property attributes.

## Attribution
- <sup>\[1\]</sup>: [The Homie Convention](https://homieiot.github.io/specification/#), [CCA 4.0](https://homieiot.github.io/license)