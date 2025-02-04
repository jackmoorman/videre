import { ZodError, Logger } from '@videre/core';

export function handleError(error: unknown) {
  let message = 'Something went wrong, please try again.';

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof ZodError) {
    const e = error?.errors?.[0];
    if (e) {
      const joined = e.path.join('.');
      message = `Error in Videre config - "${e.code}" at ${joined}, message: "${e.message}"`;
    } else {
      message = JSON.stringify(e);
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = JSON.stringify(error);
  }

  console.error(message);
  process.exit(1);
}
