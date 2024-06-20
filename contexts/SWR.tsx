import { unset } from "lodash";
import { SWRConfig } from "swr";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import axios from "axios.config";
import { useNotification } from "hooks";

const SWR = ({ children }) => {
  const { enqueueSnackbarWithError } = useNotification();

  const { status, data } = useSession();
  const [isSetJWT, setIsSetJWT] = useState(false);

  useEffect(() => {
    if (data == null) return;

    if (!data.user.token) return;
    const { user } = data;

    axios.defaults.headers["Authorization"] = `JWT ${data.user.token}`;

    setIsSetJWT(true);

    if (user.shouldReLogin) {
      unset(axios.defaults.headers, "Authorization");
      signOut();
    }
  }, [data]);

  if (status === "loading") return null;
  if (status === "authenticated" && data == null) return null;
  if (status === "authenticated" && data && !isSetJWT) return null;

  return (
    <SWRConfig
      value={{
        refreshInterval: 60000,
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnMount: true,
        revalidateOnReconnect: true,
        fetcher: async (resource) => {
          return axios
            .get(resource)
            .then(async (res) => {
              return res.data;
            })
            .catch((err) => {
              enqueueSnackbarWithError(err);
              throw err;
            });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWR;
