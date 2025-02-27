import { HttpException, HttpStatus } from "@nordjs/errors";
import type { NordManifest, Express, RequestHandler } from "@nordjs/types";
import type { ZodIssue } from "@nordjs/validator";
import { ZodError } from "@nordjs/validator";
import { getClientIp } from "@supercharge/request-ip";

interface ErrorResponse {
  status: number;
  message: string;
  validation?: ZodIssue[];
}

export const useRouter: ({
  app,
  nordManifest,
}: {
  app: Express;
  nordManifest: () => Promise<NordManifest>;
}) => void = ({ app, nordManifest }) => {
  const nordMiddleware: RequestHandler = async (request, response, next) => {
    const { routes } = await nordManifest();
    const key = `${request.method === "HEAD" ? "GET" : request.method} ${
      request.path
    }`;
    const route = routes[key];
    if (!route) return next();

    try {
      const result = await route({
        route: key,
        path: request.path,
        useParams: (obj) => obj.parse(request.params),
        useQuery: (obj) => obj.parse(request.query),
        useBody: (obj) => obj.parse(request.body ?? {}),
        ipAddress: getClientIp(request),
        _original: { request, response },
      });

      if (request.method === "HEAD") {
        response.status(204);
        response.end();
      } else response.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        const flat = error.flatten();
        response.status(HttpStatus.BAD_REQUEST);
        response.json({
          status: HttpStatus.BAD_REQUEST,
          message: [
            ...Object.entries(flat.fieldErrors).map((i) => `${i[0]} (${i[1]})`),
            ...Object.entries(flat.formErrors).map((i) => `${i[0]} (${i[1]})`),
          ].join(", "),
          validation: error.issues,
        } as ErrorResponse);
        response.end();
      } else if (error instanceof HttpException || "_httpException" in error) {
        const err = error as HttpException;
        response.status(err.code);
        response.json({
          status: err.code,
          message: err.message,
        } as ErrorResponse);
        response.end();
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR);
        response.write("Error");
        response.end();
      }
    }

    return next();
  };

  app.use(nordMiddleware);
};
