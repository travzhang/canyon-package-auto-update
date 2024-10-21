Dear SWC Team,

I am an employee at [Trip.com](https://www.trip.com), and I would like to submit a PR to include Trip.com in the "Who’s using?" section on the SWC website. At Trip.com, we have integrated SWC into our end-to-end (e2e) testing processes, particularly by leveraging our custom [swc-plugin-canyon](https://github.com/canyon-project/canyon/tree/main/plugins/swc-plugin-canyon).

Canyon is a JavaScript code coverage tool tailored for e2e testing. Initially, we developed `babel-plugin-canyon` and `vite-plugin-canyon` to serve our coverage needs. However, after realizing that several of our internal applications built with [Next.js](https://nextjs.org) were using SWC, we extended our solution with [swc-plugin-canyon](https://github.com/canyon-project/canyon/tree/main/plugins/swc-plugin-canyon). This plugin allows us to detect environment variables in our CI pipeline and report code coverage data alongside e2e results, which are then displayed on our internal server.

We are excited to share our use case for SWC at [Trip.com](https://www.trip.com), and we truly appreciate the contributions of the SWC team to the developer community.

Thank you for your consideration.
