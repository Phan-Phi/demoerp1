import useSWR from "swr";
import get from "lodash/get";
import { Row } from "react-table";
import { useIntl } from "react-intl";
import { Grid, Typography, Stack, Box } from "@mui/material";
import { useMemo, useState, useEffect, useCallback, Fragment } from "react";

import Invoice from "./Invoice";
import OrderLine from "./OrderLine";
import ReceiptOrder from "./ReceiptOrder";
import StockOutNote from "./StockOutNote";
import { InputNumber } from "compositions";
import { Dialog, BackButton } from "components";

import { PRODUCTS } from "routes";
import { transformUrl } from "libs";
import {
  ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT,
  ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT,
  ADMIN_WAREHOUSES_PURCHASE_ORDERS_RECEIPT_ORDERS_RETURN_ORDERS_END_POINT,
} from "__generated__/END_POINT";

// TODO: ISSUE 58

const ViewDetailLineDialog = ({ open, toggle, sourceType, source }) => {
  const { messages } = useIntl();
  const [returnAmount, setReturnAmount] = useState(0);

  const id = get(source, "id");

  const amount = parseFloat(get(source, "amount.incl_tax") || 0);
  const surcharge = parseFloat(get(source, "surcharge.incl_tax") || 0);
  const shippingCharge = parseFloat(get(source, "shipping_charge.incl_tax") || 0);
  const inMoney = parseFloat(get(source, "total_transaction_in_amount.incl_tax") || 0);
  const outMoney = parseFloat(get(source, "total_transaction_out_amount.incl_tax") || 0);

  const [returnValue, setReturnValue] = useState(0);
  const [returnSurcharge, setReturnSurcharge] = useState(0);

  const result = Math.abs(
    amount + surcharge + shippingCharge - Math.abs(inMoney - outMoney)
  );

  const { data: returnOrderData } = useSWR(() => {
    if (sourceType == "stock.receiptorder") {
      const params = {
        get_all: true,
        order: id,
        status: "Confirmed",
      };

      return transformUrl(
        ADMIN_WAREHOUSES_PURCHASE_ORDERS_RECEIPT_ORDERS_RETURN_ORDERS_END_POINT,
        params
      );
    }
  });

  // Giá trị trả hàng
  const { data: returnValueData } = useSWR(() => {
    if (!id) return;

    return transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT, {
      invoice: id,
      page_size: 1,
      is_confirmed: true,
      with_sum_amount_incl_tax: true,
    });
  });

  // Phụ phí trả hàng
  const { data: returnSurchargeData } = useSWR(() => {
    if (!id) return;

    return transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT, {
      invoice: id,
      page_size: 1,
      is_confirmed: true,
      with_sum_surcharge: true,
    });
  });

  useEffect(() => {
    if (sourceType == "stock.receiptorder") {
      if (returnOrderData == undefined) return;

      const tempReturnAmount = returnOrderData.reduce((totalValue, currentValue) => {
        const { amount, surcharge } = currentValue;

        const total =
          parseFloat(get(amount, "incl_tax")) + parseFloat(get(surcharge, "incl_tax"));

        return (totalValue += total);
      }, 0);

      const tempReturnValue = returnOrderData.reduce((totalValue, currentValue) => {
        const { amount } = currentValue;

        return (totalValue += parseFloat(get(amount, "incl_tax")));
      }, 0);

      const tempReturnSurcharge = returnOrderData.reduce((totalValue, currentValue) => {
        const { surcharge } = currentValue;

        return (totalValue += parseFloat(get(surcharge, "incl_tax")));
      }, 0);

      setReturnValue(tempReturnValue);
      setReturnSurcharge(tempReturnSurcharge);
      setReturnAmount(tempReturnAmount);
    } else {
      const _returnValue = parseFloat(get(returnValueData, "sum_amount_incl_tax", "0"));
      const _returnSurcharge = parseFloat(get(returnSurchargeData, "sum_surcharge", "0"));

      setReturnValue(_returnValue);
      setReturnSurcharge(_returnSurcharge);

      setReturnAmount(_returnValue + _returnSurcharge);
    }
  }, [returnOrderData, sourceType, source, returnValueData, returnSurchargeData]);

  const onGotoHandler = useCallback((data: Row<any>) => {
    const productId =
      get(data, "original.line.variant.product") ||
      get(data, "original.variant.product.id");

    window.open(`/${PRODUCTS}/${productId}`, "_blank");
  }, []);

  const ViewLineListMemo = useMemo(() => {
    if (sourceType === "stock.receiptorder") {
      return (
        <Fragment>
          <ReceiptOrder id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    } else if (sourceType === "stock.stockoutnote") {
      return (
        <Fragment>
          <StockOutNote id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    } else if (sourceType == "order.invoice") {
      return (
        <Fragment>
          <Invoice id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    }

    return null;
  }, [sourceType, id]);

  const returnOrderLineMemo = useMemo(() => {
    if (sourceType !== "stock.receiptorder") {
      return null;
    }
    return (
      <Stack spacing={2}>
        <Typography>{messages["listingReturnOrderNote"]}</Typography>
        <OrderLine id={id} onGotoHandler={onGotoHandler} />
      </Stack>
    );
  }, [returnOrderData, sourceType, id]);

  return (
    <Dialog
      {...{
        open,
        onClose: () => {
          toggle(false);
        },
        DialogProps: {
          PaperProps: {
            sx: {
              width: "75vw",
              maxWidth: "85vw",
            },
          },
        },

        dialogContentTextComponent: () => {
          return (
            <Grid container>
              <Grid item xs={12}>
                <Stack flexDirection="row" columnGap={2} marginTop={2}>
                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: messages["orderValue"] as string,
                    }}
                    InputProps={{
                      inputProps: { placeholder: messages["orderValue"] as string },
                    }}
                    NumberFormatProps={{
                      value: amount,
                      suffix: " ₫",
                    }}
                  />

                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: messages["surcharge"] as string,
                    }}
                    InputProps={{
                      inputProps: { placeholder: messages["surcharge"] as string },
                    }}
                    NumberFormatProps={{
                      value: surcharge,
                      suffix: " ₫",
                    }}
                  />

                  {sourceType == "order.invoice" ? (
                    <InputNumber
                      readOnly={true}
                      FormLabelProps={{
                        children: messages["shippingCharge"] as string,
                      }}
                      InputProps={{
                        inputProps: { placeholder: messages["shippingCharge"] as string },
                      }}
                      NumberFormatProps={{
                        value: shippingCharge,
                        suffix: " ₫",
                      }}
                    />
                  ) : (
                    <Box width={"100%"} />
                  )}

                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: messages["totalPrice"] as string,
                    }}
                    InputProps={{
                      inputProps: { placeholder: messages["totalPrice"] as string },
                    }}
                    NumberFormatProps={{
                      value: amount + surcharge + shippingCharge - returnAmount,
                      suffix: " ₫",
                    }}
                  />
                </Stack>

                <Stack flexDirection="row" columnGap={2} marginTop={2}>
                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: messages["inMoney"] as string,
                    }}
                    InputProps={{
                      inputProps: { placeholder: messages["inMoney"] as string },
                    }}
                    NumberFormatProps={{
                      value: inMoney,
                      suffix: " ₫",
                    }}
                  />

                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: messages["outMoney"] as string,
                    }}
                    InputProps={{
                      inputProps: { placeholder: messages["outMoney"] as string },
                    }}
                    NumberFormatProps={{
                      value: outMoney,
                      suffix: " ₫",
                    }}
                  />

                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: "Giá trị trả hàng",
                    }}
                    InputProps={{
                      inputProps: { placeholder: "Giá trị trả hàng" },
                    }}
                    NumberFormatProps={{
                      value: returnValue,
                      suffix: " ₫",
                    }}
                  />

                  <InputNumber
                    readOnly={true}
                    FormLabelProps={{
                      children: "Phụ phí trả hàng",
                    }}
                    InputProps={{
                      inputProps: { placeholder: "Phụ phí trả hàng" },
                    }}
                    NumberFormatProps={{
                      value: returnSurcharge,

                      suffix: " ₫",
                    }}
                  />
                </Stack>

                <InputNumber
                  readOnly={true}
                  FormLabelProps={{
                    children: messages["needToPay"] as string,
                  }}
                  InputProps={{
                    inputProps: { placeholder: messages["needToPay"] as string },
                    sx: {
                      fontWeight: 700,
                    },
                  }}
                  NumberFormatProps={{
                    value: result - returnAmount,
                    suffix: " ₫",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography>{messages["listingProduct"]}</Typography>
              </Grid>
              <Grid item xs={12}>
                {ViewLineListMemo}
              </Grid>

              <Grid item xs={12}>
                {returnOrderLineMemo}
              </Grid>
            </Grid>
          );
        },
        DialogActionsProps: {
          children: (
            <BackButton
              onClick={() => {
                toggle(false);
              }}
            />
          ),
        },
      }}
    />
  );
};

export default ViewDetailLineDialog;
