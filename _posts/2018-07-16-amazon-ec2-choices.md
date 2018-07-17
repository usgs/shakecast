---
title:  "Which Amazon EC2 is Right for Your ShakeCast Instance?"
published: true
permalink: ec2_choices.html
summary: "There are many options when it comes to starting your own ShakeCast instance on the Amazon cloud. Here I will try to answer some common questions."
tags: [software_update, pycast, release, production]
---

The requirements of your Amazon EC2 depend largely on your plans for ShakeCast and the amount of facilities you plan to monitor with your ShakeCast instance. First let's boil down the costs associated with your EC2...


## Cost of a ShakeCast instance
A full list of EC2 hourly costs can be found [here](https://aws.amazon.com/ec2/pricing/on-demand/). If you're running your instance operationally, you should plan for it to be turned on 24/7. So, the t2.medium (which costs $0.0464 per Hour) would have a daily cost of:

```
.0464 * 24 = $1.1136
```

$1.11, just over one dollar per day and less than $35 per month. You will also have to pay for the amount of disk space hooked up to your instance. In our experience, these costs start around $4 per month, and will grow depending on how much earthquake data you're collecting. There are some other charges that will be associated with your EC2, such as data transfer and bandwidth usage charges. ShakeCast only incurs minimal charges in these realms and you can generally assume they will amount to less than $1 per month.

If you plan to use the ShakeCast instance for research or planning purposes, you could choose to turn it off when it's not in use. When turned off, your EC2 will only incur storage fees (the ~$4/month mentioned above). When your ShakeCast instance is turned off, it will not be collecting earthquake data, and it will not distribute notifications.

## Choosing an EC2 size
AWS offers a free tier EC2, which will be excellent for testing, but insufficient for a production system. Feel free to checkout your first ShakeCast instance using the t2.micro; it's a great platform for you to look around and determine if ShakeCast is the right choice for you and your organization.

For most applications of ShakeCast, we recommend you use at least a t2.small. This will be sufficient for most research based endeavors, and some small production systems (~100 facilities and few groups and users). Overcrowding this EC2 with too many facilities will cause serious slowdowns.

More serious users will benefit from the multiple CPUs in the t2.medium. This system will be quite comfortable with up to a few thousand facilities (~5000).

For users with even larger footprints, we recommend the t2.large or t2.xlarge, which will be similar to the size of the systems we use for our production instances in-house.

## Cutting costs on AWS
The costs I mentioned above are all referring to "on-demand" EC2s, which means you can turn them off whenever you want and Amazon will stop charging you. Users who are ready to commit to ShakeCast can save significantly by using "reserved" instances. These require a commitment of 1 or 3 year/s, but can shrink your AWS charges by up to 75%. Check out the reserved pricing [here](https://aws.amazon.com/ec2/pricing/reserved-instances/pricing/).
