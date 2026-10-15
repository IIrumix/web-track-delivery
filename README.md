# WebTrackDelivery

## Customer map

The `/owner/customer` page loads customer records and all valid location pins from
`https://lunch-delivery-api-7we5.onrender.com/customers`. Latitude and longitude may be
JSON numbers or decimal strings. Customers without valid coordinates remain in the list.

Run `npm install` and `npm start`, then open `/owner/customer`. The Angular development
server forwards `/api/customers` through `proxy.conf.json` because the upstream API
currently does not return CORS headers. Restart `npm start` after changing the proxy.

For deployment, configure the hosting server to forward `/api/customers` to the same
upstream `/customers` endpoint **before** the SPA fallback. The Angular development
proxy is not included in the production build. Alternatively, enable CORS for the
frontend origin on the API and change `CUSTOMERS_API_URL` in `customer-store.ts` to the
absolute API URL. The map uses OpenStreetMap tiles and keeps their attribution visible.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
