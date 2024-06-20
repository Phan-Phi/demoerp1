import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOMAIN_NAME,
});

instance.interceptors.request.use(
  async function (config) {
    config.url = config.url!.replace("http://", "https://");

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (err) {
    // const message = get(err, "response.data.message");

    // if (!message.includes("Invalid page")) {
    //   typeof instance.enqueueSnackbar === "function" &&
    //     instance.enqueueSnackbar(message, { variant: "error" });
    // }

    return Promise.reject(err);
  }
);

export default instance;
