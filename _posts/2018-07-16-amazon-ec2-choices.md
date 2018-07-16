---
title:  "Which Amazon EC2 is Right for Your ShakeCast Instance?"
published: true
permalink: ec2_choices.html
summary: "There are many options when it comes to starting your own ShakeCast instance on the Amazon cloud. Here I will try to answer some common questions."
tags: [software_update, pycast, release, production]
---

The requirements of you Amazon EC2 depend largely on your plans for ShakeCast and the amount of facilities you plan to monitor with your ShakeCast instance. First let's boil down the costs associated with your EC2:


## Cost of a ShakeCast instance
A full list of EC2 hourly costs can be found [here](https://aws.amazon.com/ec2/pricing/on-demand/). If you're running your instance operationally, you should plan for it to be turned on 24/7. So for instance, the t2.medium (which costs $0.0464 per Hour) would have a daily cost of:

```
.0464 * 24 = $1.1136
```

$1.11, just over one dollar a day. There are some other charges that will be associated with your EC2, such as data transfer and bandwidth usage charges. ShakeCast only incurs minimal charges in these realms and you can safely assume that your instance will only incur $1 or $2 of charges each month on top of the EC2 cost. If you plan to use the ShakeCast instance for research or planning, you could choose to turn it on and off as needed. When turned off, your EC2 will only incur storage fees, which will likely be a few dollars each month.

## Choosing an EC2 size
AWS offers a free tier EC2, which will be excellent for testing, but insufficient for a production system. Feel free to checkout your first ShakeCast instance using the t2.micro; it's a great platform for you to look around and determine if ShakeCast is the right choice for you and your organization.

For most applications of ShakeCast, we recommend you use at least use a t2.small. This will be sufficient for most research based endeavors, and some small production systems (~100 facilities and few groups and users). Overcrowding this EC2 with too many facilities will cause serious slowdowns.

More serious users will benefit from the multiple CPUs in the t2.medium. This system will be quite comfortable with up to a few thousand facilities (~5000).

For users with a large footprint, we will recommend the t2.large or t2.xlarge, which will be similar to the size of the systems we use for our production instances in-house.