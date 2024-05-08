export function CreateHttpResponse({
  data,
  message,
  success,
}: {
  data?: any;
  message: string;
  success: boolean;
}) {
  return {
    ...data,
    success,
    message,
  };
}
