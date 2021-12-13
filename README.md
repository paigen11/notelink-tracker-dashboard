# Notelink (aka Low Fi LoJack)

This is an asset tracking dashboard to display the information captured from Blues Wireless Notecards in vehicles, which can also double as a "low fidelity" stolen vehicle recovery system.

This project was inspired when [my parents' car was stolen](https://twitter.com/pniedri/status/1464414605145522179?s=20) out of their driveway the day after Thanksgiving, and although they did not have LoJack, there happened to be a Notecard sitting in the backseat, which we followed via the dashboard until the Notecard was discovered by the thieves and dumped in a park.

https://user-images.githubusercontent.com/20400845/145849873-04c8fb07-1df0-47e4-b77b-752fa80f11b2.mp4

## Project Basics

Notelink (a play on the name Starlink which is Subaru's version of OnStar) is a Next.js app which serves up a pre-configured dashboard complete with Leaflet.js map to plot Notecard coordinates as they're relayed to Notehub, Recharts charts displaying Notecard's current voltage and temperature, and a react-table event list so a user can see the frequency with which tracking events are being recorded.

Notelink is preconfigured to poll for new events from the Notehub project every 5 minutes, and re-render the latest data on the dashboard.

Notelink is also equipped with a big red button entitle "SOS Mode", which when activated, updates the Notecard's environment variables remotely via Notehub to take GPS location readings every 15 seconds and upload them immediately to Notehub, as opposed to every 6 minutes. When this mode is active, lines between location markers on the map are colored in red instead of blue to be easier to pick out.

![SOS Mode button](https://user-images.githubusercontent.com/20400845/145845319-026a448b-6d3f-4955-95a2-cf1ad3dcb4a8.png)

When the crisis has been averted (and hopefully the vehicle recovered in good condition), SOS Mode can be switched back off and the Notecard will revert to its previous tracking interval of getting a GPS location reading every 6 minutes while the vehicle is in motion.

![Map with red SOS tracking lines on dashboard](https://user-images.githubusercontent.com/20400845/145845203-3239376a-97f6-4089-ba24-ea1b4e7e4e7b.png)

## Learn More

- [Next.js Docs](https://nextjs.org/learn/basics/create-nextjs-app) - Introduction to Next.js
- [Notecard Asset Tracking Docs](https://dev.blues.io/notecard/notecard-guides/asset-tracking/) - Configuring a Blues Wireless notecard to do asset tracking
- [Recharts Docs](https://recharts.org/en-US/) - Introduction to Recharts composable chart library
- [React Leaflet Docs](https://react-leaflet.js.org/docs/start-introduction/) - React Leaflet library introduction
- [React Table Docs](https://react-table.tanstack.com/docs/overview) - React Table getting started and example documentation

## Getting Started

Below are steps from the Notecard all the way to the software to get your own instance of Notelink up and running.

### Hardware Requirements

1. [Notecard](https://shop.blues.io/products/note-nbna-500) from Blues Wireless
2. [Notecarrier A with LiPo battery connector](https://shop.blues.io/products/carr-al) from Blues Wireless
3. [LiPo battery](https://www.adafruit.com/product/328)
4. [MicroUSB to USB converter cable](https://www.amazon.com/AmazonBasics-Male-Micro-Cable-Black/dp/B071S5NTDR/) (or other cable to connect vehicle's power source to Notecarrier when vehicle is powered on)

### Notecard / Notehub Initial Setup

1. Create an account with Blues Wireless [Notehub site](https://notehub.io/) and make a new project that this Notecard will be associated with.
2. Follow the ["Quickstart Guide"](https://dev.blues.io/start/quickstart/notecarrier-al/) on the Blues Wireless developer site to get connect your Notecard, Notecarrier A and Notehub project.
3. Feed the following commands in, one at a time, to the Notecard while it's connected to your computer using the [webREPL](https://dev.blues.io/notecard-playground/) built in to the `dev.blues.io` site.

```bash
{"req":"card.restore","delete":true} # factory reset card
{"req":"env.set","name":"_sn","text":"Notelink"} # give notecard a name in Notehub
{"req":"hub.set","product":"com.blues.paige:hackathon_notelink_tracker","mode":"periodic","outbound":15,"inbound":15} # attach tracker to Notehub project, set it to periodic syncing outbound reqs every 15 mins and inbound reqs from Notehub every 15 mins
{"req":"card.motion.mode","sensitivity":2} # set card accelerometer to higher sensitivity level
{"req":"card.location.mode","mode":"periodic","seconds":360} # tell card how often to get GPS reading and only when motion is detected
{"req":"card.location.track","start":true,"heartbeat":true,"hours":12,"sync":true} # start tracking, issue heartbeat every 12 hours when no motion detected, sync data with Notehub as soon as a tracking event is acquired (this is an important one)
```

### Notelink Project Configuration

1. Clone this repo locally.
2. Run `npm install` at the root of the project.
3. Generate an access token for Notehub via the following curl command. For further info see [this documentation](https://dev.blues.io/reference/notehub-api/api-introduction/#authentication)

```bash
  curl -X POST
    -L 'https://api.notefile.net/auth/login'
    -d '{"username":"[you@youremail.com]", "password": "[your_password]"}'
```

4. Create a `.env.local` file (also at the root of the project and give it the following variables with your Notehub credentials filled in)

```json
NOTEHUB_PROJECT_ID=APP_ID_GOES_HERE
NOTEHUB_TOKEN=NOTEHUB_GENERATED_TOKEN_GOES_HERE
NOTECARD_DEVICE_ID=DEVICE_ID GOES_HERE
REFRESH_INTERVAL=300000
```

5. Run `npm run dev` in the terminal to start the server
6. Visit http://localhost:3001 in your browser.
7. Watch the events begin to populate the new dashboard as the asset moves around.

![](https://user-images.githubusercontent.com/20400845/145846744-ca380eb3-b9bb-455d-b090-83f82200e198.png)

8. Enable SOS Mode and see events begin to stream in faster, page refreshes happen quicker and newly generated lines between location markers are now red for the duration of the SOS Mode.

![Map with red SOS tracking lines on dashboard](https://user-images.githubusercontent.com/20400845/145845271-2b05a527-0875-4ae7-a879-0cbd381c195a.png)

## LoJack Considerations

If you do intend to use this as a potential LoJack alternative, keep the following things in mind:

- **Hide the Notecard** - Hide the Notecard somewhere in the vehicle where it's not easily discoverable. The Notecard AL is equipped with an Ignion antenna, which is quite powerful, therefore, it's very possible that without a direct line of sight to the sky - say, inside the center console of a car, and it will still be able to get a triangulation lock for GPS purposes. Test this out by placing the Notecard where you might want to keep it stored and check if its location registers. Also, avoid putting it somewhere where it would either be exposed to extreme heat (like in the dashboard near the engine and windshield) or wet (like in the bumper of the car)

![Notecard hidden in vehicle's center console](https://user-images.githubusercontent.com/20400845/145850469-5079878e-645d-4e98-a22e-6f25788e88d4.JPG)

- **Have multiple power supplies** - In addition to a LiPo battery to power the Notecard when the vehicle is off, invest in some way to power the Notecard from the vehicle's power source when it's on. Although the Notecard is designed to be low power, it is still relatively power intensive to get a GPS coordinate lock and then send that data to Notehub. When SOS Mode is enabled, especially, this could be an issue. Nowadays, most vehicles come equipped with USB ports or adapters to plug in electronics, so wherever the Notecard is hidden, invest in a micro-USB to car connector so that when the car is powered on, the Notecard can run off of the car battery and charge its LiPo battery, which it will run off of when the vehicle is off.

![Notecard connected to car power source via USB cable](https://user-images.githubusercontent.com/20400845/145850653-768806ec-7173-413f-837f-d5ea1ebf30bc.JPG)

- **Notehub doesn't update the Notecard immediately** - There is currently no way to force a remote update of a Notecard from Notehub, so it is imperative that if the Notecard is going to be used in this particular manner, the "inbound" parameter of the Notecard must be set to a short time interval (I'd recommend 15 mins or less just to be safe). This way, even if the Notecard has just synced with Notehub and SOS Mode is enabled, it will at most, take 15 minutes until it gets the new environment variables command to take GPS readings at an almost continuous rate.
- **Invest in a cloud database to persist Notehub events** - Notehub charges users after a certain amount of events are sent out of the application per month (5,000, I believe), so it's not the most cost effective to poll all events from Notehub every 2 - 5 minutes. For a larger product, I'd recommend investing in some sort of a cloud database that could both pull all the initial data from Notehub and then possibly also receive events routed from Notehub as they are recorded there to cut down on costs. Then the app can pull data from that database as often as it likes with no fear of extraordinary bills being incurred from Notehub.

# Further Project Enhancements

Since this was made in just over a work day's worth of time, there are still things to be improved about this project. Here is an inexhaustive list of additional things I would add to this project were I to take it further.

- Along with the red lines on the map when the tracker is in SOS Mode, also change the events streaming into the project after SOS Mode is enabled to be red or some other color to indicate when they start coming in.
- Add a download button to the event list so that users can have a spreadsheet of data, including timestamps, GPS and cell tower locations, etc. that can be shared with law enforcement and others.
- Use something more than local storage (either Notehub env vars or a cloud database) to persist when SOS Mode is enabled. In order to be more commercially viable, local storage to keep track of when SOS Mode was started is not good enough - it was quick and easy to get up and running.
- Allow different timeframes of events to be queried from Notehub. At the moment, every single event for a project is pulled from Notehub and displayed on the dashboard, but that may not be useful depending on the situation. Give users a date picker so they can specify date ranges for the events they want to see in the dashboard.
- Add a persistent database to hold events after the initial fetch of data from Notehub. Notehub charges users after a certain amount of events are sent out of the application per month (5,000, I believe), so it's not the most cost effective to continue to poll all events from Notehub every time. For a larger product, I'd invest in some sort of a cloud database that could both pull all the initial data from Notehub and then possibly also receive events routed from Notehub as they are recorded there to cut down on costs.

---
