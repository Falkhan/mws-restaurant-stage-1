# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 3

This is a fork of the Udacity Mobile Web Specialist Project.
Being provided the code for a restaurant reviews website, I had to add features that I learnt about throughout the Udacity MWS Google Scholarship course. The main goal was to create a Progressive Web App that is fully offline-ready.


### What has been added

1. Service Worker
Service Worker that stores static files in a cache and serves them when there is no Internet connection.

2. Responsive design
Initially, the website was not responsive. CSS was added to accommodate different screen sizes.

3. Fetch API
Data stored in a JSON file in the main directory was replaced with code that uses Fetch API to get restaurant data from a local server. Fetch API is also used to send POST and PUT requests (to submit new reviews and favorite/unfavorite restaurants).

3. IndexedDB
The website now uses IDB to store data fetched from the server locally to allow for offline use.

4. BackgroundSync
BackgroundSync is used to defer POST requests. User can submit a review which will be sent to the server when connection is restored.

### Orignial MWS Project:
https://github.com/udacity/mws-restaurant-stage-1
