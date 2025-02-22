import { testing } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { assertEquals } from "jsr:@std/assert";
import { router } from "../src/server.ts";

//sample test for the / route to test if the message is being returned correctlt
Deno.test("GET / should return the expected response", async () => {
  const ctx = testing.createMockContext({
    path: "/",
    method: "GET",
  });

  await router.routes()(ctx, async () => {});

  assertEquals(ctx.response.status, 200);
  assertEquals(
    ctx.response.body,
    "hiya !!!, this is the hacksussex server for project tbd"
  );
});
