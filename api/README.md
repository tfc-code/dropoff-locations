# Dropoff Location API

## Getting Started

```
$ npm i && npm run start:dev
```

## Run with Docker
```
$  docker build -t dropoff-locations-api . && docker run -p 8080:80 dropoff-locations-api
```

## Run Tests

### Unit Tests
```
$ npm test
```

### Code Lint
```
$ npm run lint
```

## Endpoints

### Colorado Lookup

```
GET /colorado
```

Endpoint to resolve users address to their dropoff locations

 Query Param | Type | Description | Example
 --- | --- | --- | ---
 streetAddress | string | url encoded street name and number | 1220%20Davis%20St
 city | string | url encoded city name | Estes%20Park
 zipcode | string | five digit zipcode | 80517

### Michigan Lookup

```
GET /michigan
```

Endpoint to resolve users address to their municipality and polling place

 Query Param | Type | Description | Example
 --- | --- | --- | ---
 streetAddress | string | url encoded street name and number | 29759%20Robert%20Dr
 city | string | url encoded city name | Livonia
 zipcode | string | five digit zipcode | 48150

 ### Pennsylvania Lookup

```
GET /pennsylvania
```

Endpoint to resolve users address to their municipality and polling place

 Query Param | Type | Description | Example
 --- | --- | --- | ---
 streetAddress | string | url encoded street name and number | 1002%20E%20LUZERNE%20ST
 city | string | url encoded city name | Philadelphia
 zipcode | string | five digit zipcode | 19124
