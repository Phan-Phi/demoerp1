import useSWR from "swr";
import { Fragment, useState } from "react";
import { Box, Grid, styled } from "@mui/material";

import TopSale from "./components/TopSale";
import Overview from "./components/Overview";
import NetRevenue from "./components/NetRevenue";
import { Image, LoadingDynamic as Loading } from "components";

import { GeneralNetRevenueReport } from "__generated__/apiType_v1";
import {
  ADMIN_REPORTS_GENERAL_NET_REVENUE_END_POINT,
  ADMIN_SETTINGS_END_POINT,
} from "__generated__/END_POINT";
import { usePermission } from "hooks";
import HomeWithLogo from "./HomeWithLogo";
import { ADMIN_SETTINGS_PATCH_YUP_SCHEMA_TYPE } from "__generated__/PATCH_YUP";
import { transformUrl } from "libs";
import { useMeasure, useUpdateEffect } from "react-use";

const Home = () => {
  const [ref, { width }] = useMeasure();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const { hasPermission: readSaleReportPermission } = usePermission("read_sale_report");
  const { hasPermission: readProductReportPermission } =
    usePermission("read_product_report");

  const { data: reportGeneralNetRevenueData } = useSWR<Required<GeneralNetRevenueReport>>(
    ADMIN_REPORTS_GENERAL_NET_REVENUE_END_POINT
  );

  const { data: resSettingData, mutate: settingMutate } = useSWR<
    ADMIN_SETTINGS_PATCH_YUP_SCHEMA_TYPE & { dashboard_banner: { header_image: string } }
  >(
    transformUrl(ADMIN_SETTINGS_END_POINT, {
      use_cache: false,
    })
  );

  useUpdateEffect(() => {
    setImageSize({
      width,
      // height: (width * 9) / 16,
      // height: (width * 600) / 1140,
      height: (width * 500) / 1200,
      // height: (width * 524) / 1000,
      // height: (width * 300) / 720,
    });
  }, [width]);

  if (reportGeneralNetRevenueData == undefined) return <Loading />;

  return (
    <Grid container>
      {resSettingData ? (
        <WrapperImage ref={ref}>
          <Image
            width={"100%"}
            height={imageSize.height}
            src={resSettingData.dashboard_banner.header_image}
            alt="Uploaded Image"
          />
        </WrapperImage>
      ) : (
        <Loading />
      )}

      {readSaleReportPermission && (
        <Fragment>
          <Grid item xs={12}>
            <Overview data={reportGeneralNetRevenueData} />
          </Grid>

          <Grid item xs={12}>
            <NetRevenue />
          </Grid>
        </Fragment>
      )}

      {readProductReportPermission && (
        <Grid item xs={12}>
          <TopSale />
        </Grid>
      )}
      {/* {!readProductReportPermission && !readSaleReportPermission && <HomeWithLogo />} */}
    </Grid>
  );
};

const WrapperImage = styled(Box)(() => {
  return {
    position: "relative",
    width: "100%",
    height: "auto",
    // marginY: "0.5rem",
    padding: "1rem 0 0 1.5rem",

    "& img": {
      borderRadius: "10px",
      height: "100px",
      transition: "all 0.4s",
      objectFit: "cover",
      // ["&:hover"]: {
      //   // boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.25)",
      //   borderRadius: "10px",
      // },
    },
  };
});

export default Home;
