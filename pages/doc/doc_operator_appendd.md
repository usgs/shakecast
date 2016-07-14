---
title: HAZUS MBT
tags: [troubleshooting, shakecast_v3]
summary: "Relating HAZUS Structure Types to Seismic Performance"
keywords: appendix, hazus, mbt, fragility
last_updated: July 3, 2016
sidebar: doc_sidebar
permalink: doc_operator_appendd.html
folder: doc
---

## Selecting Model Building Type and Code Era

ShakeCast offers structural damage estimation capability adapted from the HAZUS-MH earthquake module (NIBS and FEMA, 2003). For any site of interest, the user begins by selecting from the available HAZUS model building types, of which there are 36 (table D.1). "Model building type" refers to the materials of construction (wood, steel, reinforced concrete, etc.), the system used to transmit earthquake forces from the ground through the building (referred to as the lateral force-resisting system), and sometimes height category (low-rise, mid-rise, and high-rise, which generally correspond to 1-3, 4-7, and 8+ stories, respectively).

The user must also select for each facility its building code era, of which there are four (high code, moderate code, low code, and pre-code; table D.2 and fig. D.1). Code eras reflect important changes in design forces or detailing requirements that matter to the seismic performance of a building. Sixteen combinations of model building type and code era do not exist (for example, high-code unreinforced masonry bearing wall), so in total there are 128 choices for HAZUS model building type and code era. Note that code era is largely a function of location and year built, so in principal ShakeCast could simplify the user's job of selecting a code era by asking for era of construction (pre-1941, 1941-1975, or post-1975) instead and then looking up the code era via internal GIS database.

![](images/appendd-1.png "Seismic zone map of the United States")

**Figure 1.** Seismic zone map of the United States (fig. 16-2, ICBO, 1997).

## Describing Potential Damage

The user selects between 3 and 4 alert levels, meaning that any facility affected by an earthquake is noted either green, yellow, or red (3 levels), or green, yellow, orange, or red (4 levels). These colors index the likely structural damage state of the facility in HAZUS terms: green corresponds to HAZUS' undamaged or slight structural damage states, yellow corresponds to moderate structural damage, orange to extensive structural damage, and red to complete structural damage. These terms (slight, moderate, etc.) are described via likely effects of the earthquake on the structural system. For example, for a small wood-frame building (W1, regardless of code era), "green" corresponds to "Undamaged or small plaster or gypsum-board cracks at corners of door and window openings and wall-ceiling intersections; small cracks in masonry chimneys and masonry veneer." These descriptions can be found in the HAZUS-MH technical manual (NIBS and FEMA, 2003) Section 5.3.1.

The code level ("L" for "low") is appended to the structure's Label (e.g., "W1") in order to represent the internal ShakeCast facility type ("W1L") from which a look-up is used to retrieve the corresponding building-specific HAZUS-MH Technical Manual Table 5.16a-d median (alpha) and variability (beta) fragility values.

## Relating Seismic Excitation to Structural Damage

When an earthquake occurs, its shaking intensity at each facility location is estimated in terms of peak horizontal ground acceleration (PGA). Buildings and ground motions are highly variable, even given a model building type and PGA level, so it is uncertain the exact level of PGA that will cause a given facility to experience structural damage of any particular level. The relationship between PGA and damage state is therefore probabilistic, meaning that one can estimate the probability of a given building experiencing a given structural damage state when the building experiences a certain level of PGA. It is more convenient here to estimate the PGA at which there is a given probability of damage exceeding a given structural damage state. In ShakeCast, a facility is indicated as damage level x (that is, green, yellow, orange, or red) when the PGA is such that there is at least a 50% probability of the corresponding HAZUS structural damage state and less than a 50% probability of the next-higher HAZUS structural damage state. These PGA values are taken from the HAZUS-MH Technical Manual Table 5.16a-d.

## Tabular Lookup Data

Two lookup files in CSV format are provided with this manual, one for a three-level damage scheme; the other is for a four-level damage scheme. Each has seven columns or fields, listed in table D.3. The fields correspond to data appearing in the ShakeCast Facility Administration screen (see Section 4.3).

 **Table 1.**  HAZUS-MH earthquake model building types (NIBS and FEMA, 2003, Table 3.1)

| No. | Label | Description | Height |
| | | | Range | | Typical | 
| | | | Name | Stories | Stories | Feet |
| --- | --- | --- | --- |
| 1 | W1 | Wood, Light Frame (≤ 5,000 sq. ft.) |   | 1 - 2 | 1 | 14 |
| 2 | W2 | Wood, Commercial and Industrial (>5,000 sq. ft.) |   | All | 2 | 24 |
| 3 | S1L |  Steel Moment Frame | Low-Rise | 1 - 3 | 2 | 24 |
| 4 | S1M | Steel Moment Frame | Mid-Rise | 4 - 7 | 5 | 60 |
| 5 | S1H |  Steel Moment Frame | High-Rise | 8+ | 13 | 156 |
| 6 | S2L |  Steel Braced Frame | Low-Rise | 1 - 3 | 2 | 24 |
| 7 | S2M | Steel Braced Frame | Mid-Rise | 4 - 7 | 5 | 60 |
| 8 | S2H |  Steel Braced Frame | High-Rise | 8+ | 13 | 156 |
| 9 | S3 | Steel Light Frame |   | All | 1 | 15 |
| 10 | S4L | Steel Frame with Cast-in-Place Concrete Shear Walls | Low-Rise | 8+ | 13 | 24 |
| 11 | S4M | Steel Frame with Cast-in-Place Concrete Shear Walls | Mid-Rise | 4 - 7 | 5 | 60  |
| 12 | S4H | Steel Frame with Cast-in-Place Concrete Shear Walls | High-Rise | 8+ | 13 | 156 |
| 13 | S5L | Steel Frame with Unreinforced Masonry Infill Walls | Low-Rise | 1 - 3 | 2 | 24 |
| 14 | S5M | Steel Frame with Unreinforced Masonry Infill Wal | Mid-Rise | 4 - 7 | 5 | 60 |
| 15 | S5H | Steel Frame with Unreinforced Masonry Infill Walls*| High-Rise | 8+ | 13 | 156 |
| 16 | C1L |   | Low-Rise | 1 - 3 | 2 | 20 |
| 17 | C1M | Concrete Moment Frame | Mid-Rise | 4 - 7 | 5 | 50 |
| 18 | C1H |   | High-Rise | 8+ | 12 | 120 |
| 19 | C2L |   | Low-Rise | 1 - 3 | 2 | 20 |
| 20 | C2M | Concrete Shear Walls | Mid-Rise | 4 - 7 | 5 | 50 |
| 21 | C2H |   | High-Rise | 8+ | 12 | 120 |
| 22 | C3L | Concrete Frame with Unreinforced Masonry Infill Walls | Low-Rise | 1 - 3 | 2 | 20 |
| 23 | C3M | Concrete Frame with Unreinforced Masonry Infill Walls | Mid-Rise | 4 - 7 | 5 | 50 |
| 24 | C3H | Concrete Frame with Unreinforced Masonry Infill Walls | High-Rise | 8+ | 12 | 120 |
| 25 | PC1 | Precast Concrete Tilt-Up Walls |   | All | 1 | 15 |
| 26 | PC2L | Precast Concrete Frames with Concrete Shear Walls | Low-Rise | 1 - 3 | 2 | 20 |
| 27 | PC2M | Precast Concrete Frames with Concrete Shear Walls | Mid-Rise | 4 - 7 | 5 | 50 |
| 28 | PC2H | Precast Concrete Frames with Concrete Shear Walls | High-Rise | 8+ | 12 | 120 |
| 29 | RM1L | Reinforced Masonry Bearing Walls | Low-Rise | 1-3 | 2 | 20 |
| 30 | RM2M | with Wood or Metal Deck Diaphragms | Mid-Rise | 4+ | 5 | 50 |
| 31 | RM2L | Reinforced Masonry Bearing Walls with Precast Concrete Diaphragms | Low-Rise | 1 - 3 | 2 | 20 |
| 32 | RM2M | Reinforced Masonry Bearing Walls with Precast Concrete Diaphragms | Mid-Rise | 4 - 7 | 5 | 50 |
| 33 | RM2H | Reinforced Masonry Bearing Walls with Precast Concrete Diaphragms | High-Rise | 8+ | 12 | 120 |
| 34 | URML | Unreinforced Masonry Bearing Walls | Low-Rise | 1 – 2 | 1 | 15 |
| 35 | URMM | Mid-Rise | 3+ | 3 | 35 |
| 36 | MH | Mobile Homes |   | All | 1 | 10 |

 **Table 2.**  HAZUS-MH guidelines for selection of damage functions for typical buildings based on UBC seismic zone and building age (NIBS and FEMA, 2003, Table 5.20).

| UBC Seismic Zone (NEHRP Map Area) | Post-1975 | 1941 - 1975 | Pre-1941 |
| --- | --- | --- | --- |
| Zone 4 (Map Area 7) | High-Code | Moderate-Code | Pre-Code(W1 = Moderate-Code) |
| Zone 3 | Moderate-Code | Moderate-Code | Pre-Code |
| (Map Area 6) |   |   | (W1 = Moderate-Code) |
| Zone 2B | Moderate-Code | Low-Code | Pre-Code |
| (Map Area 5) |   |   | (W1 = Low-Code) |
| Zone 2A | Low-Code | Low-Code | Pre-Code |
| (Map Area 4) |   |   | (W1 = Low-Code) |
| Zone 1 | Low-Code | Pre-Code | Pre-Code |
| (Map Area 2/3) |   | (W1 = Low-Code) | (W1 = Low-Code) |
| Zone 0 | Pre-Code | Pre-Code | Pre-Code |
| (Map Area 1) | (W1 = Low-Code) | (W1 = Low-Code) | (W1 = Low-Code) |

 **Table 3.** Layout of damage lookup tables.

| **Field name** | **Type** | **Description** |
| --- | --- | --- |
| ID | Integer | A unique index |
| Facility Type | String | HAZUS model building type and seismic design level |
| Color | String | Green, Yellow, Orange, or Red |
| Damage Level | String | Equivalent HAZUS structural damage level(s) |
| Low Limit | Integer | Intensity with 50% probability of this damage level occurring |
| High Limit | Integer | Intensity with 50% probability of next damage level occurring |
| Metric | String | Intensity metric |

{% include links.html %}
