# ![RestSpark](https://raw.github.com/nishantpatel08/restfox-vue-electron/main/packages/ui/public/pwa-192x192.png "RestSpark")

# RestSpark

[**Web App**](https://restspark.vercel.app) **|** [**Install**](#installation) **|** [**Releases/Downloads**](https://github.com/nishantpatel08/restfox-vue-electron/releases) **|** [**Screenshots**](#screenshots) **|** [**Docs**](https://docs.restfox.dev) **|** [**Compiling**](#compiling) **|** [**Compiling Web Standalone**](#using-web-standalone)

Offline-First Minimalistic HTTP & Socket Testing Client for the Web & Desktop

Watch video to see plugins in action:<br>
[<img src="https://img.youtube.com/vi/3cOQPm43Wus/hqdefault.jpg" width="600" height="300" width="100%"
/>](https://www.youtube.com/watch?v=3cOQPm43Wus)

## Installation

### macOS
Package available in homebrew by using:
```
brew install restspark
```

### Ubuntu and other distributions supporting snap
Package available through snap can be installed using:
```
sudo snap install restspark
```

### RPM, DEB and NuPKG
There are precompiled binaries in the [releases](https://github.com/nishantpatel08/restfox-vue-electron/releases) page.

### Windows
```
scoop bucket add extras
scoop install restspark
```
There are also precompiled binaries in the [releases](https://github.com/nishantpatel08/restfox-vue-electron/releases) page.

### [Docker](https://hub.docker.com/r/flawiddsouza/restfox)
```
docker run --name RestSpark -d -p 4004:4004 nishantpatel08/restspark:1.0.10
```

Start webapp using docker compose
```
docker-compose up -d
```

Start webapp using docker compose with custom port
```
docker-compose -p 5000:4004 up -d
```

Start webapp using docker compose with different version
```
RESTSPARK_VERSION=1.0.10 docker-compose up -d
```

## Screenshots

<img src="screenshots/1.png?raw=true">

<img src="screenshots/2.png?raw=true">

### Response History

<img src="screenshots/3.png?raw=true">

### Context Menu

<img src="screenshots/8.png?raw=true">

### Environment Variables

<img src="screenshots/4.png?raw=true">
<img src="screenshots/5.png?raw=true">

### Plugins

<img src="screenshots/6.png?raw=true">
<img src="screenshots/7.png?raw=true">

# Compiling

## ui

### Development
```
npm run dev
```

### Distribution
```
npm run build
```

### Desktop distribution and development
```
npm run build-desktop
```

### Web Standalone distribution and development
```
npm run build-web-standalone
```

### To upgrade codemirror to latest version
```bash
npm i @codemirror/autocomplete@latest @codemirror/commands@latest @codemirror/lang-javascript@latest @codemirror/lang-json@latest @codemirror/language@latest @codemirror/search@latest @codemirror/state@latest @codemirror/view@latest
```

## electron

### To upgrade electron to latest version
```bash
npm install --save-dev electron@latest @electron-forge/cli@latest @electron-forge/maker-deb@latest @electron-forge/maker-rpm@latest @electron-forge/maker-squirrel@latest @electron-forge/maker-zip@latest @electron-forge/maker-flatpak@latest @electron-forge/publisher-github@latest electron-builder@latest
```

### Development
```
npm run start
```

### Distribution
```
npm run make
```
or
```
npm run publish
```

### Development
```
npm run dev
```

### Distribution
```
npm run build
```

## Using web-standalone
```
git clone https://github.com/nishantpatel08/restfox-vue-electron
cd RestSpark/packages/ui
npm i
npm run build-web-standalone
cd ../web-standalone
npm i
npm start
```

By default npm start will run RestSpark at port 4004. You can override the port by passing port like so `PORT=5040 npm start`.

## Docker Build Instructions

First refer to [**Compiling Web Standalone**](#using-web-standalone) to build successfully locally and use it normally.
Then in the project root directory (directory with Dockerfile), execute:
```
docker build -t restspark:xx .
```
> Note: xx is the version number

After the build is complete, use the following command to start the service:
```
docker run -d -p:4004:4004 restspark:xx
```
Visit after successful startup: localhost:4004

Alternatively, you can also use the pre-built Docker image available on [Docker Hub](https://hub.docker.com/r/nishantpatel08/restfox). See: [**Docker**](#docker).
