import { Application, Router  } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

/**
 * port to run the server on 
 *
 * @author Sriram Sundar
 * @type number
 *
 */
const PORT: number = Number(Deno.env.get("PORT")) || 3000;

/**
 * origin url for the frontend application 
 *
 * @author Sriram Sundar
 * @type string
 */
const FRONT_ORIGIN: string = Deno.env.get("FRONT_ORIGIN") || "*";

/**
 * oak application 
 *
 * @author Sriram Sundar
 * @type Application
 */
const app : Application = new Application();

// set up logging middleware for the application
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
});


// set up cors 
app.use(
  oakCors({
    origin: FRONT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  })
);

/**
 * instance of the oak router
 *
 * @author Sriram Sundar
 * @type Router
 */
const router: Router = new Router();

// fun root route for the server
router.get("/", (ctx) => {
  ctx.response.status = 200;
  ctx.response.body = "hiya !!!, this is the hacksussex server for project tbd";
});

//use the oak router
app.use(router.routes());

app.use(router.allowedMethods());

// listen on the port defined in the env file or 3000 as a fallback
if (import.meta.main) {
  app.addEventListener("listen", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  await app.listen({ port: PORT });
}


export { app, router };
