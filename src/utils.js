export function range(n) {
  let r = Array(n);
  for (let i = 0; i < n; i++) {
    r[i] = i;
  }
  return r;
}

export function axiosErrorToString(error) {
  if (!error.response) {
    return 'Server not responding';
  } else if (error.response.status >= 500) {
    return 'Server error';
  }
  return error.response.data.message;
}
