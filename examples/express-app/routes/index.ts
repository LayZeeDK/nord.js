import type { Route } from "@nordjs/types";
import { z } from "@nordjs/validator";

export const get: Route = ({ query }) => {
  const { id } = query(z.object({ id: z.string() }));
  return { success: { id } };
};
