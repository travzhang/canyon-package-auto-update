Dear SWC Team,

I am an employee of [Trip.com](https://www.trip.com), and I would like to submit a PR to add Trip.com to the “Who’s using?” section on the SWC website. At Trip.com, we have adopted SWC in our e2e testing projects, particularly through the use of our [swc-plugin-canyon](https://github.com/canyon-project/canyon/tree/main/plugins/swc-plugin-canyon) solution.

Canyon is a JavaScript code coverage tool designed for e2e testing. We initially developed `babel-plugin-canyon` and `vite-plugin-canyon`, and after discovering that some of our internal applications built with [Next.js](https://nextjs.org) are using SWC, we developed [swc-plugin-canyon](https://github.com/canyon-project/canyon/tree/main/plugins/swc-plugin-canyon) as well. This plugin allows us to detect environment variables in the CI pipeline and report code coverage data alongside e2e results, which are then displayed on our server. This is one of our use cases for SWC at [Trip.com](https://www.trip.com).

Thank you for your contributions to SWC, and we look forward to supporting the community by sharing our use case.
