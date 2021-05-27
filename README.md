# Akka Serverless - Wireless Mesh Example App

A JavaScript-based example app for [Akka Serverless](https://developer.lightbend.com/docs/akka-serverless/)

Features include:

* Customer locations with wireless mesh devices

## What is this example?

To help you get started with Akka Serverless, we've built some example apps that showcase the capabilities of the platform. This example application mimics a company that uses Akka Serverless to keep track of the wireless mesh devices their customers have installed and the devices connected to the meshes.

In this example app you can interact with the devices, assign them to different rooms in the house, and turn them on or off. To make this example even more interactive, you can add an actual nightlight and switch the lights on or off.

We used the following akkaserverless capabilities: event sourced entity (wirelessmeshdomain.CustomerLocationEntity),
using an Action to publish to google pubsub (wirelessmesh.PublishingAction and publishing.proto) and using a View (wirelessmesh.CustomerLocationView and customerlocationview.proto) and finally
an Action to connect to the Lifx bulb (wirelessmesh.ToggleNightlightAction and devicecontrol.proto).

## Prerequisites

To build and deploy this example application, you'll need to have:

* An [Akka Serverless account](https://docs.cloudstate.com/getting-started/lightbend-account.html)
* Node.js v12 or higher installed
* The Docker CLI installed
* A [service account](https://cloud.google.com/docs/authentication/production) that can connect to Google Cloud Pubsub

## Build, Deploy, and Test

### Prepare your Google Cloud Pubsub
Javascript version wirelessmesh app uses the same Google Cloud Pub/Sub setup as java version.

Please refer [the Java Version](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-java#prepare-your-google-could-pubsub)

### LIFX integration for toggling nightlight

If you have an LIFX bulb and would like it to stand in for a wirelessmesh device and have it light on/off when you toggle the device nightlight, you simply have to:
* Have an operational bulb
* When you create your customer location, be sure to set the access token to the authorization token you requested with LIFX.
* When you activate the device in this app, make sure it has the same device id as your bulb.
* More information [here][https://api.developer.lifx.com]

### Build and run locally
```
# NOTE: the easiest way is to run it with node v14

# install packages
npm ci

# run akkasls-scripts codegen which
#  (1) Builds Protobuf descriptor file
#  (2) Runs Akka Serverless JS codegen
npm run build
# the above line is equal to command "akkasls-scripts build"

# start the node server at http://localhost:8080
npm start
```

If you want to start server in a different port like 8081, you can modify file `src/index.js`

change line
```
customerlocationentity.start();
```
to
```
customerlocationentity.start({bindAddress:'0.0.0.0', bindPort:'8081'});
```

### Build your containers

To build your own container, execute the below commands:

```bash
npm run package
```

Or run

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Build a container for the service
docker build . -t $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest
```

### Deploy your container

To deploy the container as a service in Akka Serverless, you'll need to:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Push the containers to a container registry
docker push $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest

## Set your Akka Serverless project name
export AKKASLS_PROJECT=<your project>
akkasls svc deploy wirelessmesh $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest --project $AKKASLS_PROJECT
```

_The above command will deploy your container to your project with the name `wirelessmesh`. If you want to have a different name, you can change that._

### How to check if data is written to Google Cloud Pub/Sub

Javascript version wirelessmesh app uses the same Google Cloud Pub/Sub setup as java version.

Please refer [the Java Version](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-java#how-to-check-if-data-is-written-to-google-cloud-pubsub)


### Testing your service with restful api
Javascript version wirelessmesh app uses the same testful api.

Please refer [the Java Version](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-java#testing-your-service-with-restful-api)


## Contributing

We welcome all contributions! [Pull requests](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/issues) first to discuss what you would like to change.

## Support

This project is provided on an as-is basis and is not covered by the Lightbend Support policy.

## License

See the [LICENSE](./LICENSE).
