import { TErrorSources } from "../interfaces/error.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleZodError = (err : any) => {
     const errorSources : TErrorSources[] = [];
     err.issues.forEach(issue => {
          errorSources.push({
               path : issue.path[issue.path.length - 1],
               // path : issue.path.length > 1 && issue.path.reverse().join("inside")
               message : issue.message
          })
     });

     return {
          statusCode: 400,
    message: "Zod Error",
    errorSources
     }
}