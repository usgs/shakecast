---
title:  "Default Browser Key for Google Maps API"
published: true
permalink: 2016_google_maps_api_key.html
summary: "ShakeCast includes a default browser key for Google Maps API in latest github revision to satisfy key requirement."
tags: [software_update, troubleshooting]
---

## ShakeCast default browser key for Google Maps API

In response to a reported error message from Google Maps API, we revised the V3 code base to allow users to specify their own Maps API key.  There is a new ShakeCast Amazon AMI (V3-14) that reflects the changes and has been shared with all existing AWS ShakeCast users.  

The revised code also includes a default browser key so that the Google Maps UI will launch correctly. The Google Maps APIs give developers several ways of embedding Google Maps into web pages or retrieving data from Google Maps, and allow for either simple use or extensive customization. ShakeCast users who expect to generate many map loads, you may want to generate your own API key or even pay for the premium plan.

Visit [Google Maps API FAQ](https://developers.google.com/maps/faq "Google Maps API FAQ") to learn more about the Maps API.  Detailed information regarding Google Maps Embed API key can be viewed on the  [Google Maps API web site](https://developers.google.com/maps/documentation/embed/ "Google Maps Embed API").


{% include links.html %}
