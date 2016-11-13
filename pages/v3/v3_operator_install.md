---
title: Installation Notes
tags: [getting_started, troubleshooting, shakecast_v3]
last_updated: July 3, 2016
keywords: installation, virtual machine, hardware, software
summary: "This guide is intended for ShakeCast system managers, operators and IT support staff. This guide is for you if you are installing, operating, or configuring a ShakeCast system."
sidebar: v3_sidebar
permalink: v3_operator_install.html
folder: v3
---


If you are a ShakeCast user interested in learning more about ShakeCast notifications, facility assessment or inspection reports or web pages, see the **ShakeCast User Guide** _https://my.usgs.gov/confluence/display/ShakeCast/._

## ShakeCast System Installation

The ShakeCast V3 system was developed under the CentOS 6 Linux system and ported to other Linux distributions (RedHat ES 6 and SUSE Enterprise Server 10) and the Windows operating system (7/Server 2008) 64-bit application.

Supporting multiple OS platforms is not possible due to resource limitations, so for ShakeCast users, the strategy going forward is to support Linux Virtual Machine (VM) for local installations and Cloud computing on Amazon Web Services (AWS). The ShakeCast application is bundled with an Open-Source Linux operating system as a standalone system image with the standard installation package.

## ShakeCast on a Virtual Machine

A virtual machine (VM) is a software implementation that executes programs like a physical machine. Virtual machines are separated into two major classifications, system and process virtual machines, based on their use and degree of correspondence to any real machine. ShakeCast VM is a system virtual machine.

ShakeCast V3 on a VM has the benefits of application provisioning, maintenance, high availability and disaster recovery. These also are important factors for consideration when implementing the application at any organization as a VM or physical server. The host VM described in this document reflects one possible VM option for the purpose of application development. USGS does not endorse any specific VM host for the ShakeCast application. The sections below describe the setup for a generic VM available to the ShakeCast user community.

## ShakeCast System Hardware Requirements

Recommended minimum hardware specifications for the ShakeCast system includes:

- Single Intel Xeon E5-2670 equivalent processor.
- 1GB RAM.
- 30GB hard drive storage
- At least low performance Internet connection (<1MB/s)

The above hardware is roughly equivalent to the "micro" instance on the Amazon Elastic Compute Cloud (Amazon EC2) in which performance was assessed. A system with these minimum requirements could be used for non-production purposes and was found to be adequate to support a ShakeCast instance with <100 facilities and <10 users for each processed ShakeMap.

Depending on the number of facilities, user inventory and the earthquake monitoring areas, more hardware resources will be needed to for better performance i.e., near instantaneous facility evaluation and user notifications. Products (ShakeMap, ShakeCast, PAGER, DYFI?, and others) for each processed earthquake usually consume 30-50 MB of hard drive space. For ShakeCast systems designated for earthquake response purpose, we recommend to at least double the minimum recommended hardware specifications. As a case example, the Caltrans ShakeCast system consists of ~26,000 bridge facilities, ~500,000 bridge components, ~300 users in several groups and uses the following hardware for all primary and backup servers:

- Quad Intel Xeon X5670 2.9GHz processors.
- 8GB RAM.
- 100GB hard drive storage.
- High performance Internet connection.

## ShakeCast System Software Requirements

The ShakeCast V3 system is distributed for both Linux and MS-Windows operating systems. The system is built on an open-source stack of supporting applications shared by all platforms, specifically:

- Apache Web server 2.x.
- MySQL 5.x database.
- Perl 5.14+ scripting language.
- Perl Modules: DBI, DBD::mysql, Text::CSV\_XS, Config::General, enum, XML::Parser, XML::LibXML, XML::Writer, XML::Twig, XML::Simple, Template-toolkit, PDF::API2, PDF::Table, MIME::Lite, GD, GD::Text, GD::Graph, GD::Graph3d, HTML::TableExtract, Net::SSLeay, Net::SMTP::SSL, Net::SMTP::TLS, Authen::SASL, Archive::Zip, JSON, JSON::XS, File::Path, Image::Size, Mojolicious.
- wkhtmltoimage conversion tool.
- gnuplot image tool.
- HTML5/Google Maps API V3/markerclusterer/jQuery/Bootstrap/dataTables Web tools.
- Optional PHP/phpmyadmin scripting language.
- Optional git version control tool.

Linux implementations:

- Xvfb X virtual framebuffer display server (required for 64-bit systems and optional for 32-bit systems).
- mailx as default mail utility.
- ShakeCast services as background daemon processes.
- Database backup cron job.

Windows implementations:

- SMTP as default mail protocol (supports both SSL/TLS security layers).
- ShakeCast services as Windows system processes.

## Security and Firewall

The default setup of ShakeCast allows access via the command line using SSH and the web interface with HTTP or HTTPS. The ShakeCast web server is designed to serve earthquake information to users and to allow administrators to conduct general administration of the system.

Command line access via SSH (Linux) should be granted only to system administrators. ShakeCast tasks not covered by the web interface are considered advanced topics for experienced ShakeCast administrators. For Windows operating systems without installed SSH service, the ShakeCast administrator will need to access the system via the default **Remote Desktop Connection** application (or similar remote access programs) to perform the same tasks.

Normal setup and interaction with a user's ShakeCast web server provides user access to maps, products and services, as well as administrator access. Administrators can modify user profiles and notifications, trigger earthquake scenarios, and access many other configurations functions. However, in the most secure installation of ShakeCast, the administrator can choose to disable modifications from the web and only permit SSH access.

Firewall and system level security configurations are platform specific and not covered by this manual. ShakeCast implements basic authentication, but it is highly recommended to implement system-level firewall policies to limit exposure to/from the Internet. These rules will take precedence over the ShakeCast-defined user authentication. For inbound traffic, firewall policies are effective methods to define domains where users can access the products and information of the ShakeCast server. For outbound traffic, firewall policies should permit the USGS Web server (http://earthquake.usgs.gov), which is the source for all earthquake products processed by ShakeCast. For ShakeCast systems receiving earthquake products via the USGS Product Distribution Layer (PDL) client, the program uses port 39977 to connect to the upstream hub server.

## Web Browser Compatibility

The ShakeCast V3 web interface was built using HTML5 standards. Most user and administrator interactions are through using a web browser. Supported web browsers:

|   | MacOS | MS-Windows |
| --- | --- | --- |
| Chrome | 25+ | 25+ |
| Firefox | 20+ | 15+ |
| Opera | 12+ | 12+ |
| Safari | 5+ | N/A |
| Internet Explorer | N/A | 9+ |

{% include links.html %}
